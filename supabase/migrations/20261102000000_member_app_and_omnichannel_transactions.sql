-- ==============================================================================
-- FitLead CRM (FTL Edition) - Member App & Omnichannel Transactions Migration
-- Version: 20261102000000
-- Timezone: Asia/Jakarta (WIB)
-- ==============================================================================

-- 1. UPDATE USER ROLES ENUM / CONSTRAINT
-- Allow 'member', 'admin', 'pt', in addition to staff roles
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('member', 'admin', 'superadmin', 'club_manager', 'front_desk', 'personal_trainer', 'pt', 'sales'));

-- 2. CREATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invoice_code VARCHAR(100) NOT NULL UNIQUE,
    transaction_type VARCHAR(50) NOT NULL, -- 'membership', 'pt_package'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL, -- 'online', 'tunai'
    payment_channel VARCHAR(50), -- 'midtrans_qris', 'midtrans_va_bca', 'midtrans_gopay', 'tunai_frontdesk'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'), -- 1 HOUR COUNTDOWN
    paid_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_code ON transactions(invoice_code);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_expires_at ON transactions(expires_at);

-- 3. WEIGHTLIFTING SPECIFIC SESSIONS (NO YOGA / AEROBICS)
CREATE TABLE IF NOT EXISTS weightlifting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g. 'Basic Powerlifting (Squat, Bench, Deadlift)', 'Hypertrophy Muscle Camp'
    category VARCHAR(50) NOT NULL DEFAULT 'strength',
    instructor_name VARCHAR(255) NOT NULL,
    instructor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    day_of_week INT NOT NULL, -- 1 = Senin ... 7 = Minggu
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity_limit INT NOT NULL DEFAULT 8,
    booked_count INT NOT NULL DEFAULT 0,
    room VARCHAR(100) NOT NULL DEFAULT 'Weight Room & Platform',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Bookings table
CREATE TABLE IF NOT EXISTS weightlifting_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES weightlifting_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'booked', -- 'booked', 'attended', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_member_session_booking UNIQUE (session_id, member_id, booking_date)
);

-- 4. AUTO-EXPIRE MECHANISM FOR CASH TRANSACTIONS (1-HOUR LIMIT)
CREATE OR REPLACE FUNCTION expire_overdue_transactions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_expired_count INT;
BEGIN
    UPDATE transactions
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending'
      AND payment_method = 'tunai'
      AND expires_at < NOW();

    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    RETURN v_expired_count;
END;
$$;

-- 5. FUNCTION FOR CASHIER (FRONT DESK) TO CONFIRM CASH TRANSACTION
CREATE OR REPLACE FUNCTION confirm_cash_transaction(
    p_invoice_code TEXT,
    p_staff_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_member RECORD;
    v_coach RECORD;
    v_sessions_to_add INT;
    v_days_to_add INT;
BEGIN
    -- 1. Lock transaction row to avoid concurrency races
    SELECT * INTO v_tx
    FROM transactions
    WHERE invoice_code = p_invoice_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invoice ' || p_invoice_code || ' tidak ditemukan.');
    END IF;

    -- 2. Check if already paid
    IF v_tx.status = 'paid' THEN
        RETURN jsonb_build_object('success', true, 'is_already_paid', true, 'message', 'Invoice ini sudah lunas sebelumnya.');
    END IF;

    -- 3. Check 1-hour expiration
    IF v_tx.expires_at < NOW() THEN
        UPDATE transactions SET status = 'expired', updated_at = NOW() WHERE id = v_tx.id;
        RETURN jsonb_build_object('success', false, 'is_expired', true, 'message', 'Waktu pembayaran tunai 1 jam telah habis. Invoice ini sudah kedaluwarsa.');
    END IF;

    -- 4. Mark transaction as paid
    UPDATE transactions
    SET status = 'paid',
        paid_at = NOW(),
        confirmed_by = p_staff_user_id,
        updated_at = NOW()
    WHERE id = v_tx.id;

    -- 5. Activate membership or PT sessions for the member
    SELECT * INTO v_member FROM members WHERE id = v_tx.member_id FOR UPDATE;

    IF v_tx.transaction_type = 'pt_package' THEN
        v_sessions_to_add := COALESCE((v_tx.details->>'sessions_count')::INT, 12);
        
        -- Update or insert PT package
        UPDATE members
        SET selected_coach_sessions = COALESCE(selected_coach_sessions, 0) + v_sessions_to_add,
            status = 'active',
            updated_at = NOW()
        WHERE id = v_tx.member_id;

    ELSIF v_tx.transaction_type = 'membership' THEN
        v_days_to_add := CASE 
            WHEN v_tx.details->>'package_type' = '1_year' THEN 365
            WHEN v_tx.details->>'package_type' = '6_months' THEN 180
            ELSE 30
        END;

        UPDATE members
        SET status = 'active',
            start_date = COALESCE(start_date, CURRENT_DATE),
            expiry_date = GREATEST(COALESCE(expiry_date, CURRENT_DATE), CURRENT_DATE) + v_days_to_add,
            payment_proof_status = 'approved',
            updated_at = NOW()
        WHERE id = v_tx.member_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Pembayaran tunai berhasil dikonfirmasi! Paket member aktif otomatis.',
        'invoice_code', v_tx.invoice_code,
        'amount', v_tx.amount,
        'member_id', v_tx.member_id
    );
END;
$$;

-- 6. ROW LEVEL SECURITY (RLS) FOR TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weightlifting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weightlifting_bookings ENABLE ROW LEVEL SECURITY;

-- Member RLS Policy: Members can only see their own transactions
CREATE POLICY "Members view own transactions"
ON transactions
FOR SELECT
USING (
    (current_user_role() = 'member' AND user_id = auth.uid()) OR
    (current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin'))
);

CREATE POLICY "Members insert own transactions"
ON transactions
FOR INSERT
WITH CHECK (
    current_user_role() = 'member' OR
    current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin')
);

-- Staff RLS Policy: Only Staff can update pending transactions to paid
CREATE POLICY "Staff update transactions"
ON transactions
FOR UPDATE
USING (
    current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin')
)
WITH CHECK (
    current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin')
);

-- Member RLS Policy on Members Table: Members can view their own profile
CREATE POLICY "Members view own profile"
ON members
FOR SELECT
USING (
    email = auth.email() OR
    current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'personal_trainer', 'sales', 'admin')
);

-- Weightlifting Sessions: Everyone can read, only staff can insert/update
CREATE POLICY "View active weightlifting sessions"
ON weightlifting_sessions
FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff manage weightlifting sessions"
ON weightlifting_sessions
FOR ALL
USING (current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin'))
WITH CHECK (current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin'));

-- Weightlifting Bookings: Members can view and book their own
CREATE POLICY "Members view own weightlifting bookings"
ON weightlifting_bookings
FOR SELECT
USING (
    member_id IN (SELECT id FROM members WHERE email = auth.email()) OR
    current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin')
);

CREATE POLICY "Members book weightlifting sessions"
ON weightlifting_bookings
FOR INSERT
WITH CHECK (
    member_id IN (SELECT id FROM members WHERE email = auth.email()) OR
    current_user_role() IN ('superadmin', 'club_manager', 'front_desk', 'admin')
);

-- 7. PG_CRON SCHEDULE (IF PG_CRON AVAILABLE IN SUPABASE)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'expire-overdue-cash-invoices-every-minute',
            '* * * * *',
            'SELECT expire_overdue_transactions();'
        );
    END IF;
END $$;

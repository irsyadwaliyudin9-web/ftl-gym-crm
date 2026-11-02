-- ==============================================================================
-- FitLead CRM (FTL Edition) - Complete Database Schema & Migration
-- High-Performance Multi-Tenant Architecture with Strict Row Level Security (RLS)
-- Timezone: Asia/Jakarta (WIB)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set default timezone to Asia/Jakarta (WIB)
SET timezone = 'Asia/Jakarta';

-- ==============================================================================
-- 2. TENANTS & MULTI-CLUB ARCHITECTURE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'single_club', -- 'single_club' (Rp299k) | 'multi_club' (Rp899k)
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'trial', -- 'active' | 'trial' | 'past_due' | 'pending_approval' | 'cancelled'
    mrr_amount NUMERIC(12, 2) NOT NULL DEFAULT 299000,
    midtrans_order_id VARCHAR(100),
    max_members INT NOT NULL DEFAULT 500, -- 500 for single club, unlimited (999999) for multi club
    owner_email VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g. 'FTL-JKT01'
    address TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Jakarta',
    phone VARCHAR(50),
    is_main_branch BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_tenant_club_code UNIQUE (tenant_id, code)
);

-- ==============================================================================
-- 3. USERS & ROLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'front_desk', -- 'superadmin', 'club_manager', 'front_desk', 'personal_trainer', 'sales'
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. MEMBERS CRM & DIGITAL PASS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    member_code VARCHAR(50) NOT NULL, -- e.g. 'FTL-0821'
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    photo_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'lead', -- 'lead', 'active', 'expired'
    package_type VARCHAR(50) NOT NULL DEFAULT '1_month', -- '1_month', '6_months', '1_year'
    package_price NUMERIC(12, 2) NOT NULL DEFAULT 250000,
    start_date DATE,
    expiry_date DATE,
    qr_code_data VARCHAR(255) NOT NULL, -- e.g. 'FTL-MEMBER:FTL-0821:4f9b2c'
    notes TEXT,
    assigned_sales_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_club_member_code UNIQUE (club_id, member_code)
);

CREATE INDEX IF NOT EXISTS idx_members_club_id ON members(club_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_expiry_date ON members(expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_qr_code ON members(qr_code_data);

-- ==============================================================================
-- 5. FRONT DESK CHECK-IN SYSTEM
-- ==============================================================================

CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_method VARCHAR(50) NOT NULL DEFAULT 'qr_scan', -- 'qr_scan', 'barcode', 'manual_search'
    status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'expired_denied', 'invalid'
    front_desk_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_club_date ON check_ins(club_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_checkins_member ON check_ins(member_id);

-- ==============================================================================
-- 6. PERSONAL TRAINER (PT) PACKAGES & SESSION SINK (RACE-CONDITION RESISTANT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS pt_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    package_name VARCHAR(255) NOT NULL DEFAULT 'Paket Personal Trainer 12 Sesi',
    total_sessions INT NOT NULL DEFAULT 12,
    used_sessions INT NOT NULL DEFAULT 0,
    remaining_sessions INT NOT NULL DEFAULT 12,
    price NUMERIC(12, 2) NOT NULL DEFAULT 2400000,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_sessions_validity CHECK (remaining_sessions >= 0 AND (used_sessions + remaining_sessions = total_sessions))
);

CREATE TABLE IF NOT EXISTS pt_session_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    pt_package_id UUID NOT NULL REFERENCES pt_packages(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    session_number INT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE, -- Prevents accidental double burning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pt_packages_club ON pt_packages(club_id);
CREATE INDEX IF NOT EXISTS idx_pt_packages_member ON pt_packages(member_id);
CREATE INDEX IF NOT EXISTS idx_pt_packages_trainer ON pt_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_pt_logs_idempotency ON pt_session_logs(idempotency_key);

-- ==============================================================================
-- 7. CLASS SCHEDULE & BOOKING MANAGEMENT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS gym_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g. 'Power Yoga', 'Pound Fit', 'Body Pump'
    category VARCHAR(50) NOT NULL DEFAULT 'group_fitness',
    instructor_name VARCHAR(255) NOT NULL,
    instructor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    day_of_week INT NOT NULL, -- 1 = Senin, 2 = Selasa, ... 7 = Minggu
    start_time TIME NOT NULL, -- e.g. '18:00:00'
    end_time TIME NOT NULL,   -- e.g. '19:00:00'
    capacity_limit INT NOT NULL DEFAULT 20,
    room VARCHAR(100) DEFAULT 'Studio 1',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES gym_classes(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'booked', -- 'booked', 'attended', 'cancelled'
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_member_class_booking UNIQUE (class_id, member_id, booking_date)
);

CREATE INDEX IF NOT EXISTS idx_class_bookings_class_date ON class_bookings(class_id, booking_date);

-- ==============================================================================
-- 8. POINT OF SALE (POS) KASIR
-- ==============================================================================

CREATE TABLE IF NOT EXISTS pos_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(50) NOT NULL DEFAULT 'beverage', -- 'beverage', 'supplement', 'merchandise', 'snack'
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 50,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    cashier_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash', -- 'cash', 'qris', 'transfer', 'debit'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES pos_products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- ==============================================================================
-- 9. AUDIT LOGS FOR OPERATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'DEDUCT_PT_SESSION', 'CHECK_IN', 'CREATE_MEMBER', 'CANCEL_BOOKING'
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 10. POSTGRES STORED PROCEDURE: deduct_pt_session (RACE-CONDITION RESISTANT)
-- Uses SELECT ... FOR UPDATE Row-Level Locking and Idempotency Key validation
-- ==============================================================================

CREATE OR REPLACE FUNCTION deduct_pt_session(
    p_member_id UUID,
    p_package_id UUID,
    p_trainer_id UUID,
    p_idempotency_key TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT 'Sesi latihan rutin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_package RECORD;
    v_new_used INT;
    v_new_remaining INT;
    v_log_id UUID;
    v_key TEXT;
    v_status VARCHAR(50);
BEGIN
    -- 1. Ensure an idempotency key is supplied
    v_key := COALESCE(p_idempotency_key, 'deduct_' || p_package_id::TEXT || '_' || extract(epoch from now())::TEXT);

    -- 2. Row-level Lock (SELECT FOR UPDATE) to prevent concurrency race conditions
    SELECT * INTO v_package
    FROM pt_packages
    WHERE id = p_package_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Paket Personal Trainer dengan ID % tidak ditemukan.', p_package_id;
    END IF;

    -- Validate member ownership if member ID provided
    IF p_member_id IS NOT NULL AND v_package.member_id <> p_member_id THEN
        RAISE EXCEPTION 'Member ID % tidak cocok dengan pemilik paket PT ini.', p_member_id;
    END IF;

    -- 3. Idempotency Check under Lock
    IF EXISTS (SELECT 1 FROM pt_session_logs WHERE idempotency_key = v_key) THEN
        SELECT id, session_number INTO v_log_id, v_new_used
        FROM pt_session_logs WHERE idempotency_key = v_key;

        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'message', 'Operasi pemotongan sesi sudah pernah diproses sebelumnya (Idempotent).',
            'package_id', p_package_id,
            'remaining_sessions', v_package.remaining_sessions,
            'session_number', v_new_used,
            'log_id', v_log_id
        );
    END IF;

    IF v_package.status <> 'active' THEN
        RAISE EXCEPTION 'Paket Personal Trainer ini sudah tidak aktif (Status: %).', v_package.status;
    END IF;

    IF v_package.remaining_sessions <= 0 THEN
        RAISE EXCEPTION 'Kuota sesi Personal Trainer sudah habis (Sisa: 0). Silakan lakukan perpanjangan paket.';
    END IF;

    -- 4. Calculate updated values
    v_new_used := v_package.used_sessions + 1;
    v_new_remaining := v_package.remaining_sessions - 1;
    v_status := CASE WHEN v_new_remaining = 0 THEN 'completed' ELSE 'active' END;

    -- 5. Mutate Package Quota
    UPDATE pt_packages
    SET used_sessions = v_new_used,
        remaining_sessions = v_new_remaining,
        status = v_status,
        updated_at = NOW()
    WHERE id = p_package_id;

    -- 6. Insert Session Audit Log with unique_violation safety net
    BEGIN
        INSERT INTO pt_session_logs (
            tenant_id,
            club_id,
            pt_package_id,
            member_id,
            trainer_id,
            session_number,
            logged_at,
            notes,
            idempotency_key
        ) VALUES (
            v_package.tenant_id,
            v_package.club_id,
            p_package_id,
            v_package.member_id,
            p_trainer_id,
            v_new_used,
            NOW(),
            p_notes,
            v_key
        ) RETURNING id INTO v_log_id;
    EXCEPTION WHEN unique_violation THEN
        SELECT id, session_number INTO v_log_id, v_new_used
        FROM pt_session_logs WHERE idempotency_key = v_key;

        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'message', 'Operasi pemotongan sesi sudah pernah diproses sebelumnya (Idempotent).',
            'package_id', p_package_id,
            'remaining_sessions', v_new_remaining,
            'session_number', v_new_used,
            'log_id', v_log_id
        );
    END;

    -- 7. Record into general audit logs
    INSERT INTO audit_logs (
        tenant_id,
        club_id,
        user_id,
        action,
        entity_name,
        entity_id,
        payload
    ) VALUES (
        v_package.tenant_id,
        v_package.club_id,
        p_trainer_id,
        'DEDUCT_PT_SESSION',
        'pt_packages',
        p_package_id::TEXT,
        jsonb_build_object(
            'session_number', v_new_used,
            'remaining_sessions', v_new_remaining,
            'log_id', v_log_id,
            'notes', p_notes
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'message', '1 Sesi Personal Trainer berhasil digunakan.',
        'package_id', p_package_id,
        'session_number', v_new_used,
        'remaining_sessions', v_new_remaining,
        'total_sessions', v_package.total_sessions,
        'package_status', v_status,
        'log_id', v_log_id,
        'logged_at', NOW()
    );
END;
$$;

-- Overload for backwards compatibility
CREATE OR REPLACE FUNCTION deduct_pt_session(
    p_package_id UUID,
    p_trainer_id UUID,
    p_notes TEXT DEFAULT 'Sesi latihan rutin',
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN deduct_pt_session(NULL::UUID, p_package_id, p_trainer_id, p_idempotency_key, p_notes);
END;
$$;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation per club_id & tenant_id
-- ==============================================================================

-- Enable RLS across all sensitive tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to inspect current user's role and club_id from JWT or user_profiles
CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
    SELECT COALESCE(
        auth.jwt() -> 'app_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'role',
        (SELECT role FROM user_profiles WHERE id = auth.uid()),
        NULLIF(auth.jwt() ->> 'role', ''),
        'anon'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_club_id() RETURNS UUID AS $$
    SELECT COALESCE(
        NULLIF(auth.jwt() -> 'app_metadata' ->> 'club_id', '')::UUID,
        NULLIF(auth.jwt() -> 'user_metadata' ->> 'club_id', '')::UUID,
        (SELECT club_id FROM user_profiles WHERE id = auth.uid())
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_tenant_id() RETURNS UUID AS $$
    SELECT COALESCE(
        NULLIF(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::UUID,
        NULLIF(auth.jwt() -> 'user_metadata' ->> 'tenant_id', '')::UUID,
        (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Members RLS Policy
CREATE POLICY "Tenant and Club isolation for members"
ON members
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- Check-ins RLS Policy
CREATE POLICY "Tenant and Club isolation for check_ins"
ON check_ins
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- PT Packages RLS Policy
CREATE POLICY "Tenant and Club isolation for pt_packages"
ON pt_packages
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- PT Session Logs RLS Policy
CREATE POLICY "Tenant and Club isolation for pt_session_logs"
ON pt_session_logs
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- Gym Classes RLS Policy
CREATE POLICY "Tenant and Club isolation for gym_classes"
ON gym_classes
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- Class Bookings RLS Policy
CREATE POLICY "Tenant and Club isolation for class_bookings"
ON class_bookings
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- POS Products RLS Policy
CREATE POLICY "Tenant and Club isolation for pos_products"
ON pos_products
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- POS Transactions RLS Policy
CREATE POLICY "Tenant and Club isolation for pos_transactions"
ON pos_transactions
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    (club_id = current_user_club_id() AND tenant_id = current_user_tenant_id())
);

-- POS Transaction Items RLS Policy
CREATE POLICY "Tenant and Club isolation for pos_transaction_items"
ON pos_transaction_items
FOR ALL
USING (
    current_user_role() = 'superadmin' OR
    EXISTS (
        SELECT 1 FROM pos_transactions t
        WHERE t.id = pos_transaction_items.transaction_id
        AND t.club_id = current_user_club_id()
        AND t.tenant_id = current_user_tenant_id()
    )
)
WITH CHECK (
    current_user_role() = 'superadmin' OR
    EXISTS (
        SELECT 1 FROM pos_transactions t
        WHERE t.id = pos_transaction_items.transaction_id
        AND t.club_id = current_user_club_id()
        AND t.tenant_id = current_user_tenant_id()
    )
);

-- Tenants RLS Policies
CREATE POLICY "Superadmin full access on tenants"
ON tenants
FOR ALL
USING (current_user_role() = 'superadmin')
WITH CHECK (current_user_role() = 'superadmin');

CREATE POLICY "Tenant owners and staff view own tenant"
ON tenants
FOR SELECT
USING (id = current_user_tenant_id());

CREATE POLICY "Tenant owners update own tenant"
ON tenants
FOR UPDATE
USING (id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'))
WITH CHECK (id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'));

-- Clubs RLS Policies
CREATE POLICY "Superadmin full access on clubs"
ON clubs
FOR ALL
USING (current_user_role() = 'superadmin')
WITH CHECK (current_user_role() = 'superadmin');

CREATE POLICY "Users view clubs in own tenant"
ON clubs
FOR SELECT
USING (tenant_id = current_user_tenant_id());

CREATE POLICY "Club managers manage clubs in own tenant"
ON clubs
FOR INSERT
WITH CHECK (tenant_id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'));

CREATE POLICY "Club managers update clubs in own tenant"
ON clubs
FOR UPDATE
USING (tenant_id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'))
WITH CHECK (tenant_id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'));

-- User Profiles RLS Policies
CREATE POLICY "Superadmin full access on user_profiles"
ON user_profiles
FOR ALL
USING (current_user_role() = 'superadmin')
WITH CHECK (current_user_role() = 'superadmin');

CREATE POLICY "Users view profiles within own tenant"
ON user_profiles
FOR SELECT
USING (tenant_id = current_user_tenant_id() OR id = auth.uid());

CREATE POLICY "Users update own profile"
ON user_profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Club managers manage profiles in own tenant"
ON user_profiles
FOR ALL
USING (tenant_id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'))
WITH CHECK (tenant_id = current_user_tenant_id() AND current_user_role() IN ('club_manager', 'superadmin'));

-- Audit Logs RLS Policies
CREATE POLICY "Tenant and Club isolation for viewing audit_logs"
ON audit_logs
FOR SELECT
USING (
    current_user_role() = 'superadmin' OR
    (tenant_id = current_user_tenant_id() AND (club_id IS NULL OR club_id = current_user_club_id()))
);

CREATE POLICY "Authenticated staff insert audit_logs"
ON audit_logs
FOR INSERT
WITH CHECK (
    current_user_role() = 'superadmin' OR
    tenant_id = current_user_tenant_id()
);


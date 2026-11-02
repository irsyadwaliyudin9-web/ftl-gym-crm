// ==============================================================================
// FitLead CRM (FTL Edition) - TypeScript Type Definitions
// ==============================================================================

export type UserRole = 
  | 'member'
  | 'admin'
  | 'pt'
  | 'superadmin'
  | 'club_manager'
  | 'front_desk'
  | 'personal_trainer'
  | 'sales';

export type TransactionPaymentMethod = 'online' | 'tunai';
export type TransactionStatus = 'pending' | 'paid' | 'expired';
export type TransactionType = 'membership' | 'pt_package';

export interface Transaction {
  id: string;
  tenant_id?: string;
  club_id?: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  invoice_code: string; // e.g. "INV-FTL-20261102-7891"
  transaction_type: TransactionType;
  title: string;
  description: string;
  amount: number;
  payment_method: TransactionPaymentMethod;
  payment_channel?: string; // 'midtrans_qris', 'midtrans_va_bca', 'midtrans_gopay', 'tunai_frontdesk'
  status: TransactionStatus;
  created_at: string;
  expires_at: string; // created_at + 1 hour (60 minutes)
  paid_at?: string;
  confirmed_by?: string;
  details?: {
    package_type?: PackageType;
    coach_id?: string;
    coach_name?: string;
    sessions_count?: number;
    additional_days?: number;
  };
}

export interface WeightliftingSession {
  id: string;
  tenant_id?: string;
  club_id?: string;
  name: string;
  category: string;
  instructor_name: string;
  instructor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity_limit: number;
  booked_count: number;
  room: string;
  is_active: boolean;
  booked_member_ids?: string[];
}

export type SubscriptionPlan = 'single_club' | 'multi_club';

export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'pending_approval' | 'cancelled';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  mrr_amount: number;
  midtrans_order_id?: string;
  max_members: number;
  owner_email: string;
  owner_phone?: string;
  created_at: string;
}

export interface Club {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  is_main_branch: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  tenant_id?: string;
  club_id?: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export type MemberStatus = 'lead' | 'active' | 'expired' | 'pending_approval';
export type PackageType = '1_month' | '6_months' | '1_year' | 'custom';

export interface Member {
  id: string;
  tenant_id: string;
  club_id: string;
  member_code: string;
  full_name: string;
  phone: string;
  email?: string;
  photo_url?: string;
  status: MemberStatus;
  package_type: PackageType;
  package_price: number;
  start_date: string; // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
  qr_code_data: string;
  notes?: string;
  assigned_sales_id?: string;
  created_at: string;
  password?: string; // Optional for consumer credentials
  // Approval & Registration fields
  payment_proof_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  selected_coach_id?: string;
  selected_coach_name?: string;
  selected_coach_sessions?: number;
  // Computed / Joined fields
  club_name?: string;
  assigned_sales_name?: string;
  pt_active_package?: PTPackage;
}

export type CheckInMethod = 'qr_scan' | 'barcode' | 'manual_search';
export type CheckInStatus = 'success' | 'expired_denied' | 'invalid' | 'pending_denied';

export interface CheckIn {
  id: string;
  tenant_id: string;
  club_id: string;
  member_id: string;
  check_in_time: string; // ISO 8601 with WIB
  scan_method: CheckInMethod;
  status: CheckInStatus;
  front_desk_user_id?: string;
  notes?: string;
  member_name?: string;
  member_code?: string;
  photo_url?: string;
  package_type?: PackageType;
  expiry_date?: string;
}

export type PTPackageStatus = 'active' | 'completed' | 'expired';

export interface PTPackage {
  id: string;
  tenant_id: string;
  club_id: string;
  member_id: string;
  trainer_id: string;
  package_name: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  price: number;
  purchase_date: string;
  expiry_date?: string;
  status: PTPackageStatus;
  created_at: string;
  // Joined fields
  member_name?: string;
  member_code?: string;
  trainer_name?: string;
}

export interface PTSessionLog {
  id: string;
  tenant_id: string;
  club_id: string;
  pt_package_id: string;
  member_id: string;
  trainer_id: string;
  session_number: number;
  logged_at: string; // ISO timestamp
  notes: string;
  idempotency_key: string;
  created_at: string;
  member_name?: string;
  trainer_name?: string;
}

export interface GymClass {
  id: string;
  tenant_id: string;
  club_id: string;
  name: string;
  category: string;
  instructor_name: string;
  instructor_id?: string;
  day_of_week: number; // 1 = Senin, ... 7 = Minggu
  start_time: string; // '18:00'
  end_time: string;   // '19:00'
  capacity_limit: number;
  room: string;
  is_active: boolean;
  booked_count?: number;
}

export type BookingStatus = 'booked' | 'attended' | 'cancelled';

export interface ClassBooking {
  id: string;
  tenant_id: string;
  club_id: string;
  class_id: string;
  member_id: string;
  booking_date: string;
  status: BookingStatus;
  checked_in_at?: string;
  created_at: string;
  member_name?: string;
  member_code?: string;
  member_phone?: string;
}

export type POSCategory = 'beverage' | 'supplement' | 'merchandise' | 'snack';

export interface POSProduct {
  id: string;
  tenant_id: string;
  club_id: string;
  name: string;
  sku: string;
  category: POSCategory;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
}

export interface POSCartItem {
  product: POSProduct;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'debit';

export interface POSTransaction {
  id: string;
  tenant_id: string;
  club_id: string;
  invoice_number: string;
  cashier_user_id?: string;
  member_id?: string;
  member_name?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  notes?: string;
  created_at: string;
}

export interface DailyHourlyTraffic {
  hour: string; // '06:00', '07:00' ... '21:00'
  checkins: number;
  isPeak: boolean;
}

export interface Coach {
  id: string;
  name: string;
  nickname: string;
  specialty: string;
  experience: string;
  rating: number;
  photo_url: string;
  bio: string;
  available_days: string;
  pt_rate_12: number;
  pt_rate_24: number;
}


"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  Tenant,
  Club,
  UserProfile,
  Member,
  MemberStatus,
  CheckIn,
  PTPackage,
  PTSessionLog,
  GymClass,
  ClassBooking,
  POSProduct,
  POSTransaction,
  POSCartItem,
  PaymentMethod,
  CheckInMethod,
  CheckInStatus,
  DailyHourlyTraffic,
  Coach,
  Transaction,
  WeightliftingSession,
  TransactionStatus,
  TransactionPaymentMethod,
  TransactionType,
} from "@/lib/types";
import { soundManager } from "@/components/common/SoundEffects";
import { exportToCSV, formatRupiah, formatWIBDate, formatWIBDateTime, isExpiringSoon, isPackageExpired } from "@/lib/utils";

// ==============================================================================
// INITIAL SEED DATA (FTL GYM PROPRIETARY SYSTEM)
// ==============================================================================

const SEED_TENANTS: Tenant[] = [
  {
    id: "tenant-ftl",
    name: "One O One Gym (101 Gym)",
    slug: "one-o-one-gym",
    subscription_plan: "multi_club",
    subscription_status: "active",
    mrr_amount: 0,
    max_members: 999999,
    owner_email: "management@oneoonegym.com",
    owner_phone: "+628118899001",
    created_at: "2026-01-01T08:00:00Z",
  },
];

const SEED_CLUBS: Club[] = [
  {
    id: "club-ftl-01",
    tenant_id: "tenant-ftl",
    name: "One O One Gym Garut Kota (Pusat)",
    code: "101-GRT",
    address: "Jl. Cimanuk No. 101, Garut Kota, Kabupaten Garut, Jawa Barat 44118",
    city: "Garut Kota, Jawa Barat",
    phone: "0262-234101",
    is_main_branch: true,
    created_at: "2026-01-01T08:00:00Z",
  },
];

export const SEED_COACHES: Coach[] = [
  {
    id: "coach-dian",
    name: "Coach Dian Permata, CSCS",
    nickname: "Coach Dian",
    specialty: "Hypertrophy, Strength & Fat Loss Transformation",
    experience: "7+ Tahun Pengalaman · 150+ Member Berhasil",
    rating: 4.9,
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    bio: "Certified Strength & Conditioning Specialist. Fokus pada pembentukan massa otot ideal, perbaikan postur, dan program diet nutrisi terstruktur.",
    available_days: "Senin - Sabtu (07:00 - 21:00 WIB)",
    rate_per_session: 30000,
    pt_rate_12: 360000,
    pt_rate_24: 680000,
  },
  {
    id: "coach-denny",
    name: "Coach Denny Santoso",
    nickname: "Coach Denny",
    specialty: "Body Recomposition & Powerbuilding",
    experience: "6 Tahun Pengalaman · Atlet Nasional",
    rating: 4.8,
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    bio: "Spesialis program angkat beban terukur (Bench, Squat, Deadlift) serta fat-loss conditioning intensitas tinggi.",
    available_days: "Senin - Jumat (06:00 - 20:00 WIB)",
    rate_per_session: 28000,
    pt_rate_12: 336000,
    pt_rate_24: 640000,
  },
  {
    id: "coach-maya",
    name: "Coach Maya Saphira",
    nickname: "Coach Maya",
    specialty: "Hypertrophy & Female Strength Transformation",
    experience: "5 Tahun Pengalaman · Certified Strength Trainer",
    rating: 4.9,
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    bio: "Spesialis program angkat beban terarah, teknik squat/deadlift yang aman, perbaikan postur tubuh, dan body shaping atletis.",
    available_days: "Selasa - Minggu (08:00 - 18:00 WIB)",
    rate_per_session: 27000,
    pt_rate_12: 324000,
    pt_rate_24: 620000,
  },
  {
    id: "coach-kevin",
    name: "Coach Kevin Adrian",
    nickname: "Coach Kevin",
    specialty: "HIIT Cardio & Weight Loss Acceleration",
    experience: "4 Tahun Pengalaman",
    rating: 4.7,
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    bio: "Program latihan kilat bagi Anda yang sibuk. Bakar kalori maksimal dalam 45 menit sesi latihan.",
    available_days: "Setiap Hari (06:00 - 22:00 WIB)",
    rate_per_session: 25000,
    pt_rate_12: 300000,
    pt_rate_24: 580000,
  },
];


const SEED_USERS: UserProfile[] = [
  {
    id: "user-mgr-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Bambang Prakoso",
    email: "bambang.mgr@ironforge.co.id",
    phone: "+628128888001",
    role: "club_manager",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-15T08:00:00Z",
  },
  {
    id: "user-fd-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Rina Anggraini",
    email: "rina.reception@ironforge.co.id",
    phone: "+6281399887766",
    role: "front_desk",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-16T08:00:00Z",
  },
  {
    id: "user-pt-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Coach Denny Santoso",
    email: "denny.pt@ironforge.co.id",
    phone: "+628117766554",
    role: "personal_trainer",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-16T08:00:00Z",
  },
  {
    id: "user-pt-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Coach Maya Saphira",
    email: "maya.pt@ironforge.co.id",
    phone: "+628129911223",
    role: "personal_trainer",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "user-sales-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Kevin Wijaya",
    email: "kevin.sales@ironforge.co.id",
    phone: "+628156677889",
    role: "sales",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "user-superadmin",
    full_name: "Superadmin FitLead",
    email: "admin@fitleadcrm.com",
    phone: "+6281100009999",
    role: "superadmin",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
];

const SEED_MEMBERS: Member[] = [
  {
    id: "mem-0801",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0801",
    full_name: "Arya Putra Perdana",
    phone: "+628123456001",
    email: "arya.perdana@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "1_year",
    package_price: 2400000,
    start_date: "2026-01-10",
    expiry_date: "2027-01-10",
    qr_code_data: "FTL:FTL-0801:ARYA-PUTRA",
    notes: "Member loyal, fokus powerlifting dan strength conditioning.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "mem-0802",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0802",
    full_name: "Siti Rahmawati",
    phone: "+628123456002",
    email: "siti.rahma@yahoo.com",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "1_month",
    package_price: 250000,
    start_date: "2026-10-04",
    expiry_date: "2026-11-04", // 5 days left from Oct 30 -> Needs Attention
    qr_code_data: "FTL:FTL-0802:SITI-RAHMA",
    notes: "Paket akan habis dalam 5 hari! Perlu follow up penawaran 6 bulan diskon 20%.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-10-04T11:00:00Z",
  },
  {
    id: "mem-0803",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0803",
    full_name: "Budi Santoso",
    phone: "+628123456003",
    email: "budi.santoso@outlook.com",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    status: "expired",
    package_type: "1_month",
    package_price: 250000,
    start_date: "2026-09-25",
    expiry_date: "2026-10-25", // Already expired 5 days ago! (Layar Merah)
    qr_code_data: "FTL:FTL-0803:BUDI-SANTOSO",
    notes: "Paket kadaluarsa. Tawarkan perpanjangan dengan free joining fee.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-09-25T14:00:00Z",
  },
  {
    id: "mem-0804",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0804",
    full_name: "Clarissa Tan",
    phone: "+628123456004",
    email: "clarissa.tan@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "6_months",
    package_price: 1200000,
    start_date: "2026-08-01",
    expiry_date: "2027-02-01",
    qr_code_data: "FTL:FTL-0804:CLARISSA-TAN",
    notes: "Memiliki paket PT 12 sesi dengan Coach Denny.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-08-01T09:30:00Z",
  },
  {
    id: "mem-0805",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0805",
    full_name: "Dedi Kusnadi",
    phone: "+628123456005",
    email: "dedi.kusnadi@corp.co.id",
    photo_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "1_month",
    package_price: 250000,
    start_date: "2026-10-15",
    expiry_date: "2026-11-15",
    qr_code_data: "FTL:FTL-0805:DEDI-KUSNADI",
    notes: "Sisa sesi PT tinggal 1 sesi! Target closing paket PT 12 sesi baru.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-10-15T15:00:00Z",
  },
  {
    id: "mem-0806",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0806",
    full_name: "Fajar Nugraha",
    phone: "+628123456006",
    email: "fajar.nugraha@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    status: "lead",
    package_type: "6_months",
    package_price: 1200000,
    start_date: "2026-10-30",
    expiry_date: "2026-10-30",
    qr_code_data: "FTL:FTL-0806:FAJAR-NUGRAHA",
    notes: "Calon member baru, minta info paket 6 bulan. Follow-up via WA.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-10-28T16:20:00Z",
  },
  {
    id: "mem-0807",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0807",
    full_name: "Gita Savitri",
    phone: "+628123456007",
    email: "gita.savitri@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    status: "lead",
    package_type: "1_year",
    package_price: 2400000,
    start_date: "2026-10-30",
    expiry_date: "2026-10-30",
    qr_code_data: "FTL:FTL-0807:GITA-SAVITRI",
    notes: "Datang via Instagram Ads. Jadwal trial kelas Pilates & Yoga Sabtu ini.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-10-29T10:15:00Z",
  },
  {
    id: "mem-0808",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0808",
    full_name: "Hendri Pratama",
    phone: "+628123456008",
    email: "hendri.p@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "6_months",
    package_price: 1200000,
    start_date: "2026-05-02",
    expiry_date: "2026-11-02", // 3 days left -> Needs Attention
    qr_code_data: "FTL:FTL-0808:HENDRI-PRATAMA",
    notes: "Paket akan expired dalam 3 hari. Member rajin pagi hari.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-05-02T07:00:00Z",
  },
  {
    id: "mem-0809-pending",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0809",
    full_name: "Reza Rahardian",
    phone: "+62895601800302",
    email: "reza.rahardian@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    status: "pending_approval",
    payment_proof_status: "pending",
    package_type: "6_months",
    package_price: 1200000,
    start_date: "2026-11-02",
    expiry_date: "2027-05-02",
    qr_code_data: "FTL:FTL-0809:REZA-RAHARDIAN",
    notes: "Pendaftaran Online: Paket 6 Bulan + Coach Dian (12 Sesi) - Bukti transfer dikirim ke WA Admin 0895601800302",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-11-02T09:00:00Z",
    selected_coach_id: "coach-dian",
    selected_coach_name: "Coach Dian Permata, CSCS",
    selected_coach_sessions: 12,
  },
  {
    id: "mem-0810-pending",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_code: "FTL-0810",
    full_name: "Nabila Syakieb",
    phone: "+6281311223344",
    email: "nabila.syakieb@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    status: "pending_approval",
    payment_proof_status: "pending",
    package_type: "1_month",
    package_price: 250000,
    start_date: "2026-11-02",
    expiry_date: "2026-12-02",
    qr_code_data: "FTL:FTL-0810:NABILA-SYAKIEB",
    notes: "Pendaftaran Online: Paket 1 Bulan - Menunggu verifikasi transfer BCA",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-11-02T10:30:00Z",
  },
  {
    id: "mem-0901",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    member_code: "FTL-0901",
    full_name: "Dimas Suryo Wicaksono",
    phone: "+628123450901",
    email: "dimas.suryo@sby.co.id",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "6_months",
    package_price: 1200000,
    start_date: "2026-07-15",
    expiry_date: "2027-01-15",
    qr_code_data: "FTL:FTL-0901:DIMAS-SURYO",
    notes: "Cabang Surabaya Dharmahusada. Memiliki paket PT 12 sesi dengan Coach Maya.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-07-15T09:00:00Z",
  },
  {
    id: "mem-0902",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    member_code: "FTL-0902",
    full_name: "Anisa Maharani",
    phone: "+628123450902",
    email: "anisa.maharani@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    status: "active",
    package_type: "1_month",
    package_price: 250000,
    start_date: "2026-10-03",
    expiry_date: "2026-11-03", // 4 days left -> Needs Attention
    qr_code_data: "FTL:FTL-0902:ANISA-MAHARANI",
    notes: "Surabaya branch. Akan expired dalam 4 hari, follow up paket 6 bulan.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-10-03T10:00:00Z",
  },
  {
    id: "mem-0903",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    member_code: "FTL-0903",
    full_name: "Reza Aditya Nugroho",
    phone: "+628123450903",
    email: "reza.aditya@sby.id",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    status: "expired",
    package_type: "1_month",
    package_price: 250000,
    start_date: "2026-09-20",
    expiry_date: "2026-10-20",
    qr_code_data: "FTL:FTL-0903:REZA-ADITYA",
    notes: "Expired 10 hari lalu. Follow up via WhatsApp.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-09-20T11:00:00Z",
  },
  {
    id: "mem-0904",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    member_code: "FTL-0904",
    full_name: "Natasha Wijaya",
    phone: "+628123450904",
    email: "natasha.w@gmail.com",
    photo_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    status: "lead",
    package_type: "6_months",
    package_price: 1200000,
    start_date: "2026-10-30",
    expiry_date: "2026-10-30",
    qr_code_data: "FTL:FTL-0904:NATASHA-WIJAYA",
    notes: "Prospek baru Surabaya, tertarik kelas Zumba.",
    assigned_sales_id: "user-sales-01",
    created_at: "2026-10-29T15:00:00Z",
  },
];

const SEED_PT_PACKAGES: PTPackage[] = [
  {
    id: "pt-pkg-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_id: "mem-0804", // Clarissa Tan
    trainer_id: "user-pt-01", // Coach Denny
    package_name: "Paket PT 12 Sesi (Hypertrophy & Tone)",
    total_sessions: 12,
    used_sessions: 4,
    remaining_sessions: 8,
    price: 2400000,
    purchase_date: "2026-08-05",
    expiry_date: "2026-12-05",
    status: "active",
    created_at: "2026-08-05T10:00:00Z",
    member_name: "Clarissa Tan",
    member_code: "FTL-0804",
    trainer_name: "Coach Denny Santoso",
  },
  {
    id: "pt-pkg-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_id: "mem-0805", // Dedi Kusnadi
    trainer_id: "user-pt-02", // Coach Maya
    package_name: "Paket PT 10 Sesi (Weight Loss & Fat Burn)",
    total_sessions: 10,
    used_sessions: 9,
    remaining_sessions: 1, // Only 1 left!
    price: 2000000,
    purchase_date: "2026-09-01",
    expiry_date: "2026-11-30",
    status: "active",
    created_at: "2026-09-01T14:00:00Z",
    member_name: "Dedi Kusnadi",
    member_code: "FTL-0805",
    trainer_name: "Coach Maya Saphira",
  },
  {
    id: "pt-pkg-03",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_id: "mem-0801", // Arya Putra
    trainer_id: "user-pt-01", // Coach Denny
    package_name: "Paket PT 24 Sesi (Athletic Performance)",
    total_sessions: 24,
    used_sessions: 18,
    remaining_sessions: 6,
    price: 4500000,
    purchase_date: "2026-01-20",
    expiry_date: "2027-01-20",
    status: "active",
    created_at: "2026-01-20T11:00:00Z",
    member_name: "Arya Putra Perdana",
    member_code: "FTL-0801",
    trainer_name: "Coach Denny Santoso",
  },
  {
    id: "pt-pkg-04",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    member_id: "mem-0901", // Dimas Suryo
    trainer_id: "user-pt-02", // Coach Maya
    package_name: "Paket PT 12 Sesi (Strength & Mobility)",
    total_sessions: 12,
    used_sessions: 5,
    remaining_sessions: 7,
    price: 2400000,
    purchase_date: "2026-08-10",
    expiry_date: "2026-12-31",
    status: "active",
    created_at: "2026-08-10T10:00:00Z",
    member_name: "Dimas Suryo Wicaksono",
    member_code: "FTL-0901",
    trainer_name: "Coach Maya Saphira",
  },
];

const SEED_PT_LOGS: PTSessionLog[] = [
  {
    id: "pt-log-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    pt_package_id: "pt-pkg-01",
    member_id: "mem-0804",
    trainer_id: "user-pt-01",
    session_number: 4,
    logged_at: "2026-10-28T18:45:00Z",
    notes: "Leg day & glute focus. Squat 40kg 4x10, lunges 12kg dumbell. Form sangat bagus.",
    idempotency_key: "seed_pt_log_001",
    created_at: "2026-10-28T18:45:00Z",
    member_name: "Clarissa Tan",
    trainer_name: "Coach Denny Santoso",
  },
  {
    id: "pt-log-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    pt_package_id: "pt-pkg-02",
    member_id: "mem-0805",
    trainer_id: "user-pt-02",
    session_number: 9,
    logged_at: "2026-10-29T08:15:00Z",
    notes: "Cardio interval & Core workout. Treadmill sprint 12kmh x 8 interval, battle rope 4 set. Sisa kuota 1 sesi.",
    idempotency_key: "seed_pt_log_002",
    created_at: "2026-10-29T08:15:00Z",
    member_name: "Dedi Kusnadi",
    trainer_name: "Coach Maya Saphira",
  },
  {
    id: "pt-log-03",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    pt_package_id: "pt-pkg-04",
    member_id: "mem-0901",
    trainer_id: "user-pt-02",
    session_number: 5,
    logged_at: "2026-10-29T17:30:00Z",
    notes: "Cabang Surabaya: Deadlift 80kg 5x5, Barbell row 50kg. Mobility shoulder membaik.",
    idempotency_key: "seed_pt_log_003",
    created_at: "2026-10-29T17:30:00Z",
    member_name: "Dimas Suryo Wicaksono",
    trainer_name: "Coach Maya Saphira",
  },
];

const SEED_CLASSES: GymClass[] = [
  {
    id: "cls-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Power Vinyasa Yoga",
    category: "Mind & Body",
    instructor_name: "Coach Maya Saphira",
    instructor_id: "user-pt-02",
    day_of_week: 1, // Senin
    start_time: "18:00",
    end_time: "19:00",
    capacity_limit: 20,
    room: "Studio 1 (Zen Studio)",
    is_active: true,
    booked_count: 16,
  },
  {
    id: "cls-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Pound Fit Ripstix",
    category: "Cardio Drumming",
    instructor_name: "Coach Tina Ross",
    day_of_week: 3, // Rabu
    start_time: "19:00",
    end_time: "20:00",
    capacity_limit: 25,
    room: "Studio 2 (Main Hall)",
    is_active: true,
    booked_count: 22,
  },
  {
    id: "cls-03",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Les Mills BodyPump",
    category: "Strength Barbell",
    instructor_name: "Coach Denny Santoso",
    instructor_id: "user-pt-01",
    day_of_week: 4, // Kamis
    start_time: "18:30",
    end_time: "19:30",
    capacity_limit: 18,
    room: "Main Floor Stage",
    is_active: true,
    booked_count: 14,
  },
  {
    id: "cls-04",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "HIIT Tabata Burn",
    category: "Functional Training",
    instructor_name: "Coach Denny Santoso",
    instructor_id: "user-pt-01",
    day_of_week: 5, // Jumat
    start_time: "18:00",
    end_time: "19:00",
    capacity_limit: 15,
    room: "Functional Turf Area",
    is_active: true,
    booked_count: 15, // FULL
  },
  {
    id: "cls-05",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Spinning RPM Express",
    category: "Indoor Cycling",
    instructor_name: "Coach Ryan Pratama",
    day_of_week: 6, // Sabtu
    start_time: "08:30",
    end_time: "09:30",
    capacity_limit: 16,
    room: "Spinning Dome",
    is_active: true,
    booked_count: 11,
  },
  {
    id: "cls-06",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    name: "Surabaya Power HIIT",
    category: "Functional Training",
    instructor_name: "Coach Maya Saphira",
    instructor_id: "user-pt-02",
    day_of_week: 2, // Selasa
    start_time: "18:30",
    end_time: "19:30",
    capacity_limit: 20,
    room: "Studio Bromo (Surabaya)",
    is_active: true,
    booked_count: 8,
  },
  {
    id: "cls-07",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    name: "Zumba Party Dharmahusada",
    category: "Cardio Dance",
    instructor_name: "Coach Lisa Anggraini",
    day_of_week: 4, // Kamis
    start_time: "19:00",
    end_time: "20:00",
    capacity_limit: 25,
    room: "Studio Aerobik Utama",
    is_active: true,
    booked_count: 18,
  },
];

const SEED_BOOKINGS: ClassBooking[] = [
  {
    id: "bk-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    class_id: "cls-01",
    member_id: "mem-0804",
    booking_date: "2026-11-02",
    status: "booked",
    created_at: "2026-10-28T09:00:00Z",
    member_name: "Clarissa Tan",
    member_code: "FTL-0804",
    member_phone: "+628123456004",
  },
  {
    id: "bk-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    class_id: "cls-01",
    member_id: "mem-0801",
    booking_date: "2026-11-02",
    status: "attended",
    checked_in_at: "2026-11-02T17:55:00Z",
    created_at: "2026-10-28T10:00:00Z",
    member_name: "Arya Putra Perdana",
    member_code: "FTL-0801",
    member_phone: "+628123456001",
  },
  {
    id: "bk-03",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    class_id: "cls-02",
    member_id: "mem-0802",
    booking_date: "2026-11-04",
    status: "booked",
    created_at: "2026-10-29T14:00:00Z",
    member_name: "Siti Rahmawati",
    member_code: "FTL-0802",
    member_phone: "+628123456002",
  },
];

const SEED_POS_PRODUCTS: POSProduct[] = [
  {
    id: "pos-prod-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Air Mineral Prima 600ml (Dingin)",
    sku: "BEV-001",
    category: "beverage",
    price: 8000,
    stock: 84,
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Pocari Sweat Isotonik 500ml",
    sku: "BEV-002",
    category: "beverage",
    price: 12000,
    stock: 42,
    image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-03",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Whey Protein Isolate Sachet (Double Choco)",
    sku: "SUP-001",
    category: "supplement",
    price: 35000,
    stock: 65,
    image_url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-04",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "BCAA Recovery Amino Can",
    sku: "SUP-002",
    category: "supplement",
    price: 28000,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-05",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Oat & Almond Protein Bar 60g",
    sku: "SNK-001",
    category: "snack",
    price: 25000,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1622484216850-eb596d769edc?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-06",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "FitLead Sport Shaker Bottle 700ml",
    sku: "MER-001",
    category: "merchandise",
    price: 75000,
    stock: 18,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-07",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "FitLead Quick-Dry Gym Towel (Black)",
    sku: "MER-002",
    category: "merchandise",
    price: 60000,
    stock: 22,
    image_url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-08",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    name: "Heavy Duty Lifting Wrist Straps",
    sku: "MER-003",
    category: "merchandise",
    price: 85000,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-09",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    name: "Air Mineral Prima 600ml (Dingin)",
    sku: "BEV-001-SBY",
    category: "beverage",
    price: 8000,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-10",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    name: "Whey Protein Isolate Sachet (Double Choco)",
    sku: "SUP-001-SBY",
    category: "supplement",
    price: 35000,
    stock: 45,
    image_url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-11",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    name: "Pocari Sweat Isotonik 500ml",
    sku: "BEV-002-SBY",
    category: "beverage",
    price: 12000,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "pos-prod-12",
    tenant_id: "tenant-ironforge",
    club_id: "club-sby-01",
    name: "FitLead Sport Shaker Bottle 700ml",
    sku: "MER-001-SBY",
    category: "merchandise",
    price: 75000,
    stock: 12,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
];

const SEED_POS_TRANSACTIONS: POSTransaction[] = [
  {
    id: "tx-pos-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    invoice_number: "INV-POS-20261030-001",
    cashier_user_id: "user-fd-01",
    member_id: "mem-0801",
    member_name: "Arya Putra Perdana",
    total_amount: 43000,
    payment_method: "qris",
    items: [
      { product_id: "pos-prod-01", product_name: "Air Mineral Prima 600ml (Dingin)", quantity: 1, unit_price: 8000, subtotal: 8000 },
      { product_id: "pos-prod-03", product_name: "Whey Protein Isolate Sachet (Double Choco)", quantity: 1, unit_price: 35000, subtotal: 35000 },
    ],
    notes: "Pembayaran QRIS BCA sukses",
    created_at: "2026-10-30T10:15:00Z",
  },
  {
    id: "tx-pos-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    invoice_number: "INV-POS-20261030-002",
    cashier_user_id: "user-fd-01",
    member_id: "mem-0804",
    member_name: "Clarissa Tan",
    total_amount: 87000,
    payment_method: "cash",
    items: [
      { product_id: "pos-prod-02", product_name: "Pocari Sweat Isotonik 500ml", quantity: 1, unit_price: 12000, subtotal: 12000 },
      { product_id: "pos-prod-06", product_name: "FitLead Sport Shaker Bottle 700ml", quantity: 1, unit_price: 75000, subtotal: 75000 },
    ],
    notes: "Uang pas Rp87.000",
    created_at: "2026-10-30T11:40:00Z",
  },
];

const SEED_WEIGHTLIFTING_SESSIONS: WeightliftingSession[] = [
  {
    id: "wl-sess-01",
    name: "Basic Powerlifting (Squat, Bench, Deadlift)",
    category: "Powerlifting",
    instructor_name: "Coach Dian",
    instructor_id: "coach-dian",
    day_of_week: 1, // Senin
    start_time: "18:30",
    end_time: "20:00",
    capacity_limit: 8,
    booked_count: 5,
    room: "Platform Barbell & Power Rack",
    is_active: true,
    booked_member_ids: ["mem-0801", "mem-0802"],
  },
  {
    id: "wl-sess-02",
    name: "Hypertrophy Muscle Camp (Chest & Biceps)",
    category: "Hypertrophy",
    instructor_name: "Coach Rendy",
    instructor_id: "coach-rendy",
    day_of_week: 2, // Selasa
    start_time: "19:00",
    end_time: "20:30",
    capacity_limit: 8,
    booked_count: 6,
    room: "Dumbbell Free Weight Area",
    is_active: true,
    booked_member_ids: ["mem-0804"],
  },
  {
    id: "wl-sess-03",
    name: "Deadlift & Posterior Chain Heavy Session",
    category: "Strength",
    instructor_name: "Coach Kevin",
    instructor_id: "coach-kevin",
    day_of_week: 3, // Rabu
    start_time: "16:00",
    end_time: "17:30",
    capacity_limit: 6,
    booked_count: 4,
    room: "Olympic Deadlift Platform",
    is_active: true,
    booked_member_ids: ["mem-0801"],
  },
  {
    id: "wl-sess-04",
    name: "Upper Body Heavy Strength & Back Sculpting",
    category: "Strength",
    instructor_name: "Coach Maya",
    instructor_id: "coach-maya",
    day_of_week: 5, // Jumat
    start_time: "17:00",
    end_time: "18:30",
    capacity_limit: 8,
    booked_count: 3,
    room: "Plate-Loaded Strength Zone",
    is_active: true,
    booked_member_ids: [],
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-init-01",
    member_id: "mem-0801",
    member_name: "Arya Putra Perdana",
    member_phone: "+628123456001",
    invoice_code: "INV-FTL-20261102-3601",
    transaction_type: "pt_package",
    title: "Paket 12 Sesi Coach/PT (Coach Dian)",
    description: "Pendampingan teknik powerlifting dan hipertrofi intensif",
    amount: 4800000,
    payment_method: "tunai",
    payment_channel: "tunai_frontdesk",
    status: "pending",
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 54 * 60 * 1000).toISOString(), // ~54 mins remaining countdown
    details: {
      coach_id: "coach-dian",
      coach_name: "Coach Dian",
      sessions_count: 12,
    },
  },
  {
    id: "tx-init-02",
    member_id: "mem-0801",
    member_name: "Arya Putra Perdana",
    member_phone: "+628123456001",
    invoice_code: "INV-FTL-20261025-9921",
    transaction_type: "membership",
    title: "Membership One O One Gym 1 Tahun (VIP)",
    description: "Akses VIP 365 Hari ke seluruh area angkat beban",
    amount: 2200000,
    payment_method: "online",
    payment_channel: "midtrans_qris",
    status: "paid",
    created_at: "2026-10-25T09:00:00Z",
    expires_at: "2026-10-25T10:00:00Z",
    paid_at: "2026-10-25T09:02:14Z",
    details: {
      package_type: "1_year",
      additional_days: 365,
    },
  },
  {
    id: "tx-init-03",
    member_id: "mem-0804",
    member_name: "Clarissa Tan",
    member_phone: "+628123456004",
    invoice_code: "INV-FTL-20261020-5541",
    transaction_type: "pt_package",
    title: "Paket 12 Sesi Coach/PT (Coach Maya)",
    description: "Latihan beban fokus body sculpting",
    amount: 3900000,
    payment_method: "tunai",
    payment_channel: "tunai_frontdesk",
    status: "paid",
    created_at: "2026-10-20T14:10:00Z",
    expires_at: "2026-10-20T15:10:00Z",
    paid_at: "2026-10-20T14:35:10Z",
    confirmed_by: "Staf Front Desk (Rian)",
    details: {
      coach_id: "coach-maya",
      coach_name: "Coach Maya",
      sessions_count: 12,
    },
  },
];

const SEED_CHECKINS: CheckIn[] = [
  {
    id: "chk-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_id: "mem-0801",
    check_in_time: "2026-10-30T07:15:00Z",
    scan_method: "qr_scan",
    status: "success",
    front_desk_user_id: "user-fd-01",
    member_name: "Arya Putra Perdana",
    member_code: "FTL-0801",
    photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    package_type: "1_year",
    expiry_date: "2027-01-10",
  },
  {
    id: "chk-02",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_id: "mem-0804",
    check_in_time: "2026-10-30T08:30:00Z",
    scan_method: "qr_scan",
    status: "success",
    front_desk_user_id: "user-fd-01",
    member_name: "Clarissa Tan",
    member_code: "FTL-0804",
    photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    package_type: "6_months",
    expiry_date: "2027-02-01",
  },
  {
    id: "chk-03",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    member_id: "mem-0803",
    check_in_time: "2026-10-30T09:10:00Z",
    scan_method: "barcode",
    status: "expired_denied",
    front_desk_user_id: "user-fd-01",
    member_name: "Budi Santoso",
    member_code: "FTL-0803",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    package_type: "1_month",
    expiry_date: "2026-10-25",
    notes: "Akses ditolak: Membership kadaluarsa pada 25 Okt 2026.",
  },
];

// Seed realistic hourly distribution for peak hour chart (17:00-20:00 peak)
const SEED_HOURLY_TRAFFIC: DailyHourlyTraffic[] = [
  { hour: "06:00", checkins: 8, isPeak: false },
  { hour: "07:00", checkins: 14, isPeak: false },
  { hour: "08:00", checkins: 12, isPeak: false },
  { hour: "09:00", checkins: 9, isPeak: false },
  { hour: "10:00", checkins: 7, isPeak: false },
  { hour: "11:00", checkins: 11, isPeak: false },
  { hour: "12:00", checkins: 18, isPeak: false },
  { hour: "13:00", checkins: 10, isPeak: false },
  { hour: "14:00", checkins: 8, isPeak: false },
  { hour: "15:00", checkins: 12, isPeak: false },
  { hour: "16:00", checkins: 22, isPeak: false },
  { hour: "17:00", checkins: 48, isPeak: true },
  { hour: "18:00", checkins: 62, isPeak: true },
  { hour: "19:00", checkins: 55, isPeak: true },
  { hour: "20:00", checkins: 38, isPeak: true },
  { hour: "21:00", checkins: 16, isPeak: false },
];

// ==============================================================================
// CONTEXT INTERFACE
// ==============================================================================

interface CheckInEvaluationResult {
  success: boolean;
  status: CheckInStatus;
  member?: Member;
  message: string;
  checkInRecord?: CheckIn;
}

interface GymDataContextType {
  // State
  tenants: Tenant[];
  currentTenant: Tenant;
  clubs: Club[];
  currentClub: Club;
  members: Member[];
  checkIns: CheckIn[];
  ptPackages: PTPackage[];
  ptSessionLogs: PTSessionLog[];
  gymClasses: GymClass[];
  classBookings: ClassBooking[];
  posProducts: POSProduct[];
  posTransactions: POSTransaction[];
  hourlyTraffic: DailyHourlyTraffic[];
  coaches: Coach[];
  transactions: Transaction[];
  weightliftingSessions: WeightliftingSession[];
  
  // Stats
  activeMembersCount: number;
  monthlyRevenue: number;
  todayCheckinsCount: number;
  newLeadsCount: number;
  needsAttentionMembers: Member[];
  pendingMembers: Member[];
  pendingMembersCount: number;
  refreshFromCloud: () => Promise<void>;

  // Actions
  setCurrentClub: (club: Club) => void;
  checkInMember: (query: string, method?: CheckInMethod) => CheckInEvaluationResult;
  deductPTSession: (packageId: string, trainerId: string, notes: string, idempotencyKey: string) => Promise<{ success: boolean; message: string; remainingSessions?: number }>;
  addMember: (member: Partial<Member>) => Member;
  approveMember: (memberId: string) => { success: boolean; message: string };
  rejectMember: (memberId: string, reason?: string) => { success: boolean; message: string };
  registerOnlineMember: (data: {
    full_name: string;
    phone: string;
    email: string;
    package_type: "1_month" | "6_months" | "1_year";
    selected_coach_id?: string;
    pt_sessions_count?: number;
  }) => { success: boolean; member?: Member; ptPackage?: PTPackage; duplicate?: boolean; message?: string; existingMember?: Member };
  loginCustomer: (identifier: string) => { success: boolean; member?: Member; message: string };
  bookCoachForMember: (coachId: string, memberId: string, sessionsCount: number) => { success: boolean; message: string };
  updateMember: (id: string, updates: Partial<Member>) => void;
  bookGymClass: (classId: string, memberId: string, bookingDate: string) => { success: boolean; message: string };
  checkInClassBooking: (bookingId: string) => void;
  cancelClassBooking: (bookingId: string) => void;
  processPOSTransaction: (cart: POSCartItem[], paymentMethod: PaymentMethod, memberId?: string) => POSTransaction;
  approveTenant: (tenantId: string) => void;
  rejectTenant: (tenantId: string) => void;
  createTransaction: (data: {
    memberId: string;
    memberName?: string;
    memberPhone?: string;
    transactionType: TransactionType;
    title: string;
    description: string;
    amount: number;
    paymentMethod: TransactionPaymentMethod;
    paymentChannel?: string;
    details?: any;
  }) => Transaction;
  confirmCashTransaction: (invoiceCode: string, staffUserId?: string) => { success: boolean; message: string; transaction?: Transaction };
  bookWeightliftingSession: (sessionId: string, memberId: string) => { success: boolean; message: string };
  exportMembersCSV: () => void;
  exportReportsCSV: () => void;
  resetToDemoData: () => void;
}

const GymDataContext = createContext<GymDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "fitlead_crm_state_v4";

export const GymDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(SEED_TENANTS);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(SEED_TENANTS[0]);
  const [clubs, setClubs] = useState<Club[]>(SEED_CLUBS);
  const [currentClub, setCurrentClub] = useState<Club>(SEED_CLUBS[0]);
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(SEED_CHECKINS);
  const [ptPackages, setPtPackages] = useState<PTPackage[]>(SEED_PT_PACKAGES);
  const [ptSessionLogs, setPtSessionLogs] = useState<PTSessionLog[]>(SEED_PT_LOGS);
  const [gymClasses, setGymClasses] = useState<GymClass[]>(SEED_CLASSES);
  const [classBookings, setClassBookings] = useState<ClassBooking[]>(SEED_BOOKINGS);
  const [posProducts, setPosProducts] = useState<POSProduct[]>(SEED_POS_PRODUCTS);
  const [posTransactions, setPosTransactions] = useState<POSTransaction[]>(SEED_POS_TRANSACTIONS);
  const [hourlyTraffic, setHourlyTraffic] = useState<DailyHourlyTraffic[]>(SEED_HOURLY_TRAFFIC);
  const [coaches] = useState<Coach[]>(SEED_COACHES);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [weightliftingSessions, setWeightliftingSessions] = useState<WeightliftingSession[]>(SEED_WEIGHTLIFTING_SESSIONS);

  // Concurrency refs to eliminate React closure lag and race conditions
  const ptLockRef = useRef<boolean>(false);
  const processedIdempotencyKeysRef = useRef<Set<string>>(
    new Set(SEED_PT_LOGS.map((l) => l.idempotency_key))
  );
  const packagesRef = useRef<PTPackage[]>(SEED_PT_PACKAGES);
  const logsRef = useRef<PTSessionLog[]>(SEED_PT_LOGS);

  // Sync refs when packages or logs change
  useEffect(() => {
    packagesRef.current = ptPackages;
  }, [ptPackages]);

  useEffect(() => {
    logsRef.current = ptSessionLogs;
    ptSessionLogs.forEach((l) => processedIdempotencyKeysRef.current.add(l.idempotency_key));
  }, [ptSessionLogs]);

  // Load from localStorage if present & preserve seed pending members
  useEffect(() => {
    try {
      let loadedMembers: Member[] = [];

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members && Array.isArray(parsed.members)) {
          loadedMembers = [...parsed.members];
        }
        if (parsed.checkIns) setCheckIns(parsed.checkIns);
        if (parsed.ptPackages) {
          setPtPackages(parsed.ptPackages);
          packagesRef.current = parsed.ptPackages;
        }
        if (parsed.ptSessionLogs) {
          setPtSessionLogs(parsed.ptSessionLogs);
          logsRef.current = parsed.ptSessionLogs;
          parsed.ptSessionLogs.forEach((l: PTSessionLog) => processedIdempotencyKeysRef.current.add(l.idempotency_key));
        }
        if (parsed.gymClasses) setGymClasses(parsed.gymClasses);
        if (parsed.classBookings) setClassBookings(parsed.classBookings);
        if (parsed.posTransactions) setPosTransactions(parsed.posTransactions);
        if (parsed.posProducts) setPosProducts(parsed.posProducts);
        if (parsed.tenants) setTenants(parsed.tenants);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
        }
        if (parsed.weightliftingSessions && Array.isArray(parsed.weightliftingSessions)) {
          setWeightliftingSessions(parsed.weightliftingSessions);
        }
      }

      // Check legacy storage key for registrations made during migration
      try {
        const legacyRaw = localStorage.getItem("fitlead_crm_state");
        if (legacyRaw) {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy.members)) {
            parsedLegacy.members.forEach((lm: Member) => {
              if (!loadedMembers.some((m) => m.id === lm.id || (lm.phone && m.phone === lm.phone))) {
                loadedMembers.unshift(lm);
              }
            });
          }
          if (Array.isArray(parsedLegacy.transactions)) {
            setTransactions((prev) => {
              const existingIds = new Set(prev.map((t) => t.id));
              const missing = parsedLegacy.transactions.filter((t: any) => !existingIds.has(t.id));
              return [...missing, ...prev];
            });
          }
        }
      } catch (e) {}

      // Check current active member session
      try {
        const sessionRaw = localStorage.getItem("ftl_member_session");
        if (sessionRaw) {
          const sessionMem = JSON.parse(sessionRaw);
          if (sessionMem && sessionMem.id) {
            if (!loadedMembers.some((m) => m.id === sessionMem.id || (sessionMem.phone && m.phone === sessionMem.phone))) {
              loadedMembers.unshift(sessionMem);
            }
          }
        }
      } catch (e) {}

      const existingIds = new Set(loadedMembers.map((m: Member) => m.id));
      const seedPending = SEED_MEMBERS.filter((m) => m.status === "pending_approval" && !existingIds.has(m.id));
      const combinedMembers = [...seedPending, ...loadedMembers];
      setMembers(combinedMembers);
    } catch (e) {
      console.warn("Could not read local state, using seed defaults", e);
    }
  }, []);

  // Cloud synchronization across devices (Mobile Phone <-> Staff PC)
  const syncWithCloud = async () => {
    try {
      const res = await fetch("/api/cloud-sync", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members) && data.members.length > 0) {
          setMembers((prev) => {
            let changed = false;
            const prevMap = new Map<string, Member>();
            const phoneToId = new Map<string, string>();

            prev.forEach((m) => {
              prevMap.set(m.id, m);
              const p = (m.phone || "").replace(/[^0-9]/g, "");
              if (p) phoneToId.set(p, m.id);
            });

            data.members.forEach((cm: Member) => {
              const cmPhone = (cm.phone || "").replace(/[^0-9]/g, "");
              const matchedId = prevMap.has(cm.id) ? cm.id : (cmPhone ? phoneToId.get(cmPhone) : null);

              if (!matchedId) {
                // New member from cloud - insert into map
                prevMap.set(cm.id, cm);
                if (cmPhone) phoneToId.set(cmPhone, cm.id);
                changed = true;
              } else {
                const local = prevMap.get(matchedId);
                if (
                  local &&
                  (local.status !== cm.status ||
                    local.payment_proof_status !== cm.payment_proof_status ||
                    (cm.status === "pending_approval" && local.status !== "pending_approval"))
                ) {
                  prevMap.set(matchedId, { ...local, ...cm });
                  changed = true;
                }
              }
            });

            if (changed) {
              // Ensure pending members always appear first!
              const updated = Array.from(prevMap.values()).sort((a, b) => {
                const aPending = a.status === "pending_approval" || a.payment_proof_status === "pending" ? 1 : 0;
                const bPending = b.status === "pending_approval" || b.payment_proof_status === "pending" ? 1 : 0;
                if (aPending !== bPending) return bPending - aPending;
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
              });

              try {
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : {};
                parsed.members = updated;
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
              } catch (e) {}
              return updated;
            }
            return prev;
          });
        }

        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const missing = data.transactions.filter((t: Transaction) => !existingIds.has(t.id));
            if (missing.length > 0) {
              return [...missing, ...prev];
            }
            return prev;
          });
        }
      }
    } catch (err) {}
  };

  const refreshFromCloud = async () => {
    await syncWithCloud();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    syncWithCloud();
    const interval = setInterval(syncWithCloud, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time synchronization across browser tabs (Portal Customer <-> Staff CRM)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("ftl_gym_sync_v4");
      bc.onmessage = (event) => {
        if (event.data?.type === "SYNC_MEMBERS" && Array.isArray(event.data.members)) {
          setMembers(event.data.members);
          soundManager.playSuccessBeep();
        }
        if (event.data?.type === "SYNC_TRANSACTIONS" && event.data.transaction) {
          setTransactions((prev) => {
            const exists = prev.some((t) => t.id === event.data.transaction.id);
            if (exists) {
              return prev.map((t) => (t.id === event.data.transaction.id ? event.data.transaction : t));
            }
            return [event.data.transaction, ...prev];
          });
        }
      };
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.members)) {
            setMembers(parsed.members);
          }
          if (Array.isArray(parsed.transactions)) {
            setTransactions(parsed.transactions);
          }
        } catch (err) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  // Auto-expire overdue pending cash transactions (1 hour rule)
  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      setTransactions((prev) => {
        let changed = false;
        const updated = prev.map((tx) => {
          if (tx.status === "pending" && tx.payment_method === "tunai" && now > new Date(tx.expires_at)) {
            changed = true;
            return { ...tx, status: "expired" as const };
          }
          return tx;
        });
        return changed ? updated : prev;
      });
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          members,
          checkIns,
          ptPackages,
          ptSessionLogs,
          gymClasses,
          classBookings,
          posTransactions,
          posProducts,
          tenants,
          transactions,
          weightliftingSessions,
        })
      );
    } catch (e) {
      // Storage quota or SSR ignore
    }
  }, [members, checkIns, ptPackages, ptSessionLogs, gymClasses, classBookings, posTransactions, posProducts, tenants, transactions, weightliftingSessions]);

  // Derived stats (Semua member terdaftar & aktif tercatat di dashboard)
  const activeMembers = members.filter((m) => m.status === "active");
  const activeMembersCount = activeMembers.length;
  
  // Monthly Revenue = Akumulasi Biaya Membership Aktif + Paket Personal Trainer
  const membershipRev = activeMembers.reduce((sum, m) => sum + (m.package_price || 0), 0);
  const ptRev = ptPackages.reduce((sum, p) => sum + (p.price || (p.total_sessions * 25000)), 0);
  const monthlyRevenue = membershipRev + ptRev;

  // Check-ins today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCheckinsCount = checkIns.filter(
    (c) => c.club_id === currentClub.id && c.status === "success" && c.check_in_time.startsWith(todayStr)
  ).length;

  const newLeadsCount = members.filter((m) => m.club_id === currentClub.id && m.status === "lead").length;

  // Members needing attention: active members expiring in <= 7 days
  const needsAttentionMembers = members.filter(
    (m) => m.club_id === currentClub.id && m.status === "active" && isExpiringSoon(m.expiry_date, 7)
  );

  // Pending Approval Members (Waiting for admin verification across all branches)
  const pendingMembers = members.filter(
    (m) => m.status === "pending_approval" || m.payment_proof_status === "pending"
  );
  const pendingMembersCount = pendingMembers.length;

  // ==============================================================================
  // CORE OPERATION: CHECK-IN SCANNER
  // Evaluates QR/Barcode/Manual code, plays sound synthesizer, logs check-in record
  // ==============================================================================
  const checkInMember = (query: string, method: CheckInMethod = "qr_scan"): CheckInEvaluationResult => {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) {
      soundManager.playErrorBeep();
      return {
        success: false,
        status: "invalid",
        message: "Kode QR atau nomor member tidak boleh kosong.",
      };
    }

    // Find member by ID, member_code, phone, qr_code_data, or full_name
    const found = members.find((m) => {
      if (m.club_id !== currentClub.id) return false;
      if (m.member_code.toUpperCase() === cleanQuery) return true;
      if (m.qr_code_data.toUpperCase().includes(cleanQuery)) return true;
      if (cleanQuery.includes(m.member_code.toUpperCase())) return true;
      if (m.phone.replace(/[^0-9]/g, "").includes(cleanQuery.replace(/[^0-9]/g, ""))) return true;
      if (m.full_name.toUpperCase().includes(cleanQuery)) return true;
      return false;
    });

    if (!found) {
      soundManager.playErrorBeep();
      const failRecord: CheckIn = {
        id: `chk-${Date.now()}`,
        tenant_id: currentTenant.id,
        club_id: currentClub.id,
        member_id: "unknown",
        check_in_time: new Date().toISOString(),
        scan_method: method,
        status: "invalid",
        notes: `Member tidak ditemukan dengan input: "${query}"`,
      };
      setCheckIns((prev) => [failRecord, ...prev]);
      return {
        success: false,
        status: "invalid",
        message: `Member dengan input "${query}" tidak terdaftar di cabang ${currentClub.name}.`,
        checkInRecord: failRecord,
      };
    }

    // If member is still pending admin approval
    if (found.status === "pending_approval") {
      soundManager.playErrorBeep();
      const pendingRecord: CheckIn = {
        id: `chk-${Date.now()}`,
        tenant_id: currentTenant.id,
        club_id: currentClub.id,
        member_id: found.id,
        check_in_time: new Date().toISOString(),
        scan_method: method,
        status: "pending_denied",
        member_name: found.full_name,
        member_code: found.member_code,
        photo_url: found.photo_url,
        package_type: found.package_type,
        expiry_date: found.expiry_date,
        notes: `AKSES DITOLAK: Member ${found.member_code} belum diapprove admin / belum verifikasi pembayaran WA: 0895601800302`,
      };
      setCheckIns((prev) => [pendingRecord, ...prev]);
      return {
        success: false,
        status: "pending_denied",
        member: found,
        message: `AKSES DITOLAK: Pendaftaran ${found.full_name} (${found.member_code}) belum disetujui admin. Hubungi Admin WhatsApp 0895-6018-00302 untuk aktivasi!`,
        checkInRecord: pendingRecord,
      };
    }

    // Check expiry cleanly with timezone-aware helper
    const isExpired = found.status === "expired" || isPackageExpired(found.expiry_date);

    if (isExpired || found.status !== "active") {
      soundManager.playErrorBeep();
      const expiredRecord: CheckIn = {
        id: `chk-${Date.now()}`,
        tenant_id: currentTenant.id,
        club_id: currentClub.id,
        member_id: found.id,
        check_in_time: new Date().toISOString(),
        scan_method: method,
        status: "expired_denied",
        member_name: found.full_name,
        member_code: found.member_code,
        photo_url: found.photo_url,
        package_type: found.package_type,
        expiry_date: found.expiry_date,
        notes: `AKSES DITOLAK: Paket ${found.package_type} kadaluarsa pada ${formatWIBDate(found.expiry_date)}`,
      };
      setCheckIns((prev) => [expiredRecord, ...prev]);
      return {
        success: false,
        status: "expired_denied",
        member: found,
        message: `Akses ditolak! Paket membership ${found.full_name} (${found.member_code}) sudah kadaluarsa sejak ${formatWIBDate(found.expiry_date)}.`,
        checkInRecord: expiredRecord,
      };
    }

    // SUCCESS - Active Member
    soundManager.playSuccessBeep();
    const successRecord: CheckIn = {
      id: `chk-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      member_id: found.id,
      check_in_time: new Date().toISOString(),
      scan_method: method,
      status: "success",
      member_name: found.full_name,
      member_code: found.member_code,
      photo_url: found.photo_url,
      package_type: found.package_type,
      expiry_date: found.expiry_date,
      notes: "Check-in sukses. Selamat berlatih!",
    };

    setCheckIns((prev) => [successRecord, ...prev]);

    // Update hourly traffic count for the current hour
    const currentHour = new Date().getHours();
    const hourLabel = `${String(currentHour).padStart(2, "0")}:00`;
    setHourlyTraffic((prev) =>
      prev.map((slot) => (slot.hour === hourLabel ? { ...slot, checkins: slot.checkins + 1 } : slot))
    );

    return {
      success: true,
      status: "success",
      member: found,
      message: `Selamat datang, ${found.full_name}! Membership aktif hingga ${formatWIBDate(found.expiry_date)}.`,
      checkInRecord: successRecord,
    };
  };

  // ==============================================================================
  // CORE OPERATION: DEDUCT PT SESSION (RACE CONDITION GUARD & IDEMPOTENCY)
  // Simulates Postgres Row-Locking & Idempotency Key validation
  // ==============================================================================
  const deductPTSession = async (
    packageId: string,
    trainerId: string,
    notes: string,
    idempotencyKey: string
  ): Promise<{ success: boolean; message: string; remainingSessions?: number }> => {
    // 1. Immediate idempotency fast-check
    if (processedIdempotencyKeysRef.current.has(idempotencyKey)) {
      const pkg = packagesRef.current.find((p) => p.id === packageId);
      return {
        success: true,
        message: "Sesi ini telah berhasil dipotong sebelumnya (Idempotent Request).",
        remainingSessions: pkg?.remaining_sessions,
      };
    }

    // 2. Concurrency Row-Level Lock simulation (spin-lock mutex)
    const startTime = Date.now();
    while (ptLockRef.current) {
      if (Date.now() - startTime > 5000) {
        throw new Error("Lock timeout: Transaksi pemotongan sesi lain sedang berlangsung.");
      }
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    ptLockRef.current = true;

    try {
      // Re-check idempotency under acquired lock
      if (processedIdempotencyKeysRef.current.has(idempotencyKey)) {
        const pkg = packagesRef.current.find((p) => p.id === packageId);
        return {
          success: true,
          message: "Sesi ini telah berhasil dipotong sebelumnya (Idempotent Request).",
          remainingSessions: pkg?.remaining_sessions,
        };
      }

      // Check current package under lock
      const pkgIndex = packagesRef.current.findIndex((p) => p.id === packageId);
      if (pkgIndex === -1) {
        return { success: false, message: "Paket Personal Trainer tidak ditemukan." };
      }

      const targetPkg = packagesRef.current[pkgIndex];
      if (targetPkg.status !== "active") {
        return { success: false, message: `Paket sudah tidak aktif (Status: ${targetPkg.status}).` };
      }
      if (targetPkg.remaining_sessions <= 0) {
        return { success: false, message: "Kuota sesi PT sudah habis (Sisa: 0). Silakan perpanjang paket." };
      }

      const updatedRemaining = targetPkg.remaining_sessions - 1;
      const updatedUsed = targetPkg.used_sessions + 1;
      const newStatus = updatedRemaining === 0 ? "completed" : "active";

      const updatedPkg: PTPackage = {
        ...targetPkg,
        used_sessions: updatedUsed,
        remaining_sessions: updatedRemaining,
        status: newStatus,
      };

      const trainer = SEED_USERS.find((u) => u.id === trainerId) || { full_name: "Coach" };

      const newLog: PTSessionLog = {
        id: `pt-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenant_id: targetPkg.tenant_id,
        club_id: targetPkg.club_id,
        pt_package_id: targetPkg.id,
        member_id: targetPkg.member_id,
        trainer_id: trainerId,
        session_number: updatedUsed,
        logged_at: new Date().toISOString(),
        notes: notes || "Sesi latihan personal trainer",
        idempotency_key: idempotencyKey,
        created_at: new Date().toISOString(),
        member_name: targetPkg.member_name,
        trainer_name: trainer.full_name,
      };

      // Mark idempotency key and mutate synchronous refs FIRST
      processedIdempotencyKeysRef.current.add(idempotencyKey);
      const nextPackages = packagesRef.current.map((p) => (p.id === packageId ? updatedPkg : p));
      const nextLogs = [newLog, ...logsRef.current];
      packagesRef.current = nextPackages;
      logsRef.current = nextLogs;

      // Update React state
      setPtPackages(nextPackages);
      setPtSessionLogs(nextLogs);

      return {
        success: true,
        message: `1 Sesi berhasil dipotong. Sisa kuota: ${updatedRemaining} sesi.`,
        remainingSessions: updatedRemaining,
      };
    } finally {
      ptLockRef.current = false;
    }
  };

  // ==============================================================================
  // MEMBER MANAGEMENT
  // ==============================================================================
  const addMember = (data: Partial<Member>): Member => {
    const nextSeq = members.length + 1;
    const code = `101-0${800 + nextSeq}`;
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      member_code: code,
      full_name: data.full_name || "Member Baru",
      phone: data.phone || "+628120000000",
      email: data.email || "",
      photo_url: data.photo_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      status: data.status || "active",
      package_type: data.package_type || "1_month",
      package_price: data.package_price || 250000,
      start_date: data.start_date || new Date().toISOString().slice(0, 10),
      expiry_date: data.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      qr_code_data: `101:${code}:${data.full_name?.toUpperCase().replace(/\s+/g, "-")}`,
      notes: data.notes || "",
      assigned_sales_id: data.assigned_sales_id || "user-sales-01",
      created_at: new Date().toISOString(),
      club_name: currentClub.name,
    };

    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // Online Registration for Customers with Duplicate Guard
  const registerOnlineMember = (data: {
    full_name: string;
    phone: string;
    email: string;
    package_type: "1_month" | "6_months" | "1_year";
    selected_coach_id?: string;
    pt_sessions_count?: number;
  }): { success: boolean; member?: Member; ptPackage?: PTPackage; duplicate?: boolean; message?: string; existingMember?: Member } => {
    // 1. Prevent duplicate phone or email registration
    const cleanPhone = data.phone.replace(/[^0-9]/g, "");
    const cleanEmail = (data.email || "").trim().toLowerCase();

    const existing = members.find((m) => {
      const mPhone = m.phone.replace(/[^0-9]/g, "");
      const mEmail = (m.email || "").trim().toLowerCase();
      if (cleanPhone && mPhone && cleanPhone === mPhone) return true;
      if (cleanEmail && mEmail && cleanEmail === mEmail) return true;
      return false;
    });

    const prices: Record<string, number> = {
      "1_month": 250000,
      "6_months": 1200000,
      "1_year": 2200000,
    };
    const days: Record<string, number> = {
      "1_month": 30,
      "6_months": 180,
      "1_year": 365,
    };

    const nextSeq = members.length + 1;
    const code = `101-0${800 + nextSeq}`;
    const price = prices[data.package_type] || 250000;
    const validDays = days[data.package_type] || 30;

    const startDate = new Date().toISOString().slice(0, 10);
    const expiryDate = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (existing) {
      // If already pending approval: update their pending registration and float to top!
      if (existing.status === "pending_approval" || existing.payment_proof_status === "pending") {
        const updatedPending: Member = {
          ...existing,
          full_name: data.full_name || existing.full_name,
          email: data.email || existing.email,
          package_type: data.package_type || existing.package_type,
          package_price: price,
          selected_coach_id: data.selected_coach_id,
          selected_coach_name: coaches.find((c) => c.id === data.selected_coach_id)?.name,
          selected_coach_sessions: data.pt_sessions_count,
          created_at: new Date().toISOString(),
          status: "pending_approval",
          payment_proof_status: "pending",
        };
        const updatedMembers = [updatedPending, ...members.filter((m) => m.id !== existing.id)];
        setMembers(updatedMembers);

        const regTx: Transaction = {
          id: `tx-reg-${Date.now()}`,
          tenant_id: currentTenant.id,
          club_id: currentClub.id,
          member_id: updatedPending.id,
          member_name: updatedPending.full_name,
          member_phone: updatedPending.phone,
          invoice_code: `INV-101-${Date.now().toString().slice(-6)}`,
          transaction_type: "membership",
          title: `Pendaftaran Member Baru One O One Gym (${data.package_type.replace("_", " ")}${updatedPending.selected_coach_name ? ` + PT ${updatedPending.selected_coach_name}` : ""})`,
          description: `Pendaftaran baru ${updatedPending.full_name}. Menunggu persetujuan staf front desk One O One Gym Garut Kota.`,
          amount: price,
          payment_method: "tunai",
          payment_channel: "tunai_frontdesk",
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          details: {
            package_type: data.package_type,
            coach_id: data.selected_coach_id,
            coach_name: updatedPending.selected_coach_name,
            sessions_count: data.pt_sessions_count,
          },
        };

        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : {};
          parsed.members = updatedMembers;
          parsed.transactions = [regTx, ...(parsed.transactions || [])];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const bc = new BroadcastChannel("ftl_gym_sync_v4");
            bc.postMessage({ type: "SYNC_MEMBERS", members: updatedMembers, newMember: updatedPending });
            bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: regTx });
            bc.close();
          }

          if (typeof window !== "undefined") {
            fetch("/api/cloud-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "register", member: updatedPending, transaction: regTx }),
            }).catch(() => {});
          }
        } catch (e) {}

        return { success: true, member: updatedPending, duplicate: false, message: "Pendaftaran diperbarui dan sedang menunggu approval staf One O One Gym." };
      }

      return {
        success: false,
        duplicate: true,
        existingMember: existing,
        message: `Nomor WhatsApp (${data.phone}) atau Email (${data.email || "-"}) sudah terdaftar atas nama "${existing.full_name}" (Kode Member: ${existing.member_code}). Akun Anda sudah terdaftar dan aktif. Silakan gunakan tombol Masuk Akun.`,
      };
    }

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      member_code: code,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      status: "pending_approval",
      payment_proof_status: "pending",
      package_type: data.package_type,
      package_price: price,
      start_date: startDate,
      expiry_date: expiryDate,
      qr_code_data: `101:${code}:${data.full_name.toUpperCase().replace(/\s+/g, "-")}`,
      notes: "Pendaftaran Online (Menunggu Konfirmasi Pembayaran WhatsApp 0895-6018-00302)",
      created_at: new Date().toISOString(),
      club_name: currentClub.name,
      selected_coach_id: data.selected_coach_id,
      selected_coach_name: coaches.find((c) => c.id === data.selected_coach_id)?.name,
      selected_coach_sessions: data.pt_sessions_count,
    };

    const regTx: Transaction = {
      id: `tx-reg-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      member_id: newMember.id,
      member_name: newMember.full_name,
      member_phone: newMember.phone,
      invoice_code: `INV-101-${Date.now().toString().slice(-6)}`,
      transaction_type: "membership",
      title: `Pendaftaran Member Baru One O One Gym (${data.package_type.replace("_", " ")}${newMember.selected_coach_name ? ` + PT ${newMember.selected_coach_name}` : ""})`,
      description: `Permohonan pendaftaran member baru ${newMember.full_name}. Menunggu persetujuan staf front desk One O One Gym Garut Kota.`,
      amount: price,
      payment_method: "tunai",
      payment_channel: "tunai_frontdesk",
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      details: {
        package_type: data.package_type,
        coach_id: data.selected_coach_id,
        coach_name: newMember.selected_coach_name,
        sessions_count: data.pt_sessions_count,
      },
    };

    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);
    setTransactions((prev) => [regTx, ...prev]);

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.members = updatedMembers;
      parsed.transactions = [regTx, ...(parsed.transactions || [])];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({ type: "SYNC_MEMBERS", members: updatedMembers, newMember });
        bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: regTx });
        bc.close();
      }

      // Sync to cloud API across devices
      if (typeof window !== "undefined") {
        fetch("/api/cloud-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "register", member: newMember, transaction: regTx }),
        }).catch(() => {});
      }
    } catch (e) {}

    return { success: true, member: newMember };
  };

  // Customer Login via WhatsApp or Email
  const loginCustomer = (identifier: string): { success: boolean; member?: Member; message: string } => {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = clean.replace(/[^0-9]/g, "");

    const found = members.find((m) => {
      const mPhone = m.phone.replace(/[^0-9]/g, "");
      const mEmail = (m.email || "").trim().toLowerCase();
      const mCode = m.member_code.toLowerCase();
      if (cleanPhone && mPhone && mPhone === cleanPhone) return true;
      if (clean && mEmail && mEmail === clean) return true;
      if (clean && mCode && mCode === clean) return true;
      return false;
    });

    if (found) {
      try {
        localStorage.setItem("ftl_portal_member_id", found.id);
      } catch (e) {}
      return {
        success: true,
        member: found,
        message: `Selamat datang kembali, ${found.full_name}!`,
      };
    }

    return {
      success: false,
      message: "Nomor WhatsApp atau Email belum terdaftar. Silakan lakukan pendaftaran member baru.",
    };
  };

  // Persetujuan & Penolakan Member Online oleh Staf Admin
  const approveMember = (memberId: string): { success: boolean; message: string } => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return { success: false, message: "Member tidak ditemukan." };

    const coach = target.selected_coach_id
      ? coaches.find((c) => c.id === target.selected_coach_id) || coaches[0]
      : undefined;
    const ptPrice = target.selected_coach_sessions && coach
      ? (target.selected_coach_sessions === 24 ? coach.pt_rate_24 : coach.pt_rate_12)
      : 0;
    const membershipPrice = target.package_price || 250000;
    const totalRegRevenue = membershipPrice + ptPrice;

    const updatedMembers = members.map((m) =>
      m.id === memberId
        ? {
            ...m,
            status: "active" as MemberStatus,
            payment_proof_status: "approved" as const,
            pt_sessions_remaining: (m.pt_sessions_remaining || 0) + (target.selected_coach_sessions || 0),
            rejection_reason: undefined,
            notes: (m.notes ? m.notes + " · " : "") + `Disetujui Admin pada ${new Date().toLocaleDateString("id-ID")}`,
          }
        : m
    );
    setMembers(updatedMembers);

    // Record financial revenue transaction in transactions ledger
    const regTx: Transaction = {
      id: `tx-appr-${Date.now()}`,
      member_id: target.id,
      member_name: target.full_name,
      member_phone: target.phone,
      invoice_code: `INV-REG-${Date.now().toString().slice(-6)}`,
      transaction_type: "membership",
      title: `Pendaftaran Member Baru (${target.package_type || "1 Bulan"}${target.selected_coach_name ? ` + PT ${target.selected_coach_name}` : ""})`,
      description: `Pemasukan kas pendaftaran resmi member ${target.full_name}`,
      amount: totalRegRevenue,
      payment_method: "online",
      payment_channel: "transfer_bank",
      status: "paid",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      paid_at: new Date().toISOString(),
      confirmed_by: "Staf Admin One O One Gym",
      details: {
        package_type: target.package_type,
        coach_id: target.selected_coach_id,
        coach_name: target.selected_coach_name,
        sessions_count: target.selected_coach_sessions,
      },
    };

    setTransactions((prev) => [regTx, ...prev]);

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.members = updatedMembers;
      parsed.transactions = [regTx, ...(parsed.transactions || [])];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({ type: "SYNC_MEMBERS", members: updatedMembers });
        bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: regTx });
        bc.close();
      }

      // Sync approval to cloud API across devices
      if (typeof window !== "undefined") {
        fetch("/api/cloud-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve", memberId }),
        }).catch(() => {});
      }
    } catch (e) {}

    // If member selected a coach during online registration, activate their PT package
    if (target.selected_coach_id && target.selected_coach_sessions && coach) {
      const startDate = new Date().toISOString().slice(0, 10);

      const newPtPkg: PTPackage = {
        id: `pt-pkg-${Date.now()}`,
        tenant_id: currentTenant.id,
        club_id: currentClub.id,
        member_id: target.id,
        trainer_id: coach.id,
        package_name: `Paket PT ${target.selected_coach_sessions} Sesi (${coach.nickname})`,
        total_sessions: target.selected_coach_sessions,
        used_sessions: 0,
        remaining_sessions: target.selected_coach_sessions,
        price: ptPrice,
        purchase_date: startDate,
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "active",
        created_at: new Date().toISOString(),
        member_name: target.full_name,
        member_code: target.member_code,
        trainer_name: coach.name,
      };

      setPtPackages((prev) => [newPtPkg, ...prev]);
    }

    soundManager.playSuccessBeep();
    return { success: true, message: `Pendaftaran ${target.full_name} (${target.member_code}) berhasil DISETUJUI & status kini AKTIF!` };
  };

  const rejectMember = (memberId: string, reason?: string): { success: boolean; message: string } => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return { success: false, message: "Member tidak ditemukan." };

    const rejectNote = reason || "Pembayaran tidak valid atau belum transfer via WhatsApp.";
    const updatedMembers = members.map((m) =>
      m.id === memberId
        ? {
            ...m,
            status: "expired" as MemberStatus,
            payment_proof_status: "rejected" as const,
            rejection_reason: rejectNote,
            notes: (m.notes ? m.notes + " · " : "") + `Ditolak Admin: ${rejectNote}`,
          }
        : m
    );
    setMembers(updatedMembers);

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.members = updatedMembers;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({ type: "SYNC_MEMBERS", members: updatedMembers });
        bc.close();
      }

      // Sync rejection to cloud API across devices
      if (typeof window !== "undefined") {
        fetch("/api/cloud-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", memberId }),
        }).catch(() => {});
      }
    } catch (e) {}

    return { success: true, message: `Pendaftaran ${target.full_name} berhasil ditolak (${rejectNote}).` };
  };

  const bookCoachForMember = (coachId: string, memberId: string, sessionsCount: number): { success: boolean; message: string } => {
    const coach = coaches.find((c) => c.id === coachId);
    if (!coach) return { success: false, message: "Coach tidak ditemukan." };

    const member = members.find((m) => m.id === memberId);
    if (!member) return { success: false, message: "Data member tidak ditemukan." };

    const ptPrice = sessionsCount === 24 ? coach.pt_rate_24 : coach.pt_rate_12;
    const newPtPackage: PTPackage = {
      id: `pt-pkg-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      member_id: member.id,
      trainer_id: coach.id,
      package_name: `Paket PT ${sessionsCount} Sesi (${coach.nickname})`,
      total_sessions: sessionsCount,
      used_sessions: 0,
      remaining_sessions: sessionsCount,
      price: ptPrice,
      purchase_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "active",
      created_at: new Date().toISOString(),
      member_name: member.full_name,
      member_code: member.member_code,
      trainer_name: coach.name,
    };

    setPtPackages((prev) => [newPtPackage, ...prev]);
    return { success: true, message: `Berhasil mendaftarkan latihan dengan ${coach.name} sebanyak ${sessionsCount} sesi!` };
  };

  // ==============================================================================
  // CLASS BOOKINGS
  // ==============================================================================
  const bookGymClass = (classId: string, memberId: string, bookingDate: string): { success: boolean; message: string } => {
    const gymClass = gymClasses.find((c) => c.id === classId);
    if (!gymClass) return { success: false, message: "Kelas tidak ditemukan." };

    const member = members.find((m) => m.id === memberId);
    if (!member) return { success: false, message: "Member tidak ditemukan." };

    if (member.status !== "active") {
      return { success: false, message: "Hanya member aktif yang dapat melakukan reservasi kelas." };
    }

    const currentBookedCount = classBookings.filter(
      (b) => b.class_id === classId && b.booking_date === bookingDate && b.status !== "cancelled"
    ).length;

    if (currentBookedCount >= gymClass.capacity_limit) {
      return { success: false, message: `Kuota kelas sudah penuh (Maksimal ${gymClass.capacity_limit} peserta).` };
    }

    const alreadyBooked = classBookings.some(
      (b) => b.class_id === classId && b.member_id === memberId && b.booking_date === bookingDate && b.status !== "cancelled"
    );

    if (alreadyBooked) {
      return { success: false, message: "Member sudah terdaftar di kelas ini untuk tanggal yang dipilih." };
    }

    const newBooking: ClassBooking = {
      id: `bk-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      class_id: classId,
      member_id: memberId,
      booking_date: bookingDate,
      status: "booked",
      created_at: new Date().toISOString(),
      member_name: member.full_name,
      member_code: member.member_code,
      member_phone: member.phone,
    };

    setClassBookings((prev) => [newBooking, ...prev]);
    setGymClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, booked_count: (c.booked_count || 0) + 1 } : c))
    );

    return { success: true, message: `Berhasil mendaftarkan ${member.full_name} ke kelas ${gymClass.name}.` };
  };

  const checkInClassBooking = (bookingId: string) => {
    setClassBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "attended", checked_in_at: new Date().toISOString() } : b))
    );
  };

  const cancelClassBooking = (bookingId: string) => {
    const booking = classBookings.find((b) => b.id === bookingId);
    if (booking) {
      setGymClasses((prev) =>
        prev.map((c) => (c.id === booking.class_id ? { ...c, booked_count: Math.max(0, (c.booked_count || 1) - 1) } : c))
      );
    }
    setClassBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
  };

  // ==============================================================================
  // POS KASIR TRANSACTIONS
  // ==============================================================================
  const processPOSTransaction = (
    cart: POSCartItem[],
    paymentMethod: PaymentMethod,
    memberId?: string
  ): POSTransaction => {
    const member = memberId ? members.find((m) => m.id === memberId) : undefined;
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const invoiceNum = `INV-POS-${Date.now().toString().slice(-8)}`;

    const tx: POSTransaction = {
      id: `tx-pos-${Date.now()}`,
      tenant_id: currentTenant.id,
      club_id: currentClub.id,
      invoice_number: invoiceNum,
      cashier_user_id: "user-fd-01",
      member_id: member?.id,
      member_name: member?.full_name || "Pelanggan Umum (Guest)",
      total_amount: total,
      payment_method: paymentMethod,
      items: cart.map((c) => ({
        product_id: c.product.id,
        product_name: c.product.name,
        quantity: c.quantity,
        unit_price: c.product.price,
        subtotal: c.subtotal,
      })),
      notes: `Pembayaran via ${paymentMethod.toUpperCase()} sukses`,
      created_at: new Date().toISOString(),
    };

    // Deduct stock
    setPosProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((c) => c.product.id === p.id);
        if (cartMatch) {
          return { ...p, stock: Math.max(0, p.stock - cartMatch.quantity) };
        }
        return p;
      })
    );

    setPosTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  // ==============================================================================
  // SUPERADMIN ACTIONS (TENANT APPROVAL)
  // ==============================================================================
  const approveTenant = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, subscription_status: "active" } : t))
    );
  };

  const rejectTenant = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, subscription_status: "cancelled" } : t))
    );
  };

  // ==============================================================================
  // CSV EXPORTS
  // ==============================================================================
  // ==============================================================================
  // MEMBER TRANSACTIONS & OMNICHANNEL PAYMENTS
  // ==============================================================================
  const createTransaction = (data: {
    memberId: string;
    memberName?: string;
    memberPhone?: string;
    transactionType: TransactionType;
    title: string;
    description: string;
    amount: number;
    paymentMethod: TransactionPaymentMethod;
    paymentChannel?: string;
    details?: any;
  }): Transaction => {
    const member = members.find((m) => m.id === data.memberId);
    const invoiceCode = `INV-101-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 HOUR (60 minutes)

    const isOnline = data.paymentMethod === "online";
    const status: TransactionStatus = isOnline ? "paid" : "pending";

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      member_id: data.memberId,
      member_name: data.memberName || member?.full_name || "Member One O One Gym",
      member_phone: data.memberPhone || member?.phone || "-",
      invoice_code: invoiceCode,
      transaction_type: data.transactionType,
      title: data.title,
      description: data.description,
      amount: data.amount,
      payment_method: data.paymentMethod,
      payment_channel: data.paymentChannel || (isOnline ? "midtrans_qris" : "tunai_frontdesk"),
      status,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      paid_at: isOnline ? now.toISOString() : undefined,
      confirmed_by: isOnline ? "Midtrans Automated Settlement" : undefined,
      details: data.details,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If online, immediately activate membership or PT sessions for the member!
    if (isOnline && member) {
      if (data.transactionType === "pt_package") {
        const addedSessions = data.details?.sessions_count || 12;
        updateMember(member.id, {
          selected_coach_sessions: (member.selected_coach_sessions || 0) + addedSessions,
          selected_coach_id: data.details?.coach_id || member.selected_coach_id || "coach-dian",
          selected_coach_name: data.details?.coach_name || member.selected_coach_name || "Coach Dian",
          status: "active",
        });
      } else if (data.transactionType === "membership") {
        const days = data.details?.package_type === "1_year" ? 365 : data.details?.package_type === "6_months" ? 180 : 30;
        const currentExp = member.expiry_date ? new Date(member.expiry_date) : new Date();
        const baseDate = currentExp > new Date() ? currentExp : new Date();
        const newExp = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        updateMember(member.id, {
          expiry_date: newExp,
          status: "active",
          package_type: data.details?.package_type || member.package_type,
          payment_proof_status: "approved",
        });
      }
    }

    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: newTx });
        bc.close();
      }
    } catch (e) {}

    return newTx;
  };

  const confirmCashTransaction = (
    invoiceCode: string,
    staffUserId: string = "user-fd-01"
  ): { success: boolean; message: string; transaction?: Transaction } => {
    const tx = transactions.find((t) => t.invoice_code.toUpperCase() === invoiceCode.trim().toUpperCase());
    if (!tx) {
      return { success: false, message: `Invoice ${invoiceCode} tidak ditemukan.` };
    }

    if (tx.status === "paid") {
      return { success: true, message: `Invoice ${invoiceCode} sudah lunas sebelumnya.`, transaction: tx };
    }

    const now = new Date();
    if (now > new Date(tx.expires_at)) {
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? { ...t, status: "expired" as const } : t)));
      return { success: false, message: "Waktu pembayaran tunai 1 jam telah habis. Invoice ini sudah expired/hangus." };
    }

    const updatedTx: Transaction = {
      ...tx,
      status: "paid",
      paid_at: now.toISOString(),
      confirmed_by: `Staf Front Desk (${staffUserId})`,
    };

    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? updatedTx : t)));

    // Activate package or PT sessions for the member!
    const member = members.find((m) => m.id === tx.member_id);
    if (member) {
      if (tx.transaction_type === "pt_package") {
        const addedSessions = tx.details?.sessions_count || 12;
        updateMember(member.id, {
          selected_coach_sessions: (member.selected_coach_sessions || 0) + addedSessions,
          selected_coach_id: tx.details?.coach_id || member.selected_coach_id || "coach-dian",
          selected_coach_name: tx.details?.coach_name || member.selected_coach_name || "Coach Dian",
          status: "active",
        });
      } else if (tx.transaction_type === "membership") {
        const days = tx.details?.package_type === "1_year" ? 365 : tx.details?.package_type === "6_months" ? 180 : 30;
        const currentExp = member.expiry_date ? new Date(member.expiry_date) : new Date();
        const baseDate = currentExp > new Date() ? currentExp : new Date();
        const newExp = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        updateMember(member.id, {
          expiry_date: newExp,
          status: "active",
          package_type: tx.details?.package_type || member.package_type,
          payment_proof_status: "approved",
        });
      }
    }

    soundManager.playSuccessBeep();

    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: updatedTx });
        bc.close();
      }
    } catch (e) {}

    return {
      success: true,
      message: `Pembayaran tunai ${formatRupiah(tx.amount)} berhasil dikonfirmasi kasir! Paket member aktif otomatis.`,
      transaction: updatedTx,
    };
  };

  const bookWeightliftingSession = (
    sessionId: string,
    memberId: string
  ): { success: boolean; message: string } => {
    const session = weightliftingSessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: "Sesi latihan beban tidak ditemukan." };
    }

    const member = members.find((m) => m.id === memberId);
    if (!member) {
      return { success: false, message: "Data member tidak ditemukan. Silakan login terlebih dahulu." };
    }

    if (member.status !== "active") {
      return { success: false, message: "Status keanggotaan Anda belum aktif. Silakan lakukan aktivasi terlebih dahulu." };
    }

    if (session.booked_member_ids?.includes(memberId)) {
      return { success: false, message: "Anda sudah mengamankan slot di sesi angkat beban ini." };
    }

    if (session.booked_count >= session.capacity_limit) {
      return { success: false, message: "Slot sesi angkat beban ini sudah penuh." };
    }

    const updatedSession: WeightliftingSession = {
      ...session,
      booked_count: session.booked_count + 1,
      booked_member_ids: [...(session.booked_member_ids || []), memberId],
    };

    setWeightliftingSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)));

    soundManager.playSuccessBeep();
    return {
      success: true,
      message: `Berhasil booking sesi ${session.name}! Slot latihan Anda telah terkonfirmasi.`,
    };
  };

  const exportMembersCSV = () => {
    const rows = members
      .filter((m) => m.club_id === currentClub.id)
      .map((m) => ({
        "ID Member": m.member_code,
        "Nama Lengkap": m.full_name,
        "No Handphone": m.phone,
        "Email": m.email || "-",
        "Status": m.status.toUpperCase(),
        "Paket Membership": m.package_type,
        "Harga Paket (IDR)": m.package_price,
        "Tanggal Mulai": m.start_date,
        "Tanggal Expired": m.expiry_date,
        "Cabang Gym": currentClub.name,
      }));

    exportToCSV(`FitLead_Members_${currentClub.code}`, rows);
  };

  const exportReportsCSV = () => {
    const rows = checkIns
      .filter((c) => c.club_id === currentClub.id)
      .map((c) => ({
        "Waktu Check-In (WIB)": formatWIBDateTime(c.check_in_time),
        "ID Member": c.member_code || "-",
        "Nama Member": c.member_name || "Unknown",
        "Metode": c.scan_method,
        "Status": c.status === "success" ? "BERHASIL (HIJAU)" : "DITOLAK (MERAH)",
        "Catatan": c.notes || "-",
      }));

    exportToCSV(`FitLead_CheckIn_Report_${currentClub.code}`, rows);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setMembers(SEED_MEMBERS);
    setCheckIns(SEED_CHECKINS);
    setPtPackages(SEED_PT_PACKAGES);
    setPtSessionLogs(SEED_PT_LOGS);
    setGymClasses(SEED_CLASSES);
    setClassBookings(SEED_BOOKINGS);
    setPosProducts(SEED_POS_PRODUCTS);
    setPosTransactions(SEED_POS_TRANSACTIONS);
    setTenants(SEED_TENANTS);
  };

  return (
    <GymDataContext.Provider
      value={{
        tenants,
        currentTenant,
        clubs,
        currentClub,
        members,
        checkIns,
        ptPackages,
        ptSessionLogs,
        gymClasses,
        classBookings,
        posProducts,
        posTransactions,
        hourlyTraffic,
        coaches,
        transactions,
        weightliftingSessions,
        activeMembersCount,
        monthlyRevenue,
        todayCheckinsCount,
        newLeadsCount,
        needsAttentionMembers,
        pendingMembers,
        pendingMembersCount,
        refreshFromCloud,
        setCurrentClub,
        checkInMember,
        deductPTSession,
        addMember,
        approveMember,
        rejectMember,
        registerOnlineMember,
        loginCustomer,
        bookCoachForMember,
        updateMember,
        createTransaction,
        confirmCashTransaction,
        bookWeightliftingSession,
        bookGymClass,
        checkInClassBooking,
        cancelClassBooking,
        processPOSTransaction,
        approveTenant,
        rejectTenant,
        exportMembersCSV,
        exportReportsCSV,
        resetToDemoData,
      }}
    >
      {children}
    </GymDataContext.Provider>
  );
};

export const useGymData = () => {
  const context = useContext(GymDataContext);
  if (!context) {
    throw new Error("useGymData must be used within a GymDataProvider");
  }
  return context;
};

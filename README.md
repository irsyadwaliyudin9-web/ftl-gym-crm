# FitLead CRM (FTL Edition) 🏋️‍♂️⚡
> **Sistem Manajemen Gym Terpadu: Member, Kelas, dan Sales dalam Satu Dashboard**

FitLead CRM adalah aplikasi Customer Relationship Management sekaligus Core Operational System yang dirancang khusus untuk pusat kebugaran (Gym/Fitness Center) di Indonesia. Aplikasi ini memusatkan seluruh manajemen prospek (calon member), data membership, check-in QR Code kilat, pemotongan kuota Personal Trainer (PT) anti-kebocoran, jadwal kelas mingguan, hingga kasir Point of Sale (POS) F&B.

---

## 🎨 Sporty Dark & Neon Design System
- **Palet Warna Utama**:
  - Main Background: Obsidian Black (`#0A0A0A`), Industrial Dark Slate (`#121212`), Elevated Cards (`#1A1A1A`)
  - Aksen Utama: Kuning Neon Sporty (`#E2F952` / `#DFFF00`) untuk tombol aksi, highlight kuota, chart peak hours, dan scanner laser.
  - Status Indicators: Emerald Green (`#10B981`) untuk sukses check-in, Rose Red (`#EF4444`) untuk membership expired.
- **Tipografi**: Inter & Montserrat (Geometric, modern, bold, atletis).
- **Bahasa**: 100% Bahasa Indonesia & format waktu WIB (`Asia/Jakarta`).

---

## 🏗️ Arsitektur & Infrastruktur
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React Icons.
- **Database**: PostgreSQL / Supabase Multi-Tenant dengan **Row Level Security (RLS)** ketat per `club_id` dan `tenant_id`.
- **Anti Race-Condition PT Session Guard**: PostgreSQL Stored Procedure `deduct_pt_session()` dengan `SELECT ... FOR UPDATE` row-locking dan validasi client-side `idempotency_key` untuk mencegah pemotongan dobel.
- **Front Desk Scanner**: Hybrid scanner (Live Camera Front/Rear toggle via WebRTC, hardware USB barcode laser scanner listener, dan manual search), dilengkapi **Web Audio API Synthesizer** (Harmonious double chime tone untuk hijau sukses, low buzzer saw tone untuk merah expired).
- **Digital Member Pass**: Kartu member digital sporty ber-QR Code SVG mandiri yang dapat dibuka di smartphone dan dicetak langsung.
- **SaaS Subscription Plans**:
  - **Single Club**: Rp299.000 / bulan (Maks 1 cabang, 500 member, Check-in, Sesi PT).
  - **Multi Club Enterprise**: Rp899.000 / bulan (Unlimited cabang, POS Kasir F&B, Jadwal Kelas, Analitik lintas cabang).
- **Payment Gateway**: Midtrans Sandbox/Production (QRIS, Bank Virtual Account, Kartu Kredit).
- **Notifikasi Otomatis**: Supabase Edge Functions (`member-expiry-reminder`) cron 08:00 WIB terintegrasi WhatsApp Gateway Fonnte/Wablas untuk follow-up member kadaluarsa 7 hari.

---

## 📁 Struktur Direktori
```
fitlead-crm/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── .env.example
├── .env.local
├── supabase/
│   ├── migrations/
│   │   └── 20261030000000_fitlead_schema.sql  # Skema Postgres + RLS Policies + deduct_pt_session RPC
│   └── functions/
│       └── member-expiry-reminder/
│           └── index.ts                       # Supabase Edge Function untuk reminder WhatsApp
├── tests/
│   └── run-tests.mjs                          # Test suite verifikasi mendalam (10 modul pengujian)
└── src/
    ├── app/
    │   ├── layout.tsx                         # Root layout dengan Inter/Montserrat & Context Providers
    │   ├── page.tsx                           # Sporty Landing Page + Interactive Scanner Preview
    │   ├── auth/
    │   │   └── login/page.tsx                 # Login Dark Theme + 1-Click Persona Switcher
    │   ├── onboarding/page.tsx                # 3-Step Wizard Onboarding Gym Baru
    │   └── dashboard/
    │       ├── layout.tsx                     # Dashboard Layout (Navbar, Sidebar, MobileNav, RoleSwitcher)
    │       ├── page.tsx                       # Dashboard Overview: 4 Stats Cards, Peak Hours Chart, Needs Attention
    │       ├── checkin/page.tsx               # Front Desk Hybrid Scanner + Audio Feedback Web Audio API
    │       ├── members/page.tsx               # Data Members CRM, Digital Pass Modal, Filter Tabs, WhatsApp Link
    │       ├── pt-sessions/page.tsx           # Sesi PT: Touch Burner Cards & Idempotency Audit Trail
    │       ├── classes/page.tsx               # Jadwal Kelas Mingguan, Kuota Bar, & Manifest Check-in
    │       ├── pos/page.tsx                   # Point of Sale Kasir Ringan: Cart Drawer & Printable Receipt
    │       ├── reports/page.tsx               # Analitik Pendapatan, Leaderboard Trainer, & Export CSV
    │       ├── settings/page.tsx              # Pengaturan Profil Gym, Midtrans API, & WA Gateway
    │       └── superadmin/page.tsx            # Superadmin Platform: MRR & Approval Tenant Midtrans
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── MobileNav.tsx
    │   │   ├── RoleSwitcher.tsx
    │   │   └── SoundEffects.ts                # Web Audio API Synthesizer (Beep Hijau & Buzzer Merah)
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   └── Modal.tsx
    │   ├── members/
    │   │   ├── DigitalPassModal.tsx
    │   │   └── MemberFormModal.tsx
    │   ├── pt/
    │   │   └── DeductSessionModal.tsx
    │   ├── pos/
    │   │   └── ReceiptModal.tsx
    │   └── landing/
    │       └── InteractiveScannerPreview.tsx
    ├── context/
    │   ├── AuthContext.tsx                    # Multi-Role Persona Switcher
    │   └── GymDataContext.tsx                 # Reactive Offline/Online State Provider + Indonesian Gym Seed Data
    └── lib/
        ├── qrGenerator.ts                     # SVG QR Code & Barcode Generator mandiri
        ├── utils.ts                           # Formatter Rupiah, Tanggal WIB, & CSV Exporter
        ├── types.ts                           # Domain TypeScript definitions
        └── supabaseClient.ts                  # Supabase client helper
```

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Test Suite**:
   ```bash
   node tests/run-tests.mjs
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

3. **Akun Uji Coba Cepat (1-Click Login di Login Page)**:
   - **Club Manager**: Bambang Prakoso (`bambang.mgr@ironforge.co.id`)
   - **Front Desk**: Rina Anggraini (`rina.reception@ironforge.co.id`)
   - **Personal Trainer**: Coach Denny Santoso (`denny.pt@ironforge.co.id`)
   - **Sales**: Kevin Wijaya (`kevin.sales@ironforge.co.id`)
   - **Superadmin SaaS**: Admin Pusat FitLead (`superadmin@fitleadcrm.com`)

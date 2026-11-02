"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useGymData } from "@/context/GymDataContext";
import { formatRupiah, formatWIBDate } from "@/lib/utils";
import { soundManager } from "@/components/common/SoundEffects";
import { GymMemberCard } from "@/components/GymMemberCard";
import {
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
  QrCode,
  Star,
  Users,
  Flame,
  CreditCard,
  Check,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Award,
  MessageCircle,
  AlertCircle,
  Hourglass,
  Search,
  PartyPopper,
  ArrowRight,
  LogIn,
  LogOut,
  Target,
  Apple,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type TabType = "pass" | "pt-schedule" | "classes" | "membership" | "login";

export default function CustomerPortalPage() {
  const { coaches, gymClasses, registerOnlineMember, loginCustomer, bookGymClass, members } = useGymData();

  // Active Tab - Default to "membership" if no member saved, or "pass" if already registered
  const [activeTab, setActiveTab] = useState<TabType>("membership");

  // Form State for Online Membership Registration
  const [selectedPlan, setSelectedPlan] = useState<"1_month" | "6_months" | "1_year">("6_months");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [includeCoach, setIncludeCoach] = useState(true);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("coach-dian");
  const [ptSessionsCount, setPtSessionsCount] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<{ message: string; existingMember: any } | null>(null);

  // Customer Login State
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Success State for Newly Registered Member
  const [registeredMember, setRegisteredMember] = useState<any>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // Persistent Registered Member ID
  const [registeredMemberId, setRegisteredMemberId] = useState<string | null>(null);
  const [showApprovalNotice, setShowApprovalNotice] = useState(false);

  // Load saved member id from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedId = localStorage.getItem("ftl_portal_member_id");
        if (savedId) {
          setRegisteredMemberId(savedId);
          setActiveTab("pass");
        }
      } catch (e) {}
    }
  }, []);

  // Dynamically resolve member from members array (which updates via BroadcastChannel in real-time!)
  const liveMember = registeredMemberId
    ? members.find(
        (m) =>
          m.id === registeredMemberId ||
          m.member_code.toUpperCase() === registeredMemberId.toUpperCase() ||
          m.phone.replace(/[^0-9]/g, "") === registeredMemberId.replace(/[^0-9]/g, "") ||
          (m.email && m.email.toLowerCase() === registeredMemberId.toLowerCase())
      )
    : null;

  const displayMember = liveMember || registeredMember;
  const isPending = displayMember?.status === "pending_approval" || displayMember?.payment_proof_status === "pending";

  // Watch for real-time approval transitions (Pending -> Active)
  const prevStatusRef = useRef<string | undefined>(displayMember?.status);
  useEffect(() => {
    if (prevStatusRef.current === "pending_approval" && displayMember?.status === "active") {
      soundManager.playSuccessBeep();
      setShowApprovalNotice(true);
    }
    prevStatusRef.current = displayMember?.status;
  }, [displayMember?.status]);

  // Plans details
  const membershipPlans = [
    {
      id: "1_month" as const,
      name: "Paket 1 Bulan",
      tagline: "Cocok untuk permulaan & rutinitas baru",
      price: 250000,
      period: "1 Bulan",
      popular: false,
      benefits: [
        "Akses bebas 24 Jam ke seluruh alat FTL Gym",
        "Akses loker harian & shower room",
        "1x Free Body Composition Check (InBody)",
        "Gratis akses semua kelas studio",
      ],
    },
    {
      id: "6_months" as const,
      name: "Paket 6 Bulan",
      tagline: "Paling Populer · Hemat Rp300.000",
      price: 1200000,
      period: "6 Bulan",
      popular: true,
      badge: "BEST VALUE",
      benefits: [
        "Semua fitur Paket 1 Bulan",
        "Hemat Rp300.000 dibanding bulanan",
        "Free 1x Sesi Personal Trainer Assessment",
        "Gratis FTL Official Shaker Bottle",
        "Bisa cuti/freeze membership 1x (maks 14 hari)",
      ],
    },
    {
      id: "1_year" as const,
      name: "Paket 1 Tahun (VIP)",
      tagline: "Hasil maksimal jangka panjang",
      price: 2200000,
      period: "12 Bulan",
      popular: false,
      badge: "VIP ACCESS",
      benefits: [
        "Akses VIP 365 Hari penuh",
        "Tarif paling hemat (hanya Rp183k/bln)",
        "Free 2x Sesi Personal Trainer",
        "Gratis Exclusive FTL Gym Bag & Merchandise",
        "Bisa cuti/freeze membership 2x (total 30 hari)",
      ],
    },
  ];

  const currentSelectedPlanObj = membershipPlans.find((p) => p.id === selectedPlan)!;
  const currentSelectedCoach = coaches.find((c) => c.id === selectedCoachId) || coaches[0];
  const coachPrice = includeCoach
    ? ptSessionsCount === 24
      ? currentSelectedCoach.pt_rate_24
      : currentSelectedCoach.pt_rate_12
    : 0;
  const grandTotal = currentSelectedPlanObj.price + coachPrice;

  // Handle Online Registration Submit with Duplicate Check
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError(null);

    if (!fullName || !phone) {
      alert("Silakan lengkapi nama dan nomor WhatsApp Anda.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = registerOnlineMember({
        full_name: fullName,
        phone,
        email,
        package_type: selectedPlan,
        selected_coach_id: includeCoach ? selectedCoachId : undefined,
        pt_sessions_count: includeCoach ? ptSessionsCount : undefined,
      });

      setIsSubmitting(false);

      if (!result.success && result.duplicate) {
        setDuplicateError({
          message: result.message || "Nomor WhatsApp atau Email ini sudah pernah didaftarkan.",
          existingMember: result.existingMember,
        });
        soundManager.playErrorBeep();
        return;
      }

      if (result.member) {
        setRegisteredMember(result.member);
        setRegisteredMemberId(result.member.id);
        try {
          localStorage.setItem("ftl_portal_member_id", result.member.id);
        } catch (e) {}

        setShowApprovalNotice(false);
        setActiveTab("pass");
      }
    }, 600);
  };

  // Handle Customer Login
  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError("Silakan masukkan Nomor WhatsApp atau Email Anda.");
      return;
    }

    const res = loginCustomer(loginIdentifier);
    if (res.success && res.member) {
      setRegisteredMemberId(res.member.id);
      setRegisteredMember(res.member);
      setLoginSuccessNotice(res.message);
      soundManager.playSuccessBeep();
      setTimeout(() => {
        setLoginSuccessNotice(null);
        setActiveTab("pass");
      }, 1000);
    } else {
      setLoginError(res.message);
      soundManager.playErrorBeep();
    }
  };

  // Handle Customer Logout
  const handleCustomerLogout = () => {
    if (confirm("Keluar dari tampilan akun member ini di perangkat ini?")) {
      setRegisteredMemberId(null);
      setRegisteredMember(null);
      try {
        localStorage.removeItem("ftl_portal_member_id");
      } catch (e) {}
      setActiveTab("login");
    }
  };

  // Quick Book Studio Class
  const handleBookClass = (classId: string, className: string) => {
    const memberId = displayMember ? displayMember.id : members[0]?.id;
    if (!memberId) {
      alert("Silakan masuk atau daftar membership terlebih dahulu.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const result = bookGymClass(classId, memberId, todayStr);
    setBookingMessage(result.message);
    setTimeout(() => setBookingMessage(null), 4000);
  };

  // Assigned coach details for customer personal schedule
  const assignedCoach = displayMember?.selected_coach_id
    ? coaches.find((c) => c.id === displayMember.selected_coach_id) || coaches[0]
    : coaches[0];

  return (
    <div className="space-y-8 select-none">
      {/* Top Banner / Welcome Bar */}
      <div className="relative rounded-3xl bg-gradient-to-r from-gym-card via-gym-elevated to-black border border-gym-border p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="neon" size="md" className="font-black tracking-wider uppercase">
                ⚡ FTL GYM OFFICIAL MEMBER PORTAL
              </Badge>
              {displayMember && (
                <Badge variant={isPending ? "warning" : "success"} size="sm" className="font-bold">
                  {isPending ? "STATUS: PENDING" : "MEMBER AKTIF"}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {displayMember ? (
                <>
                  Selamat Datang, <span className="text-neon">{displayMember.full_name}</span>!
                </>
              ) : (
                "Transformasi Fisik Anda Dimulai di Sini."
              )}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {displayMember ? (
                <>
                  Kelola kartu digital FTL Gym Anda, pantau jadwal latihan dengan{" "}
                  <strong className="text-white">{displayMember.selected_coach_name || "Coach Dian"}</strong>, serta pesan kelas studio favorit Anda.
                </>
              ) : (
                "Daftar membership online, pilih Personal Trainer favorit Anda, dan dapatkan Kartu Member Resmi & QR Code digital langsung di HP Anda."
              )}
            </p>
          </div>

          {/* Quick Account Switcher / Logout */}
          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            {displayMember ? (
              <button
                onClick={handleCustomerLogout}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ganti Akun / Keluar</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("login")}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-black text-white border border-zinc-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4 text-neon" />
                <span>Sudah Punya Akun? Masuk di Sini</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Always visible so customers can explore all features */}
        <div className="flex flex-wrap gap-2.5 pt-6 border-t border-zinc-800/80 mt-6">
          <button
            onClick={() => setActiveTab("pass")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "pass"
                ? "bg-neon text-gym-base shadow-neon"
                : "bg-zinc-800 text-zinc-300 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Kartu Member & QR Pass</span>
          </button>

          <button
            onClick={() => setActiveTab("pt-schedule")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "pt-schedule"
                ? "bg-neon text-gym-base shadow-neon"
                : "bg-zinc-800 text-zinc-300 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Jadwal Sesi Personal Trainer</span>
          </button>

          <button
            onClick={() => setActiveTab("classes")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "classes"
                ? "bg-neon text-gym-base shadow-neon"
                : "bg-zinc-800 text-zinc-300 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal Kelas Studio</span>
          </button>

          <button
            onClick={() => {
              setDuplicateError(null);
              setActiveTab("membership");
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "membership"
                ? "bg-neon text-gym-base shadow-neon"
                : "bg-zinc-800 text-zinc-300 hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>{displayMember ? "Perpanjang / Tambah Paket" : "Daftar Membership Baru"}</span>
          </button>

          {!displayMember ? (
            <button
              onClick={() => setActiveTab("login")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === "login"
                  ? "bg-neon text-gym-base shadow-neon"
                  : "bg-zinc-800 text-zinc-300 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Akun Member</span>
            </button>
          ) : (
            <button
              onClick={handleCustomerLogout}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-rose-400 hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun ({displayMember.full_name.split(" ")[0]})</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Booking Feedback Notice */}
      {bookingMessage && (
        <div className="p-4 rounded-2xl bg-neon/15 border border-neon/40 text-neon font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bookingMessage}</span>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 1: KARTU DIGITAL MEMBER & QR PASS                                          */}
      {/* ============================================================================== */}
      {activeTab === "pass" && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <Badge variant={isPending ? "warning" : "success"} size="md" className="font-black tracking-wide">
              {isPending ? "⏳ MENUNGGU APPROVAL ADMIN" : "✓ KARTU MEMBER FTL GYM AKTIF"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Kartu Member Digital Anda
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Tunjukkan QR Code di kartu ini pada pemindai meja resepsionis/turnstile untuk akses masuk gym.
            </p>
          </div>

          {/* Celebratory Approval Alert */}
          {showApprovalNotice && !isPending && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-black border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 text-white space-y-2 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-400">
                    SELAMAT! Pendaftaran Anda Telah Disetujui Admin!
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Keanggotaan Anda kini telah <strong>AKTIF</strong>. QR Code dapat langsung digunakan untuk akses masuk gym.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approval WhatsApp Instructions Banner */}
          {isPending && displayMember && (
            <div className="p-5 rounded-3xl bg-amber-950/70 border-2 border-amber-600/70 text-amber-200 text-xs space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <Hourglass className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="font-black text-white text-sm">
                    Menunggu Konfirmasi Pembayaran oleh Staf Admin
                  </div>
                  <p className="text-[12px] text-zinc-300 leading-relaxed">
                    Pendaftaran Anda telah tercatat dengan Kode <strong className="text-neon">{displayMember.member_code}</strong>.
                    Silakan transfer pembayaran ke rekening FTL Gym lalu kirimkan bukti transfer melalui WhatsApp Admin di bawah ini.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/70 border border-amber-800/80 text-[12px] space-y-1.5">
                <div className="text-zinc-400">Rekening Transfer Resmi FTL Gym:</div>
                <div className="font-mono font-bold text-white text-sm">BCA: 8830-1928-11 (a/n PT FTL Gym Indonesia)</div>
                <div className="text-zinc-300">
                  Total Biaya: <strong className="text-neon font-black text-sm">{formatRupiah(displayMember.package_price)}</strong>
                </div>
              </div>

              <a
                href={`https://wa.me/62895601800302?text=${encodeURIComponent(
                  `Halo Admin FTL Gym, saya sudah mendaftar membership online:\n\n` +
                  `• Kode Member: ${displayMember.member_code}\n` +
                  `• Nama: ${displayMember.full_name}\n` +
                  `• No. HP: ${displayMember.phone}\n` +
                  `• Paket: ${displayMember.package_type.replace("_", " ")}\n` +
                  (displayMember.selected_coach_name ? `• Coach: ${displayMember.selected_coach_name} (${displayMember.selected_coach_sessions} Sesi)\n` : "") +
                  `• Total Biaya: ${formatRupiah(displayMember.package_price)}\n\n` +
                  `Berikut bukti transfer saya. Mohon segera di-approve. Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-white text-xs sm:text-sm shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Kirim Bukti Transfer ke WA Admin (0895-6018-00302)</span>
              </a>
            </div>
          )}

          {/* Member Card Component */}
          {displayMember ? (
            <GymMemberCard member={displayMember} />
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
              <CreditCard className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Belum Ada Akun yang Masuk</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Silakan masuk dengan akun yang sudah terdaftar atau lakukan pendaftaran member baru.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="neon" size="md" onClick={() => setActiveTab("login")}>
                  Masuk Akun Saya
                </Button>
                <Button variant="secondary" size="md" onClick={() => setActiveTab("membership")}>
                  Daftar Member Baru
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: JADWAL SESI PERSONAL TRAINER SAYA                                       */}
      {/* ============================================================================== */}
      {activeTab === "pt-schedule" && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400" />
              <span>Jadwal & Kuota Sesi Personal Trainer</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Pantau kuota sesi latihan bersama coach Anda dan atur jadwal latihan langsung via WhatsApp resmi FTL Gym.
            </p>
          </div>

          {/* Member Status Banner if Logged In */}
          {displayMember ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-gym-base font-black flex items-center justify-center text-sm shadow-md">
                  {displayMember.full_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Akun Member:</span>
                    <Badge variant={displayMember.status === "active" ? "success" : "warning"} size="sm">
                      {displayMember.status === "active" ? "Member Aktif" : "Menunggu Approval"}
                    </Badge>
                  </div>
                  <div className="text-base font-black text-white">{displayMember.full_name}</div>
                  <div className="text-xs text-zinc-400 font-mono">{displayMember.member_code} • {displayMember.phone}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-zinc-400 uppercase font-bold">Sisa Kuota PT Anda</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {displayMember.selected_coach_sessions || 12} Sesi Tersisa
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">Sudah Punya Akun Member FTL Gym?</div>
                  <div className="text-xs text-zinc-400">Masuk untuk melihat sisa kuota sesi PT dan jadwal pelatih pribadi Anda.</div>
                </div>
              </div>
              <Button variant="neon" size="sm" onClick={() => setActiveTab("login")} className="text-xs font-black">
                <LogIn className="w-3.5 h-3.5 mr-1" />
                <span>Masuk Akun Member</span>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Coach Profile Card */}
            <div className="md:col-span-7 bg-gym-card border-2 border-zinc-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-start gap-4 pb-5 border-b border-zinc-800">
                <img
                  src={assignedCoach.photo_url}
                  alt={assignedCoach.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-400/60 shadow-lg"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded">
                    Personal Trainer Utama
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">{assignedCoach.name}</h3>
                  <div className="text-xs font-semibold text-neon">{assignedCoach.specialty}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-0.5">
                    <span className="flex items-center text-amber-400 font-bold gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {assignedCoach.rating} / 5.0
                    </span>
                    <span>·</span>
                    <span>{assignedCoach.experience}</span>
                  </div>
                </div>
              </div>

              {/* Sesi Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Sisa Kuota Sesi</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {displayMember?.selected_coach_sessions || 12} Sesi
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Tersedia untuk digunakan</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Jadwal Praktik</div>
                  <div className="text-sm font-black text-white mt-1">
                    {assignedCoach.available_days}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Sesuai kesepakatan janji</div>
                </div>
              </div>

              {/* Booking WhatsApp Action */}
              <a
                href={`https://wa.me/62895601800302?text=${encodeURIComponent(
                  `Halo Coach ${assignedCoach.nickname} & Admin FTL Gym, saya member ${displayMember?.full_name || ""} (Kode: ${displayMember?.member_code || ""}). Saya ingin membuat janji temu sesi latihan Personal Trainer.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buat Janji Latihan via WhatsApp ({assignedCoach.nickname})</span>
              </a>
            </div>

            {/* Workout Guidance & Program Focus */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-gym-card border border-zinc-800 rounded-3xl p-5 space-y-3">
                <div className="text-xs font-black uppercase text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-neon" />
                  <span>Fokus Program Pelatihan Anda</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                    <span>Penilaian postur & massa otot (*InBody Assessment*)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                    <span>Panduan teknik angkat beban aman & progresif</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                    <span>Konsultasi target kalori & asupan protein harian</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-2">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Aturan & Kebijakan Sesi PT</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Konfirmasi pembatalan sesi wajib dilakukan minimal 4 jam sebelum jadwal latihan dimulai. Pemotongan sesi dilakukan oleh staf/trainer di resepsionis.
                </p>
              </div>
            </div>
          </div>

          {/* Roster of Certified Coaches */}
          <div className="pt-4 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-neon" />
              <span>Tim Personal Trainer Bersertifikat FTL Gym</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coaches.map((c) => (
                <div key={c.id} className="bg-gym-card border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <img
                    src={c.photo_url}
                    alt={c.name}
                    className="w-full h-36 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-sm font-black text-white">{c.name}</div>
                    <div className="text-xs text-neon font-semibold">{c.specialty}</div>
                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                      <span className="flex items-center text-amber-400 gap-1 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {c.rating}
                      </span>
                      <span>{c.experience}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: JADWAL KELAS STUDIO FTL GYM                                             */}
      {/* ============================================================================== */}
      {activeTab === "classes" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-neon" />
              <span>Jadwal Kelas Studio FTL Gym</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Semua member resmi FTL Gym berhak mengikuti kelas studio secara gratis. Kuota terbatas!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gymClasses.map((cls) => {
              const booked = cls.booked_count || 0;
              const isFull = booked >= cls.capacity_limit;
              return (
                <Card key={cls.id} className="bg-gym-card border-zinc-800 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold uppercase">
                        {cls.room}
                      </span>
                      <span className="text-xs font-bold text-neon">{cls.start_time} - {cls.end_time} WIB</span>
                    </div>

                    <h3 className="text-base font-black text-white">{cls.name}</h3>
                    <p className="text-xs text-zinc-400">Instruktur: <strong className="text-zinc-200">{cls.instructor_name}</strong></p>

                    {/* Capacity Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Kapasitas Terisi:</span>
                        <span className={isFull ? "text-rose-400 font-bold" : "text-white font-semibold"}>
                          {booked} / {cls.capacity_limit} Kursi
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-rose-500" : "bg-neon"
                          }`}
                          style={{ width: `${Math.min(100, (booked / cls.capacity_limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isFull ? "secondary" : "neon"}
                    size="sm"
                    disabled={isFull}
                    onClick={() => handleBookClass(cls.id, cls.name)}
                    className="w-full text-xs"
                  >
                    {isFull ? "Kelas Penuh" : "Booking Slot Kelas"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 4: DAFTAR MEMBERSHIP BARU (DENGAN CEK DATA GANDA)                          */}
      {/* ============================================================================== */}
      {activeTab === "membership" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Duplicate Registration Error Banner */}
          {duplicateError && (
            <div className="p-5 rounded-3xl bg-rose-950/90 border-2 border-rose-600 shadow-xl text-white space-y-3 animate-in zoom-in-95">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-black text-sm text-rose-200">
                    Pendaftaran Ditolak: Data Sudah Terdaftar!
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {duplicateError.message}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredMemberId(duplicateError.existingMember.id);
                    setRegisteredMember(duplicateError.existingMember);
                    try {
                      localStorage.setItem("ftl_portal_member_id", duplicateError.existingMember.id);
                    } catch (e) {}
                    setDuplicateError(null);
                    setActiveTab("pass");
                  }}
                  className="py-2 px-4 rounded-xl bg-neon text-gym-base font-black text-xs shadow-neon transition-all"
                >
                  Buka Akun Saya Sekarang →
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateError(null)}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-bold transition-colors"
                >
                  Tutup Peringatan
                </button>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>Langkah 1: Pilih Paket Membership FTL Gym</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Pilih durasi membership yang sesuai dengan target kebugaran Anda.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {membershipPlans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all relative flex flex-col justify-between border-2 ${
                    isSelected
                      ? "bg-gym-card border-neon shadow-neon scale-[1.02]"
                      : "bg-gym-card/80 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-6 text-[10px] bg-neon text-gym-base font-black px-2.5 py-0.5 rounded-full shadow-md uppercase">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white">{plan.name}</h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-neon bg-neon text-gym-base" : "border-zinc-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <div className="text-3xl font-black text-white">{formatRupiah(plan.price)}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Masa aktif: {plan.period}</div>
                    </div>

                    <p className="text-xs text-zinc-400">{plan.tagline}</p>

                    <div className="pt-4 border-t border-zinc-800 space-y-2">
                      {plan.benefits.map((b, i) => (
                        <div key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-neon shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <div
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-colors ${
                        isSelected ? "bg-neon text-gym-base" : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {isSelected ? "Paket Terpilih" : "Pilih Paket Ini"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Add-on: Berlatih dengan Personal Trainer */}
          <Card className="bg-gym-card border-zinc-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Langkah 2: Ingin Berlatih dengan Personal Trainer? (Opsional)</span>
                    <Badge variant="warning" size="sm">
                      REKOMENDASI CEPAT
                    </Badge>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Dapatkan pendampingan teknik angkat beban, panduan nutrisi, dan target hasil terukur bersama coach tersertifikasi.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCoach}
                  onChange={(e) => setIncludeCoach(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
              </label>
            </div>

            {includeCoach && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {coaches.map((c) => {
                    const isCoachSelected = selectedCoachId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCoachId(c.id)}
                        className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-center gap-3 ${
                          isCoachSelected
                            ? "bg-zinc-900 border-neon shadow-neon-sm"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <img
                          src={c.photo_url}
                          alt={c.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-zinc-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-white flex items-center justify-between">
                            <span className="truncate">{c.nickname}</span>
                            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {c.rating}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">{c.specialty}</div>
                          {c.id === "coach-dian" && (
                            <span className="inline-block mt-1 text-[9px] bg-neon/20 text-neon px-1.5 py-0.2 rounded font-bold uppercase">
                              Paling Favorit
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Session package choice */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Pilihan Paket Sesi dengan {currentSelectedCoach.name}:
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{currentSelectedCoach.experience}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPtSessionsCount(12)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        ptSessionsCount === 12
                          ? "bg-neon text-gym-base border-neon shadow-sm"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      12 Sesi ({formatRupiah(currentSelectedCoach.pt_rate_12)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPtSessionsCount(24)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        ptSessionsCount === 24
                          ? "bg-neon text-gym-base border-neon shadow-sm"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      24 Sesi ({formatRupiah(currentSelectedCoach.pt_rate_24)})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Form Biodata & Checkout */}
          <Card className="bg-gym-card border-zinc-800 p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Langkah 3: Lengkapi Data Diri Calon Member</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Data ini digunakan untuk penerbitan Kartu Member FTL Gym dan QR Code resmi Anda.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Nama Lengkap *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pratama Arhan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Nomor WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Email (Opsional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary & Pay */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>{currentSelectedPlanObj.name} ({currentSelectedPlanObj.period})</span>
                  <span className="font-bold text-white">{formatRupiah(currentSelectedPlanObj.price)}</span>
                </div>

                {includeCoach && (
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span>
                      Paket Personal Trainer: {currentSelectedCoach.name} ({ptSessionsCount} Sesi)
                    </span>
                    <span className="font-bold text-white">{formatRupiah(coachPrice)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-400">Total Pembayaran:</div>
                    <div className="text-2xl font-black text-neon">{formatRupiah(grandTotal)}</div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    size="lg"
                    isLoading={isSubmitting}
                    className="shadow-neon px-8 text-sm"
                  >
                    <span>Daftar & Terbitkan Kartu Member</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 5: MASUK AKUN CUSTOMER (LOGIN CUSTOMER)                                    */}
      {/* ============================================================================== */}
      {activeTab === "login" && (
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-neon text-gym-base flex items-center justify-center font-black mx-auto shadow-neon text-lg">
              FTL
            </div>
            <h2 className="text-2xl font-black text-white">Masuk ke Akun Member FTL Gym</h2>
            <p className="text-xs text-zinc-400">
              Masukkan Nomor WhatsApp, Email, atau Kode Member (FTL-...) yang sudah Anda daftarkan sebelumnya.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccessNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{loginSuccessNotice}</span>
            </div>
          )}

          <Card className="bg-gym-card border-zinc-800 p-6 space-y-4">
            <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                  Nomor WhatsApp / Email / Kode Member *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890 atau FTL-0810"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
                  />
                </div>
              </div>

              <Button type="submit" variant="neon" size="lg" className="w-full shadow-neon font-black text-xs py-3">
                <span>Masuk & Buka Akun Saya</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="pt-3 border-t border-zinc-800 text-center text-xs text-zinc-400">
              Belum pernah mendaftar membership?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("membership")}
                className="text-neon font-bold hover:underline"
              >
                Daftar Sekarang
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

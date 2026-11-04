"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
} from "lucide-react";

export default function SplitPortalAuthPage() {
  const router = useRouter();
  const { loginStaff, loginMember, registerMember } = useAuth();
  const { members, registerOnlineMember } = useGymData();

  // Mode: "member" (Pintu Konsumen) or "staff" (Pintu Staf)
  const [activePortal, setActivePortal] = useState<"member" | "staff">("member");

  // Member sub-mode: "login" or "register"
  const [memberMode, setMemberMode] = useState<"login" | "register">("login");

  // Member Login Form State
  const [memberIdentifier, setMemberIdentifier] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [showMemberPassword, setShowMemberPassword] = useState(false);

  // Member Register Form State
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Staff Login Form State
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showFacilitiesAccordion, setShowFacilitiesAccordion] = useState(false);
  const [registeredPendingInfo, setRegisteredPendingInfo] = useState<{ name: string; code: string; phone: string } | null>(null);

  // Handle Member Login
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await loginMember(memberIdentifier, memberPassword);
      setIsLoading(false);

      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/member/dashboard");
        }, 300);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage("Terjadi kendala koneksi saat memverifikasi akun. Silakan coba kembali.");
    }
  };

  // Handle Member Registration
  const handleMemberRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim() || !regPhone.trim()) {
      setErrorMessage("Silakan lengkapi nama dan nomor WhatsApp Anda.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Call registerOnlineMember from GymDataContext as single source of truth
      const regRes = registerOnlineMember({
        full_name: regFullName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        package_type: "1_month",
      });

      setIsLoading(false);

      if (!regRes.success) {
        if (regRes.duplicate && regRes.existingMember?.status === "active") {
          setErrorMessage(regRes.message || "Nomor WhatsApp ini sudah terdaftar sebagai member aktif. Silakan pilih tab 'Masuk Akun'.");
        } else {
          setErrorMessage(regRes.message || "Gagal mendaftarkan akun. Silakan periksa kembali data Anda.");
        }
        return;
      }

      const registered = regRes.member;
      if (registered) {
        // Also register in AuthContext with the EXACT same member data
        registerMember({
          fullName: registered.full_name,
          phone: registered.phone,
          email: registered.email || "",
          password: regPassword,
          existingMember: registered,
        });

        setRegisteredPendingInfo({
          name: registered.full_name,
          code: registered.member_code,
          phone: registered.phone,
        });
        setSuccessMessage(null);
        setErrorMessage(null);
      }
    }, 450);
  };

  // Handle Staff Login
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginStaff(staffEmail, staffPassword);
      setIsLoading(false);

      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/dashboard");
        }, 400);
      } else {
        setErrorMessage(res.message);
      }
    }, 450);
  };

  // Quick Demo Login for Arya Putra
  const handleQuickDemoMember = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await loginMember("arya.perdana@gmail.com");
      setIsLoading(false);
      if (res.success) {
        router.push("/member/dashboard");
      } else {
        setErrorMessage(res.message);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gym-base text-zinc-100 flex flex-col justify-between selection:bg-neon selection:text-black relative overflow-x-hidden p-4 sm:p-6">
      {/* Background Neon Ambiance */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-neon/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Header & Branding */}
      <header className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-neon flex items-center justify-center font-black text-gym-base text-lg shadow-neon">
            101
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-white text-base tracking-tight leading-none">
              <span>ONE O ONE GYM</span>
              <span className="text-[9px] bg-neon text-gym-base font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                OFFICIAL
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5 font-medium">
              One O One Fitness Club • Garut Kota, Jawa Barat
            </div>
          </div>
        </div>

        <Badge variant="neutral" size="sm" className="border-zinc-800 text-zinc-400 text-[10px]">
          24 Jam Non-Stop
        </Badge>
      </header>

      {/* Main Dual-Auth Card (Mobile-First) */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-2">
        <div className="bg-gym-card/95 border-2 border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          {/* ========================================================================= */}
          {/* PINTU KONSUMEN (MEMBER AREA)                                              */}
          {/* ========================================================================= */}
          {activePortal === "member" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Member Portal Header */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-neon bg-neon/15 px-3 py-1 rounded-full border border-neon/30 inline-block mb-1">
                  Pintu Masuk Member One O One Gym
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {memberMode === "login" ? "Selamat Datang, Champion!" : "Mulai Perjalanan Kebugaran"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {memberMode === "login"
                    ? "Buka kartu ID digital, cek sisa sesi PT & booking latihan beban."
                    : "Daftar membership online langsung aktif di HP Anda."}
                </p>
              </div>

              {/* Jika Baru Mendaftar: Tampilkan Layar Konfirmasi Menunggu Approval */}
              {registeredPendingInfo ? (
                <div className="space-y-4 py-1 animate-in fade-in zoom-in-95">
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border-2 border-neon/50 text-center space-y-3 shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-neon/15 border border-neon/40 flex items-center justify-center mx-auto text-neon shadow-neon-sm">
                      <Clock className="w-7 h-7 text-neon" />
                    </div>
                    
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full">
                        ⏳ Menunggu Approval Staf
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white mt-2">
                        Pendaftaran Berhasil Dikirim!
                      </h3>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        Halo <strong className="text-white">{registeredPendingInfo.name}</strong>, akun Anda telah tercatat dengan kode member:
                      </p>
                      <div className="text-sm font-black text-neon font-mono bg-neon/10 py-1 px-3 rounded-lg inline-block mt-1 border border-neon/20">
                        {registeredPendingInfo.code}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/70 border border-zinc-800 text-left text-xs text-zinc-300 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Nama:</span>
                        <span className="text-white font-bold">{registeredPendingInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">No. WA:</span>
                        <span className="text-white font-bold">{registeredPendingInfo.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Cabang:</span>
                        <span className="text-white font-bold">Garut Kota (Pusat)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className="text-amber-400 font-bold">Menunggu Approval Staf</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-normal text-left sm:text-center">
                      Sesuai SOP One O One Gym Garut Kota, akun member baru harus disetujui staf front desk kasir sebelum dapat login dan menggunakan QR Code check-in.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/62895601800302?text=${encodeURIComponent(
                        `Halo Admin Front Desk One O One Gym Garut Kota, saya telah mendaftar akun member baru atas nama "${registeredPendingInfo.name}" (Kode: ${registeredPendingInfo.code}, No WA: ${registeredPendingInfo.phone}). Mohon bantuannya untuk menyetujui (approve) akun saya agar bisa segera login. Terima kasih!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Konfirmasi Approval via WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setRegisteredPendingInfo(null);
                        setMemberMode("login");
                        setMemberIdentifier(registeredPendingInfo.phone);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                    >
                      <span>Sudah Diapprove Staf? Ke Form Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Dual Switcher: Masuk vs Daftar */}
                  <div className="grid grid-cols-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMemberMode("login");
                        setErrorMessage(null);
                      }}
                      className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                        memberMode === "login"
                          ? "bg-neon text-gym-base shadow-neon"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Masuk sebagai Member
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberMode("register");
                        setErrorMessage(null);
                      }}
                      className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                        memberMode === "register"
                          ? "bg-neon text-gym-base shadow-neon"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Daftar Member Baru
                    </button>
                  </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* FORM 1: LOGIN MEMBER */}
              {memberMode === "login" && (
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                      No. WhatsApp / Email / Kode Member *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={memberIdentifier}
                        onChange={(e) => setMemberIdentifier(e.target.value)}
                        placeholder="Contoh: 081234567890 / 101-0801"
                        className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-zinc-300 uppercase">
                        Kata Sandi (Opsional jika pakai OTP/No. HP)
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showMemberPassword ? "text" : "password"}
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMemberPassword(!showMemberPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full shadow-neon font-black text-sm py-3.5 rounded-2xl"
                  >
                    <span>Masuk ke Member App</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  {/* Quick Demo Member Login Pill */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleQuickDemoMember}
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300 font-bold border border-zinc-700/80 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-neon" />
                      <span>Masuk Langsung dengan Akun Demo (Arya Putra)</span>
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 2: DAFTAR MEMBER BARU */}
              {memberMode === "register" && (
                <form onSubmit={handleMemberRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Nama sesuai KTP"
                        className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      No. WhatsApp Aktif *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Email (Untuk Invoice & E-Receipt) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Kata Sandi *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full shadow-neon font-black text-sm py-3.5 rounded-2xl mt-2"
                  >
                    <span>Daftar & Buka Member App</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}
            </>
          )}

              {/* PINTU STAF TRIGGER LINK (DISCREET BOTTOM LINK) */}
              <div className="pt-4 border-t border-zinc-800/80 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal("staff");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-neon transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-850"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Login sebagai Staf / Admin CRM</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PINTU STAF (ADMIN / CRM AREA)                                             */}
          {/* ========================================================================= */}
          {activePortal === "staff" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Back to Member Portal */}
              <button
                type="button"
                onClick={() => {
                  setActivePortal("member");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-neon font-bold transition-colors"
              >
                ← Kembali ke Pintu Member
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border-2 border-neon/50 text-neon flex items-center justify-center mx-auto shadow-neon-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight pt-1">
                  Portal Staf & Manajemen CRM
                </h2>
                <p className="text-xs text-zinc-400">
                  Khusus Front Desk, Trainer, dan Manajemen Operasional One O One Gym.
                </p>
              </div>

              {/* Security Badge */}
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Staf tidak bisa mendaftar sendiri. Akun resmi dibuatkan langsung oleh Club Manager internal.
                </p>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Staff Login Form */}
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                    Email Resmi Staf *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="ftlgym@gmail.com"
                      className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showStaffPassword ? "text" : "password"}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="•••••••••••••"
                      className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="neon"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full shadow-neon font-black text-xs sm:text-sm py-3.5 rounded-2xl"
                >
                  <span>Masuk ke Dashboard Staf CRM</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Collapsible Quick Info: Fasilitas Angkat Beban & Coach */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowFacilitiesAccordion(!showFacilitiesAccordion)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-semibold transition-colors py-1"
          >
            <span>Fasilitas Angkat Beban & Coach One O One Gym</span>
            {showFacilitiesAccordion ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showFacilitiesAccordion && (
            <div className="mt-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2.5 text-xs text-zinc-300 animate-in fade-in">
              <div className="font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-neon" />
                <span>Spesialisasi Kekuatan & Pembentukan Tubuh</span>
              </div>
              <ul className="space-y-1.5 text-zinc-400 pl-6 list-disc text-[11px]">
                <li>Area Barbell Olympic & Platform Deadlift Resmi</li>
                <li>Power Rack, Smith Machine, & Dumbbell Lengkap hingga 50kg</li>
                <li>Pelatih Pribadi Bersertifikat: Coach Dian, Coach Denny, Coach Maya, Coach Kevin</li>
                <li>Tarif Personal Trainer: Star dari Rp 300.000 – Rp 400.000 / sesi latihan</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md mx-auto text-center pt-4 pb-2 text-[11px] text-zinc-500">
        © 2026 One O One Gym Indonesia · Heavy Strength & Conditioning
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { formatRupiah, formatWIBDate, formatWIBTime, isPackageExpired } from "@/lib/utils";
import { generateQRCodeSVG, generateBarcodeSVG } from "@/lib/qrGenerator";
import { soundManager } from "@/components/common/SoundEffects";
import { OmnichannelPaymentModal } from "@/components/member/OmnichannelPaymentModal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  QrCode,
  CreditCard,
  Flame,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Sparkles,
  ChevronRight,
  User,
  Star,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Receipt,
  Download,
  RefreshCw,
  Award,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function MemberDashboardPage() {
  const { currentMember } = useAuth();
  const {
    members,
    transactions,
    coaches,
    checkIns,
  } = useGymData();

  // Find live member from context to reflect instant updates
  const liveMember = members.find((m) => m.id === currentMember?.id) || currentMember;

  // Active Main Tab: "overview" | "membership" | "pt" | "transactions"
  const [activeTab, setActiveTab] = useState<"overview" | "membership" | "pt" | "transactions">("overview");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentItemType, setPaymentItemType] = useState<"pt_package" | "membership">("membership");
  const [preselectedCoachId, setPreselectedCoachId] = useState<string | undefined>(undefined);

  // Feedback State
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Active Pending Cash Invoice (if any, with 1-hour live countdown)
  const activeCashInvoice = transactions.find(
    (t) => t.member_id === liveMember?.id && t.payment_method === "tunai" && t.status === "pending"
  );

  // Live countdown state for pending cash invoice
  const [cashSecondsRemaining, setCashSecondsRemaining] = useState<number>(0);
  useEffect(() => {
    if (!activeCashInvoice) return;

    const tick = () => {
      const now = new Date().getTime();
      const expiry = new Date(activeCashInvoice.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setCashSecondsRemaining(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeCashInvoice]);

  if (!liveMember) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-zinc-400">Data member tidak ditemukan. Silakan login kembali.</p>
      </div>
    );
  }

  const isPendingApproval = liveMember.status === "pending_approval" || liveMember.payment_proof_status === "pending";
  const isExpired = !isPendingApproval && isPackageExpired(liveMember.expiry_date);
  const hasCoach = Boolean(liveMember.selected_coach_id && (liveMember.selected_coach_sessions || 0) > 0);
  const assignedCoach = hasCoach ? coaches.find((c) => c.id === liveMember.selected_coach_id) : null;

  const totalSessionsBought = liveMember.selected_coach_sessions || 0;
  const sessionsRemaining = liveMember.pt_sessions_remaining !== undefined ? liveMember.pt_sessions_remaining : totalSessionsBought;
  const sessionsUsed = liveMember.pt_sessions_used || Math.max(0, totalSessionsBought - sessionsRemaining);

  const memberCheckins = checkIns.filter((c) => c.member_id === liveMember.id);
  const memberTransactions = transactions.filter((t) => t.member_id === liveMember.id);

  const handleRefreshStatus = () => {
    setRefreshNotice("Memeriksa status persetujuan staf One O One Gym...");
    setTimeout(() => {
      if (liveMember.status === "active") {
        setRefreshNotice("✓ Akun Anda sudah AKTIF dan disetujui staf admin!");
      } else {
        setRefreshNotice("Akun Anda masih dalam antrean verifikasi staf Front Desk. Harap tunggu sebentar.");
      }
      setTimeout(() => setRefreshNotice(null), 4000);
    }, 600);
  };

  const handleOpenCoachModal = (coachId?: string) => {
    setPaymentItemType("pt_package");
    setPreselectedCoachId(coachId || "coach-dian");
    setIsPaymentModalOpen(true);
  };

  const cashMins = Math.floor(cashSecondsRemaining / 60);
  const cashSecs = cashSecondsRemaining % 60;
  const cashTimerFormatted = `${String(cashMins).padStart(2, "0")}:${String(cashSecs).padStart(2, "0")}`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">

      {/* ========================================================================= */}
      {/* 1. INFORMASI PENDAFTARAN & STATUS APPROVAL OLEH STAF ADMIN (PENTING)      */}
      {/* ========================================================================= */}
      {isPendingApproval ? (
        <section className="bg-gradient-to-r from-orange-950/80 via-zinc-900 to-black border-2 border-neon rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neon/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neon text-black flex items-center justify-center font-black shrink-0 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-neon tracking-wider bg-neon/20 px-2.5 py-0.5 rounded border border-neon/40">
                  STATUS PENDAFTARAN: MENUNGGU VERIFIKASI STAF ADMIN
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white mt-1">
                  Pendaftaran Berhasil! Halo, {liveMember.full_name}
                </h1>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              className="border-neon/60 text-neon hover:bg-neon/20 text-xs font-bold shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Cek Status Approval</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div className="p-3.5 rounded-2xl bg-black/60 border border-neon/30 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-neon">Rincian Akun One O One Gym:</div>
              <div><strong>Nama Lengkap:</strong> {liveMember.full_name}</div>
              <div><strong>No. WhatsApp:</strong> {liveMember.phone}</div>
              <div><strong>Email:</strong> {liveMember.email || "-"}</div>
              <div><strong>Nomor ID Antrean:</strong> <span className="font-mono text-neon font-bold">{liveMember.member_code}</span></div>
              <div><strong>Paket Pendaftaran:</strong> {liveMember.package_type === "1_year" ? "1 Tahun VIP" : liveMember.package_type === "6_months" ? "6 Bulan VIP" : "1 Bulan VIP Gym"} ({formatRupiah(liveMember.package_price || 250000)})</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-neon/30 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-neon">Petunjuk Aktivasi Front Desk:</div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mt-1">
                  Akun Anda sedang ditinjau oleh staf Front Desk One O One Gym. Saat staf mengklik <em>&quot;Setujui (Approve)&quot;</em> di komputer kasir, akun Anda otomatis menjadi aktif seketika dan QR Code Digital Pass dapat langsung digunakan untuk masuk gym.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`https://wa.me/62895601800302?text=${encodeURIComponent(
                    `Halo Staf Front Desk One O One Gym, saya baru saja mendaftar akun member atas nama ${liveMember.full_name} (${liveMember.phone}). Mohon bantuannya untuk verifikasi & approval akun saya.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neon hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Konfirmasi ke WhatsApp Front Desk (0895-6018-00302) →</span>
                </a>
              </div>
            </div>
          </div>

          {refreshNotice && (
            <div className="p-3 rounded-xl bg-neon/20 border border-neon/50 text-orange-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-neon" />
              <span>{refreshNotice}</span>
            </div>
          )}
        </section>
      ) : null}

      {/* ========================================================================= */}
      {/* 2. RINGKASAN DASHBOARD KONSUMEN (STAT CARDS TEMA ORANGE & HITAM)           */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Status Membership */}
        <Card className="p-4 bg-gym-card border-zinc-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Status Keanggotaan</span>
            <Badge
              variant={isPendingApproval ? "warning" : isExpired ? "danger" : "neon"}
              size="sm"
              className="text-[9px] font-black uppercase"
            >
              {isPendingApproval ? "Pending" : isExpired ? "Expired" : "Aktif"}
            </Badge>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white truncate">
              {liveMember.package_type === "1_year" ? "1 Tahun VIP" : liveMember.package_type === "6_months" ? "6 Bulan VIP" : "1 Bulan VIP"}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Exp: {liveMember.expiry_date ? formatWIBDate(liveMember.expiry_date) : "Menunggu Approval"}
            </div>
          </div>
        </Card>

        {/* Stat 2: Status Sewa PT */}
        <Card className="p-4 bg-gym-card border-zinc-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Personal Trainer</span>
            <Flame className="w-3.5 h-3.5 text-neon" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white truncate">
              {hasCoach ? assignedCoach?.name : "Belum Sewa PT"}
            </div>
            <div className="text-[11px] text-neon font-bold mt-0.5">
              {hasCoach ? `${sessionsRemaining} Sesi Tersedia` : "Tarif: 300rb - 400rb/sesi"}
            </div>
          </div>
        </Card>

        {/* Stat 3: Sesi Terpakai */}
        <Card className="p-4 bg-gym-card border-zinc-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Sesi PT Terpakai</span>
            <Dumbbell className="w-3.5 h-3.5 text-neon" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-neon">
              {sessionsUsed} <span className="text-xs text-zinc-400 font-normal">/ {totalSessionsBought} Sesi</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-neon h-full rounded-full transition-all duration-300"
                style={{
                  width: totalSessionsBought > 0 ? `${Math.min(100, Math.round((sessionsUsed / totalSessionsBought) * 100))}%` : "0%",
                }}
              />
            </div>
          </div>
        </Card>

        {/* Stat 4: Total Kunjungan Gym */}
        <Card className="p-4 bg-gym-card border-zinc-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Kedatangan Gym</span>
            <History className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white">
              {memberCheckins.length} <span className="text-xs text-zinc-400 font-normal">Kunjungan</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {memberCheckins.length > 0 ? "Check-in terverifikasi" : "Belum ada kunjungan"}
            </div>
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* ACTIVE PENDING CASH INVOICE ALERT (1-HOUR COUNTDOWN BRIDGE TO CASHIER)    */}
      {/* ========================================================================= */}
      {activeCashInvoice && (
        <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-950/80 via-zinc-900 to-black border-2 border-neon shadow-xl space-y-3 animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon text-black flex items-center justify-center font-black shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-black text-neon">
                  Tagihan Tunai Menunggu Kasir: {activeCashInvoice.title}
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  Nominal: <strong className="text-white font-mono">{formatRupiah(activeCashInvoice.amount)}</strong> • Kode Invoice:{" "}
                  <span className="font-mono text-neon font-bold">{activeCashInvoice.invoice_code}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Sisa Waktu:</div>
              <div className="text-base sm:text-lg font-black font-mono text-neon">
                {cashSecondsRemaining > 0 ? cashTimerFormatted : "EXPIRED"}
              </div>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="p-3 rounded-2xl bg-white flex justify-center">
            <div
              dangerouslySetInnerHTML={{
                __html: generateBarcodeSVG(activeCashInvoice.invoice_code, 260, 42, "#000000", "#FFFFFF"),
              }}
            />
          </div>

          <div className="text-xs text-zinc-400 text-center">
            Tunjukkan barcode ini ke kasir Front Desk One O One Gym sebelum batas 1 jam berakhir untuk aktivasi lunas.
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. TABS MENU KHUSUS CUSTOMER (CLEAN 4 TABS - TANPA JADWAL & SESI)         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Navigation Switcher Tabs (4 Bersih: Digital ID, Pembelian, Sewa PT, Transaksi) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "overview" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital ID (QR)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("membership")}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "membership" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pembelian Member</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pt")}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "pt" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-neon" />
            <span>Sewa Coach (PT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "transactions" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Riwayat Transaksi</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW / DIGITAL ID PASS & QR CHECK-IN                           */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="bg-gym-card border-2 border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6 animate-in fade-in">
            <div className="absolute top-0 right-0 w-80 h-80 bg-neon/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-neon tracking-widest bg-neon/15 px-2.5 py-0.5 rounded border border-neon/30">
                  DIGITAL PASS • ONE O ONE GYM
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {liveMember.full_name}
                </h2>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  ID: {liveMember.member_code} • {liveMember.phone}
                </div>
              </div>

              <Badge
                variant={isPendingApproval ? "warning" : isExpired ? "danger" : "neon"}
                size="md"
                className="font-black self-start sm:self-auto"
              >
                {isPendingApproval ? "⏳ MENUNGGU APPROVAL STAF" : isExpired ? "MEMBERSHIP EXPIRED" : "✓ MEMBER AKTIF"}
              </Badge>
            </div>

            {/* Big Scannable QR Code */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gym-elevated/90 border border-zinc-700/80 shadow-inner space-y-3">
              <div
                dangerouslySetInnerHTML={{
                  __html: generateQRCodeSVG(
                    liveMember.qr_code_data || `101:${liveMember.member_code}:${liveMember.full_name}`,
                    220,
                    isPendingApproval ? "#FFAA00" : "#FF6B00",
                    "#0A0A0A"
                  ),
                }}
                className={`flex items-center justify-center p-3 rounded-2xl bg-zinc-950 border-2 shadow-neon-sm ${
                  isPendingApproval ? "border-amber-500/60 opacity-80" : "border-neon/70"
                }`}
              />

              <div className="text-center space-y-1">
                <div className="text-xs sm:text-sm font-black text-white tracking-wide">
                  {isPendingApproval
                    ? "QR Code akan aktif seketika setelah disetujui staf admin"
                    : "Arahkan QR Code ini ke kamera scanner Front Desk One O One Gym"}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {isPendingApproval
                    ? "Harap tunjukkan pendaftaran ke staf kasir untuk validasi lunas"
                    : "Check-in otomatis tanpa antre (Waktu respon 0.08 detik)"}
                </div>
              </div>
            </div>

            {/* Expiry Date & Perpanjang Membership CTA */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Masa Berlaku Keanggotaan:</div>
                <div className={`text-sm sm:text-base font-black ${isPendingApproval ? "text-neon" : isExpired ? "text-rose-400" : "text-white"}`}>
                  {isPendingApproval ? "Menunggu Verifikasi Front Desk" : liveMember.expiry_date ? formatWIBDate(liveMember.expiry_date) : "Aktif"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="neon"
                  size="md"
                  onClick={() => {
                    setPaymentItemType("membership");
                    setIsPaymentModalOpen(true);
                  }}
                  className="shadow-neon text-xs font-black px-4 py-2.5"
                >
                  <span>Beli / Perpanjang Membership</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PEMBELIAN & PAKET MEMBERSHIP (OMNICHANNEL ONLINE / TUNAI KASIR)   */}
        {/* ========================================================================= */}
        {activeTab === "membership" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-5 sm:p-6 bg-gym-card border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-neon" />
                    <span>Paket Keanggotaan One O One Gym</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Akses tak terbatas ke seluruh alat angkat beban, power rack, dumbbell, dan fasilitas gym.
                  </p>
                </div>

                <Badge variant={isExpired ? "danger" : "neon"} size="sm" className="font-mono">
                  {liveMember.package_type === "1_year" ? "12 Bulan VIP" : liveMember.package_type === "6_months" ? "6 Bulan VIP" : "1 Bulan VIP"}
                </Badge>
              </div>

              {/* Status & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Paket 1 Bulan</div>
                  <div className="text-lg font-black text-white">Rp 250.000</div>
                  <p className="text-[11px] text-zinc-400">Cocok untuk latihan rutin bulanan.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentItemType("membership");
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full text-xs font-bold border-zinc-700 hover:border-neon hover:text-neon"
                  >
                    Pilih Paket
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border-2 border-neon/50 relative space-y-2">
                  <div className="absolute top-2 right-2 text-[9px] bg-neon text-black font-black px-1.5 py-0.5 rounded">
                    HEMAT 300RB
                  </div>
                  <div className="text-[10px] text-neon uppercase font-bold">Paket 6 Bulan</div>
                  <div className="text-lg font-black text-white">Rp 1.200.000</div>
                  <p className="text-[11px] text-zinc-400">@ Rp 200rb/bln. Komitmen progres fisik.</p>
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => {
                      setPaymentItemType("membership");
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full text-xs font-black shadow-neon"
                  >
                    Pilih 6 Bulan
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="text-[10px] text-neon uppercase font-bold">Paket 1 Tahun (VIP)</div>
                  <div className="text-lg font-black text-white">Rp 2.200.000</div>
                  <p className="text-[11px] text-zinc-400">@ Rp 183rb/bln. Nilai terbaik seumur hidup.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentItemType("membership");
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full text-xs font-bold border-zinc-700 hover:border-neon text-zinc-200 hover:text-neon"
                  >
                    Pilih 1 Tahun
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gym-elevated/80 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Metode Pembayaran Tersedia:</span>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Online Otomatis (QRIS, VA Bank) & Bayar Tunai di Meja Kasir Front Desk (Berlaku 1 Jam).
                  </div>
                </div>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => {
                    setPaymentItemType("membership");
                    setIsPaymentModalOpen(true);
                  }}
                  className="font-black text-xs shrink-0"
                >
                  Perpanjang Sekarang
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SEWA PERSONAL TRAINER (COACH) & TRACKER SESI TERPAKAI              */}
        {/* ========================================================================= */}
        {activeTab === "pt" && (
          <div className="space-y-4 animate-in fade-in">
            {/* If Member ALREADY HAS a coach */}
            {hasCoach && assignedCoach ? (
              <Card className="p-5 sm:p-6 bg-gym-card border-zinc-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-neon" />
                      <span>Pelatih Pribadi Anda: {assignedCoach.name}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{assignedCoach.specialty}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="neon" size="md" className="font-black text-xs">
                      {sessionsRemaining} Sesi Tersisa
                    </Badge>
                  </div>
                </div>

                {/* Coach Profile Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={assignedCoach.photo_url}
                      alt={assignedCoach.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-neon/60 shrink-0"
                    />
                    <div>
                      <div className="text-sm font-black text-white">{assignedCoach.name}</div>
                      <div className="text-xs text-neon font-semibold">{assignedCoach.specialty}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center text-neon font-bold">
                          <Star className="w-3 h-3 fill-neon mr-0.5" />
                          {assignedCoach.rating}
                        </span>
                        <span>•</span>
                        <span>Jadwal: {assignedCoach.available_days}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/62895601800302?text=${encodeURIComponent(
                      `Halo Coach ${assignedCoach.nickname}, saya member One O One Gym ${liveMember.full_name} (${liveMember.member_code}). Saya ingin membuat janji sesi latihan beban berikutnya.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm self-stretch sm:self-auto justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat WhatsApp Coach</span>
                  </a>
                </div>

                {/* Session Tracker Box */}
                <div className="p-4 rounded-2xl bg-gym-elevated/70 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Pemakaian Sesi Latihan Beban:</span>
                    <span className="font-black text-neon">{sessionsUsed} dari {totalSessionsBought} Sesi Terpakai</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-neon h-full rounded-full transition-all duration-300 shadow-neon-sm"
                      style={{
                        width: totalSessionsBought > 0 ? `${Math.min(100, Math.round((sessionsUsed / totalSessionsBought) * 100))}%` : "0%",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Total Dibeli</div>
                      <div className="text-base font-black text-white mt-0.5">{totalSessionsBought} Sesi</div>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Terpakai</div>
                      <div className="text-base font-black text-neon mt-0.5">{sessionsUsed} Sesi</div>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Sisa Kuota</div>
                      <div className="text-base font-black text-neon mt-0.5">{sessionsRemaining} Sesi</div>
                    </div>
                  </div>
                </div>

                {/* Beli Tambahan Sesi */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-zinc-400">
                    Sisa sesi menipis? Tambah paket sesi kapan saja.
                  </div>
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => handleOpenCoachModal(assignedCoach.id)}
                    className="font-black text-xs"
                  >
                    Beli Tambahan Sesi PT
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* If Member DOES NOT HAVE a coach, or wants to choose another coach */}
            <Card className="p-5 sm:p-6 bg-gym-card border-zinc-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {hasCoach ? "Pilihan Coach Lainnya" : "Sewa Personal Trainer (Coach Angkat Beban)"}
                    </h3>
                    <Badge variant="neon" size="sm" className="font-bold text-[9px] uppercase">
                      OPSIONAL
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tarif sesi coach mulai dari <strong>Rp 25.000 – Rp 30.000 / sesi</strong>. Dapatkan koreksi teknik squat, bench, deadlift & nutrisi.
                  </p>
                </div>
              </div>

              {/* Grid 4 Coaches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {coaches.map((c) => {
                  const isCurrent = c.id === liveMember.selected_coach_id;
                  const ratePerSession = c.rate_per_session || 25000;

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? "bg-zinc-850 border-neon shadow-md"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={c.photo_url}
                          alt={c.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-white">{c.name}</span>
                            {c.id === "coach-dian" && (
                              <span className="text-[9px] font-black bg-neon text-black px-1.5 py-0.2 rounded">
                                FAVORIT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-300 font-medium truncate">{c.specialty}</div>
                          <div className="text-[11px] text-neon font-bold mt-1">
                            Tarif: {formatRupiah(ratePerSession)} / Sesi
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-zinc-400 font-mono">12 Sesi: {formatRupiah(c.pt_rate_12)}</span>
                        <Button
                          variant={isCurrent ? "secondary" : "neon"}
                          size="sm"
                          onClick={() => handleOpenCoachModal(c.id)}
                          className="text-xs font-bold py-1.5 px-3"
                        >
                          {isCurrent ? "Perpanjang" : "Sewa Coach Ini"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RIWAYAT TRANSAKSI & KUNJUNGAN CHECK-IN                             */}
        {/* ========================================================================= */}
        {activeTab === "transactions" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Tabel Riwayat Pembayaran */}
            <Card className="p-5 sm:p-6 bg-gym-card border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-neon" />
                    <span>Riwayat Pembayaran & Transaksi Member</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Histori tagihan pendaftaran, perpanjangan akses membership, dan paket sesi personal trainer.
                  </p>
                </div>

                <Badge variant="neon" size="sm" className="font-mono">
                  {memberTransactions.length} Transaksi
                </Badge>
              </div>

              {memberTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  Belum ada catatan transaksi untuk akun ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gym-elevated/70 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal / Waktu</th>
                        <th className="py-2.5 px-3">No. Invoice</th>
                        <th className="py-2.5 px-3">Keterangan Paket</th>
                        <th className="py-2.5 px-3">Metode Bayar</th>
                        <th className="py-2.5 px-3 text-right">Jumlah</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-medium">
                      {memberTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-3 text-zinc-300 whitespace-nowrap">
                            <div>{formatWIBDate(t.created_at)}</div>
                            <div className="text-[10px] text-zinc-500">{formatWIBTime(t.created_at)} WIB</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-neon font-bold whitespace-nowrap">
                            {t.invoice_code}
                          </td>
                          <td className="py-3 px-3 text-white max-w-[200px]">
                            <div className="font-bold truncate">{t.title}</div>
                            <div className="text-[10px] text-zinc-400 truncate">{t.description}</div>
                          </td>
                          <td className="py-3 px-3 text-zinc-300 whitespace-nowrap">
                            {t.payment_method === "tunai" ? "Tunai Kasir Gym" : "Online Midtrans"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                            {formatRupiah(t.amount)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <Badge
                              variant={t.status === "paid" ? "success" : t.status === "pending" ? "warning" : "danger"}
                              size="sm"
                              className="font-mono text-[10px]"
                            >
                              {t.status === "paid" ? "LUNAS" : t.status === "pending" ? "MENUNGGU KASIR" : "EXPIRED"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Riwayat Kunjungan Check-In */}
            <Card className="p-5 sm:p-6 bg-gym-card border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-neon" />
                  <span>Log Kunjungan Kedatangan Member (Check-In)</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">{memberCheckins.length} Kedatangan</span>
              </div>

              {memberCheckins.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  Belum ada log check-in kedatangan. Scan QR Code Anda di pintu masuk gym saat datang.
                </div>
              ) : (
                <div className="space-y-2">
                  {memberCheckins.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-bold text-white">Check-in Scan QR Masuk One O One Gym</div>
                          <div className="text-[10px] text-zinc-400">{formatWIBDate(c.check_in_time)} pukul {formatWIBTime(c.check_in_time)} WIB</div>
                        </div>
                      </div>
                      <Badge variant="success" size="sm" className="font-mono text-[10px]">
                        BERHASIL
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. OMNICHANNEL PAYMENT MODAL (ONLINE & 1-HOUR CASH INVOICE)               */}
      {/* ========================================================================= */}
      <OmnichannelPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        member={liveMember}
        initialItemType={paymentItemType}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          setActiveTab("transactions");
        }}
      />
    </div>
  );
}

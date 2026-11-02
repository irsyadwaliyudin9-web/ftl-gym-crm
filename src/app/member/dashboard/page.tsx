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
  Calendar,
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
} from "lucide-react";

export default function MemberDashboardPage() {
  const { currentMember } = useAuth();
  const {
    members,
    transactions,
    weightliftingSessions,
    bookWeightliftingSession,
    coaches,
    checkIns,
  } = useGymData();

  // Find live member from context to reflect instant updates
  const liveMember = members.find((m) => m.id === currentMember?.id) || currentMember;

  // Active Tab for bottom section: "sessions" | "history" | "transactions"
  const [subTab, setSubTab] = useState<"sessions" | "history" | "transactions">("sessions");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentItemType, setPaymentItemType] = useState<"pt_package" | "membership">("pt_package");

  // Booking Feedback State
  const [bookingNotice, setBookingNotice] = useState<{ success: boolean; message: string } | null>(null);

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
      <div className="text-center py-12 space-y-3">
        <p className="text-xs text-zinc-400">Data member tidak ditemukan.</p>
      </div>
    );
  }

  const isExpired = isPackageExpired(liveMember.expiry_date);
  const assignedCoach = coaches.find((c) => c.id === liveMember.selected_coach_id) || coaches[0];
  const memberCheckins = checkIns.filter((c) => c.member_id === liveMember.id);
  const memberTransactions = transactions.filter((t) => t.member_id === liveMember.id);

  const handleBookSession = (sessionId: string) => {
    const res = bookWeightliftingSession(sessionId, liveMember.id);
    setBookingNotice(res);
    setTimeout(() => setBookingNotice(null), 4000);
  };

  const cashMins = Math.floor(cashSecondsRemaining / 60);
  const cashSecs = cashSecondsRemaining % 60;
  const cashTimerFormatted = `${String(cashMins).padStart(2, "0")}:${String(cashSecs).padStart(2, "0")}`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: DIGITAL ID & CHECK-IN (BIG QR CODE)                      */}
      {/* ========================================================================= */}
      <section className="bg-gym-card border-2 border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon/10 rounded-full blur-3xl pointer-events-none" />

        {/* Member Greeting & Badge */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-neon tracking-widest bg-neon/15 px-2.5 py-0.5 rounded border border-neon/30">
              DIGITAL ID PASS
            </span>
            <h1 className="text-xl font-black text-white mt-1 leading-tight">
              {liveMember.full_name}
            </h1>
            <div className="text-xs text-zinc-400 font-mono">
              {liveMember.member_code} • {liveMember.phone}
            </div>
          </div>

          <Badge variant={isExpired ? "danger" : "neon"} size="md" className="font-black">
            {isExpired ? "MEMBERSHIP EXPIRED" : "✓ MEMBER AKTIF"}
          </Badge>
        </div>

        {/* Big Scannable QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gym-elevated/90 border border-zinc-700/80 shadow-inner space-y-3">
          <div
            dangerouslySetInnerHTML={{
              __html: generateQRCodeSVG(
                liveMember.qr_code_data || `FTL:${liveMember.member_code}:${liveMember.full_name}`,
                210,
                "#E2F952",
                "#0A0A0A"
              ),
            }}
            className="flex items-center justify-center p-2 rounded-2xl bg-zinc-950 border-2 border-neon/50 shadow-neon-sm"
          />

          <div className="text-center space-y-0.5">
            <div className="text-xs font-black text-white tracking-wide">
              Tunjukkan QR Code ini pada scanner Front Desk saat datang
            </div>
            <div className="text-[10px] text-zinc-400">
              Validasi instan dalam 0.08 detik (Bebas antre)
            </div>
          </div>
        </div>

        {/* Expiry Date & Perpanjang Membership CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Masa Berlaku Membership:</div>
            <div className={`text-sm font-black ${isExpired ? "text-rose-400" : "text-white"}`}>
              {liveMember.expiry_date ? formatWIBDate(liveMember.expiry_date) : "Aktif"}
            </div>
          </div>

          <Button
            variant="neon"
            size="md"
            onClick={() => {
              setPaymentItemType("membership");
              setIsPaymentModalOpen(true);
            }}
            className="shadow-neon text-xs font-black px-4 py-2"
          >
            <span>Perpanjang Membership</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ACTIVE PENDING CASH INVOICE ALERT (1-HOUR COUNTDOWN BRIDGE TO CASHIER)    */}
      {/* ========================================================================= */}
      {activeCashInvoice && (
        <section className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/80 via-zinc-900 to-black border-2 border-amber-500 shadow-xl space-y-3 animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-300">
                  Pesanan Tunai Menunggu Kasir: {activeCashInvoice.title}
                </div>
                <div className="text-[11px] text-zinc-300">
                  Total: <strong className="text-white">{formatRupiah(activeCashInvoice.amount)}</strong> • Kode:{" "}
                  <span className="font-mono text-neon font-bold">{activeCashInvoice.invoice_code}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-zinc-400 uppercase">Sisa Waktu:</div>
              <div className="text-lg font-black font-mono text-amber-400">
                {cashSecondsRemaining > 0 ? cashTimerFormatted : "EXPIRED"}
              </div>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="p-2.5 rounded-xl bg-white flex justify-center">
            <div
              dangerouslySetInnerHTML={{
                __html: generateBarcodeSVG(activeCashInvoice.invoice_code, 220, 36, "#000000", "#FFFFFF"),
              }}
            />
          </div>

          <div className="text-[10px] text-zinc-400 text-center">
            Tunjukkan barcode ini ke kasir Front Desk gym sebelum waktu 1 jam habis.
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. MANAJEMEN PERSONAL TRAINER (COACH/PT) & WAJIB PENAWARAN RP 360.000     */}
      {/* ========================================================================= */}
      <section className="bg-gym-card border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Manajemen Personal Trainer</h2>
              <p className="text-xs text-zinc-400">Bimbingan teknik angkat beban intensif</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Sisa Kuota Sesi:</div>
            <div className="text-xl font-black text-amber-400">
              {liveMember.selected_coach_sessions || 0} Sesi
            </div>
          </div>
        </div>

        {/* Coach Assigned Info */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <img
            src={assignedCoach.photo_url}
            alt={assignedCoach.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400/50 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-white truncate">{assignedCoach.name}</div>
            <div className="text-[11px] text-neon font-semibold truncate">{assignedCoach.specialty}</div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 pt-0.5">
              <span className="flex items-center text-amber-400 font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                {assignedCoach.rating}
              </span>
              <span>•</span>
              <span>{assignedCoach.available_days}</span>
            </div>
          </div>

          <a
            href={`https://wa.me/62895601800302?text=${encodeURIComponent(
              `Halo Coach ${assignedCoach.nickname} & Admin FTL Gym, saya member ${liveMember.full_name} (${liveMember.member_code}). Saya ingin membuat janji temu sesi latihan beban.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 transition-colors shadow-sm"
            title="Chat WhatsApp Trainer"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>

        {/* Penawaran Resmi PT: Star dari Rp 300.000 - Rp 400.000 / sesi */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-black border-2 border-amber-500/80 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="warning" size="sm" className="font-black text-[9px] uppercase tracking-wider">
              PENAWARAN RESMI FTL GYM
            </Badge>
            <span className="text-[10px] text-amber-400 font-bold">Star 300rb – 400rb / Sesi</span>
          </div>

          <div>
            <div className="text-base sm:text-lg font-black text-white">
              Paket Sesi Coach/PT: <span className="text-amber-400 font-black">Mulai Rp 3.600.000</span>
            </div>
            <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
              Dapatkan pendampingan teknik angkat beban, deadlift, squat, dan konsultasi asupan nutrisi bersama Coach bersertifikat (star Rp 300rb/sesi).
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setPaymentItemType("pt_package");
              setIsPaymentModalOpen(true);
            }}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs py-2.5 shadow-lg rounded-xl mt-1"
          >
            <span>Beli / Perpanjang Sesi PT (Mulai Rp 3.600.000)</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TABS: JADWAL KELAS ANGKAT BEBAN / RIWAYAT KUNJUNGAN / TRANSAKSI        */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Navigation Switcher */}
        <div className="grid grid-cols-3 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setSubTab("sessions")}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              subTab === "sessions" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Sesi Beban</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("history")}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              subTab === "history" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Kunjungan</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("transactions")}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              subTab === "transactions" ? "bg-neon text-gym-base shadow-neon" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Transaksi</span>
          </button>
        </div>

        {/* Global Booking Feedback Alert */}
        {bookingNotice && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              bookingNotice.success
                ? "bg-neon/15 border-neon/40 text-neon"
                : "bg-rose-950/80 border-rose-600 text-rose-300"
            }`}
          >
            {bookingNotice.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{bookingNotice.message}</span>
          </div>
        )}

        {/* SUBTAB 1: JADWAL SESI ANGKAT BEBAN (NO YOGA/ZUMBA) */}
        {subTab === "sessions" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-black text-white">Jadwal Sesi Angkat Beban</h3>
                <p className="text-[11px] text-zinc-400">Amankan slot latihan beban intensif sebelum datang</p>
              </div>
              <Badge variant="neutral" size="sm" className="text-[10px] border-zinc-800 text-zinc-400">
                Khusus Strength
              </Badge>
            </div>

            <div className="space-y-3">
              {weightliftingSessions.map((session) => {
                const isBooked = session.booked_member_ids?.includes(liveMember.id);
                const isFull = session.booked_count >= session.capacity_limit;

                return (
                  <Card key={session.id} className="bg-gym-card border-zinc-800 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] bg-zinc-800 text-neon px-2 py-0.5 rounded font-black uppercase inline-block">
                          {session.category}
                        </div>
                        <h4 className="text-sm font-black text-white mt-1 leading-tight">{session.name}</h4>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Coach: <strong className="text-zinc-200">{session.instructor_name}</strong> • {session.room}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-neon">{session.start_time} WIB</div>
                        <div className="text-[10px] text-zinc-500">{session.end_time} WIB</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <div className="text-[11px] text-zinc-400">
                        Kapasitas:{" "}
                        <strong className={isFull ? "text-rose-400" : "text-white"}>
                          {session.booked_count} / {session.capacity_limit} Slot
                        </strong>
                      </div>

                      {isBooked ? (
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Slot Terkonfirmasi</span>
                        </span>
                      ) : (
                        <Button
                          variant={isFull ? "secondary" : "neon"}
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleBookSession(session.id)}
                          className="text-xs font-black px-4"
                        >
                          {isFull ? "Slot Penuh" : "Booking Sesi"}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: RIWAYAT KUNJUNGAN CHECK-IN */}
        {subTab === "history" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="px-1">
              <h3 className="text-sm font-black text-white">Riwayat Kunjungan Check-In</h3>
              <p className="text-[11px] text-zinc-400">Histori kedatangan Anda di meja Front Desk / Turnstile</p>
            </div>

            {memberCheckins.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                <History className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Belum ada catatan check-in.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {memberCheckins.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3 rounded-2xl bg-gym-card border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-neon/15 text-neon flex items-center justify-center font-black text-xs">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Check-In Berhasil ({chk.scan_method})
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {formatWIBDate(chk.check_in_time)} • {formatWIBTime(chk.check_in_time)} WIB
                        </div>
                      </div>
                    </div>

                    <Badge variant="success" size="sm" className="text-[9px]">
                      HADIR
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: RIWAYAT TRANSAKSI */}
        {subTab === "transactions" && (
          <div className="space-y-3 animate-in fade-in">
            <div className="px-1 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Histori Pembayaran & Invoice</h3>
                <p className="text-[11px] text-zinc-400">Daftar transaksi online & tunai Anda</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPaymentItemType("pt_package");
                  setIsPaymentModalOpen(true);
                }}
                className="text-[10px] border-zinc-700"
              >
                + Beli Baru
              </Button>
            </div>

            {memberTransactions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                <Receipt className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Belum ada histori transaksi.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {memberTransactions.map((tx) => {
                  const isPending = tx.status === "pending";
                  const isPaid = tx.status === "paid";
                  const isExpired = tx.status === "expired";

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-gym-card border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-black text-white">{tx.title}</div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {tx.invoice_code} • {formatWIBDate(tx.created_at)}
                          </div>
                        </div>

                        <Badge
                          variant={isPaid ? "success" : isPending ? "warning" : "danger"}
                          size="sm"
                          className="text-[9px] font-black uppercase"
                        >
                          {isPaid
                            ? `LUNAS (${tx.payment_method})`
                            : isPending
                            ? "PENDING TUNAI"
                            : "EXPIRED / HANGUS"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-xs">
                        <span className="text-zinc-400 text-[11px]">
                          Metode: <strong className="text-white uppercase">{tx.payment_method}</strong>
                        </span>
                        <span className="font-black text-neon">{formatRupiah(tx.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Omnichannel Payment Modal Component */}
      <OmnichannelPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        member={liveMember}
        initialItemType={paymentItemType}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Member, Coach, Transaction } from "@/lib/types";
import { useGymData } from "@/context/GymDataContext";
import { formatRupiah } from "@/lib/utils";
import { generateQRCodeSVG, generateBarcodeSVG } from "@/lib/qrGenerator";
import { soundManager } from "@/components/common/SoundEffects";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface OmnichannelPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  initialItemType?: "pt_package" | "membership";
  onSuccess: (tx: Transaction) => void;
}

export const OmnichannelPaymentModal: React.FC<OmnichannelPaymentModalProps> = ({
  isOpen,
  onClose,
  member,
  initialItemType = "pt_package",
  onSuccess,
}) => {
  const { coaches, createTransaction, transactions } = useGymData();

  // Mode: "pt_package" or "membership"
  const [itemType, setItemType] = useState<"pt_package" | "membership">(initialItemType);

  // PT Package Options (Tarif Sesi PT: Star dari Rp 25.000 - Rp 30.000 / sesi)
  const [selectedCoachId, setSelectedCoachId] = useState<string>(member.selected_coach_id || "coach-kevin");
  const [selectedPtSessions, setSelectedPtSessions] = useState<number>(12);
  const currentCoach = coaches.find((c) => c.id === selectedCoachId) || coaches[0];
  const ptPrice = selectedPtSessions === 12
    ? (currentCoach?.pt_rate_12 || 300000)
    : (currentCoach?.pt_rate_24 || 580000);

  // Membership Renewal Options
  const [selectedMembershipPlan, setSelectedMembershipPlan] = useState<"1_month" | "6_months" | "1_year">("1_month");
  const membershipPrice =
    selectedMembershipPlan === "1_month" ? 250000 : selectedMembershipPlan === "6_months" ? 1200000 : 2200000;

  // Payment Method Selection: "online" or "tunai"
  const [paymentMethod, setPaymentMethod] = useState<"online" | "tunai">("online");
  const [onlineChannel, setOnlineChannel] = useState<"qris" | "va_bca" | "gopay">("qris");

  // Flow State
  const [step, setStep] = useState<"select" | "processing_online" | "cash_invoice" | "success">("select");
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setItemType(initialItemType);
      setStep("select");
      setActiveTransaction(null);
      setPaymentMethod("online");
    }
  }, [isOpen, initialItemType]);

  // Watch for real-time status update if cash invoice is open!
  useEffect(() => {
    if (step === "cash_invoice" && activeTransaction) {
      const current = transactions.find((t) => t.id === activeTransaction.id);
      if (current && current.status === "paid" && activeTransaction.status !== "paid") {
        setActiveTransaction(current);
        soundManager.playSuccessBeep();
        setStep("success");
        onSuccess(current);
      } else if (current && current.status === "expired" && activeTransaction.status !== "expired") {
        setActiveTransaction(current);
      }
    }
  }, [transactions, step, activeTransaction, onSuccess]);

  if (!isOpen) return null;

  const totalAmount = itemType === "pt_package" ? ptPrice : membershipPrice;
  const itemTitle =
    itemType === "pt_package"
      ? `Paket ${selectedPtSessions} Sesi Coach/PT (${currentCoach.name})`
      : `Perpanjangan Membership Gym ${selectedMembershipPlan === "1_month" ? "1 Bulan" : selectedMembershipPlan === "6_months" ? "6 Bulan" : "1 Tahun (VIP)"}`;

  // Handle Checkout Submit
  const handleProceedPayment = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (paymentMethod === "online") {
        // Create online transaction and transition to Midtrans simulation
        const tx = createTransaction({
          memberId: member.id,
          memberName: member.full_name,
          memberPhone: member.phone,
          transactionType: itemType,
          title: itemTitle,
          description:
            itemType === "pt_package"
              ? `Pembelian ${selectedPtSessions} Sesi Angkat Beban bersama ${currentCoach.name}`
              : `Perpanjangan akses gym area angkat beban ${selectedMembershipPlan}`,
          amount: totalAmount,
          paymentMethod: "online",
          paymentChannel: `midtrans_${onlineChannel}`,
          details: {
            package_type: itemType === "membership" ? selectedMembershipPlan : undefined,
            coach_id: itemType === "pt_package" ? selectedCoachId : undefined,
            coach_name: itemType === "pt_package" ? currentCoach.name : undefined,
            sessions_count: itemType === "pt_package" ? selectedPtSessions : undefined,
          },
        });

        setActiveTransaction(tx);
        setStep("processing_online");
      } else {
        // Create cash pending transaction with 1-HOUR countdown!
        const tx = createTransaction({
          memberId: member.id,
          memberName: member.full_name,
          memberPhone: member.phone,
          transactionType: itemType,
          title: itemTitle,
          description: `Pembayaran tunai di kasir gym untuk ${itemTitle}`,
          amount: totalAmount,
          paymentMethod: "tunai",
          paymentChannel: "tunai_frontdesk",
          details: {
            package_type: itemType === "membership" ? selectedMembershipPlan : undefined,
            coach_id: itemType === "pt_package" ? selectedCoachId : undefined,
            coach_name: itemType === "pt_package" ? currentCoach.name : undefined,
            sessions_count: itemType === "pt_package" ? selectedPtSessions : undefined,
          },
        });

        setActiveTransaction(tx);
        setStep("cash_invoice");
      }
    }, 400);
  };

  // Simulate Midtrans online payment success
  const handleSimulateMidtransSuccess = () => {
    if (!activeTransaction) return;
    soundManager.playSuccessBeep();
    setStep("success");
    onSuccess(activeTransaction);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md bg-gym-card border-2 border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: SELECT ITEM & PAYMENT METHOD */}
        {step === "select" && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-neon bg-neon/15 px-2.5 py-0.5 rounded border border-neon/30">
                OMNICHANNEL PAYMENT
              </span>
              <h2 className="text-xl font-black text-white mt-1">Pilih Item & Metode Pembayaran</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pilih pembayaran online langsung aktif atau bayar tunai di meja kasir.
              </p>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setItemType("pt_package")}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  itemType === "pt_package"
                    ? "bg-neon text-gym-base shadow-neon"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Sesi Personal Trainer</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType("membership")}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  itemType === "membership"
                    ? "bg-neon text-gym-base shadow-neon"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Paket Membership</span>
              </button>
            </div>

            {/* PT PACKAGE CONFIG (Tarif Sesi PT: Star dari Rp 300.000 - Rp 400.000 / sesi) */}
            {itemType === "pt_package" && (
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Sesi Personal Trainer Angkat Beban</span>
                  </div>
                  <Badge variant="warning" size="sm" className="text-[10px] font-black">
                    STAR DARI 300RB/SESI
                  </Badge>
                </div>

                {/* Pricing info banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-900 border border-amber-500/50">
                  <div className="text-[11px] font-bold text-amber-300">TARIF RESMI PERSONAL TRAINER:</div>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">
                    Star dari <span className="text-amber-400">Rp 25.000 – Rp 30.000</span> / Sesi
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Harga disesuaikan dengan sertifikasi Coach. {currentCoach.name}: <span className="text-amber-300 font-bold">{formatRupiah(currentCoach.rate_per_session || 25000)} / sesi</span>.
                  </div>
                </div>

                {/* Coach Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">
                    Pilih Personal Trainer Pendamping:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {coaches.map((c) => {
                      const isSelected = selectedCoachId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCoachId(c.id)}
                          className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-zinc-850 border-neon shadow-neon-sm"
                              : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <img
                            src={c.photo_url}
                            alt={c.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{c.nickname}</div>
                            <div className="text-[10px] text-amber-400 font-mono font-bold">
                              Rp {((c.rate_per_session || 25000) / 1000).toFixed(0)}rb/sesi
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sessions count */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPtSessions(12)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedPtSessions === 12
                        ? "bg-neon text-black border-neon font-black shadow-neon"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    <div className="font-black">12 Sesi ({formatRupiah(currentCoach.pt_rate_12)})</div>
                    <div className="text-[9px] opacity-80">
                      @ {formatRupiah(currentCoach.rate_per_session || 25000)}/sesi
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPtSessions(24)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedPtSessions === 24
                        ? "bg-neon text-black border-neon font-black shadow-neon"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    <div className="font-black">24 Sesi ({formatRupiah(currentCoach.pt_rate_24)})</div>
                    <div className="text-[9px] opacity-80 text-neon font-bold">
                      Diskon Hemat Paket
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* MEMBERSHIP PLAN CONFIG */}
            {itemType === "membership" && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase">
                  Pilih Durasi Perpanjangan Membership:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setSelectedMembershipPlan("1_month")}
                    className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                      selectedMembershipPlan === "1_month"
                        ? "bg-zinc-900 border-neon shadow-neon-sm"
                        : "bg-zinc-900/60 border-zinc-800"
                    }`}
                  >
                    <div className="text-xs font-black text-white">1 Bulan</div>
                    <div className="text-[11px] font-bold text-neon mt-1">Rp 250k</div>
                  </div>
                  <div
                    onClick={() => setSelectedMembershipPlan("6_months")}
                    className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                      selectedMembershipPlan === "6_months"
                        ? "bg-zinc-900 border-neon shadow-neon-sm"
                        : "bg-zinc-900/60 border-zinc-800"
                    }`}
                  >
                    <div className="text-xs font-black text-white">6 Bulan</div>
                    <div className="text-[11px] font-bold text-neon mt-1">Rp 1,2jt</div>
                  </div>
                  <div
                    onClick={() => setSelectedMembershipPlan("1_year")}
                    className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                      selectedMembershipPlan === "1_year"
                        ? "bg-zinc-900 border-neon shadow-neon-sm"
                        : "bg-zinc-900/60 border-zinc-800"
                    }`}
                  >
                    <div className="text-xs font-black text-white">1 Tahun (VIP)</div>
                    <div className="text-[11px] font-bold text-neon mt-1">Rp 2,2jt</div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD CHOICES (WAJIB: ONLINE VS TUNAI 1 JAM) */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <label className="block text-xs font-black text-white uppercase">
                Metode Pembayaran (Omnichannel):
              </label>

              {/* Option A: Bayar Online Midtrans */}
              <div
                onClick={() => setPaymentMethod("online")}
                className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all space-y-2 ${
                  paymentMethod === "online"
                    ? "bg-zinc-900 border-neon shadow-neon-sm"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-neon/20 text-neon flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">A. Bayar Online (Midtrans Instant)</div>
                      <div className="text-[10px] text-zinc-400">QRIS, Virtual Account BCA, GoPay</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm" className="text-[9px]">
                    LANGSUNG AKTIF
                  </Badge>
                </div>

                {paymentMethod === "online" && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOnlineChannel("qris");
                      }}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border ${
                        onlineChannel === "qris" ? "bg-neon text-gym-base border-neon" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      QRIS Semua Bank
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOnlineChannel("va_bca");
                      }}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border ${
                        onlineChannel === "va_bca" ? "bg-neon text-gym-base border-neon" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      VA BCA / Mandiri
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOnlineChannel("gopay");
                      }}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border ${
                        onlineChannel === "gopay" ? "bg-neon text-gym-base border-neon" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      GoPay / Shopee
                    </button>
                  </div>
                )}
              </div>

              {/* Option B: Bayar Tunai (Di Gym - Batas 1 Jam) */}
              <div
                onClick={() => setPaymentMethod("tunai")}
                className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all space-y-1 ${
                  paymentMethod === "tunai"
                    ? "bg-zinc-900 border-amber-400 shadow-lg"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">B. Bayar Tunai (Di Kasir Gym)</div>
                      <div className="text-[10px] text-zinc-400">Dapatkan Barcode & bayar ke Front Desk</div>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm" className="text-[9px]">
                    BATAS 1 JAM
                  </Badge>
                </div>
                <div className="text-[10px] text-amber-300/90 pl-10 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Invoice tunai hangus otomatis jika tidak lunas dalam 60 menit.</span>
                </div>
              </div>
            </div>

            {/* Total and Submit */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Total Pembayaran:</div>
                <div className="text-xl font-black text-neon">{formatRupiah(totalAmount)}</div>
              </div>

              <Button
                type="button"
                variant="neon"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleProceedPayment}
                className="shadow-neon px-6 text-xs sm:text-sm font-black"
              >
                <span>Lanjut Pembayaran</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2A: PROCESSING ONLINE (MIDTRANS GATEWAY SIMULATION) */}
        {step === "processing_online" && activeTransaction && (
          <div className="space-y-5 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-neon text-gym-base flex items-center justify-center font-black mx-auto shadow-neon">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-neon tracking-wider bg-neon/15 px-2.5 py-0.5 rounded border border-neon/30">
                GATEWAY MIDTRANS SIMULATION
              </span>
              <h3 className="text-lg font-black text-white mt-1">Pembayaran Online Otomatis</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Scan kode QRIS di bawah ini dengan aplikasi perbankan atau e-wallet Anda.
              </p>
            </div>

            {/* Generated QRIS Graphic */}
            <div className="p-4 rounded-3xl bg-white border-4 border-neon max-w-[210px] mx-auto shadow-xl">
              <div
                dangerouslySetInnerHTML={{
                  __html: generateQRCodeSVG(
                    `MIDTRANS:QRIS:${activeTransaction.invoice_code}:${activeTransaction.amount}`,
                    180,
                    "#000000",
                    "#FFFFFF"
                  ),
                }}
                className="flex items-center justify-center"
              />
              <div className="text-[10px] font-black font-mono text-black mt-2">
                ONE O ONE GYM OFFICIAL QRIS
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>No. Invoice:</span>
                <span className="font-mono font-bold text-white">{activeTransaction.invoice_code}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Biaya:</span>
                <span className="font-black text-neon text-sm">{formatRupiah(activeTransaction.amount)}</span>
              </div>
            </div>

            {/* Instant Simulation Action */}
            <Button
              type="button"
              variant="neon"
              size="lg"
              onClick={handleSimulateMidtransSuccess}
              className="w-full shadow-neon font-black text-xs py-3"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Simulasi Bayar Sukses (Midtrans Instant Callback)</span>
            </Button>
          </div>
        )}

        {/* STEP 2B: CASH INVOICE (PENDING WITH 1-HOUR COUNTDOWN TIMER) */}
        {step === "cash_invoice" && activeTransaction && (
          <LiveCashInvoiceView transaction={activeTransaction} onClose={onClose} />
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === "success" && activeTransaction && (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 font-black">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <Badge variant="success" size="md" className="font-black">
                PEMBAYARAN LUNAS
              </Badge>
              <h3 className="text-xl font-black text-white">Paket Berhasil Diaktifkan!</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Terima kasih! {activeTransaction.title} telah aktif dan dapat langsung digunakan di gym.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Invoice:</span>
                <span className="text-white font-bold">{activeTransaction.invoice_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Metode:</span>
                <span className="text-neon uppercase">{activeTransaction.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total:</span>
                <span className="text-white font-bold">{formatRupiah(activeTransaction.amount)}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="neon"
              size="lg"
              onClick={onClose}
              className="w-full shadow-neon font-black text-xs py-3.5 rounded-2xl"
            >
              <span>Tutup & Lihat Dashboard Saya</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================================================
// LIVE CASH INVOICE WITH 1-HOUR REAL-TIME COUNTDOWN
// ==============================================================================
function LiveCashInvoiceView({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(transaction.expires_at).getTime();
      const diffSecs = Math.floor((expiry - now) / 1000);

      if (diffSecs <= 0) {
        setSecondsRemaining(0);
        setIsExpired(true);
      } else {
        setSecondsRemaining(diffSecs);
        setIsExpired(false);
      }
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [transaction.expires_at]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-4 text-center animate-in zoom-in-95">
      {/* Expiry Warning Header */}
      <div>
        <Badge variant={isExpired ? "danger" : "warning"} size="md" className="font-black tracking-wide">
          {isExpired ? "✕ INVOICE EXPIRED / HANGUS" : "⏳ MENUNGGU PEMBAYARAN KASIR"}
        </Badge>
        <h3 className="text-lg font-black text-white mt-1.5">Invoice Bayar Tunai (Di Gym)</h3>
        <p className="text-xs text-zinc-400">
          Tunjukkan ID Pesanan / Barcode ini kepada staf Front Desk di meja resepsionis.
        </p>
      </div>

      {/* Visual Live Countdown Timer */}
      <div
        className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
          isExpired
            ? "bg-rose-950/60 border-rose-600 text-rose-300"
            : "bg-amber-950/50 border-amber-500/80 text-amber-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Clock className={`w-5 h-5 ${isExpired ? "text-rose-400" : "text-amber-400 animate-pulse"}`} />
          <div className="text-left">
            <div className="text-[10px] uppercase font-black text-zinc-400">Batas Waktu Pelunasan:</div>
            <div className="text-xs font-bold text-white">
              {isExpired ? "Waktu 1 Jam Habis" : "Hanya Berlaku 1 Jam"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black font-mono tracking-wider text-amber-400">
            {isExpired ? "00:00" : formattedCountdown}
          </div>
          <div className="text-[9px] text-zinc-400">Menit : Detik</div>
        </div>
      </div>

      {/* Barcode Graphic for Cashier Scanner */}
      <div className="p-4 rounded-2xl bg-white border-2 border-zinc-700 space-y-2">
        <div
          dangerouslySetInnerHTML={{
            __html: generateBarcodeSVG(transaction.invoice_code, 260, 50, "#000000", "#FFFFFF"),
          }}
          className="flex justify-center overflow-hidden"
        />
        <div className="text-xs font-black font-mono text-black tracking-widest">
          {transaction.invoice_code}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-left space-y-1.5">
        <div className="flex justify-between text-zinc-400">
          <span>Item:</span>
          <span className="font-bold text-white text-right truncate max-w-[200px]">
            {transaction.title}
          </span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Total Tunai:</span>
          <span className="font-black text-neon text-sm">{formatRupiah(transaction.amount)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Status Kasir:</span>
          <span className="font-bold text-amber-400">Menunggu Konfirmasi Staf</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 text-left">
        💡 <strong>Catatan:</strong> Saat kasir mengklik <em>"Konfirmasi Lunas"</em> di komputer Front Desk, layar HP Anda akan otomatis berubah menjadi LUNAS seketika.
      </div>

      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={onClose}
        className="w-full text-xs font-bold"
      >
        Tutup Layar (Invoice Tersimpan di Histori)
      </Button>
    </div>
  );
}

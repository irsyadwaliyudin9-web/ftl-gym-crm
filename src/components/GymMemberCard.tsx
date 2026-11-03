"use client";

import React, { useState } from "react";
import { Member } from "@/lib/types";
import { formatRupiah, formatWIBDate } from "@/lib/utils";
import { generateQRCodeSVG, generateBarcodeSVG } from "@/lib/qrGenerator";
import { downloadMemberCardPNG } from "@/lib/memberCardGenerator";
import {
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  Hourglass,
  Flame,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  Share2,
} from "lucide-react";

interface GymMemberCardProps {
  member: Member;
  onRefreshStatus?: () => void;
}

export const GymMemberCard: React.FC<GymMemberCardProps> = ({ member, onRefreshStatus }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const isPending = member.status === "pending_approval" || member.payment_proof_status === "pending";

  const qrSvg = generateQRCodeSVG(
    member.qr_code_data || `FTL:${member.member_code}`,
    180,
    isPending ? "#F59E0B" : "#E2F952",
    "#07080A"
  );
  const barcodeSvg = generateBarcodeSVG(member.member_code, 220, 36, isPending ? "#F59E0B" : "#E2F952", "transparent");

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadMemberCardPNG(member);
    } finally {
      setIsDownloading(false);
    }
  };

  const tierName =
    member.package_type === "1_year"
      ? "VIP DIAMOND PASS"
      : member.package_type === "6_months"
      ? "VIP GOLD PASS"
      : "SILVER PASS";

  return (
    <div className="space-y-4">
      {/* Physical-Style Digital Membership Card */}
      <div
        className={`relative rounded-3xl overflow-hidden p-6 sm:p-7 border-2 transition-all duration-300 shadow-2xl ${
          isPending
            ? "border-amber-500/60 bg-gradient-to-br from-[#12110D] via-[#1A1813] to-[#0A0A0A] shadow-amber-500/10"
            : "border-neon/60 bg-gradient-to-br from-[#0D0F14] via-[#141822] to-[#0A0B0E] shadow-neon/20"
        }`}
      >
        {/* Subtle decorative glow & carbon grid */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-neon/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between pb-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                isPending ? "bg-amber-400 text-black" : "bg-neon text-black shadow-neon-sm"
              }`}
            >
              101
            </div>
            <div>
              <div className="font-black text-white text-base tracking-wider flex items-center gap-2">
                <span>ONE O ONE GYM</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                  OFFICIAL PASS
                </span>
              </div>
              <div className="text-[11px] font-bold text-zinc-400 tracking-wider">
                ONE O ONE FITNESS CLUB • JAKARTA
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Metallic Smartchip simulation */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-400 via-amber-200 to-amber-600 border border-amber-700 p-1 flex flex-col justify-between shadow-inner hidden sm:flex">
              <div className="h-0.5 bg-amber-800/60 w-full" />
              <div className="h-1 bg-amber-700/50 w-2/3 mx-auto rounded" />
              <div className="h-0.5 bg-amber-800/60 w-full" />
            </div>

            {/* VIP Tier Badge */}
            <span
              className={`text-[11px] font-black px-3 py-1 rounded-xl uppercase tracking-wider border shadow-sm ${
                isPending
                  ? "bg-amber-950/80 text-amber-400 border-amber-700/80"
                  : "bg-neon/15 text-neon border-neon/50 shadow-neon-sm"
              }`}
            >
              {tierName}
            </span>
          </div>
        </div>

        {/* Card Main Body */}
        <div className="relative z-10 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Member Details (Left) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">
                NAMA LENGKAP MEMBER
              </span>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 leading-snug break-words">
                {member.full_name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">
                  NOMOR MEMBER
                </span>
                <span className={`text-base sm:text-lg font-black font-mono mt-0.5 block ${
                  isPending ? "text-amber-400" : "text-neon"
                }`}>
                  {member.member_code}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">
                  BERLAKU HINGGA
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-zinc-200 mt-1 block">
                  {formatWIBDate(member.expiry_date)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">
                PAKET MEMBERSHIP
              </span>
              <span className="text-xs font-bold text-zinc-300 mt-0.5 block">
                {member.package_type === "1_year"
                  ? "Paket 1 Tahun (365 Hari) · All Clubs Access"
                  : member.package_type === "6_months"
                  ? "Paket 6 Bulan (180 Hari) · All Clubs Access"
                  : "Paket 1 Bulan (30 Hari) · All Clubs Access"}
              </span>
            </div>

            {member.selected_coach_name && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    PERSONAL TRAINER
                  </span>
                  <span className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{member.selected_coach_name}</span>
                  </span>
                </div>
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  {member.selected_coach_sessions || 12} Sesi
                </span>
              </div>
            )}

            {/* Status Pill Indicator */}
            <div>
              {isPending ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-700/80 text-amber-400 text-xs font-black">
                  <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  <span>MENUNGGU PERSETUJUAN WA ADMIN</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OFFICIAL ACTIVE MEMBER • ACCREDITED</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Matrix (Right) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all bg-[#07080A] shadow-inner relative w-full max-w-[240px] ${
                isPending ? "border-amber-700/60" : "border-neon/40 shadow-neon-sm"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                className={`w-40 h-40 flex items-center justify-center transition-opacity ${
                  isPending ? "opacity-35" : "opacity-100"
                }`}
              />

              {isPending && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-3 text-center">
                  <Hourglass className="w-7 h-7 text-amber-400 mb-1.5 animate-bounce" />
                  <span className="text-xs font-black text-white">QR Code Terkunci</span>
                  <span className="text-[10px] text-zinc-300 mt-1 leading-tight">
                    Aktif seketika saat admin meng-approve pendaftaran Anda.
                  </span>
                </div>
              )}

              <div className="mt-2 text-center w-full">
                <div dangerouslySetInnerHTML={{ __html: barcodeSvg }} className="h-7 opacity-80 mx-auto" />
                <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                  {member.qr_code_data}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 block">
                  Scan di Turnstile / Front Desk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="relative z-10 pt-5 mt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
          <div>PT ONE O ONE GYM INDONESIA • CS / ADMIN WA: 0895-6018-00302</div>
          <div className="font-semibold text-zinc-400">RESMI & BERLAKU DI SELURUH CABANG</div>
        </div>
      </div>

      {/* Action Buttons: Download Card (PNG), Print, and Quick Share */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-3 px-5 rounded-2xl bg-neon hover:bg-neon-lime text-gym-base font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-neon transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{isDownloading ? "Membuat Gambar Kartu..." : "Unduh Kartu Member (Gambar PNG)"}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="w-full py-3 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-zinc-700 transition-all active:scale-[0.98]"
        >
          <Printer className="w-4 h-4 text-zinc-400" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      <p className="text-[11px] text-center text-zinc-400 leading-relaxed">
        💡 Tombol <strong>"Unduh Kartu Member"</strong> akan menyimpan kartu identitas lengkap (nama, nomor member, paket, coach, dan QR code) berformat PNG dengan resolusi tinggi ke perangkat Anda.
      </p>
    </div>
  );
};

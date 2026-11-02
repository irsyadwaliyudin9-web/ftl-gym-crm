"use client";

import React, { useState } from "react";
import { soundManager } from "@/components/common/SoundEffects";
import { ShieldCheck, AlertOctagon, CheckCircle2, QrCode, Volume2 } from "lucide-react";
import { generateQRCodeSVG } from "@/lib/qrGenerator";

export const InteractiveScannerPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"success" | "expired">("success");

  const sampleSuccess = {
    code: "FTL-0801",
    name: "Arya Putra Perdana",
    status: "AKTIF (HIJAU)",
    pkg: "1 Tahun VIP Unlimited",
    expiry: "10 Jan 2027",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    message: "Akses Diberikan. Selamat Berlatih!",
  };

  const sampleExpired = {
    code: "FTL-0803",
    name: "Budi Santoso",
    status: "EXPIRED (MERAH)",
    pkg: "1 Bulan Reguler",
    expiry: "25 Okt 2026",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    message: "AKSES DITOLAK! Paket Habis Sejak 25 Okt 2026",
  };

  const current = activeTab === "success" ? sampleSuccess : sampleExpired;
  const qrSvg = generateQRCodeSVG(current.code, 120, activeTab === "success" ? "#10B981" : "#EF4444", "#0A0A0A");

  const handleTabSwitch = (tab: "success" | "expired") => {
    setActiveTab(tab);
    if (tab === "success") {
      soundManager.playSuccessBeep();
    } else {
      soundManager.playErrorBeep();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gym-card/90 border-2 border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Interactive Switcher Bar */}
      <div className="bg-gym-elevated p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
          <QrCode className="w-4 h-4 text-neon" />
          <span>Simulasi Live Front Desk:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => handleTabSwitch("success")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "success"
                ? "bg-emerald-500 text-gym-base shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aktif (Hijau)</span>
          </button>
          <button
            onClick={() => handleTabSwitch("expired")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "expired"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Expired (Merah)</span>
          </button>
        </div>
      </div>

      {/* Screen Body with dynamic Green/Red pulse */}
      <div
        className={`p-6 transition-colors duration-300 relative ${
          activeTab === "success"
            ? "bg-gradient-to-b from-emerald-950/40 via-gym-card to-gym-base border-b-4 border-emerald-500"
            : "bg-gradient-to-b from-rose-950/40 via-gym-card to-gym-base border-b-4 border-rose-500"
        }`}
      >
        {/* Flash Status Banner */}
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl mb-5 font-black text-xs uppercase tracking-wider ${
            activeTab === "success"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-900/30 shadow-lg"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-900/30 shadow-lg"
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === "success" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-bounce" />
            )}
            <span>{current.message}</span>
          </div>
          <button
            onClick={() => (activeTab === "success" ? soundManager.playSuccessBeep() : soundManager.playErrorBeep())}
            title="Dengarkan Beep"
            className="p-1 hover:opacity-80 transition-opacity"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Member Details Visual */}
        <div className="flex items-center gap-4 bg-gym-elevated/70 p-4 rounded-xl border border-zinc-800 mb-4">
          <img
            src={current.photo}
            alt={current.name}
            className={`w-16 h-16 rounded-xl object-cover ring-2 ${
              activeTab === "success" ? "ring-emerald-400" : "ring-rose-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono font-bold text-neon">{current.code}</div>
            <div className="text-base font-extrabold text-white truncate">{current.name}</div>
            <div className="text-xs text-zinc-400 mt-0.5">{current.pkg}</div>
            <div className="text-[11px] text-zinc-500">Masa Berlaku: {current.expiry}</div>
          </div>
        </div>

        {/* Dynamic QR visual preview */}
        <div className="flex items-center justify-between bg-black/50 p-3 rounded-xl border border-zinc-800 text-xs">
          <div className="text-zinc-400">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Hasil Pemindaian</div>
            <div className="font-mono text-zinc-300 mt-0.5">{current.code}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Respon Scanner: &lt; 80 milidetik</div>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: qrSvg }}
            className="w-16 h-16 flex items-center justify-center rounded-lg overflow-hidden bg-black p-1 border border-zinc-800"
          />
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from "lucide-react";

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Detect iOS device
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Listen for Android beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Do not show if already running as an installed standalone app or dismissed
  if (isStandalone || isDismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="relative rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-neon/40 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon text-gym-base flex items-center justify-center font-black shrink-0 shadow-neon-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>Pasang Aplikasi FTL Gym di Smartphone Anda</span>
              <span className="text-[10px] bg-neon/20 text-neon font-bold px-2 py-0.5 rounded-full uppercase">
                iOS & Android
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Buka kartu member & scan QR code secara instan langsung dari layar utama HP Anda tanpa mengetik URL.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-neon hover:bg-neon-lime text-gym-base font-black text-xs transition-all shadow-neon flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isIOS ? "Panduan Pasang di iPhone" : "Install Aplikasi"}</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            title="Tutup banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS & General Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gym-card border-2 border-neon/50 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neon text-gym-base flex items-center justify-center font-black text-lg shadow-neon-sm">
                FTL
              </div>
              <div>
                <h3 className="text-base font-black text-white">Cara Pasang di HP (iOS & Android)</h3>
                <p className="text-xs text-zinc-400">Aplikasi FTL Gym Pass & CRM</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="font-black text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-neon flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Untuk Pengguna iPhone / iPad (Safari):</span>
                </div>
                <div className="pl-7 space-y-1 text-zinc-300">
                  <p>1. Buka website ini di browser <strong>Safari</strong>.</p>
                  <p>2. Ketuk ikon <strong>Bagikan (Share ⬆️)</strong> di menu bawah Safari.</p>
                  <p>3. Geser ke bawah lalu pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</p>
                  <p>4. Ikon FTL Gym akan muncul di menu iPhone Anda seperti aplikasi App Store!</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="font-black text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-neon flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>Untuk Pengguna Android (Chrome):</span>
                </div>
                <div className="pl-7 space-y-1 text-zinc-300">
                  <p>1. Ketuk tombol titik tiga (⋮) di pojok kanan atas browser Chrome.</p>
                  <p>2. Pilih <strong>"Install Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
                  <p>3. Aplikasi FTL Gym langsung terpasang di daftar aplikasi HP Anda!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-neon text-gym-base font-black text-xs shadow-neon transition-all"
            >
              Mengerti, Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </>
  );
};

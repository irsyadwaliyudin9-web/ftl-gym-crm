"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { InstallAppBanner } from "@/components/common/InstallAppBanner";

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gym-base text-zinc-100 flex flex-col font-sans selection:bg-neon selection:text-black">
      {/* Top Customer Header - Strictly for Customers, NO internal CRM link */}
      <header className="sticky top-0 z-40 bg-gym-card/95 backdrop-blur-md border-b border-gym-border px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <Link href="/portal" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-neon flex items-center justify-center font-black text-gym-base text-lg tracking-tighter shadow-neon-sm group-hover:shadow-neon transition-all">
            FTL
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
              <span>FTL GYM</span>
              <span className="text-[10px] bg-neon/20 text-neon px-1.5 py-0.5 rounded font-black tracking-widest border border-neon/30 uppercase">
                Member Portal
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Faster Than Light Fitness Club</p>
          </div>
        </Link>

        {/* Customer Help & WhatsApp Contact (0895601800302) */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1 text-[11px] text-zinc-400 mr-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pendaftaran Resmi Online</span>
          </div>
          <a
            href="https://wa.me/62895601800302?text=Halo%20Admin%20FTL%20Gym%2C%20saya%20butuh%20bantuan%20mengenai%20membership%20online."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-500/50 text-xs font-bold text-white transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin WA:</span>
            <span>0895-6018-00302</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <InstallAppBanner />
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gym-border bg-gym-card py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span className="font-semibold text-zinc-400">FTL Gym Senopati (Pusat) — Buka 24 Jam</span>
          </div>
          <p>© 2026 FTL Gym (Faster Than Light). All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

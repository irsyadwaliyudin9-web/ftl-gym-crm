"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Bell, ShieldCheck } from "lucide-react";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isMemberAuthenticated, currentMember, logoutMember } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check if session exists in localStorage
    let hasSession = false;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ftl_member_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id) hasSession = true;
        }
      } catch (e) {}
    }

    if (!isMemberAuthenticated && !hasSession) {
      router.replace("/");
    } else {
      setIsVerifying(false);
    }
  }, [isMemberAuthenticated, router]);

  const handleLogout = () => {
    if (confirm("Keluar dari Member App FTL Gym?")) {
      logoutMember();
      router.push("/");
    }
  };

  if (isVerifying && !isMemberAuthenticated) {
    return (
      <div className="min-h-screen bg-gym-base flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neon text-gym-base font-black flex items-center justify-center mx-auto shadow-neon animate-pulse text-lg">
            FTL
          </div>
          <p className="text-xs text-zinc-400 font-bold">Memuat Akun Member...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-base text-zinc-100 flex flex-col selection:bg-neon selection:text-black">
      {/* Top Mobile-First App Header */}
      <header className="sticky top-0 z-40 bg-gym-base/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/member/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neon text-gym-base font-black flex items-center justify-center text-sm shadow-neon-sm">
              FTL
            </div>
            <div>
              <div className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                <span>MEMBER APP</span>
                <span className="text-[9px] bg-neon/20 text-neon font-black px-1.5 py-0.2 rounded border border-neon/40">
                  SPORT
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">Faster Than Light Gym</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {currentMember && (
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-white truncate max-w-[120px]">
                  {currentMember.full_name}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {currentMember.member_code}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Keluar Akun Member"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Mobile-First max-w-md centered) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-6">
        {children}
      </main>

      {/* Bottom Safe Area Padding & Mini Watermark */}
      <footer className="w-full max-w-md mx-auto text-center py-4 text-[10px] text-zinc-600">
        FTL Gym Member Ecosystem · v2.0 Mobile
      </footer>
    </div>
  );
}

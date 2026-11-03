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
    if (confirm("Keluar dari Member App One O One Gym?")) {
      logoutMember();
      router.push("/");
    }
  };

  if (isVerifying && !isMemberAuthenticated) {
    return (
      <div className="min-h-screen bg-gym-base flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neon text-gym-base font-black flex items-center justify-center mx-auto shadow-neon animate-pulse text-lg">
            101
          </div>
          <p className="text-xs text-zinc-400 font-bold">Memuat Akun Member One O One Gym...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-base text-zinc-100 flex flex-col selection:bg-neon selection:text-black">
      {/* Top Professional Header (Mobile & Desktop Responsive) */}
      <header className="sticky top-0 z-40 bg-gym-card/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link href="/member/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-neon text-gym-base font-black flex items-center justify-center text-base shadow-neon-sm group-hover:scale-105 transition-transform">
              101
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1.5">
                <span>ONE O ONE GYM</span>
                <span className="text-[9px] bg-neon/20 text-neon font-black px-1.5 py-0.5 rounded border border-neon/40">
                  MEMBER
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">One O One Gym • Heavy Strength & Conditioning</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {currentMember && (
              <div className="flex items-center gap-2.5 bg-gym-elevated/80 border border-zinc-800 rounded-xl px-3 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 text-neon flex items-center justify-center text-xs font-black">
                  {currentMember.full_name ? currentMember.full_name.charAt(0).toUpperCase() : "M"}
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-white truncate max-w-[140px] sm:max-w-[200px]">
                    {currentMember.full_name}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {currentMember.member_code} • {currentMember.status === "pending_approval" ? "Menunggu Approval" : "Aktif"}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Keluar Akun Member"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Spacious & Clean like Staff Dashboard) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center py-5 text-xs text-zinc-600 border-t border-zinc-800/80">
        One O One Gym Member Ecosystem · Portal Khusus Member Beban & Fitness · © 2026 One O One Gym
      </footer>
    </div>
  );
}

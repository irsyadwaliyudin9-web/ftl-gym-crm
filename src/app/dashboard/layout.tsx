"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { Navbar } from "@/components/common/Navbar";
import { Sidebar } from "@/components/common/Sidebar";
import { MobileNav } from "@/components/common/MobileNav";
import { Lock, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isStaffAuthenticated } = useAuth();
  const { pendingMembersCount } = useGymData();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check if staff session exists
    let hasSession = false;
    if (typeof window !== "undefined") {
      try {
        hasSession = localStorage.getItem("ftl_staff_session") === "authenticated";
      } catch (e) {}
    }

    if (!isStaffAuthenticated && !hasSession) {
      router.replace("/auth/login?redirect=/dashboard");
    } else {
      setIsVerifying(false);
    }
  }, [isStaffAuthenticated, router]);

  if (isVerifying && !isStaffAuthenticated) {
    return (
      <div className="min-h-screen bg-gym-base flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-2 border-neon/50 text-neon flex items-center justify-center mx-auto shadow-neon-sm animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Memeriksa Hak Akses Staf CRM</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Akses khusus staf One O One Gym. Mengalihkan ke halaman login resmi...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-base text-zinc-100 flex flex-col selection:bg-neon selection:text-black pb-16 lg:pb-0">
      <Navbar />

      {/* Global High-Visibility Pending Member Approval Notification Banner */}
      {pendingMembersCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-neon to-amber-600 text-black px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 border-b-2 border-black z-40 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-black animate-ping shrink-0" />
            <div className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5 flex-wrap">
              <span className="bg-black text-amber-300 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">
                NOTIFIKASI STAF
              </span>
              <span>
                Ada <strong>{pendingMembersCount} Pendaftaran Member Baru</strong> menunggu persetujuan (Approval)!
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/approvals"
            className="px-3.5 py-1.5 rounded-xl bg-black text-amber-300 hover:text-white hover:bg-zinc-900 text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
          >
            <span>Tinjau & Setujui Sekarang ({pendingMembersCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Child Page Content */}
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

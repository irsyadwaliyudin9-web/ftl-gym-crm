"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Sidebar } from "@/components/common/Sidebar";
import { MobileNav } from "@/components/common/MobileNav";
import { Lock, ShieldAlert } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isStaffAuthenticated } = useAuth();
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

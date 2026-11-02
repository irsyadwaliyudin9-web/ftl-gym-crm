"use client";

import React from "react";
import { Navbar } from "@/components/common/Navbar";
import { Sidebar } from "@/components/common/Sidebar";
import { MobileNav } from "@/components/common/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

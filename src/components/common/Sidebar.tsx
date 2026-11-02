"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import {
  LayoutDashboard,
  QrCode,
  Users,
  Dumbbell,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentRole } = useAuth();
  const { needsAttentionMembers, activeMembersCount } = useGymData();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: "/dashboard/checkin",
      label: "Front Desk (Check-in)",
      icon: QrCode,
      badge: "LIVE",
      badgeColor: "bg-neon/20 text-neon border border-neon/40",
    },
    {
      href: "/dashboard/members",
      label: "Data Members CRM",
      icon: Users,
      badge: `${activeMembersCount}`,
      badgeColor: "bg-zinc-800 text-zinc-300",
    },
    {
      href: "/dashboard/pt-sessions",
      label: "Sesi Personal Trainer",
      icon: Dumbbell,
      badge: null,
    },
    {
      href: "/dashboard/reports",
      label: "Laporan & Analitik",
      icon: BarChart3,
      badge: null,
    },
    {
      href: "/dashboard/settings",
      label: "Pengaturan Cabang",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gym-card/90 border-r border-gym-border min-h-[calc(100vh-61px)] p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Menu Operasional
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                    isActive
                      ? "bg-zinc-800/90 text-neon shadow-sm border border-zinc-700/80 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-neon" : "text-zinc-400 group-hover:text-white"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Follow-Up CTA Box */}
        {needsAttentionMembers.length > 0 && (
          <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3.5 text-xs text-rose-200">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Needs Attention ({needsAttentionMembers.length})</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2.5 leading-relaxed">
              {needsAttentionMembers.length} member akan kadaluarsa dalam 7 hari. Follow-up segera untuk retensi.
            </p>
            <Link
              href="/dashboard/members?filter=expiring"
              className="inline-block text-[11px] font-bold text-rose-300 hover:text-white underline underline-offset-2"
            >
              Lihat Daftar Member →
            </Link>
          </div>
        )}
      </div>

      {/* Customer Portal Shortcut */}
      <div className="pt-4 border-t border-gym-border/80 text-xs">
        <Link
          href="/portal"
          className="block bg-zinc-900/80 hover:bg-zinc-800/90 rounded-xl p-3 border border-zinc-800 hover:border-neon/50 transition-colors group"
        >
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-neon" />
              <span>Portal Member</span>
            </span>
            <span className="text-[10px] bg-neon/15 text-neon px-1.5 py-0.5 rounded font-bold">ONLINE</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Daftar Paket & Pilih Coach Dian</div>
          <div className="text-[10px] text-neon font-bold mt-1 group-hover:underline">Buka Halaman Customer →</div>
        </Link>
      </div>
    </aside>
  );
};

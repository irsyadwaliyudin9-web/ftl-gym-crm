"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, Dumbbell, Users, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
    { href: "/dashboard/checkin", label: "Scan QR", icon: QrCode, highlight: true },
    { href: "/dashboard/pt-sessions", label: "Sesi PT", icon: Dumbbell },
    { href: "/dashboard/members", label: "Members", icon: Users },
    { href: "/dashboard/pos", label: "Kasir POS", icon: ShoppingBag },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gym-card/95 backdrop-blur-lg border-t border-gym-border px-2 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-6 group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                  isActive
                    ? "bg-neon text-gym-base shadow-neon scale-105"
                    : "bg-neon/90 text-gym-base hover:scale-105"
                )}
              >
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-neon mt-1">Scan QR</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors min-w-[56px]",
              isActive ? "text-neon font-bold" : "text-zinc-400 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

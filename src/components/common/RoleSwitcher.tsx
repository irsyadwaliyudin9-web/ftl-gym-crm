"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/types";
import { ShieldCheck, UserCheck, Dumbbell, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setCurrentRole } = useAuth();

  const roles: Array<{ role: UserRole; label: string; icon: any; color: string }> = [
    { role: "club_manager", label: "Club Manager", icon: Building2, color: "text-amber-400" },
    { role: "front_desk", label: "Front Desk (Resepsionis)", icon: UserCheck, color: "text-emerald-400" },
    { role: "personal_trainer", label: "Personal Trainer (PT)", icon: Dumbbell, color: "text-neon" },
    { role: "sales", label: "Sales Consultant", icon: Sparkles, color: "text-cyan-400" },
    { role: "superadmin", label: "Superadmin SaaS", icon: ShieldCheck, color: "text-purple-400" },
  ];

  return (
    <div className="bg-gym-elevated/90 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-3 overflow-x-auto shadow-inner">
      <div className="flex items-center gap-2 pl-1 whitespace-nowrap text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
        <span>Mode Peran:</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.role;
          return (
            <button
              key={r.role}
              onClick={() => setCurrentRole(r.role)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap border",
                isActive
                  ? "bg-zinc-800 border-neon/50 text-white shadow-sm ring-1 ring-neon/40"
                  : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", r.color)} />
              <span>{r.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-neon ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

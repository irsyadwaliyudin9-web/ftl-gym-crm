"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { soundManager } from "@/components/common/SoundEffects";
import { Building2, Volume2, VolumeX, Bell, ChevronDown, LogOut } from "lucide-react";

export const Navbar: React.FC = () => {
  const { currentUser, currentRole, logoutStaff } = useAuth();
  const { clubs, currentClub, setCurrentClub, needsAttentionMembers, pendingMembersCount } = useGymData();
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showClubDropdown, setShowClubDropdown] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    soundManager.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) {
      soundManager.playSuccessBeep();
    }
  };

  const roleLabels: Record<string, string> = {
    club_manager: "Club Manager",
    front_desk: "Front Desk",
    personal_trainer: "Personal Trainer",
    sales: "Sales Consultant",
    superadmin: "Superadmin",
  };

  return (
    <header className="sticky top-0 z-30 bg-gym-base/95 backdrop-blur-md border-b border-gym-border px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Brand & Branch Selector */}
      <div className="flex items-center gap-4 lg:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-neon flex items-center justify-center font-black text-gym-base text-base tracking-tighter shadow-neon-sm group-hover:shadow-neon transition-all">
            101
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
              <span>One O One Gym</span>
              <span className="text-[10px] bg-neon/20 text-neon px-1.5 py-0.5 rounded font-black tracking-widest border border-neon/30">
                CRM
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">Sistem Operasional Gym</div>
          </div>
        </Link>

        {/* Club Branch Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowClubDropdown(!showClubDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gym-elevated hover:bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-neon" />
            <span className="max-w-[140px] truncate">{currentClub.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showClubDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-gym-card border border-gym-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1 tracking-wider">
                Pilih Cabang Gym:
              </div>
              {clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => {
                    setCurrentClub(club);
                    setShowClubDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    club.id === currentClub.id
                      ? "bg-neon/15 text-neon font-bold border border-neon/30"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <div>
                    <div>{club.name}</div>
                    <div className="text-[10px] text-zinc-500 font-normal">{club.city}</div>
                  </div>
                  {club.is_main_branch && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Pusat</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Sound FX, Alerts, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Audio Synthesizer Beep Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? "Aktifkan Suara Beep Scanner" : "Matikan Suara Beep Scanner"}
          className={`p-2 rounded-lg border transition-colors ${
            isMuted
              ? "bg-zinc-900 border-zinc-800 text-zinc-500"
              : "bg-neon/15 border-neon/40 text-neon shadow-sm"
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Pending Approval Online Registrations Pill */}
        {pendingMembersCount > 0 && (
          <Link
            href="/dashboard/approvals"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all shadow-lg shadow-amber-500/30 animate-pulse border-2 border-amber-300 active:scale-95"
            title={`${pendingMembersCount} Pendaftaran Member Online Menunggu Persetujuan Admin`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span className="hidden sm:inline">Persetujuan:</span>
            <span>🚨 {pendingMembersCount} Pending</span>
          </Link>
        )}

        {/* Needs Attention Alert Icon */}
        <Link
          href="/dashboard#needs-attention"
          className="relative p-2 rounded-lg bg-gym-elevated hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 transition-colors"
          title="Member paket expired dalam 7 hari"
        >
          <Bell className="w-4 h-4" />
          {needsAttentionMembers.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
              {needsAttentionMembers.length}
            </span>
          )}
        </Link>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800">
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
            alt={currentUser.full_name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-neon/40"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{currentUser.full_name}</div>
            <div className="text-[10px] text-neon font-medium leading-tight">{roleLabels[currentRole] || currentRole}</div>
          </div>
          <button
            onClick={() => {
              if (confirm("Yakin ingin keluar dari akun staf One O One Gym?")) {
                logoutStaff();
                window.location.href = "/auth/login";
              }
            }}
            title="Keluar / Logout Akun Staf"
            className="p-1.5 ml-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

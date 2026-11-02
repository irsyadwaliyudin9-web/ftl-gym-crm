"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsRole } = useAuth();
  const [email, setEmail] = useState("bambang.mgr@ironforge.co.id");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginAsRole("club_manager");
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gym-base flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-neon/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-gym-card border-2 border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-neon flex items-center justify-center font-black text-gym-base text-2xl shadow-neon-sm mb-3">
            FTL
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Masuk ke FitLead CRM</h1>
          <p className="text-xs text-zinc-400 mt-1">Portal Operasional Gym & Fitness Center</p>
        </div>

        {/* Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Email Staf Gym</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gym.com"
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase">Kata Sandi</label>
              <a href="#" className="text-[11px] text-zinc-400 hover:text-neon transition-colors">
                Lupa sandi?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          <Button type="submit" variant="neon" size="lg" isLoading={isLoading} className="w-full mt-2">
            <span>Masuk ke Dashboard Gym</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Separator & Footer Links */}
        <div className="pt-5 border-t border-zinc-800 space-y-3 text-center text-xs text-zinc-400">
          <div>
            Belum mendaftarkan gym Anda?{" "}
            <Link href="/onboarding" className="text-neon font-bold hover:underline">
              Daftar Gym Baru
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/superadmin/login"
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-purple-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Login Khusus Superadmin SaaS Platform</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

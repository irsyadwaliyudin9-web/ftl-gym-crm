"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginStaff } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginStaff(email, password);
      setIsLoading(false);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setErrorMsg(result.message);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gym-base flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background neon glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[380px] bg-neon/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-gym-card border-2 border-zinc-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neon flex items-center justify-center font-black text-gym-base text-2xl shadow-neon mb-3">
            FTL
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Login Staf CRM FTL Gym</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Portal Khusus Operasional & Manajemen Internal FTL Gym
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-neon shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Halaman ini khusus untuk staf front desk dan manajemen gym. Silakan gunakan akun email resmi staf FTL Gym.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
              Email Resmi Staf *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ftlgym@gmail.com"
                className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
              Kata Sandi *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-gym-elevated border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="neon"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 shadow-neon font-black text-xs sm:text-sm py-3"
          >
            <span>Masuk ke Dashboard Staf CRM</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Back to Customer Portal */}
        <div className="pt-4 border-t border-zinc-800 text-center">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-neon transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bukan Staf? Kembali ke Portal Member FTL Gym</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

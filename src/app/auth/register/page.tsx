"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Phone, Building2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [gymName, setGymName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+628");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gym-base flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-neon/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-gym-card border-2 border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-neon flex items-center justify-center font-black text-gym-base text-2xl shadow-neon-sm mb-3">
            FTL
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Daftarkan Gym Anda</h1>
          <p className="text-xs text-zinc-400 mt-1">Coba gratis 14 hari penuh tanpa kartu kredit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mb-6">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Nama Gym / Fitness Center</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Contoh: IronPeak Fitness"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Nama Pemilik / Manajer</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="owner@gym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">No. WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="+628..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
              />
            </div>
          </div>

          <Button type="submit" variant="neon" size="lg" isLoading={isLoading} className="w-full mt-3">
            <span>Daftar & Lanjut Setup Gym</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Sudah memiliki akun?{" "}
          <Link href="/auth/login" className="text-neon font-bold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

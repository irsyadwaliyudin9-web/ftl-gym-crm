"use client";

import React, { useState } from "react";
import { useGymData } from "@/context/GymDataContext";
import {
  Building2,
  CreditCard,
  MessageCircle,
  RotateCcw,
  Save,
  CheckCircle2,
  Key,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { currentClub, resetToDemoData } = useGymData();

  const [clubName, setClubName] = useState(currentClub.name);
  const [clubPhone, setClubPhone] = useState(currentClub.phone);
  const [clubAddress, setClubAddress] = useState(currentClub.address);
  const [midtransClientKey, setMidtransClientKey] = useState("SB-Mid-client-demo_fitlead_key");
  const [midtransServerKey, setMidtransServerKey] = useState("SB-Mid-server-demo_fitlead_key");
  const [waApiKey, setWaApiKey] = useState("fonnte_demo_key_998877");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm("Apakah Anda yakin ingin me-reset seluruh database simulasi ke seed data awal?")) {
      resetToDemoData();
      alert("Database simulasi berhasil di-reset!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Pengaturan Sistem & Integrasi Cabang</span>
            <Badge variant="neon" size="sm">
              CONFIG
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Konfigurasi profil gym, integrasi Midtrans Payment Gateway, dan notifikasi WhatsApp otomatis.
          </p>
        </div>

        <Button variant="danger" size="sm" onClick={handleResetData}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Reset ke Data Demo Awal</span>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Club Profile */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Building2 className="w-5 h-5 text-neon" />
            <h2 className="text-base font-bold text-white">Profil Cabang Gym</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Nama Cabang Gym
              </label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Nomor Telepon Front Desk
              </label>
              <input
                type="text"
                value={clubPhone}
                onChange={(e) => setClubPhone(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-neon"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Alamat Fisik Lokasi Gym
              </label>
              <input
                type="text"
                value={clubAddress}
                onChange={(e) => setClubAddress(e.target.value)}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-neon"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Midtrans Payment Gateway */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-neon" />
              <h2 className="text-base font-bold text-white">Integrasi Midtrans Payment Gateway</h2>
            </div>
            <Badge variant="success" size="sm">
              CONNECTED (SANDBOX)
            </Badge>
          </div>

          <p className="text-xs text-zinc-400">
            Digunakan untuk pembayaran otomatis paket membership via QRIS, Virtual Account (BCA, Mandiri, BNI, BRI), dan kartu kredit.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Midtrans Client Key
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={midtransClientKey}
                  onChange={(e) => setMidtransClientKey(e.target.value)}
                  className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-neon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Midtrans Server Key
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={midtransServerKey}
                  onChange={(e) => setMidtransServerKey(e.target.value)}
                  className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-neon"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: WhatsApp Notification Gateway */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-neon" />
              <h2 className="text-base font-bold text-white">Integrasi WhatsApp Notification Gateway</h2>
            </div>
            <Badge variant="neon" size="sm">
              CRON ACTIVE (08:00 WIB)
            </Badge>
          </div>

          <p className="text-xs text-zinc-400">
            Supabase Edge Function secara otomatis mengirim pesan pengingat kepada member yang masa berlakunya akan habis dalam 7 hari.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
              WA Gateway API Key (Fonnte / Wablas)
            </label>
            <input
              type="text"
              value={waApiKey}
              onChange={(e) => setWaApiKey(e.target.value)}
              className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neon"
            />
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          {saveSuccess ? (
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          ) : (
            <div />
          )}

          <Button type="submit" variant="neon" size="md">
            <Save className="w-4 h-4 mr-1" />
            <span>Simpan Perubahan Pengaturan</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

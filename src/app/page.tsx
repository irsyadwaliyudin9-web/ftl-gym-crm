"use client";

import React from "react";
import Link from "next/link";
import {
  QrCode,
  Dumbbell,
  Calendar,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InteractiveScannerPreview } from "@/components/landing/InteractiveScannerPreview";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gym-base text-zinc-100 flex flex-col selection:bg-neon selection:text-black">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-zinc-900 via-gym-elevated to-zinc-900 border-b border-zinc-800 text-center py-2 px-4 text-xs font-medium text-zinc-300">
        <span className="text-neon font-bold mr-2">⚡ FTL GYM OFFICIAL:</span>
        Pusat Kebugaran Modern 24 Jam Non-Stop · Pendaftaran Membership Online & Personal Trainer Sudah Dibuka!
        <Link href="/portal" className="text-neon hover:underline ml-2 font-bold inline-flex items-center gap-1">
          Daftar Member Online →
        </Link>
      </div>

      {/* Main Landing Navbar */}
      <header className="sticky top-0 z-40 bg-gym-base/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-neon flex items-center justify-center font-black text-gym-base text-lg shadow-neon-sm">
            FTL
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
              <span>FTL GYM</span>
              <span className="text-[10px] bg-neon/20 text-neon px-1.5 py-0.5 rounded font-black tracking-widest border border-neon/30">
                OFFICIAL
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium hidden sm:block">
              Faster Than Light Fitness Club
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
          <Link href="/portal" className="text-neon hover:underline font-bold">
            Portal Member Online
          </Link>
          <a href="#fitur" className="hover:text-neon transition-colors">
            Fasilitas & Fitur
          </a>
          <a href="#preview" className="hover:text-neon transition-colors">
            Check-In Scanner
          </a>
          <a href="#harga" className="hover:text-neon transition-colors">
            Paket Membership
          </a>
          <Link href="/dashboard" className="hover:text-neon transition-colors">
            CRM Staf Gym
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/portal">
            <Button variant="neon" size="sm" className="shadow-neon-sm">
              <Dumbbell className="w-4 h-4 mr-1.5" />
              <span>Portal Member</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              <span>Masuk CRM Staf</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden border-b border-zinc-800">
        {/* Neon Ambient Background Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-neon/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-zinc-300 mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span>FTL GYM OPERATIONAL & MEMBER ECOSYSTEM</span>
            <span className="text-zinc-600">|</span>
            <span className="text-neon">Buka 24 Jam Non-Stop</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
            FTL GYM —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-neon-lime to-yellow-300 neon-text-glow">
              Faster Than Light Fitness.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-3xl mb-10 leading-relaxed font-normal">
            Daftar membership gym online, pilih pelatih pribadi favorit Anda (seperti <strong className="text-white">Coach Dian</strong>), dan akses fasilitas latihan angkat beban serta sistem operasional CRM terpadu dalam satu aplikasi.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Link href="/portal" className="w-full sm:w-auto">
              <Button variant="neon" size="lg" className="w-full sm:w-auto text-base shadow-neon">
                <Dumbbell className="w-5 h-5 mr-1" />
                <span>Portal Member: Daftar & Pilih Coach</span>
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                <span>Buka CRM Staf Operasional</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Interactive Live Scanner Preview */}
          <div id="preview" className="w-full pt-4">
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-extrabold mb-3">
              UJI COBA INTERAKTIF: SISTEM SCANNER KILAT & SUARA BEEP
            </div>
            <InteractiveScannerPreview />
          </div>
        </div>
      </section>

      {/* METRICS & CLIENT BANNER */}
      <section className="py-12 px-6 border-b border-zinc-800 bg-zinc-950/60">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-gym-card/60 border border-zinc-800">
            <div className="text-3xl sm:text-4xl font-black text-neon mb-1">0.08s</div>
            <div className="text-xs text-zinc-400 font-medium">Kecepatan Scan & Validasi QR</div>
          </div>
          <div className="p-4 rounded-xl bg-gym-card/60 border border-zinc-800">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">100%</div>
            <div className="text-xs text-zinc-400 font-medium">Bebas Kebocoran Sesi PT</div>
          </div>
          <div className="p-4 rounded-xl bg-gym-card/60 border border-zinc-800">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">14 Hari</div>
            <div className="text-xs text-zinc-400 font-medium">Free Trial Tanpa Kartu Kredit</div>
          </div>
          <div className="p-4 rounded-xl bg-gym-card/60 border border-zinc-800">
            <div className="text-3xl sm:text-4xl font-black text-neon mb-1">Multi-Cabang</div>
            <div className="text-xs text-zinc-400 font-medium">Sinkronisasi Real-Time Tenant</div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="fitur" className="py-24 px-6 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="neon" size="sm" className="mb-3">
              FITUR CORE
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Dibangun Khusus untuk Alur Operasional Gym Sebenarnya
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
              Setiap tombol, form, dan layar scanner didesain agar Front Desk, Trainer, dan Sales bekerja
              dalam tempo cepat tanpa hambatan teknis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gym-card border border-zinc-800 rounded-2xl p-6 hover:border-neon/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon mb-5 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sistem Check-in Kilat</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Pindai QR member lewat kamera HP/tablet atau barcode scanner hardware. Layar seketika hijau
                aktif atau merah berbunyi beep keras jika paket kadaluarsa.
              </p>
              <ul className="text-xs text-zinc-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neon" />
                  <span>Audio Feedback Web Audio API bawaan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neon" />
                  <span>Dukungan kamera depan/belakang & barcode USB</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-gym-card border border-zinc-800 rounded-2xl p-6 hover:border-neon/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon mb-5 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Manajemen PT Tanpa Kertas</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Personal Trainer langsung memotong sesi dari HP mereka setelah latihan selesai. Dilindungi
                Postgres Row Locking anti double-burn saat jaringan tidak stabil.
              </p>
              <ul className="text-xs text-zinc-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neon" />
                  <span>Idempotency token mencegah pemotongan dobel</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neon" />
                  <span>Log histori jam, tanggal & catatan latihan</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gym-card border border-zinc-800 rounded-2xl p-6 hover:border-neon/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pilihan Coach & Sesi Latihan Beban</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Pilih Personal Trainer profesional untuk bimbingan teknik angkat beban, powerlifting, hipertrofi otot, dan konsultasi postur tubuh. Atur janji temu dan pantau sisa kuota sesi via portal.
              </p>
              <ul className="text-xs text-zinc-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neon" />
                  <span>Tim Coach bersertifikat (Coach Dian, Coach Rendy, dll.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neon" />
                  <span>Booking sesi latihan langsung via WhatsApp resmi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="harga" className="py-24 px-6 border-b border-zinc-800 bg-zinc-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="neon" size="sm" className="mb-3">
              PAKET MEMBERSHIP FTL GYM
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Pilihan Membership & Sesi Personal Trainer
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm">
              Bisa daftar langsung lewat portal online. Didukung pembayaran QRIS & Virtual Account instan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Paket 1 Bulan */}
            <div className="bg-gym-card border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-2">
                  Pemula / Rutinitas Baru
                </div>
                <h3 className="text-xl font-black text-white mb-3">Paket 1 Bulan</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-white">Rp250.000</span>
                  <span className="text-xs text-zinc-400">/ bulan</span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Akses Bebas 24 Jam ke Semua Alat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Akses Loker & Shower Room</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Akses Lengkap Seluruh Area Angkat Beban</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>1x Free Body Composition Check</span>
                  </div>
                </div>
              </div>

              <Link href="/portal">
                <Button variant="outline" size="md" className="w-full">
                  Daftar 1 Bulan Online
                </Button>
              </Link>
            </div>

            {/* Paket 6 Bulan */}
            <div className="bg-gradient-to-b from-zinc-900 to-gym-card border-2 border-neon rounded-2xl p-6 flex flex-col justify-between relative shadow-neon-sm scale-105">
              <div className="absolute -top-3.5 right-6 bg-neon text-gym-base text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-neon-sm">
                BEST SELLER
              </div>

              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-neon mb-2">
                  Hemat Rp300.000
                </div>
                <h3 className="text-xl font-black text-white mb-3">Paket 6 Bulan</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-neon">Rp1.200.000</span>
                  <span className="text-xs text-zinc-400">/ 6 bulan</span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-zinc-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Semua Keuntungan Paket 1 Bulan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Hemat Rp300.000 dibanding bulanan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Free 1x Assessment Personal Trainer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Free FTL Gym Shaker Bottle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Bisa Freeze Membership 14 Hari</span>
                  </div>
                </div>
              </div>

              <Link href="/portal">
                <Button variant="neon" size="md" className="w-full shadow-neon-sm">
                  Daftar 6 Bulan Online
                </Button>
              </Link>
            </div>

            {/* Paket 1 Tahun */}
            <div className="bg-gym-card border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-2">
                  Komitmen Penuh · VIP
                </div>
                <h3 className="text-xl font-black text-white mb-3">Paket 1 Tahun (VIP)</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-white">Rp2.200.000</span>
                  <span className="text-xs text-zinc-400">/ tahun</span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Akses VIP 365 Hari Non-Stop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Tarif Hemat (Hanya Rp183k/bln)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Free 2x Sesi Personal Trainer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Free Official FTL Gym Bag</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon" />
                    <span>Bisa Freeze Membership 30 Hari</span>
                  </div>
                </div>
              </div>

              <Link href="/portal">
                <Button variant="outline" size="md" className="w-full">
                  Daftar VIP 1 Tahun
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimoni" className="py-20 px-6 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Dipercaya oleh Praktisi Kebugaran di Seluruh Indonesia
            </h2>
            <p className="text-xs text-zinc-400">
              Kata pemilik gym, manajer cabang, dan personal trainer setelah menggunakan FitLead CRM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gym-card border border-zinc-800 p-6 rounded-xl">
              <div className="flex text-neon mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 italic mb-4 leading-relaxed">
                "Sebelumnya member kami sering komplain karena kartu manual hilang dan sisa sesi PT selisih.
                Dengan FitLead, member tinggal scan QR di HP dan sesi PT langsung terpotong akurat!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-neon">
                  BP
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Bambang Prakoso</div>
                  <div className="text-[10px] text-zinc-500">Club Manager — Mega Kuningan</div>
                </div>
              </div>
            </div>

            <div className="bg-gym-card border border-zinc-800 p-6 rounded-xl">
              <div className="flex text-neon mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 italic mb-4 leading-relaxed">
                "Suara beep scanner-nya sangat memuaskan di jam sibuk sore hari. Resepsionis tidak perlu
                menatap layar terus-menerus, kalau berbunyi merah langsung tahu member belum bayar."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-neon">
                  RA
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rina Anggraini</div>
                  <div className="text-[10px] text-zinc-500">Head Front Desk — Surabaya Branch</div>
                </div>
              </div>
            </div>

            <div className="bg-gym-card border border-zinc-800 p-6 rounded-xl">
              <div className="flex text-neon mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 italic mb-4 leading-relaxed">
                "Sebagai PT, saya bisa bakar 1 sesi langsung dari HP di sela-sela melatih klien di lantai gym.
                UI-nya gampang disentuh jari dan ada catatan progress angkatan klien."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-neon">
                  DS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Coach Denny Santoso</div>
                  <div className="text-[10px] text-zinc-500">Senior Personal Trainer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-black border-t border-zinc-800/80 py-12 px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neon flex items-center justify-center font-black text-gym-base text-xs">
              FTL
            </div>
            <div>
              <div className="font-bold text-white">FitLead CRM (FTL Edition)</div>
              <div className="text-[10px]">Sistem Manajemen Gym Terpadu Indonesia</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/dashboard" className="hover:text-neon">
              Dashboard Demo
            </Link>
            <Link href="/auth/login" className="hover:text-neon">
              Login Staf
            </Link>
            <Link href="/onboarding" className="hover:text-neon">
              Daftar Gym Baru
            </Link>
          </div>

          <div className="text-center sm:text-right text-[11px]">
            <div>© 2026 FitLead CRM. Hak cipta dilindungi undang-undang.</div>
            <div className="text-zinc-600">Timezone: Asia/Jakarta (WIB) · High-Performance RLS Postgres</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

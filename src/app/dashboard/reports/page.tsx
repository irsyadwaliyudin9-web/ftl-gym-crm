"use client";

import React, { useState } from "react";
import { useGymData } from "@/context/GymDataContext";
import { formatRupiah, formatWIBDate, formatWIBTime } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Trophy,
  Dumbbell,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  CheckCircle2,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ReportsAnalyticsPage() {
  const {
    currentClub,
    clubs,
    setCurrentClub,
    members,
    checkIns,
    ptPackages,
    ptSessionLogs,
    transactions,
    exportReportsCSV,
    exportMembersCSV,
  } = useGymData();

  const [dateRange, setDateRange] = useState("month"); // 'today', 'week', 'month'
  const [selectedTrainer, setSelectedTrainer] = useState<string>("all");

  // Revenue calculation (Semua pendaftaran member aktif & paket PT)
  const membershipRev = members
    .filter((m) => m.status === "active")
    .reduce((sum, m) => sum + (m.package_price || 0), 0);

  const ptRev = ptPackages
    .reduce((sum, p) => sum + (p.price || (p.total_sessions * 300000)), 0);

  const totalRev = membershipRev + ptRev;

  // Filter paid transactions for financial audit ledger
  const paidTransactions = transactions.filter((t) => t.status === "paid");

  // Trainer Ranking Leaderboard
  const trainerMap = new Map<string, { trainer_name: string; total_sessions: number }>();
  ptSessionLogs.forEach((log) => {
    if (log.club_id === currentClub.id) {
      const current = trainerMap.get(log.trainer_id) || { trainer_name: log.trainer_name || "Trainer", total_sessions: 0 };
      trainerMap.set(log.trainer_id, {
        trainer_name: current.trainer_name,
        total_sessions: current.total_sessions + 1,
      });
    }
  });

  const trainerLeaderboard = Array.from(trainerMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total_sessions - a.total_sessions);

  const displayedTrainers = selectedTrainer === "all"
    ? trainerLeaderboard
    : trainerLeaderboard.filter((t) => t.id === selectedTrainer);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Analitik & Laporan Performa Gym</span>
            <Badge variant="neon" size="sm">
              WIB (JAKARTA)
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Laporan finansial, produktivitas personal trainer, dan export data mentah CSV untuk audit.
          </p>
        </div>

        {/* Global Export CSV Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={exportMembersCSV}>
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export CSV Member</span>
          </Button>
          <Button variant="neon" size="sm" onClick={exportReportsCSV} className="shadow-neon-sm">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
            <span>Export CSV Check-In</span>
          </Button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gym-card p-3 rounded-xl border border-zinc-800">
        {/* Cabang Filter */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Filter Cabang Gym:</label>
          <select
            value={currentClub.id}
            onChange={(e) => {
              const target = clubs.find((c) => c.id === e.target.value);
              if (target) setCurrentClub(target);
            }}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>

        {/* Rentang Waktu */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Rentang Tanggal:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon"
          >
            <option value="today">Hari Ini (Real-Time)</option>
            <option value="week">Minggu Ini (7 Hari Terakhir)</option>
            <option value="month">Bulan Ini (Oktober 2026)</option>
          </select>
        </div>

        {/* Filter Trainer */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Filter Personal Trainer:</label>
          <select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon"
          >
            <option value="all">Semua Personal Trainer</option>
            {trainerLeaderboard.map((t) => (
              <option key={t.id} value={t.id}>
                {t.trainer_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Pendapatan Gym</span>
            <div className="w-8 h-8 rounded-lg bg-neon/15 text-neon flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neon mb-1">{formatRupiah(totalRev)}</div>
          <div className="text-[11px] text-zinc-400">Total akumulasi Membership & Paket PT</div>
        </Card>

        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Omzet Membership</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mb-1">{formatRupiah(membershipRev)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {Math.round((membershipRev / Math.max(1, totalRev)) * 100)}% dari total omzet
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Omzet Paket PT</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 mb-1">{formatRupiah(ptRev)}</div>
          <div className="text-[11px] text-zinc-400">
            {ptPackages.length} paket Personal Trainer terdaftar
          </div>
        </Card>
      </div>

      {/* Trainer Productivity Leaderboard */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Peringkat Produktivitas Personal Trainer (Sesi Terbanyak)</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Menghitung jumlah sesi latihan yang telah diselesaikan oleh masing-masing trainer bulan ini.
            </p>
          </div>
          <Badge variant="neon" size="sm">
            TOP TRAINERS
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gym-elevated/70 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Peringkat</th>
                <th className="py-2.5 px-3">Nama Trainer</th>
                <th className="py-2.5 px-3">Total Sesi Melatih</th>
                <th className="py-2.5 px-3">Estimasi Jam Latihan</th>
                <th className="py-2.5 px-3">Status Komisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedTrainers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Tidak ada sesi personal trainer yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                displayedTrainers.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40">
                    <td className="py-3 px-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          idx === 0
                            ? "bg-amber-400 text-black shadow-sm"
                            : idx === 1
                            ? "bg-zinc-300 text-black"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-white flex items-center gap-2">
                      <Dumbbell className="w-3.5 h-3.5 text-neon" />
                      <span>{item.trainer_name}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-neon">{item.total_sessions} Sesi Selesai</td>
                    <td className="py-3 px-3 text-zinc-300">{item.total_sessions * 1} Jam Pelatihan</td>
                    <td className="py-3 px-3">
                      <Badge variant="success" size="sm">
                        QUALIFIED BONUS
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Histori Pemasukan Kas & Transaksi Member */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-neon" />
              <span>Log Histori Pemasukan Kas & Transaksi Member (Audit Keuangan)</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Setiap kali ada member mendaftar, disetujui, atau membeli paket sesi, transaksi kas bertambah dan tercatat di sini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" className="font-mono">
              {paidTransactions.length} Transaksi Terverifikasi
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gym-elevated/70 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Waktu (WIB)</th>
                <th className="py-2.5 px-3">No. Invoice</th>
                <th className="py-2.5 px-3">Nama Member</th>
                <th className="py-2.5 px-3">Keterangan Transaksi</th>
                <th className="py-2.5 px-3">Metode Bayar</th>
                <th className="py-2.5 px-3 text-right">Pemasukan (Rp)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paidTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Belum ada riwayat transaksi lunas.
                  </td>
                </tr>
              ) : (
                paidTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      <div>{formatWIBDate(tx.paid_at || tx.created_at)}</div>
                      <div className="text-[10px] text-zinc-500">{formatWIBTime(tx.paid_at || tx.created_at)}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-300 text-xs">
                      {tx.invoice_code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{tx.member_name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{tx.member_phone || "-"}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-200">{tx.title}</div>
                      <div className="text-[10px] text-zinc-400">{tx.description}</div>
                    </td>
                    <td className="py-3 px-3 capitalize text-zinc-300">
                      {tx.payment_method === "tunai" ? "Tunai Kasir Gym" : tx.payment_channel?.replace("_", " ").toUpperCase() || "Online"}
                    </td>
                    <td className="py-3 px-3 text-right font-black font-mono text-neon text-sm">
                      +{formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="success" size="sm" className="font-black text-[10px]">
                        ✓ LUNAS
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

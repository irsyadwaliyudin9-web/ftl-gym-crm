"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGymData } from "@/context/GymDataContext";
import { formatRupiah, formatWIBDate, getDaysRemaining } from "@/lib/utils";
import {
  Users,
  DollarSign,
  QrCode,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Flame,
  Calendar,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Dumbbell,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardOverviewPage() {
  const {
    currentClub,
    activeMembersCount,
    monthlyRevenue,
    todayCheckinsCount,
    newLeadsCount,
    needsAttentionMembers,
    pendingMembers,
    approveMember,
    rejectMember,
    hourlyTraffic,
    checkIns,
  } = useGymData();

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    const res = approveMember(id);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menolak permohonan pendaftaran ini?")) {
      const res = rejectMember(id, "Pembayaran belum dikonfirmasi via WhatsApp (0895-6018-00302)");
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Find max value in traffic for proportional bar height
  const maxTraffic = Math.max(...hourlyTraffic.map((h) => h.checkins), 1);

  return (
    <div className="space-y-6">
      {/* Toast Notification Action Feedback */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-neon text-gym-base font-black text-xs sm:text-sm flex items-center justify-between shadow-neon animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gym-base" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold underline">
            Tutup
          </button>
        </div>
      )}

      {/* Page Title & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Dashboard Operasional</span>
            <span className="text-xs bg-neon/20 text-neon border border-neon/40 px-2 py-0.5 rounded font-bold uppercase">
              {currentClub.code}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Data real-time cabang <span className="text-white font-semibold">{currentClub.name}</span> · Timezone Asia/Jakarta (WIB)
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/checkin">
            <Button variant="neon" size="sm" className="shadow-neon-sm">
              <QrCode className="w-4 h-4 mr-1" />
              <span>Buka Scanner Front Desk</span>
            </Button>
          </Link>
          <Link href="/dashboard/pt-sessions">
            <Button variant="secondary" size="sm">
              <Flame className="w-4 h-4 text-neon mr-1" />
              <span>Sesi PT</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* NOTIFIKASI APPROVE & TOLAK PENDAFTARAN MEMBER ONLINE */}
      {pendingMembers.length > 0 ? (
        <Card id="pending-approval-section" className="border-amber-500/80 bg-gradient-to-r from-amber-950/40 via-gym-card to-gym-elevated p-5 space-y-4 shadow-xl animate-in fade-in scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Hourglass className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Permohonan Pendaftaran Member Online Menunggu Persetujuan</span>
                  <Badge variant="warning" size="sm">
                    {pendingMembers.length} PENDING
                  </Badge>
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Calon member telah mendaftar online & mengirim konfirmasi pembayaran ke WhatsApp Admin:{" "}
                  <strong className="text-white">0895-6018-00302</strong>
                </p>
              </div>
            </div>

            <Link href="/dashboard/members?filter=pending">
              <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-white">
                <span>Kelola di Menu Member →</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingMembers.map((member) => {
              const waMemberUrl = `https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Halo Kak ${member.full_name}, kami dari Admin One O One Gym mengenai pendaftaran membership Anda (${member.member_code}).`
              )}`;

              return (
                <div
                  key={member.id}
                  className="bg-black/60 border border-amber-900/60 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-amber-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                        alt={member.full_name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-500/50"
                      />
                      <div>
                        <div className="text-sm font-extrabold text-white">{member.full_name}</div>
                        <div className="text-xs font-mono font-bold text-amber-400">{member.member_code}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-neon">{formatRupiah(member.package_price)}</div>
                      <Badge variant="warning" size="sm" className="mt-1">
                        {member.package_type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {member.selected_coach_name && (
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-neon" />
                        <span>Pelatih: <strong className="text-white">{member.selected_coach_name}</strong></span>
                      </div>
                      <span className="text-amber-400 font-bold">{member.selected_coach_sessions} Sesi</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <a
                      href={waMemberUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat Member</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(member.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>

                      <button
                        onClick={() => handleApprove(member.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui (Approve)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="border-zinc-800/80 bg-gym-card/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Status Persetujuan Pendaftaran Member:</span>{" "}
              <span className="text-zinc-400">Semua pendaftaran telah diproses (0 pending). Pendaftaran baru dari portal online akan muncul di sini secara otomatis.</span>
            </div>
          </div>
          <Link href="/member/dashboard" className="text-neon hover:underline font-bold shrink-0 text-xs flex items-center gap-1">
            <span>Buka Tampilan Member</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      )}

      {/* PART 4: 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Members */}
        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated/70 border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Member Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{activeMembersCount}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% dibanding bulan lalu</span>
          </div>
        </Card>

        {/* Card 2: Pendapatan Bulan Ini (Membership & PT) */}
        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated/70 border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pendapatan Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-neon/15 border border-neon/30 flex items-center justify-center text-neon">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neon mb-1">{formatRupiah(monthlyRevenue)}</div>
          <div className="text-[11px] text-zinc-400">
            Total Paket Membership & Sesi PT
          </div>
        </Card>

        {/* Card 3: Check-in Hari Ini */}
        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated/70 border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Check-in Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{todayCheckinsCount}</div>
          <div className="text-[11px] text-zinc-400">
            {checkIns.filter((c) => c.status === "expired_denied").length} member ditolak/expired
          </div>
        </Card>

        {/* Card 4: Lead Baru */}
        <Card className="bg-gradient-to-br from-gym-card to-gym-elevated/70 border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prospek / Lead Baru</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{newLeadsCount}</div>
          <div className="text-[11px] text-cyan-400 font-semibold">
            Perlu di-follow up oleh Sales
          </div>
        </Card>
      </div>

      {/* TRAFFIC PEAK HOURS CHART & RECENT CHECK-INS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours Chart (2 cols) */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Trafik Kunjungan Gym Harian</span>
                <Badge variant="neon" size="sm">
                  Peak: 17:00 - 20:00
                </Badge>
              </h2>
              <p className="text-xs text-zinc-400">
                Distribusi kedatangan member per jam untuk optimalisasi jadwal instruktur dan staf.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-zinc-700" />
                <span>Jam Biasa</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neon" />
                <span className="text-white font-semibold">Peak Hour</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2 px-1">
            {hourlyTraffic.map((item) => {
              const heightPercent = Math.max(10, Math.round((item.checkins / maxTraffic) * 100));
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-zinc-800 text-white px-1.5 py-0.5 rounded mb-1 whitespace-nowrap shadow-md pointer-events-none font-bold">
                    {item.checkins} org
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 ${
                      item.isPeak
                        ? "bg-gradient-to-t from-neon/70 to-neon shadow-neon-sm"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  />

                  {/* Hour label */}
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 font-mono mt-2 truncate w-full text-center">
                    {item.hour.slice(0, 2)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Feed / Activity Quick Box */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Check-in Terakhir</span>
              </h2>
              <Link href="/dashboard/checkin" className="text-xs text-neon hover:underline font-semibold">
                Lihat Semua →
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {checkIns.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gym-elevated/60 border border-zinc-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={c.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-700"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{c.member_name || "Unknown"}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{c.member_code}</div>
                    </div>
                  </div>

                  <Badge variant={c.status === "success" ? "success" : "danger"} size="sm">
                    {c.status === "success" ? "BERHASIL" : "DITOLAK"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <Link href="/dashboard/classes">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1 text-neon" />
                <span>Lihat Jadwal Kelas Studio</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* PART 4: "NEEDS ATTENTION" TABLE */}
      <Card id="needs-attention" className="space-y-4 border-amber-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Needs Attention — Paket Berakhir dalam 7 Hari</span>
              <Badge variant="warning" size="sm">
                {needsAttentionMembers.length} Member
              </Badge>
            </h2>
            <p className="text-xs text-zinc-400">
              Daftar member aktif yang membutuhkan follow-up perpanjangan agar tidak kehilangan membership (churn).
            </p>
          </div>

          <Link href="/dashboard/members?filter=expiring">
            <Button variant="ghost" size="sm" className="text-xs text-neon">
              <span>Kelola Semua di CRM Member</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {needsAttentionMembers.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Tidak ada member yang akan kadaluarsa dalam 7 hari ke depan. Semua keanggotaan aman! ✨
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gym-elevated/70 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Paket</th>
                  <th className="py-2.5 px-3">Tanggal Expired</th>
                  <th className="py-2.5 px-3">Sisa Waktu</th>
                  <th className="py-2.5 px-3">Catatan Follow-up</th>
                  <th className="py-2.5 px-3 text-right">Aksi Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {needsAttentionMembers.map((member) => {
                  const daysLeft = getDaysRemaining(member.expiry_date);
                  const waUrl = `https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Halo Kak ${member.full_name}, kami dari ${currentClub.name} ingin mengingatkan bahwa paket membership Anda akan berakhir dalam ${daysLeft} hari (${formatWIBDate(
                      member.expiry_date
                    )}). Dapatkan promo spesial perpanjangan paket hari ini! 💪`
                  )}`;

                  return (
                    <tr key={member.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={member.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
                          />
                          <div>
                            <div className="font-bold text-white">{member.full_name}</div>
                            <div className="text-[10px] font-mono text-neon">{member.member_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize text-zinc-300">
                        {member.package_type.replace("_", " ")}
                      </td>
                      <td className="py-3 px-3 font-semibold text-zinc-200">
                        {formatWIBDate(member.expiry_date)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="danger" size="sm">
                          {daysLeft} Hari Lagi
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">
                        {member.notes || "Belum ada catatan khusus"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Hubungi WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

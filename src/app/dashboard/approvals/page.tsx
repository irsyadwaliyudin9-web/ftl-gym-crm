"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGymData } from "@/context/GymDataContext";
import { Member } from "@/lib/types";
import { formatRupiah, formatWIBDate, formatWIBDateTime } from "@/lib/utils";
import { soundManager } from "@/components/common/SoundEffects";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  RefreshCw,
  Search,
  Dumbbell,
  ShieldCheck,
  Calendar,
  CreditCard,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ApprovalsPage() {
  const {
    pendingMembers,
    pendingMembersCount,
    approveMember,
    rejectMember,
    refreshFromCloud,
    currentClub,
    coaches,
  } = useGymData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal States for Approval & Rejection
  const [confirmingMember, setConfirmingMember] = useState<Member | null>(null);
  const [rejectingMember, setRejectingMember] = useState<Member | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshFromCloud();
    setTimeout(() => {
      setIsRefreshing(false);
      setActionNotice("Sinkronisasi cloud berhasil. Data pendaftaran terbaru sudah dimuat.");
      setTimeout(() => setActionNotice(null), 3000);
    }, 600);
  };

  const handleApproveConfirm = () => {
    if (!confirmingMember) return;
    const res = approveMember(confirmingMember.id);
    soundManager.playSuccessBeep();
    setConfirmingMember(null);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRejectConfirm = () => {
    if (!rejectingMember) return;
    const reason = rejectReason.trim() || "Pembayaran tidak valid atau belum konfirmasi via WhatsApp.";
    const res = rejectMember(rejectingMember.id, reason);
    setRejectingMember(null);
    setRejectReason("");
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filter pending members based on search
  const filteredPending = pendingMembers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = m.full_name.toLowerCase().includes(q);
    const codeMatch = m.member_code.toLowerCase().includes(q);
    const phoneMatch = m.phone.includes(q);
    const emailMatch = (m.email || "").toLowerCase().includes(q);
    return nameMatch || codeMatch || phoneMatch || emailMatch;
  });

  // Calculate total pending revenue
  const totalPendingAmount = filteredPending.reduce((sum, m) => {
    const pkg = m.package_price || 250000;
    const ptCoach = m.selected_coach_id ? coaches.find((c) => c.id === m.selected_coach_id) : undefined;
    const ptAmount = m.selected_coach_sessions && ptCoach
      ? (m.selected_coach_sessions === 24 ? ptCoach.pt_rate_24 : ptCoach.pt_rate_12)
      : 0;
    return sum + pkg + ptAmount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification Action Feedback */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-neon text-gym-base font-black text-xs sm:text-sm flex items-center justify-between shadow-neon animate-in fade-in slide-in-from-top-2 border border-black">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-gym-base shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold underline shrink-0">
            Tutup
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              PUSAT PERSETUJUAN MEMBER ONLINE
            </span>
            <span className="text-xs text-zinc-500">· Cabang {currentClub.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>Fitur Menunggu Approval</span>
            <Badge variant="warning" size="sm" className="font-mono text-xs">
              {pendingMembersCount} PENDING
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Daftar calon member One O One Gym yang mendaftar online & menunggu verifikasi kasir serta persetujuan akun resmi.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            className="border-zinc-700 hover:border-neon text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-neon" />
            <span>Refresh Data Cloud</span>
          </Button>

          <Link href="/dashboard/members">
            <Button variant="outline" size="sm" className="text-xs border-zinc-700 text-zinc-300 hover:text-white">
              <span>Semua Member CRM →</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="p-4 bg-gym-card border-amber-500/40 relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Menunggu Approval
            </div>
            <div className="text-2xl font-black text-amber-400 mt-0.5 font-mono">
              {pendingMembersCount} <span className="text-xs font-normal text-zinc-400">Calon Member</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </Card>

        <Card className="p-4 bg-gym-card border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Estimasi Pemasukan Kas
            </div>
            <div className="text-2xl font-black text-neon mt-0.5 font-mono">
              {formatRupiah(totalPendingAmount)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neon/15 text-neon flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-gym-card border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Cabang One O One Gym
            </div>
            <div className="text-sm font-extrabold text-white mt-1">
              Garut Kota (Pusat)
            </div>
            <div className="text-[10px] text-zinc-400">Kode Cabang: 101-GRT</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center font-black">
            101
          </div>
        </Card>
      </div>

      {/* Search Input Bar */}
      <div className="bg-gym-card p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama calon member, nomor WhatsApp, atau kode member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          />
        </div>
      </div>

      {/* Main Content Area: Pending Members Cards */}
      {filteredPending.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gym-card border-zinc-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-white">
              Tidak Ada Pendaftaran Menunggu Approval
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Semua calon member telah disetujui atau belum ada pendaftaran baru. Setiap kali calon customer mendaftar via aplikasi / website, data akun dan tombol konfirmasi setujui akan muncul di sini secara otomatis.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={handleManualRefresh} className="text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-neon" />
              <span>Cek Pembaharuan Sekarang</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPending.map((member) => {
            const cleanPhone = member.phone.replace(/[^0-9]/g, "");
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Halo Kak ${member.full_name}, kami dari Staf Front Desk One O One Gym Garut Kota mengenai permohonan pendaftaran akun Anda (Kode: ${member.member_code}). Apakah sudah melakukan pembayaran paket membership? Terima kasih!`
            )}`;

            const coach = member.selected_coach_id
              ? coaches.find((c) => c.id === member.selected_coach_id)
              : undefined;

            const ptPrice = member.selected_coach_sessions && coach
              ? (member.selected_coach_sessions === 24 ? coach.pt_rate_24 : coach.pt_rate_12)
              : 0;

            const totalBill = (member.package_price || 250000) + ptPrice;

            return (
              <Card
                key={member.id}
                className="p-5 sm:p-6 bg-gradient-to-b from-gym-card to-gym-elevated/90 border-2 border-amber-500/60 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-amber-400 transition-all"
              >
                {/* Header: Member Code, Registration Time, & Status Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {member.member_code}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{member.created_at ? formatWIBDateTime(member.created_at) : "Baru saja"} WIB</span>
                    </span>
                  </div>

                  <Badge variant="warning" size="sm" className="font-black text-[10px] shrink-0 animate-pulse">
                    MENUNGGU APPROVAL
                  </Badge>
                </div>

                {/* Member Profile Information */}
                <div className="flex items-start gap-4">
                  <img
                    src={member.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                    alt={member.full_name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-amber-500/60 shrink-0 shadow-md"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white truncate">
                      {member.full_name}
                    </h3>

                    <div className="text-xs text-zinc-300 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neon shrink-0" />
                      <span className="font-mono font-bold">{member.phone}</span>
                    </div>

                    {member.email && (
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package & Payment Information Box */}
                <div className="p-3.5 rounded-2xl bg-black/70 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500">Paket Membership:</span>
                    <span className="font-bold text-white capitalize">
                      {member.package_type.replace("_", " ")} ({formatRupiah(member.package_price || 250000)})
                    </span>
                  </div>

                  {member.selected_coach_name && (
                    <div className="flex items-center justify-between text-zinc-300 pt-1.5 border-t border-zinc-800/80">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-neon" />
                        <span>Personal Trainer:</span>
                      </span>
                      <span className="font-bold text-amber-300">
                        {member.selected_coach_name} ({member.selected_coach_sessions} Sesi)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Total Tagihan Kasir:</span>
                    <span className="text-sm font-black text-neon font-mono">
                      {formatRupiah(totalBill)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons: Approve, Reject, Chat WA */}
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/60 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Hubungi Calon Member via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setRejectingMember(member);
                      setRejectReason("");
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak</span>
                  </button>

                  <Button
                    type="button"
                    variant="neon"
                    size="sm"
                    onClick={() => setConfirmingMember(member)}
                    className="flex-1 py-2.5 text-xs font-black shadow-neon-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui (Approve) Akun</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI APPROVAL AKUN MEMBER (PENTING)                           */}
      {/* ========================================================================= */}
      {confirmingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-gym-card border-2 border-neon rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-2xl bg-neon text-gym-base flex items-center justify-center font-black shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Konfirmasi Persetujuan Akun</h3>
                <p className="text-xs text-zinc-400">Verifikasi data calon member One O One Gym</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nama Calon Member:</span>
                <span className="font-extrabold text-white">{confirmingMember.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Kode Member:</span>
                <span className="font-mono font-bold text-neon">{confirmingMember.member_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">No. WhatsApp:</span>
                <span className="font-mono text-zinc-200">{confirmingMember.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Paket Dipilih:</span>
                <span className="font-bold text-white capitalize">{confirmingMember.package_type.replace("_", " ")}</span>
              </div>
              {confirmingMember.selected_coach_name && (
                <div className="flex justify-between text-amber-300">
                  <span>Personal Trainer:</span>
                  <span className="font-bold">{confirmingMember.selected_coach_name} ({confirmingMember.selected_coach_sessions} Sesi)</span>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Dengan mengklik <strong>"Ya, Setujui & Aktifkan"</strong>, akun member ini akan langsung berstatus <strong className="text-neon">AKTIF</strong>. Kartu Member QR Digital member akan menyala dan member dapat langsung login untuk latihan di gym.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConfirmingMember(null)}
                className="flex-1 text-xs"
              >
                Batal
              </Button>
              <Button
                variant="neon"
                size="md"
                onClick={handleApproveConfirm}
                className="flex-1 text-xs font-black shadow-neon"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Ya, Setujui & Aktifkan</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PENOLAKAN PENDAFTARAN                                              */}
      {/* ========================================================================= */}
      {rejectingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-gym-card border-2 border-rose-600 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Tolak Pendaftaran Member</h3>
                <p className="text-xs text-zinc-400">Pendaftaran atas nama {rejectingMember.full_name}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Alasan Penolakan:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak valid atau belum mengirim konfirmasi via WhatsApp."
                rows={3}
                className="w-full bg-gym-elevated border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setRejectingMember(null)}
                className="flex-1 text-xs"
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

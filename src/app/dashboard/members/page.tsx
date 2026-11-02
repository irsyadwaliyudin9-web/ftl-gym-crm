"use client";

import React, { useState } from "react";
import { useGymData } from "@/context/GymDataContext";
import { Member, MemberStatus } from "@/lib/types";
import { formatRupiah, formatWIBDate, getDaysRemaining, isExpiringSoon } from "@/lib/utils";
import {
  UserPlus,
  QrCode,
  Download,
  Search,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Hourglass,
  Dumbbell,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DigitalPassModal } from "@/components/members/DigitalPassModal";
import { MemberFormModal } from "@/components/members/MemberFormModal";

export default function MembersCRMPage() {
  const { members, currentClub, addMember, exportMembersCSV, approveMember, rejectMember, pendingMembersCount } = useGymData();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus | "expiring" | "pending">("all");
  const [selectedPassMember, setSelectedPassMember] = useState<Member | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    const res = approveMember(id);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleReject = (id: string) => {
    if (confirm("Yakin ingin menolak pendaftaran member ini?")) {
      const res = rejectMember(id, "Pembayaran belum transfer via WhatsApp (0895-6018-00302)");
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  // Filter members (Pastikan akun member yang mendaftar & aktif tetap ada selamanya di dashboard staf)
  const filteredMembers = members.filter((m) => {
    // Tampilkan member: permohonan pending atau member terdaftar di gym
    if (statusFilter !== "pending" && m.club_id && m.club_id !== currentClub.id && m.club_id !== "club-ftl-01" && m.club_id !== "club-jkt-01") return false;

    // Filter tab
    if (statusFilter === "expiring") {
      if (!(m.status === "active" && isExpiringSoon(m.expiry_date, 7))) return false;
    } else if (statusFilter === "pending") {
      if (!(m.status === "pending_approval" || m.payment_proof_status === "pending")) return false;
    } else if (statusFilter !== "all" && m.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.full_name.toLowerCase().includes(q);
      const matchCode = m.member_code.toLowerCase().includes(q);
      const matchPhone = m.phone.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    return true;
  });

  const handleOpenDigitalPass = (member: Member) => {
    setSelectedPassMember(member);
    setIsPassModalOpen(true);
  };

  const handleAddMemberSubmit = (data: Partial<Member>) => {
    const created = addMember(data);
    handleOpenDigitalPass(created);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Member & Prospek (CRM)</span>
            <Badge variant="neutral" size="sm">
              {filteredMembers.length} Terdaftar
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Database keanggotaan, status lead prospek, persetujuan member online, dan generator Kartu Member Digital QR Code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={exportMembersCSV}>
            <Download className="w-4 h-4 mr-1 text-zinc-300" />
            <span>Export CSV</span>
          </Button>

          <Button variant="neon" size="sm" onClick={() => setIsAddModalOpen(true)} className="shadow-neon-sm">
            <UserPlus className="w-4 h-4 mr-1" />
            <span>Tambah Member / Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-card p-3 rounded-xl border border-zinc-800">
        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === "all" ? "bg-neon text-gym-base" : "text-zinc-400 hover:text-white"
            }`}
          >
            Semua Member
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-500 text-gym-base font-black shadow-sm"
                : "text-amber-400 hover:text-white"
            }`}
          >
            <span>⏳ Menunggu Approval</span>
            {pendingMembersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-gym-base text-[10px] font-black">
                {pendingMembersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === "active" ? "bg-emerald-500 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Aktif VIP
          </button>
          <button
            onClick={() => setStatusFilter("expiring")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === "expiring" ? "bg-amber-500 text-gym-base font-extrabold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Needs Attention (≤7 Hari)
          </button>
          <button
            onClick={() => setStatusFilter("expired")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === "expired" ? "bg-rose-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setStatusFilter("lead")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === "lead" ? "bg-cyan-500 text-gym-base font-extrabold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Prospek (Leads)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Nama, ID, atau No. HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
          />
        </div>
      </div>

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isExpSoon = member.status === "active" && isExpiringSoon(member.expiry_date, 7);
          const daysLeft = getDaysRemaining(member.expiry_date);

          return (
            <Card
              key={member.id}
              className="p-5 flex flex-col justify-between hover:border-zinc-600 transition-all group"
            >
              <div>
                {/* Header row: Member Code & Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                    {member.member_code}
                  </span>

                  <Badge
                    variant={
                      member.status === "pending_approval"
                        ? "warning"
                        : member.status === "active"
                        ? isExpSoon
                          ? "warning"
                          : "success"
                        : member.status === "expired"
                        ? "danger"
                        : "info"
                    }
                    size="sm"
                  >
                    {member.status === "pending_approval"
                      ? "⏳ MENUNGGU APPROVAL"
                      : member.status === "active"
                      ? isExpSoon
                        ? `HABIS ${daysLeft} HARI`
                        : "AKTIF"
                      : member.status === "expired"
                      ? "EXPIRED"
                      : "PROSPEK / LEAD"}
                  </Badge>
                </div>

                {/* Profile info */}
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={member.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                    alt={member.full_name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-zinc-700 group-hover:ring-neon/60 transition-all shadow-md shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-white truncate group-hover:text-neon transition-colors">
                      {member.full_name}
                    </h3>
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span>{member.phone}</span>
                    </div>
                    {member.email && (
                      <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-zinc-600" />
                        <span>{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package details */}
                <div className="bg-gym-elevated/70 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Paket:</span>
                    <span className="font-bold text-zinc-200 capitalize">
                      {member.package_type.replace("_", " ")} ({formatRupiah(member.package_price)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Berlaku Sampai:</span>
                    <span
                      className={`font-semibold ${
                        isExpSoon ? "text-amber-400 font-bold" : "text-zinc-300"
                      }`}
                    >
                      {formatWIBDate(member.expiry_date)}
                    </span>
                  </div>
                  {member.notes && (
                    <div className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800 line-clamp-2">
                      "{member.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                {member.status === "pending_approval" ? (
                  <>
                    <button
                      onClick={() => handleReject(member.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => handleApprove(member.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                  </>
                ) : (
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => handleOpenDigitalPass(member)}
                    className="flex-1 text-xs"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1" />
                    <span>Pass QR</span>
                  </Button>
                )}

                <a
                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/60 transition-colors"
                  title="Kirim WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="py-16 text-center text-zinc-500 text-xs">
          Tidak ada member atau prospek yang cocok dengan filter atau kata kunci pencarian.
        </div>
      )}

      {/* Digital Member Pass Modal */}
      <DigitalPassModal
        member={selectedPassMember}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
      />

      {/* Add Member / Lead Modal */}
      <MemberFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMemberSubmit}
      />
    </div>
  );
}

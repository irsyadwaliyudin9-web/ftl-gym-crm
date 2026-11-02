"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { PTPackage } from "@/lib/types";
import { formatWIBDateTime } from "@/lib/utils";
import {
  Dumbbell,
  Flame,
  User,
  History,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeductSessionModal } from "@/components/pt/DeductSessionModal";

export default function PTSessionsPage() {
  const { ptPackages, ptSessionLogs, currentClub } = useGymData();
  const { currentRole, currentUser } = useAuth();

  const [selectedPkgForDeduct, setSelectedPkgForDeduct] = useState<PTPackage | null>(null);
  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"packages" | "logs">("packages");

  const filteredPackages = ptPackages.filter((pkg) => {
    if (pkg.club_id !== currentClub.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMember = pkg.member_name?.toLowerCase().includes(q);
      const matchCode = pkg.member_code?.toLowerCase().includes(q);
      const matchTrainer = pkg.trainer_name?.toLowerCase().includes(q);
      if (!matchMember && !matchCode && !matchTrainer) return false;
    }
    return true;
  });

  const handleOpenDeduct = (pkg: PTPackage) => {
    setSelectedPkgForDeduct(pkg);
    setIsDeductModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Sesi Personal Trainer (PT)</span>
            <Badge variant="neon" size="sm">
              RACE-SAFE
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pelacakan kuota sesi klien & pemotongan real-time via smartphone pelatih dengan perlindungan row-locking.
          </p>
        </div>

        {/* View Switcher: Active Quota Cards vs Session Logs */}
        <div className="flex items-center gap-2 bg-gym-card p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "packages" ? "bg-neon text-gym-base shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Klien & Kuota Sesi</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "logs" ? "bg-neon text-gym-base shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Pemotongan ({ptSessionLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab 1: Klien & Kuota Sesi */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Nama Klien atau Nama Trainer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gym-card border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
            />
          </div>

          {/* Touch-Friendly PT Client Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => {
              const percentUsed = Math.round((pkg.used_sessions / pkg.total_sessions) * 100);
              const isLow = pkg.remaining_sessions <= 2 && pkg.remaining_sessions > 0;
              const isFinished = pkg.remaining_sessions === 0;

              return (
                <Card
                  key={pkg.id}
                  className="p-5 flex flex-col justify-between hover:border-zinc-600 transition-all group"
                >
                  <div>
                    {/* Top row: Member Code & Trainer */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                        {pkg.member_code}
                      </span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span>{pkg.trainer_name}</span>
                      </span>
                    </div>

                    {/* Member Name & Package */}
                    <h3 className="text-lg font-black text-white mb-1 group-hover:text-neon transition-colors">
                      {pkg.member_name}
                    </h3>
                    <p className="text-xs text-zinc-400 mb-4">{pkg.package_name}</p>

                    {/* Quota Numbers Visual */}
                    <div className="bg-gym-elevated/90 border border-zinc-800 rounded-xl p-3.5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Sisa Kuota Sesi:</span>
                        <span
                          className={`font-black text-base ${
                            isFinished ? "text-rose-400" : isLow ? "text-amber-400" : "text-neon"
                          }`}
                        >
                          {pkg.remaining_sessions}{" "}
                          <span className="text-xs text-zinc-400 font-normal">/ {pkg.total_sessions} Sesi</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentUsed}%` }}
                          className={`h-full transition-all duration-300 ${
                            isFinished ? "bg-rose-500" : isLow ? "bg-amber-400" : "bg-neon"
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>{pkg.used_sessions} sesi telah dibakar</span>
                        <span>{percentUsed}% selesai</span>
                      </div>
                    </div>
                  </div>

                  {/* Touch Burn Button */}
                  <div className="pt-2">
                    <Button
                      variant={isFinished ? "secondary" : "neon"}
                      size="touch"
                      disabled={isFinished}
                      onClick={() => handleOpenDeduct(pkg)}
                      className="text-sm font-bold shadow-sm"
                    >
                      <Flame className="w-4 h-4 fill-current mr-1" />
                      <span>{isFinished ? "Sesi Sudah Habis" : "Gunakan 1 Sesi (Bakar)"}</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tab 2: Session Logs History */}
      {activeTab === "logs" && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neon" />
                <span>Log Pemotongan Sesi Personal Trainer</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Audit trail transaksi pemotongan sesi yang dicatat real-time oleh trainer.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              Total Log: {ptSessionLogs.length}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gym-elevated/70 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Waktu (WIB)</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Pelatih (Trainer)</th>
                  <th className="py-2.5 px-3">Sesi Ke-</th>
                  <th className="py-2.5 px-3">Catatan / Gerakan Latihan</th>
                  <th className="py-2.5 px-3">Idempotency Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {ptSessionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {formatWIBDateTime(log.logged_at)}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {log.member_name}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {log.trainer_name}
                    </td>
                    <td className="py-3 px-3 font-bold text-neon">
                      Sesi #{log.session_number}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 max-w-sm">
                      {log.notes}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-zinc-500">
                      {log.idempotency_key}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Deduction Dialog Modal */}
      <DeductSessionModal
        pkg={selectedPkgForDeduct}
        isOpen={isDeductModalOpen}
        onClose={() => setIsDeductModalOpen(false)}
      />
    </div>
  );
}

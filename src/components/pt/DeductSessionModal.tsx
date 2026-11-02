"use client";

import React, { useState } from "react";
import { PTPackage } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { generateIdempotencyKey } from "@/lib/utils";
import { Flame, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface DeductSessionModalProps {
  pkg: PTPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeductSessionModal: React.FC<DeductSessionModalProps> = ({ pkg, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { deductPTSession } = useGymData();
  const [notes, setNotes] = useState("");
  const [isDeducting, setIsDeducting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!pkg) return null;

  const handleConfirmDeduct = async () => {
    if (isDeducting) return; // Prevent double-trigger

    setIsDeducting(true);
    setResultMsg(null);

    // Generate unique idempotency key for this exact burn attempt
    const idempotencyKey = generateIdempotencyKey(`burn_${pkg.id}_${currentUser.id}`);

    try {
      const res = await deductPTSession(pkg.id, currentUser.id, notes, idempotencyKey);
      if (res.success) {
        setResultMsg({ type: "success", text: res.message });
        setTimeout(() => {
          onClose();
          setNotes("");
          setResultMsg(null);
        }, 1500);
      } else {
        setResultMsg({ type: "error", text: res.message });
      }
    } catch (e: any) {
      setResultMsg({ type: "error", text: e.message || "Gagal memproses pemotongan sesi." });
    } finally {
      setIsDeducting(false);
    }
  };

  const isOutOfSessions = pkg.remaining_sessions <= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" title="Potong 1 Sesi Personal Trainer">
      <div className="space-y-4">
        {/* Package summary card */}
        <div className="bg-gym-elevated border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Member:</span>
            <span className="text-xs font-mono font-bold text-neon">{pkg.member_code}</span>
          </div>
          <div className="text-base font-extrabold text-white mb-1">{pkg.member_name}</div>
          <div className="text-xs text-zinc-400 mb-3">{pkg.package_name}</div>

          {/* Quota visual bar */}
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Sisa Kuota Saat Ini</div>
              <div className="text-2xl font-black text-neon mt-0.5">
                {pkg.remaining_sessions}{" "}
                <span className="text-xs text-zinc-400 font-normal">/ {pkg.total_sessions} Sesi</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Setelah Dipotong</div>
              <div className="text-xl font-bold text-zinc-300 mt-0.5">
                {Math.max(0, pkg.remaining_sessions - 1)} Sesi
              </div>
            </div>
          </div>
        </div>

        {/* Notes input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
            Catatan Latihan Hari Ini:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {["Chest & Triceps", "Leg Day & Squat", "Back & Biceps", "Cardio HIIT", "Mobility & Core"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNotes(preset)}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-neon px-2 py-1 rounded-md border border-zinc-700 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Contoh: Chest & Triceps (Bench Press 70kg, Incline DB Press, Cable Pushdown)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
          />
        </div>

        {/* Feedback message */}
        {resultMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              resultMsg.type === "success"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                : "bg-rose-950/80 text-rose-300 border border-rose-800"
            }`}
          >
            {resultMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{resultMsg.text}</span>
          </div>
        )}

        {/* Protection Note */}
        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Dilindungi Idempotency Key & Row-Level Lock PostgreSQL anti double-click.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isDeducting} className="flex-1">
            Batal
          </Button>
          <Button
            variant="neon"
            size="touch"
            onClick={handleConfirmDeduct}
            isLoading={isDeducting}
            disabled={isOutOfSessions || isDeducting}
            className="flex-1"
          >
            <Flame className="w-5 h-5 fill-current" />
            <span>{isOutOfSessions ? "Kuota Habis" : "Konfirmasi Potong 1 Sesi"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

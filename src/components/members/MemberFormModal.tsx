"use client";

import React, { useState } from "react";
import { Member, PackageType, MemberStatus } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: Partial<Member>) => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+628");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<MemberStatus>("active");
  const [packageType, setPackageType] = useState<PackageType>("1_month");
  const [packagePrice, setPackagePrice] = useState<number>(250000);
  const [notes, setNotes] = useState("");

  const handlePackageChange = (pkg: PackageType) => {
    setPackageType(pkg);
    if (pkg === "1_month") setPackagePrice(250000);
    else if (pkg === "6_months") setPackagePrice(1200000);
    else if (pkg === "1_year") setPackagePrice(2400000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert("Nama lengkap dan No. HP wajib diisi.");
      return;
    }

    // Expiry calculation
    const now = new Date();
    let daysToAdd = 30;
    if (packageType === "6_months") daysToAdd = 180;
    else if (packageType === "1_year") daysToAdd = 365;

    const expiry = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    onSubmit({
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      status,
      package_type: packageType,
      package_price: packagePrice,
      start_date: now.toISOString().slice(0, 10),
      expiry_date: expiry,
      notes: notes.trim(),
    });

    // Reset
    setFullName("");
    setPhone("+628");
    setEmail("");
    setNotes("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Tambah Member / Prospek Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
            Nama Lengkap <span className="text-neon">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Rian Anggara"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
              No. Handphone (WhatsApp) <span className="text-neon">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="+628123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Email</label>
            <input
              type="email"
              placeholder="member@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
            />
          </div>
        </div>

        {/* Status & Package */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Status Keanggotaan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MemberStatus)}
              className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon"
            >
              <option value="active">Active (Langsung Aktif)</option>
              <option value="lead">Lead (Calon Member / Prospek)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Pilihan Paket</label>
            <select
              value={packageType}
              onChange={(e) => handlePackageChange(e.target.value as PackageType)}
              className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon"
            >
              <option value="1_month">1 Bulan (Rp250.000)</option>
              <option value="6_months">6 Bulan (Rp1.200.000)</option>
              <option value="1_year">1 Tahun (Rp2.400.000)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Catatan / Profil Kebugaran</label>
          <textarea
            rows={2}
            placeholder="Target latihan: Fat loss, Strength, riwayat cedera..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="neon">
            <UserPlus className="w-4 h-4" />
            <span>Simpan Member</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

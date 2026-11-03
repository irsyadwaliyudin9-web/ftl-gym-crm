"use client";

import React, { useRef, useState } from "react";
import { Member } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { generateQRCodeSVG, generateBarcodeSVG } from "@/lib/qrGenerator";
import { downloadMemberCardPNG } from "@/lib/memberCardGenerator";
import { formatWIBDate, isPackageExpired } from "@/lib/utils";
import { Printer, Share2, Download } from "lucide-react";

interface DigitalPassModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({ member, isOpen, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!member) return null;

  const isExpired = member.status === "expired" || isPackageExpired(member.expiry_date);
  const isPending = member.status === "pending_approval" || member.payment_proof_status === "pending";
  const qrSvg = generateQRCodeSVG(member.qr_code_data, 180, isPending ? "#F59E0B" : "#E2F952", "#0A0A0A");
  const barcodeSvg = generateBarcodeSVG(member.member_code, 260, 45, isPending ? "#F59E0B" : "#E2F952", "transparent");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      await downloadMemberCardPNG(member);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `Kartu Member One O One Gym: ${member.full_name} (${member.member_code}) - Berlaku hingga ${formatWIBDate(member.expiry_date)}`;
    if (navigator.share) {
      navigator.share({ title: "One O One Gym Member Pass", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Tautan kartu member disalin ke clipboard!");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Kartu Member Digital (One O One Gym Pass)">
      <div className="flex flex-col items-center gap-6">
        {/* Printable/Downloadable Pass Container */}
        <div
          ref={cardRef}
          className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-2 border-zinc-700/80 p-5 shadow-2xl relative overflow-hidden text-white select-none"
        >
          {/* Top Neon Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neon via-neon-lime to-amber-400" />

          {/* Watermark Logo */}
          <div className="absolute -right-8 -bottom-8 opacity-5 text-[140px] font-black pointer-events-none text-neon">
            101
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center font-black text-black text-sm shadow-neon-sm">
                101
              </div>
              <div>
                <div className="text-xs font-black tracking-wider text-white">ONE O ONE GYM OFFICIAL PASS</div>
                <div className="text-[10px] text-zinc-400">{member.club_name || "One O One Gym Jakarta Pusat"}</div>
              </div>
            </div>

            <Badge variant={isPending ? "warning" : isExpired ? "danger" : "neon"} size="sm">
              {isPending ? "PENDING APPROVAL" : isExpired ? "EXPIRED" : "ACTIVE VIP"}
            </Badge>
          </div>

          {/* Member Profile Row */}
          <div className="flex items-center gap-3.5 mb-5 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
            <img
              src={member.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
              alt={member.full_name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-neon/40 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-extrabold text-white truncate">{member.full_name}</div>
              <div className="text-xs font-mono font-bold text-neon tracking-wider">{member.member_code}</div>
              <div className="text-[11px] text-zinc-400 capitalize">
                Paket: {member.package_type.replace("_", " ")}
              </div>
            </div>
          </div>

          {/* Scannable QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-gym-base rounded-2xl border border-zinc-800/90 shadow-inner mb-4">
            <div
              dangerouslySetInnerHTML={{ __html: qrSvg }}
              className="w-[180px] h-[180px] flex items-center justify-center"
            />
            <div className="text-[10px] text-zinc-400 font-mono mt-2 tracking-widest text-center">
              SCAN DI SCANNER FRONT DESK
            </div>
          </div>

          {/* Barcode Section */}
          <div className="flex flex-col items-center justify-center mb-3">
            <div dangerouslySetInnerHTML={{ __html: barcodeSvg }} className="h-10 flex items-center" />
            <div className="text-[10px] text-zinc-500 font-mono mt-1">{member.member_code}</div>
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Masa Berlaku:</span>
            <span className="font-bold text-zinc-200">{formatWIBDate(member.expiry_date)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 w-full">
          <Button
            variant="neon"
            size="md"
            onClick={handleDownloadCard}
            isLoading={isDownloading}
            className="w-full shadow-neon font-black text-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Unduh Kartu Member (Gambar PNG Lengkap)</span>
          </Button>

          <div className="flex items-center gap-3 w-full">
            <Button variant="secondary" size="md" onClick={handlePrint} className="flex-1 text-xs">
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Cetak / PDF</span>
            </Button>
            <Button variant="secondary" size="md" onClick={handleShare} className="flex-1 text-xs">
              <Share2 className="w-4 h-4 mr-1.5" />
              <span>Bagikan Pass</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

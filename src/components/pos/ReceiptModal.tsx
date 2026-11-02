"use client";

import React, { useRef } from "react";
import { POSTransaction } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatRupiah, formatWIBDateTime } from "@/lib/utils";
import { Printer } from "lucide-react";

interface ReceiptModalProps {
  transaction: POSTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, isOpen, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" title="Struk Pembayaran POS">
      <div className="space-y-4">
        {/* Receipt Visual */}
        <div
          ref={receiptRef}
          className="bg-white text-zinc-900 rounded-xl p-5 font-mono text-xs shadow-xl border border-zinc-200"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-300">
            <div className="text-base font-black tracking-tight">FITLEAD GYM POS</div>
            <div className="text-[11px] text-zinc-600">Core Operational System</div>
            <div className="text-[10px] text-zinc-500 mt-1">{formatWIBDateTime(transaction.created_at)}</div>
            <div className="text-[10px] font-bold text-zinc-800 mt-0.5">No: {transaction.invoice_number}</div>
          </div>

          {/* Member / Customer Info */}
          <div className="py-2.5 border-b border-dashed border-zinc-300 text-[11px] flex justify-between">
            <span className="text-zinc-500">Pelanggan:</span>
            <span className="font-bold">{transaction.member_name || "Umum"}</span>
          </div>

          {/* Items List */}
          <div className="py-3 border-b border-dashed border-zinc-300 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div className="flex-1 pr-2">
                  <div className="font-medium text-zinc-800">{item.product_name}</div>
                  <div className="text-zinc-500 text-[10px]">
                    {item.quantity} x {formatRupiah(item.unit_price)}
                  </div>
                </div>
                <div className="font-bold">{formatRupiah(item.subtotal)}</div>
              </div>
            ))}
          </div>

          {/* Total & Payment Method */}
          <div className="pt-3 space-y-1.5">
            <div className="flex justify-between text-sm font-black">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.total_amount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-600">
              <span>Metode Bayar</span>
              <span className="uppercase font-bold text-zinc-900">{transaction.payment_method}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Status</span>
              <span className="font-bold text-emerald-700 uppercase">LUNAS</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-zinc-400 pt-4 border-t border-dashed border-zinc-300 mt-3">
            Terima kasih atas kunjungan Anda.<br />
            Semoga latihan hari ini menyenangkan! 🔥
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={onClose} className="flex-1">
            Tutup
          </Button>
          <Button variant="neon" size="md" onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah currency format
 * @example formatRupiah(250000) => "Rp250.000"
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num) || num === null || num === undefined) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format standard ISO string or Date to Asia/Jakarta (WIB) date string
 * @example "2026-10-30" => "30 Okt 2026"
 */
export function formatWIBDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format standard ISO string to Asia/Jakarta (WIB) datetime string
 * @example "2026-10-30T11:30:00Z" => "30 Okt 2026, 18:30 WIB"
 */
export function formatWIBDateTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";
  const formatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${formatted} WIB`;
}

/**
 * Format standard ISO time to Asia/Jakarta (WIB)
 */
export function formatWIBTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB"
  );
}

/**
 * Calculate difference in days from today (Asia/Jakarta WIB) to target date.
 * If target is today, returns 0. If target is tomorrow, returns 1. If expired yesterday, returns -1.
 */
export function getDaysRemaining(expiryDateStr: string | undefined, baseDate?: Date | string): number {
  if (!expiryDateStr) return 0;
  
  const cleanExpiry = expiryDateStr.split("T")[0];
  const parts = cleanExpiry.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return 0;
  }
  const [ey, em, ed] = parts;
  const expiryUtc = Date.UTC(ey, em - 1, ed);

  let refDate: Date;
  if (baseDate) {
    refDate = typeof baseDate === "string" ? new Date(baseDate) : baseDate;
  } else {
    refDate = new Date();
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const partsWIB = formatter.formatToParts(refDate);
  const nowYear = Number(partsWIB.find((p) => p.type === "year")?.value || refDate.getFullYear());
  const nowMonth = Number(partsWIB.find((p) => p.type === "month")?.value || refDate.getMonth() + 1);
  const nowDay = Number(partsWIB.find((p) => p.type === "day")?.value || refDate.getDate());

  const nowUtc = Date.UTC(nowYear, nowMonth - 1, nowDay);
  const diffTime = expiryUtc - nowUtc;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if member package expires within the given window (default 7 days)
 */
export function isExpiringSoon(expiryDateStr: string | undefined, daysThreshold: number = 7, baseDate?: Date | string): boolean {
  if (!expiryDateStr) return false;
  const daysLeft = getDaysRemaining(expiryDateStr, baseDate);
  return daysLeft >= 0 && daysLeft <= daysThreshold;
}

/**
 * Checks if a member package is already past its expiration date
 */
export function isPackageExpired(expiryDateStr: string | undefined, baseDate?: Date | string): boolean {
  if (!expiryDateStr) return true;
  const daysLeft = getDaysRemaining(expiryDateStr, baseDate);
  return daysLeft < 0;
}

/**
 * Generate a client-side idempotency key to protect against double clicks / network retries
 */
export function generateIdempotencyKey(prefix: string = "req"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Format Day of week index (1 = Senin ... 7 = Minggu) to Indonesian string
 */
export function formatDayOfWeek(dayNum: number): string {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  return days[dayNum - 1] || "Setiap Hari";
}

/**
 * Export array of data objects to CSV with UTF-8 BOM for Indonesian Excel compatibility
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : "";
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\r\n");

  // UTF-8 BOM (\uFEFF) ensures proper Indonesian character & number parsing in MS Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

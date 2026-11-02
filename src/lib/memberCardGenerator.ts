// ==============================================================================
// FTL GYM OFFICIAL DIGITAL MEMBER CARD CANVAS GENERATOR
// Renders authentic, high-resolution physical-style gym VIP membership cards.
// Produces downloadable PNGs containing the full card: FTL Branding, Member Info,
// Package Tier, Assigned Coach, Validity, EMV Chip, and Scannable QR Code.
// ==============================================================================

import QRCode from "qrcode";
import { Member } from "@/lib/types";
import { formatRupiah, formatWIBDate } from "@/lib/utils";

/**
 * Helper to draw a rounded rectangle on Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws metallic gold smartcard chip simulation
 */
function drawSmartCardChip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  // Chip base gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "#F59E0B");
  grad.addColorStop(0.3, "#FDE68A");
  grad.addColorStop(0.7, "#D97706");
  grad.addColorStop(1, "#B45309");

  drawRoundedRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#78350F";
  ctx.stroke();

  // Internal circuit lines
  ctx.strokeStyle = "#92400E";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // Horizontal center line
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  // Vertical segments
  ctx.moveTo(x + w * 0.35, y);
  ctx.lineTo(x + w * 0.35, y + h);
  ctx.moveTo(x + w * 0.65, y);
  ctx.lineTo(x + w * 0.65, y + h);
  // Center small contact
  ctx.stroke();

  drawRoundedRect(ctx, x + w * 0.35, y + h * 0.3, w * 0.3, h * 0.4, 2);
  ctx.fillStyle = "#F59E0B";
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders the full Gym VIP Membership Card to an HTML5 Canvas and returns the Data URL (PNG)
 */
export async function renderMemberCardCanvas(member: Member): Promise<string> {
  const width = 1100;
  const height = 660;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  const isPending = member.status === "pending_approval" || member.payment_proof_status === "pending";

  // 1. Base Card Background (Obsidian & Deep Carbon Gradient)
  const cardGrad = ctx.createLinearGradient(0, 0, width, height);
  cardGrad.addColorStop(0, "#0D0F14");
  cardGrad.addColorStop(0.5, "#151821");
  cardGrad.addColorStop(1, "#0A0B0E");

  drawRoundedRect(ctx, 0, 0, width, height, 36);
  ctx.fillStyle = cardGrad;
  ctx.fill();

  // 2. High-Tech Carbon Fiber Pattern / Grid Dots
  ctx.save();
  ctx.clip(); // Clip within card rounded rect
  ctx.fillStyle = "rgba(226, 249, 82, 0.02)";
  for (let x = 0; x < width; x += 18) {
    for (let y = 0; y < height; y += 18) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Diagonal ambient glow
  const neonGlow = ctx.createRadialGradient(width - 150, 150, 10, width - 150, 150, 320);
  neonGlow.addColorStop(0, "rgba(226, 249, 82, 0.12)");
  neonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = neonGlow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 3. Card Outer Border (Neon Yellow / Cyber Lime)
  drawRoundedRect(ctx, 3, 3, width - 6, height - 6, 34);
  ctx.lineWidth = isPending ? 3 : 4;
  ctx.strokeStyle = isPending ? "#D97706" : "#E2F952";
  ctx.stroke();

  // 4. Header: FTL Gym Brand
  ctx.save();
  // FTL Brand Emblem
  const emblemX = 50;
  const emblemY = 50;
  drawRoundedRect(ctx, emblemX, emblemY, 52, 52, 14);
  ctx.fillStyle = isPending ? "#F59E0B" : "#E2F952";
  ctx.fill();

  ctx.fillStyle = "#0A0A0A";
  ctx.font = "900 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FTL", emblemX + 26, emblemY + 27);

  // Brand Name & Slogan
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 28px system-ui, sans-serif";
  ctx.fillText("FTL GYM", emblemX + 68, emblemY + 4);

  ctx.fillStyle = isPending ? "#F59E0B" : "#E2F952";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("FASTER THAN LIGHT • OFFICIAL PASS", emblemX + 70, emblemY + 34);

  // Smartcard EMV Chip
  drawSmartCardChip(ctx, 510, 52, 58, 44);

  // VIP Tier Badge on top-right
  const tierX = 600;
  const tierY = 54;
  const tierName =
    member.package_type === "1_year"
      ? "VIP DIAMOND PASS"
      : member.package_type === "6_months"
      ? "VIP GOLD PASS"
      : "SILVER PASS";

  drawRoundedRect(ctx, tierX, tierY, 170, 38, 10);
  ctx.fillStyle = isPending ? "rgba(245, 158, 11, 0.15)" : "rgba(226, 249, 82, 0.15)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isPending ? "#F59E0B" : "#E2F952";
  ctx.stroke();

  ctx.fillStyle = isPending ? "#FBBF24" : "#E2F952";
  ctx.font = "900 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tierName, tierX + 85, tierY + 19);

  ctx.restore();

  // 5. Member Info Fields (Left Column)
  const leftX = 50;
  let cursorY = 145;

  // MEMBER NAME
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("NAMA LENGKAP MEMBER", leftX, cursorY);
  cursorY += 20;

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 32px system-ui, sans-serif";
  ctx.letterSpacing = "0px";
  const displayName = (member.full_name || "MEMBER BARU").toUpperCase();
  ctx.fillText(displayName.length > 22 ? displayName.slice(0, 22) + "..." : displayName, leftX, cursorY);
  cursorY += 46;

  // Two-column layout for Code & Expiry
  // Left: Member Code
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("NOMOR MEMBER", leftX, cursorY);

  // Right: Masa Berlaku
  ctx.fillText("BERLAKU HINGGA", leftX + 270, cursorY);
  cursorY += 20;

  // Code value
  ctx.fillStyle = isPending ? "#F59E0B" : "#E2F952";
  ctx.font = "900 24px monospace, system-ui";
  ctx.fillText(member.member_code, leftX, cursorY);

  // Expiry value
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 19px system-ui, sans-serif";
  ctx.fillText(formatWIBDate(member.expiry_date), leftX + 270, cursorY);
  cursorY += 44;

  // Package Type & Details
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("PAKET MEMBERSHIP & LOKASI", leftX, cursorY);
  cursorY += 19;

  ctx.fillStyle = "#E5E7EB";
  ctx.font = "800 17px system-ui, sans-serif";
  const packageLabel =
    member.package_type === "1_year"
      ? "Paket 1 Tahun (365 Hari) · All Clubs Access"
      : member.package_type === "6_months"
      ? "Paket 6 Bulan (180 Hari) · All Clubs Access"
      : "Paket 1 Bulan (30 Hari) · All Clubs Access";
  ctx.fillText(packageLabel, leftX, cursorY);
  cursorY += 42;

  // Personal Trainer (Coach) if selected
  if (member.selected_coach_name) {
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "800 12px system-ui, sans-serif";
    ctx.letterSpacing = "1.5px";
    ctx.fillText("PERSONAL TRAINER ASSIGNED", leftX, cursorY);
    cursorY += 19;

    ctx.fillStyle = "#FBBF24";
    ctx.font = "900 17px system-ui, sans-serif";
    const coachLabel = `🔥 ${member.selected_coach_name} (${member.selected_coach_sessions || 12} Sesi Eksklusif)`;
    ctx.fillText(coachLabel, leftX, cursorY);
    cursorY += 42;
  }

  // STATUS PILL BADGE
  cursorY += 4;
  const statusBadgeW = 340;
  const statusBadgeH = 38;
  drawRoundedRect(ctx, leftX, cursorY, statusBadgeW, statusBadgeH, 10);
  ctx.fillStyle = isPending ? "rgba(180, 83, 9, 0.3)" : "rgba(16, 185, 129, 0.25)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isPending ? "#F59E0B" : "#10B981";
  ctx.stroke();

  ctx.fillStyle = isPending ? "#FBBF24" : "#34D399";
  ctx.font = "900 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const statusText = isPending
    ? "⏳ MENUNGGU VERIFIKASI WA ADMIN"
    : "✓ OFFICIAL ACTIVE MEMBER • ALL ACCESS";
  ctx.fillText(statusText, leftX + statusBadgeW / 2, cursorY + statusBadgeH / 2);

  // 6. Right Column: Crisp Scannable QR Code Box
  const qrBoxX = 800;
  const qrBoxY = 135;
  const qrBoxSize = 250;

  // Outer container box with neon border
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 85, 20);
  ctx.fillStyle = "#07080A";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isPending ? "#78350F" : "#27272A";
  ctx.stroke();

  // Generate Scannable QR Code Data URL
  const qrDataUrl = await QRCode.toDataURL(member.qr_code_data || `FTL:${member.member_code}`, {
    errorCorrectionLevel: "M",
    width: 220,
    margin: 1,
    color: {
      dark: isPending ? "#D97706" : "#E2F952",
      light: "#07080A",
    },
  });

  // Draw QR Image onto Canvas
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, qrBoxX + 15, qrBoxY + 15, 220, 220);
      resolve();
    };
    img.onerror = () => {
      // Fallback text if image fails to load
      ctx.fillStyle = isPending ? "#F59E0B" : "#E2F952";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(member.member_code, qrBoxX + qrBoxSize / 2, qrBoxY + 120);
      resolve();
    };
    img.src = qrDataUrl;
  });

  // QR Code Subtext
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 12px system-ui, sans-serif";
  ctx.fillText("PINDAI DI MEJA FRONT DESK", qrBoxX + qrBoxSize / 2, qrBoxY + 248);

  ctx.fillStyle = isPending ? "#F59E0B" : "#9CA3AF";
  ctx.font = "800 11px monospace";
  ctx.fillText(member.qr_code_data, qrBoxX + qrBoxSize / 2, qrBoxY + 268);

  if (isPending) {
    ctx.fillStyle = "#F59E0B";
    ctx.font = "900 10px system-ui, sans-serif";
    ctx.fillText("AKAN AKTIF SETELAH DIAIRKAHKAN", qrBoxX + qrBoxSize / 2, qrBoxY + 292);
  } else {
    ctx.fillStyle = "#34D399";
    ctx.font = "900 10px system-ui, sans-serif";
    ctx.fillText("SIAP DIPINDAI / SCAN READY", qrBoxX + qrBoxSize / 2, qrBoxY + 292);
  }

  // 7. Footer Bar
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, height - 70);
  ctx.lineTo(width - 50, height - 70);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#6B7280";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText("PT FTL GYM INDONESIA • CS / ADMIN WHATSAPP: 0895-6018-00302", 50, height - 42);

  ctx.textAlign = "right";
  ctx.fillText("RESMI & BERLAKU DI SELURUH CABANG FTL GYM", width - 50, height - 42);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Downloads the full physical-style gym VIP membership card as PNG
 */
export async function downloadMemberCardPNG(member: Member) {
  try {
    const dataUrl = await renderMemberCardCanvas(member);
    const link = document.createElement("a");
    const cleanName = (member.full_name || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 25);
    link.download = `kartu-member-ftl-${member.member_code}-${cleanName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Failed to generate member card image:", error);
    alert("Gagal mengunduh kartu member. Silakan coba lagi.");
    return false;
  }
}

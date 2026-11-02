"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGymData } from "@/context/GymDataContext";
import { Member, CheckInStatus } from "@/lib/types";
import { soundManager } from "@/components/common/SoundEffects";
import { formatWIBDate, formatWIBTime } from "@/lib/utils";
import jsQR from "jsqr";
import {
  QrCode,
  Camera,
  Keyboard,
  ShieldCheck,
  AlertOctagon,
  Search,
  CheckCircle2,
  XCircle,
  FlipHorizontal,
  RotateCw,
  Hourglass,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function FrontDeskScannerPage() {
  const { checkInMember, checkIns } = useGymData();

  const [inputQuery, setInputQuery] = useState("");
  const [activeScanMode, setActiveScanMode] = useState<"camera" | "manual">("camera");
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [isMirror, setIsMirror] = useState(false); // DEFAULT FALSE: Kamera normal / anti-mirror agar QR terbaca jelas!
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedScanNotice, setDetectedScanNotice] = useState<string | null>(null);

  // Result card state
  const [lastResult, setLastResult] = useState<{
    status: CheckInStatus;
    member?: Member;
    message: string;
    timestamp: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const scanAnimFrameRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string>("");
  const scanCooldownRef = useRef<number>(0);

  // Setup camera stream
  useEffect(() => {
    if (activeScanMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeScanMode, cameraFacing]);

  // Real-time automatic camera QR detection loop via jsQR
  useEffect(() => {
    if (!isCameraActive || activeScanMode !== "camera") return;

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }
        const canvas = canvasRef.current;
        const width = 480;
        const height = Math.floor((video.videoHeight / (video.videoWidth || 1)) * 480) || 480;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          if (isMirror) {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const qrCode = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "dontInvert",
          });

          if (qrCode && qrCode.data) {
            const rawCode = qrCode.data.trim();
            const now = Date.now();
            // 3-second cooldown to avoid continuous duplicate firing on same card
            if (rawCode !== lastScannedCodeRef.current || now - scanCooldownRef.current > 3000) {
              lastScannedCodeRef.current = rawCode;
              scanCooldownRef.current = now;
              setDetectedScanNotice(`QR Terdeteksi: ${rawCode}`);
              setTimeout(() => setDetectedScanNotice(null), 2500);
              handleExecuteCheckIn(rawCode, "qr_scan");
            }
          }
        }
      }

      scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
    };

    scanAnimFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (scanAnimFrameRef.current) {
        cancelAnimationFrame(scanAnimFrameRef.current);
      }
    };
  }, [isCameraActive, activeScanMode, isMirror]);

  // Ensure video element receives stream whenever camera is active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn("Camera auto-play blocked:", err);
      });
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing },
          audio: false,
        });
        streamRef.current = stream;
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError("Browser tidak mendukung WebRTC Camera.");
      }
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError("Kamera tidak dapat diakses atau diblokir izinnya. Gunakan input manual / simulasi.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Hardware Barcode Scanner listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (barcodeBufferRef.current.length > 2) {
          handleExecuteCheckIn(barcodeBufferRef.current, "barcode");
          barcodeBufferRef.current = "";
        }
      } else if (e.key.length === 1) {
        // Fast burst typical of laser barcode scanner
        if (diff > 120) {
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleExecuteCheckIn = (query: string, method: "qr_scan" | "barcode" | "manual_search" = "qr_scan") => {
    if (!query.trim()) return;

    const result = checkInMember(query, method);
    setLastResult({
      status: result.status,
      member: result.member,
      message: result.message,
      timestamp: new Date().toISOString(),
    });

    setInputQuery("");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteCheckIn(inputQuery, "manual_search");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Front Desk Scanner</span>
            <Badge variant="neon" size="sm" className="shadow-neon-sm">
              LIVE SYSTEM
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pindai QR Code kartu member atau ketik No. Member untuk check-in instan dengan validasi audio.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-gym-card p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveScanMode("camera")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeScanMode === "camera"
                ? "bg-neon text-gym-base shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera / Webcam</span>
          </button>
          <button
            onClick={() => setActiveScanMode("manual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeScanMode === "manual"
                ? "bg-neon text-gym-base shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Input Keyboard / USB</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scanner Left + Live Feedback Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Window (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-gym-card border-zinc-800 relative overflow-hidden flex flex-col items-center">
            {/* Camera Viewport */}
            {activeScanMode === "camera" ? (
              <div className="w-full aspect-square bg-black rounded-xl relative overflow-hidden border border-zinc-800 flex items-center justify-center">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: isMirror ? "scaleX(-1)" : "none" }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-xs text-zinc-400">
                    <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-300">Viewport Kamera Scanner</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {cameraError || "Arahkan kamera ke QR Code kartu member..."}
                    </p>
                  </div>
                )}

                {/* Laser Scanning Overlay */}
                <div className="scanner-laser" />

                {/* Crosshair Brackets */}
                <div className="absolute inset-8 border-2 border-neon/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-neon" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-neon" />
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-neon" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-neon" />
                  </div>
                </div>

                {/* Top Status Badges: Camera Orientation & Scan Status */}
                {isCameraActive && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="text-[10px] font-bold bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-neon border border-neon/30">
                      Arah: {isMirror ? "Mode Mirror (Cermin)" : "Normal (Anti-Terbalik)"}
                    </span>
                    <span className="text-[10px] font-bold bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Scanner Aktif</span>
                    </span>
                  </div>
                )}

                {/* Detection Flash Banner */}
                {detectedScanNotice && (
                  <div className="absolute top-12 inset-x-4 bg-neon text-gym-base font-black text-xs py-1.5 px-3 rounded-lg text-center shadow-lg animate-in fade-in slide-in-from-top-2 z-20">
                    {detectedScanNotice}
                  </div>
                )}

                {/* Camera Controls: Mirror Toggle & Flip Facing */}
                {isCameraActive && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => setIsMirror(!isMirror)}
                      title={isMirror ? "Ubah ke Kamera Normal (Tanpa Mirror)" : "Ubah ke Mode Mirror"}
                      className={`p-2 rounded-lg text-xs flex items-center gap-1 shadow-md border transition-colors ${
                        !isMirror
                          ? "bg-neon text-gym-base border-neon font-bold"
                          : "bg-black/70 hover:bg-black text-white border-zinc-700"
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{isMirror ? "Mirror" : "Normal"}</span>
                    </button>

                    <button
                      onClick={toggleCameraFacing}
                      title="Ganti Kamera Depan / Belakang"
                      className="p-2 rounded-lg bg-black/70 hover:bg-black text-white border border-zinc-700 text-xs flex items-center gap-1 shadow-md"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-neon" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Manual Input / Hardware Scanner viewport */
              <div className="w-full aspect-square bg-zinc-950 rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-neon/15 border border-neon/30 flex items-center justify-center text-neon mb-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <div className="text-sm font-extrabold text-white mb-1">Hardware Barcode Scanner Siap</div>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Arahkan pemindai barcode laser USB ke kartu member, atau ketik langsung di form input bawah.
                </p>
              </div>
            )}

            {/* Quick Manual / Test Trigger Bar */}
            <form onSubmit={handleManualSubmit} className="w-full mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik ID Member (FTL-0801) / No HP..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="w-full bg-gym-elevated border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                />
              </div>
              <Button type="submit" variant="neon" size="md" className="shrink-0">
                <span>Check-in</span>
              </Button>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="w-full mt-3 pt-3 border-t border-zinc-800/80">
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-wider text-center">
                Simulasi Uji Coba Cepat:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteCheckIn("FTL-0801", "qr_scan")}
                  className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800 text-left text-xs font-semibold text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">FTL-0801 (Member Aktif)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteCheckIn("FTL-0803", "qr_scan")}
                  className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 text-left text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">FTL-0803 (Expired)</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Flash Status Feedback Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            className={`min-h-[420px] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
              !lastResult
                ? "bg-gym-card border-zinc-800"
                : lastResult.status === "success"
                ? "bg-gradient-to-b from-emerald-950/60 via-gym-card to-gym-base border-2 border-emerald-500 shadow-emerald-900/40 shadow-2xl"
                : lastResult.status === "pending_denied"
                ? "bg-gradient-to-b from-amber-950/60 via-gym-card to-gym-base border-2 border-amber-500 shadow-amber-900/40 shadow-2xl"
                : "bg-gradient-to-b from-rose-950/60 via-gym-card to-gym-base border-2 border-rose-500 shadow-rose-900/40 shadow-2xl"
            }`}
          >
            {!lastResult ? (
              /* Idle Standby Screen */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 mb-4 animate-pulse">
                  <QrCode className="w-8 h-8" />
                </div>
                <div className="text-lg font-bold text-zinc-300 mb-1">Standby Menunggu Pemindaian</div>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Layar ini akan berubah seketika menjadi <span className="text-emerald-400 font-bold">HIJAU</span> jika
                  paket aktif, <span className="text-amber-400 font-bold">KUNING</span> jika belum diapprove admin, atau{" "}
                  <span className="text-rose-400 font-bold">MERAH BEEP</span> jika membership expired.
                </p>
              </div>
            ) : (
              /* Active Feedback Display */
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                {/* Status Banner */}
                <div
                  className={`p-4 rounded-xl flex items-center justify-between font-black text-sm uppercase tracking-wider ${
                    lastResult.status === "success"
                      ? "bg-emerald-500 text-gym-base shadow-emerald-900/40 shadow-lg"
                      : lastResult.status === "pending_denied"
                      ? "bg-amber-500 text-gym-base shadow-amber-900/40 shadow-lg"
                      : "bg-rose-600 text-white shadow-rose-900/40 shadow-lg"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {lastResult.status === "success" ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : lastResult.status === "pending_denied" ? (
                      <Hourglass className="w-6 h-6 animate-spin" />
                    ) : (
                      <AlertOctagon className="w-6 h-6 animate-bounce" />
                    )}
                    <span>
                      {lastResult.status === "success"
                        ? "AKSES DIBERIKAN (BERHASIL)"
                        : lastResult.status === "pending_denied"
                        ? "AKSES DITOLAK: MENUNGGU PERSETUJUAN ADMIN"
                        : "AKSES DITOLAK (EXPIRED / INVALID)"}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold">
                    {formatWIBTime(lastResult.timestamp)}
                  </div>
                </div>

                {/* Member Profile Details */}
                {lastResult.member ? (
                  <div className="bg-gym-elevated/90 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <img
                      src={lastResult.member.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                      alt={lastResult.member.full_name}
                      className={`w-28 h-28 rounded-2xl object-cover ring-4 shrink-0 shadow-lg ${
                        lastResult.status === "success" ? "ring-emerald-500" : "ring-rose-500"
                      }`}
                    />

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div>
                        <div className="text-xs font-mono font-bold text-neon">{lastResult.member.member_code}</div>
                        <div className="text-2xl font-black text-white">{lastResult.member.full_name}</div>
                        <div className="text-xs text-zinc-400">{lastResult.member.phone}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">Jenis Paket</div>
                          <div className="font-bold text-zinc-200 capitalize">
                            {lastResult.member.package_type.replace("_", " ")}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">Masa Berlaku</div>
                          <div
                            className={`font-bold ${
                              lastResult.status === "success" ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {formatWIBDate(lastResult.member.expiry_date)}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400 italic pt-1">
                        "{lastResult.message}"
                      </div>

                      {lastResult.status === "pending_denied" && (
                        <div className="pt-3 flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/62895601800302?text=${encodeURIComponent(
                              `Halo Admin FTL Gym, member ${lastResult.member.full_name} (${lastResult.member.member_code}) berada di Front Desk namun pendaftarannya masih pending approval. Mohon segera dicek.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Konfirmasi WA Admin (0895-6018-00302)</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-rose-300 bg-rose-950/40 rounded-xl border border-rose-800">
                    {lastResult.message}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Controls / Beep Re-test */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Sistem Audio: Web Audio API Active</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => soundManager.playSuccessBeep()}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-emerald-400 font-semibold"
                >
                  Test Suara Hijau
                </button>
                <button
                  onClick={() => soundManager.playErrorBeep()}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-rose-400 font-semibold"
                >
                  Test Suara Merah
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Check-in Log Table of Today */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white">Log Check-in Hari Ini</h2>
            <p className="text-xs text-zinc-400">Riwayat akses member di gerbang Front Desk</p>
          </div>
          <Badge variant="neutral" size="sm">
            Total Hari Ini: {checkIns.length}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gym-elevated/70 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Jam (WIB)</th>
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">Metode Scan</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {checkIns.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-zinc-300">
                    {formatWIBTime(item.check_in_time)}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{item.member_name || "Unknown Member"}</div>
                    <div className="text-[10px] font-mono text-neon">{item.member_code || "-"}</div>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-zinc-400">
                    {item.scan_method.replace("_", " ")}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={item.status === "success" ? "success" : "danger"} size="sm">
                      {item.status === "success" ? "AKSES DIBERIKAN" : "AKSES DITOLAK"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 max-w-xs truncate">
                    {item.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useGymData } from "@/context/GymDataContext";
import { GymClass, ClassBooking } from "@/lib/types";
import { formatDayOfWeek } from "@/lib/utils";
import {
  Users,
  MapPin,
  CheckCircle,
  Plus,
  UserCheck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function ClassesSchedulePage() {
  const { gymClasses, classBookings, members, bookGymClass, checkInClassBooking, cancelClassBooking, currentClub } = useGymData();

  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = Semua Hari
  const [activeManifestClass, setActiveManifestClass] = useState<GymClass | null>(null);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [bookingDate, setBookingDate] = useState("2026-11-02");
  const [bookingMsg, setBookingMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const daysList = [
    { num: 0, label: "Semua Hari" },
    { num: 1, label: "Senin" },
    { num: 2, label: "Selasa" },
    { num: 3, label: "Rabu" },
    { num: 4, label: "Kamis" },
    { num: 5, label: "Jumat" },
    { num: 6, label: "Sabtu" },
    { num: 7, label: "Minggu" },
  ];

  const filteredClasses = gymClasses.filter((c) => {
    if (c.club_id !== currentClub.id) return false;
    if (selectedDay !== 0 && c.day_of_week !== selectedDay) return false;
    return true;
  });

  const handleOpenManifest = (cls: GymClass) => {
    setActiveManifestClass(cls);
    setIsManifestOpen(true);
    setBookingMsg(null);
  };

  const handleBookMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeManifestClass || !selectedMemberId) return;

    const res = bookGymClass(activeManifestClass.id, selectedMemberId, bookingDate);
    if (res.success) {
      setBookingMsg({ type: "success", text: res.message });
      setSelectedMemberId("");
    } else {
      setBookingMsg({ type: "error", text: res.message });
    }
  };

  const activeBookingsForClass = classBookings.filter(
    (b) => activeManifestClass && b.class_id === activeManifestClass.id && b.status !== "cancelled"
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Jadwal Kelas Mingguan (Class Schedule)</span>
            <Badge variant="neutral" size="sm">
              {gymClasses.length} Kelas Aktif
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Penjadwalan kelas grup fitness, limit kuota peserta, dan manifest kehadiran kelas.
          </p>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-gym-card p-2 rounded-xl border border-zinc-800">
        {daysList.map((day) => (
          <button
            key={day.num}
            onClick={() => setSelectedDay(day.num)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              selectedDay === day.num
                ? "bg-neon text-gym-base font-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const bookedCount = cls.booked_count || 0;
          const isFull = bookedCount >= cls.capacity_limit;
          const percentCapacity = Math.round((bookedCount / cls.capacity_limit) * 100);

          return (
            <Card
              key={cls.id}
              className="p-5 flex flex-col justify-between hover:border-zinc-600 transition-all group"
            >
              <div>
                {/* Header row: Day & Category */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-neon tracking-wider">
                    {formatDayOfWeek(cls.day_of_week)} · {cls.start_time} - {cls.end_time} WIB
                  </span>
                  <Badge variant={isFull ? "danger" : "neon"} size="sm">
                    {isFull ? "KELAS PENUH" : cls.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-black text-white mb-1 group-hover:text-neon transition-colors">
                  {cls.name}
                </h3>

                <div className="text-xs text-zinc-400 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Instruktur: <strong className="text-zinc-200">{cls.instructor_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Ruangan: <strong className="text-zinc-200">{cls.room}</strong></span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="bg-gym-elevated/80 border border-zinc-800 rounded-xl p-3 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Kapasitas Peserta:</span>
                    <span className="font-extrabold text-white">
                      {bookedCount} / {cls.capacity_limit} Orang
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentCapacity}%` }}
                      className={`h-full transition-all ${
                        isFull ? "bg-rose-500" : percentCapacity > 80 ? "bg-amber-400" : "bg-neon"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenManifest(cls)}
                  className="w-full font-bold text-xs"
                >
                  <Users className="w-3.5 h-3.5 mr-1 text-neon" />
                  <span>Buka Manifest & Reservasi Peserta</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Manifest & Booking Modal */}
      {activeManifestClass && (
        <Modal
          isOpen={isManifestOpen}
          onClose={() => setIsManifestOpen(false)}
          maxWidth="lg"
          title={`Manifest Kelas: ${activeManifestClass.name}`}
        >
          <div className="space-y-6">
            {/* Class Details summary */}
            <div className="bg-gym-elevated border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-white text-sm">{activeManifestClass.name}</div>
                <div className="text-zinc-400 mt-0.5">
                  {formatDayOfWeek(activeManifestClass.day_of_week)}, {activeManifestClass.start_time} - {activeManifestClass.end_time} WIB · {activeManifestClass.room}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="neon" size="sm">
                  {activeBookingsForClass.length} / {activeManifestClass.capacity_limit} Terisi
                </Badge>
              </div>
            </div>

            {/* Quick Add Member to Manifest Form */}
            <form onSubmit={handleBookMember} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-neon" />
                <span>Tambahkan Member ke Kelas Ini</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-gym-elevated border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neon"
                  >
                    <option value="">-- Pilih Member Terdaftar --</option>
                    {members
                      .filter((m) => m.status === "active" && m.club_id === currentClub.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.member_code}) - {m.package_type}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <Button type="submit" variant="neon" size="sm" className="w-full h-full text-xs">
                    <span>Daftarkan</span>
                  </Button>
                </div>
              </div>

              {bookingMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    bookingMsg.type === "success"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-rose-950 text-rose-300 border border-rose-800"
                  }`}
                >
                  {bookingMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{bookingMsg.text}</span>
                </div>
              )}
            </form>

            {/* Registered Manifest Table */}
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Daftar Peserta Terdaftar ({activeBookingsForClass.length}):
              </div>

              {activeBookingsForClass.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs bg-gym-elevated/40 rounded-xl border border-zinc-800">
                  Belum ada peserta yang mendaftar di kelas ini.
                </div>
              ) : (
                <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gym-elevated text-zinc-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Member</th>
                        <th className="py-2.5 px-3">No. HP</th>
                        <th className="py-2.5 px-3">Status Kehadiran</th>
                        <th className="py-2.5 px-3 text-right">Aksi Front Desk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {activeBookingsForClass.map((booking) => (
                        <tr key={booking.id} className="hover:bg-zinc-800/40">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-white">{booking.member_name}</div>
                            <div className="text-[10px] font-mono text-neon">{booking.member_code}</div>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">{booking.member_phone}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant={booking.status === "attended" ? "success" : "neutral"} size="sm">
                              {booking.status === "attended" ? "HADIR (CHECK-IN)" : "TERDAFTAR"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1.5">
                            {booking.status !== "attended" && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => checkInClassBooking(booking.id)}
                                className="text-[11px] py-1 px-2.5"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                <span>Tandai Hadir</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelClassBooking(booking.id)}
                              className="text-[11px] text-zinc-400 hover:text-rose-400 py-1 px-2"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

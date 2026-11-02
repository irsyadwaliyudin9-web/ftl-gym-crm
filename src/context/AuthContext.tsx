"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, Member } from "@/lib/types";

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isStaffAuthenticated: boolean;
  isMemberAuthenticated: boolean;
  currentMember: Member | null;
  setCurrentMember: (member: Member | null) => void;
  loginStaff: (email: string, pass: string) => { success: boolean; message: string };
  logoutStaff: () => void;
  loginMember: (identifier: string, pass?: string) => { success: boolean; member?: Member; message: string };
  registerMember: (data: { fullName: string; phone: string; email: string; password?: string }) => { success: boolean; member?: Member; message: string };
  logoutMember: () => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

const OFFICIAL_STAFF_USER: UserProfile = {
  id: "user-ftl-staff-official",
  tenant_id: "tenant-ftl",
  club_id: "club-ftl-01",
  full_name: "Staf Resmi FTL Gym",
  email: "ftlgym@gmail.com",
  phone: "+62895601800302",
  role: "club_manager",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  is_active: true,
  created_at: "2026-01-01T08:00:00Z",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setRoleState] = useState<UserRole>("club_manager");
  const [currentUser, setCurrentUser] = useState<UserProfile>(OFFICIAL_STAFF_USER);
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [isMemberAuthenticated, setIsMemberAuthenticated] = useState<boolean>(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Restore staff and member sessions on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const staffSession = localStorage.getItem("ftl_staff_session");
        if (staffSession === "authenticated") {
          setIsStaffAuthenticated(true);
          setIsAuthenticated(true);
          setCurrentUser(OFFICIAL_STAFF_USER);
        }

        const savedMember = localStorage.getItem("ftl_member_session");
        if (savedMember) {
          const parsed = JSON.parse(savedMember);
          if (parsed && parsed.id) {
            setCurrentMember(parsed);
            setIsMemberAuthenticated(true);
          }
        }
      } catch (e) {}
    }
  }, []);

  const loginStaff = (email: string, pass: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanEmail === "ftlgym@gmail.com" && cleanPass === "pataruman12345") {
      setIsStaffAuthenticated(true);
      setIsAuthenticated(true);
      setCurrentUser(OFFICIAL_STAFF_USER);
      setRoleState("club_manager");
      try {
        localStorage.setItem("ftl_staff_session", "authenticated");
      } catch (e) {}
      return { success: true, message: "Login berhasil! Selamat datang di Dashboard Staf FTL Gym." };
    }

    return {
      success: false,
      message: "Email atau kata sandi salah. Hanya staf resmi FTL Gym (ftlgym@gmail.com) yang diizinkan masuk.",
    };
  };

  const logoutStaff = () => {
    setIsStaffAuthenticated(false);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("ftl_staff_session");
    } catch (e) {}
  };

  const loginMember = (identifier: string, pass?: string): { success: boolean; member?: Member; message: string } => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, "");

    // Try finding in localStorage state
    let allMembers: Member[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("fitlead_crm_state");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.members && Array.isArray(parsed.members)) {
            allMembers = parsed.members;
          }
        }
      } catch (e) {}
    }

    // Default fallback demo members if none yet in localStorage
    if (allMembers.length === 0) {
      allMembers = [
        {
          id: "mem-0801",
          tenant_id: "tenant-ftl",
          club_id: "club-ftl-01",
          member_code: "FTL-0801",
          full_name: "Arya Putra Perdana",
          phone: "+628123456001",
          email: "arya.perdana@gmail.com",
          status: "active",
          package_type: "1_year",
          package_price: 2200000,
          start_date: "2026-01-10",
          expiry_date: "2027-01-10",
          qr_code_data: "FTL:FTL-0801:ARYA-PUTRA",
          selected_coach_id: "coach-dian",
          selected_coach_name: "Coach Dian",
          selected_coach_sessions: 12,
          created_at: "2026-01-10T10:00:00Z",
        },
      ];
    }

    const matched = allMembers.find((m) => {
      const mEmail = (m.email || "").trim().toLowerCase();
      const mPhone = m.phone.replace(/[^0-9]/g, "");
      const mCode = m.member_code.trim().toLowerCase();

      if (clean && mEmail === clean) return true;
      if (cleanDigits && mPhone && mPhone.endsWith(cleanDigits)) return true;
      if (clean && mCode === clean) return true;
      return false;
    });

    if (matched) {
      setCurrentMember(matched);
      setIsMemberAuthenticated(true);
      try {
        localStorage.setItem("ftl_member_session", JSON.stringify(matched));
        localStorage.setItem("ftl_portal_member_id", matched.id);
      } catch (e) {}
      return { success: true, member: matched, message: `Selamat datang kembali, ${matched.full_name}!` };
    }

    return {
      success: false,
      message: "Nomor WhatsApp atau Email belum terdaftar di FTL Gym. Silakan klik 'Daftar Member Baru' di atas untuk membuat akun.",
    };
  };

  const registerMember = (data: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
  }): { success: boolean; member?: Member; message: string } => {
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.fullName.trim();

    const newMember: Member = {
      id: "mem-" + Date.now().toString(36),
      tenant_id: "tenant-ironforge",
      club_id: "club-jkt-01",
      club_name: "FTL Gym Jakarta Pusat (Pusat)",
      member_code: "FTL-" + Math.floor(1000 + Math.random() * 9000),
      full_name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      status: "active",
      package_type: "1_month",
      package_price: 250000,
      start_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      qr_code_data: "FTL:" + cleanName.toUpperCase().replace(/\s+/g, "-") + ":" + Date.now(),
      selected_coach_id: "coach-dian",
      selected_coach_name: "Coach Dian",
      selected_coach_sessions: 12,
      created_at: new Date().toISOString(),
      password: data.password,
    };

    setCurrentMember(newMember);
    setIsMemberAuthenticated(true);

    try {
      localStorage.setItem("ftl_member_session", JSON.stringify(newMember));
      localStorage.setItem("ftl_portal_member_id", newMember.id);

      // Append to fitlead_crm_state permanently so it persists in Staff Dashboard
      const raw = localStorage.getItem("fitlead_crm_state");
      const parsed = raw ? JSON.parse(raw) : {};
      if (!Array.isArray(parsed.members)) {
        parsed.members = [];
      }
      parsed.members = [newMember, ...parsed.members.filter((m: Member) => m.id !== newMember.id)];

      // Record financial revenue transaction
      if (!Array.isArray(parsed.transactions)) {
        parsed.transactions = [];
      }
      const regTx = {
        id: `tx-reg-${Date.now()}`,
        member_id: newMember.id,
        member_name: newMember.full_name,
        member_phone: newMember.phone,
        invoice_code: `INV-REG-${Date.now().toString().slice(-6)}`,
        transaction_type: "membership",
        title: "Pendaftaran Member Baru (Paket 1 Bulan)",
        description: `Pemasukan biaya pendaftaran keanggotaan aktif member ${newMember.full_name}`,
        amount: 250000,
        payment_method: "online",
        payment_channel: "transfer_bank",
        status: "paid",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        paid_at: new Date().toISOString(),
        confirmed_by: "Sistem Otomatis FTL",
        details: {
          package_type: "1_month",
        },
      };
      parsed.transactions = [regTx, ...parsed.transactions];

      localStorage.setItem("fitlead_crm_state", JSON.stringify(parsed));

      // Broadcast real-time to Staff Dashboard in other tabs
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({ type: "SYNC_MEMBERS", members: parsed.members, newMember });
        bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: regTx });
        bc.close();
      }
    } catch (e) {}

    return {
      success: true,
      member: newMember,
      message: `Pendaftaran berhasil! Akun Anda aktif dan tercatat resmi di sistem FTL Gym.`,
    };
  };

  const logoutMember = () => {
    setIsMemberAuthenticated(false);
    setCurrentMember(null);
    try {
      localStorage.removeItem("ftl_member_session");
    } catch (e) {}
  };

  const setCurrentRole = (role: UserRole) => {
    setRoleState(role);
  };

  const loginAsRole = (role: UserRole) => {
    setRoleState(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutStaff();
    logoutMember();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        isAuthenticated,
        isStaffAuthenticated,
        isMemberAuthenticated,
        currentMember,
        setCurrentMember,
        loginStaff,
        logoutStaff,
        loginMember,
        registerMember,
        logoutMember,
        loginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

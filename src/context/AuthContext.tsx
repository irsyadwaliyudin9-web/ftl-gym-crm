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
  loginMember: (identifier: string, pass?: string) => Promise<{ success: boolean; member?: Member; message: string; isPendingApproval?: boolean }>;
  registerMember: (data: { fullName: string; phone: string; email: string; password?: string; existingMember?: Member }) => { success: boolean; member?: Member; message: string; isPendingApproval?: boolean };
  logoutMember: () => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

const OFFICIAL_STAFF_USER: UserProfile = {
  id: "user-ftl-staff-official",
  tenant_id: "tenant-ftl",
  club_id: "club-ftl-01",
  full_name: "Staf Resmi One O One Gym",
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
          // Only automatically authenticate if member is fully active/approved
          if (parsed && parsed.id && parsed.status === "active") {
            setCurrentMember(parsed);
            setIsMemberAuthenticated(true);
          }
        }
      } catch (e) {}
    }

    // Sync member status across tabs in real-time when staff approves
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("ftl_gym_sync_v4");
      bc.onmessage = (event) => {
        if (event.data?.type === "SYNC_MEMBERS" && Array.isArray(event.data.members)) {
          setCurrentMember((prev) => {
            if (!prev) return prev;
            const updated = event.data.members.find((m: Member) => m.id === prev.id);
            if (updated) {
              try {
                localStorage.setItem("ftl_member_session", JSON.stringify(updated));
              } catch (e) {}
              return updated;
            }
            return prev;
          });
        }
      };
      return () => bc.close();
    }
  }, []);

  const loginStaff = (email: string, pass: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if ((cleanEmail === "ftlgym@gmail.com" || cleanEmail === "oneoonegym@gmail.com" || cleanEmail === "101gym@gmail.com") && cleanPass === "pataruman12345") {
      setIsStaffAuthenticated(true);
      setIsAuthenticated(true);
      setCurrentUser(OFFICIAL_STAFF_USER);
      setRoleState("club_manager");
      try {
        localStorage.setItem("ftl_staff_session", "authenticated");
      } catch (e) {}
      return { success: true, message: "Login berhasil! Selamat datang di Dashboard Staf One O One Gym." };
    }

    return {
      success: false,
      message: "Email atau kata sandi salah. Hanya staf resmi One O One Gym yang diizinkan masuk.",
    };
  };

  const logoutStaff = () => {
    setIsStaffAuthenticated(false);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("ftl_staff_session");
    } catch (e) {}
  };

  const loginMember = async (
    identifier: string,
    pass?: string
  ): Promise<{ success: boolean; member?: Member; message: string; isPendingApproval?: boolean }> => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, "");

    // 1. Fetch latest state from cloud API (Live Supabase & Restful Cloud)
    let cloudMembers: Member[] = [];
    try {
      const res = await fetch("/api/cloud-sync", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members)) {
          cloudMembers = data.members;
        }
      }
    } catch (err) {
      console.warn("Live cloud sync fetch before login failed:", err);
    }

    // 2. Read local state from both v4 and legacy keys
    let localMembers: Member[] = [];
    if (typeof window !== "undefined") {
      try {
        const v4 = localStorage.getItem("fitlead_crm_state_v4");
        const raw = v4 || localStorage.getItem("fitlead_crm_state");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.members)) {
            localMembers = parsed.members;
          }
        }
      } catch (e) {}
    }

    // 3. Merge members: Cloud status takes absolute precedence over stale local state!
    const memberMap = new Map<string, Member>();
    // First local
    localMembers.forEach((m) => {
      memberMap.set(m.id, m);
      const p = (m.phone || "").replace(/[^0-9]/g, "");
      if (p) memberMap.set(`p:${p}`, m);
      const e = (m.email || "").toLowerCase().trim();
      if (e) memberMap.set(`e:${e}`, m);
    });
    // Then cloud (updates status to active if approved by staff)
    cloudMembers.forEach((cm) => {
      const p = (cm.phone || "").replace(/[^0-9]/g, "");
      const e = (cm.email || "").toLowerCase().trim();
      const existing = memberMap.get(cm.id) || (p ? memberMap.get(`p:${p}`) : null) || (e ? memberMap.get(`e:${e}`) : null);
      const merged = existing ? { ...existing, ...cm } : cm;

      memberMap.set(cm.id, merged);
      if (p) memberMap.set(`p:${p}`, merged);
      if (e) memberMap.set(`e:${e}`, merged);
    });

    let allMembers = Array.from(new Set(memberMap.values()));

    // Fallback demo members if completely empty
    if (allMembers.length === 0) {
      allMembers = [
        {
          id: "mem-0801",
          tenant_id: "tenant-ftl",
          club_id: "club-ftl-01",
          member_code: "101-0801",
          full_name: "Arya Putra Perdana",
          phone: "+628123456001",
          email: "arya.perdana@gmail.com",
          status: "active",
          package_type: "1_year",
          package_price: 2200000,
          start_date: "2026-01-10",
          expiry_date: "2027-01-10",
          qr_code_data: "101:101-0801:ARYA-PUTRA",
          selected_coach_id: "coach-dian",
          selected_coach_name: "Coach Dian",
          selected_coach_sessions: 12,
          created_at: "2026-01-10T10:00:00Z",
        },
      ];
    }

    // Persist refreshed state to localStorage
    if (typeof window !== "undefined" && allMembers.length > 0) {
      try {
        const updateStore = (key: string) => {
          const existing = localStorage.getItem(key);
          const parsed = existing ? JSON.parse(existing) : {};
          parsed.members = allMembers;
          localStorage.setItem(key, JSON.stringify(parsed));
        };
        updateStore("fitlead_crm_state_v4");
        updateStore("fitlead_crm_state");
      } catch (e) {}
    }

    // 4. Find matching member
    const matched = allMembers.find((m) => {
      const mEmail = (m.email || "").trim().toLowerCase();
      const mPhone = (m.phone || "").replace(/[^0-9]/g, "");
      const mCode = (m.member_code || "").trim().toLowerCase();
      const mCodeClean = mCode.replace(/[^a-z0-9]/g, "");
      const mName = (m.full_name || "").trim().toLowerCase();

      // Check Email
      if (clean && mEmail && mEmail === clean) return true;

      // Check Member Code (e.g. "101-0818" or "1010818")
      if (clean && mCode && (mCode === clean || (mCodeClean && mCodeClean === clean.replace(/[^a-z0-9]/g, "")))) return true;

      // Check Phone Number: ONLY if input has 8 or more digits to avoid single digit false positives!
      if (cleanDigits.length >= 8 && mPhone) {
        if (mPhone === cleanDigits || mPhone.endsWith(cleanDigits.slice(-8)) || cleanDigits.endsWith(mPhone.slice(-8))) {
          return true;
        }
      }

      // Check Full Name
      if (clean.length >= 3 && mName && mName === clean) return true;

      return false;
    });

    if (matched) {
      const isPending = matched.status === "pending_approval" || matched.payment_proof_status === "pending";

      // If pending, BLOCK login to member dashboard
      if (isPending) {
        return {
          success: false,
          isPendingApproval: true,
          member: matched,
          message: `Akun Anda (${matched.full_name}) masih dalam status MENUNGGU PERSETUJUAN (Approval) oleh staf admin Front Desk One O One Gym Garut Kota. Anda baru dapat masuk ke dashboard setelah akun disetujui staf. Silakan hubungi WhatsApp Admin 0895-6018-00302 untuk aktivasi cepat.`,
        };
      }

      // If active, permit login
      setCurrentMember(matched);
      setIsMemberAuthenticated(true);
      try {
        localStorage.setItem("ftl_member_session", JSON.stringify(matched));
        localStorage.setItem("ftl_portal_member_id", matched.id);
      } catch (e) {}

      return {
        success: true,
        member: matched,
        message: `Selamat datang kembali, ${matched.full_name}!`,
      };
    }

    return {
      success: false,
      message: "Nomor WhatsApp atau Email belum terdaftar di One O One Gym. Silakan klik 'Daftar Member Baru' di atas untuk membuat akun.",
    };
  };

  const registerMember = (data: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    existingMember?: Member;
  }): { success: boolean; member?: Member; message: string; isPendingApproval?: boolean } => {
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.fullName.trim();

    const newMember: Member = data.existingMember || {
      id: "mem-" + Date.now().toString(36),
      tenant_id: "tenant-ftl",
      club_id: "club-ftl-01",
      club_name: "One O One Gym Garut Kota (Pusat)",
      member_code: "101-" + Math.floor(1000 + Math.random() * 9000),
      full_name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      status: "pending_approval",
      package_type: "1_month",
      payment_proof_status: "pending",
      package_price: 250000,
      start_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      qr_code_data: "101:" + cleanName.toUpperCase().replace(/\s+/g, "-") + ":" + Date.now(),
      selected_coach_id: undefined,
      selected_coach_name: undefined,
      selected_coach_sessions: 0,
      pt_sessions_remaining: 0,
      pt_sessions_used: 0,
      created_at: new Date().toISOString(),
      password: data.password,
    };

    // Do NOT automatically log in member until staff approves
    setCurrentMember(null);
    setIsMemberAuthenticated(false);

    try {
      localStorage.setItem("ftl_pending_registration", JSON.stringify(newMember));
      localStorage.setItem("ftl_portal_member_id", newMember.id);

      // Helper to update state in both v4 and legacy keys
      const updateStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : {};
        if (!Array.isArray(parsed.members)) {
          parsed.members = [];
        }
        parsed.members = [newMember, ...parsed.members.filter((m: Member) => m.id !== newMember.id)];

        if (!Array.isArray(parsed.transactions)) {
          parsed.transactions = [];
        }
        const regTx = {
          id: `tx-reg-${Date.now()}`,
          member_id: newMember.id,
          member_name: newMember.full_name,
          member_phone: newMember.phone,
          invoice_code: `INV-101-${Date.now().toString().slice(-6)}`,
          transaction_type: "membership",
          title: "Pendaftaran Member Baru One O One Gym (Menunggu Approval)",
          description: `Pendaftaran baru ${newMember.full_name}. Menunggu verifikasi & persetujuan staf front desk One O One Gym Garut Kota.`,
          amount: 250000,
          payment_method: "tunai",
          payment_channel: "frontdesk_cash",
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          confirmed_by: undefined,
          details: {
            package_type: "1_month",
          },
        };
        parsed.transactions = [regTx, ...parsed.transactions];
        localStorage.setItem(key, JSON.stringify(parsed));
        return { members: parsed.members, transaction: regTx };
      };

      const resV4 = updateStorage("fitlead_crm_state_v4");
      updateStorage("fitlead_crm_state");

      // Broadcast real-time to Staff Dashboard in other tabs
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("ftl_gym_sync_v4");
        bc.postMessage({
          type: "SYNC_MEMBERS",
          members: resV4.members,
          newMember,
          isNewRegistration: true,
        });
        bc.postMessage({ type: "SYNC_TRANSACTIONS", transaction: resV4.transaction });
        bc.close();
      }

      // Sync across all devices via Next.js Cloud Sync API
      if (typeof window !== "undefined") {
        fetch("/api/cloud-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            member: newMember,
            transaction: resV4.transaction,
          }),
        }).catch(() => {});
      }
    } catch (e) {}

    return {
      success: true,
      member: newMember,
      isPendingApproval: true,
      message: `Pendaftaran berhasil! Akun Anda (${newMember.full_name}) sedang dalam antrean verifikasi & persetujuan (Approval) staf admin One O One Gym Garut Kota. Anda dapat login setelah disetujui staf.`,
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

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/lib/types";

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isStaffAuthenticated: boolean;
  loginStaff: (email: string, pass: string) => { success: boolean; message: string };
  logoutStaff: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Restore staff session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const staffSession = localStorage.getItem("ftl_staff_session");
        if (staffSession === "authenticated") {
          setIsStaffAuthenticated(true);
          setIsAuthenticated(true);
          setCurrentUser(OFFICIAL_STAFF_USER);
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

  const setCurrentRole = (role: UserRole) => {
    setRoleState(role);
  };

  const loginAsRole = (role: UserRole) => {
    setRoleState(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutStaff();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        isAuthenticated,
        isStaffAuthenticated,
        loginStaff,
        logoutStaff,
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

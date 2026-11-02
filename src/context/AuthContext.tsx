"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/lib/types";

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  club_manager: {
    id: "user-mgr-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Bambang Prakoso",
    email: "bambang.mgr@ironforge.co.id",
    phone: "+628128888001",
    role: "club_manager",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-15T08:00:00Z",
  },
  front_desk: {
    id: "user-fd-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Rina Anggraini",
    email: "rina.reception@ironforge.co.id",
    phone: "+6281399887766",
    role: "front_desk",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-16T08:00:00Z",
  },
  personal_trainer: {
    id: "user-pt-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Coach Denny Santoso",
    email: "denny.pt@ironforge.co.id",
    phone: "+628117766554",
    role: "personal_trainer",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-16T08:00:00Z",
  },
  sales: {
    id: "user-sales-01",
    tenant_id: "tenant-ironforge",
    club_id: "club-jkt-01",
    full_name: "Kevin Wijaya",
    email: "kevin.sales@ironforge.co.id",
    phone: "+628156677889",
    role: "sales",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-02-01T08:00:00Z",
  },
  superadmin: {
    id: "user-superadmin",
    full_name: "Superadmin FitLead FTL",
    email: "superadmin@fitleadcrm.com",
    phone: "+6281100009999",
    role: "superadmin",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setRoleState] = useState<UserRole>("club_manager");
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS.club_manager);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("fitlead_active_role") as UserRole;
      if (savedRole && DEFAULT_USERS[savedRole]) {
        setRoleState(savedRole);
        setCurrentUser(DEFAULT_USERS[savedRole]);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const setCurrentRole = (role: UserRole) => {
    setRoleState(role);
    setCurrentUser(DEFAULT_USERS[role]);
    try {
      localStorage.setItem("fitlead_active_role", role);
    } catch (e) {}
  };

  const loginAsRole = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        isAuthenticated,
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

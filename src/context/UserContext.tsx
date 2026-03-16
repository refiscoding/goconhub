"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface VendorProfile {
  id: string;
  bio: string;
  category: string;
  skills: string[];
  location: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  verified: boolean;
  entityType: string;
  companyName: string;
  companyRegNumber: string;
  idDocumentUrl: string;
  cipaDocumentUrl: string;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  role: "customer" | "vendor" | "admin";
  status: "active" | "pending" | "suspended";
  firstName: string;
  lastName: string;
  city: string | null;
  area: string | null;
  preferredServices: string[];
  avatarUrl: string | null;
  createdAt: string;
  vendor: VendorProfile | null;
}

interface UserContextValue {
  user:    AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout:  () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null, loading: true,
  refresh: async () => {}, logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

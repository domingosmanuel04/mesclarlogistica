"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export type DemoRole = "CUSTOMER" | "SELLER" | "ADMIN";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  registrationNumber?: string | null;
  phone?: string;
  whatsapp?: string;
  role: DemoRole;
  photoUrl?: string | null;
}

interface AuthContextValue {
  user: DemoUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    password: string;
    role?: DemoRole;
  }) => Promise<{ ok: boolean; error?: string; registrationNumber?: string }>;
  becomeSeller: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      const d = await fetch("/api/account").then((r) => r.json()).catch(() => null);
      if (d?.photoUrl) setPhotoUrl(d.photoUrl);
    }
  }, [session?.user]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const user: DemoUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        registrationNumber: (session.user as { registrationNumber?: string | null }).registrationNumber ?? null,
        role: session.user.role as DemoRole,
        photoUrl,
      }
    : null;

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const res = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });
      if (res?.error) {
        return { ok: false, error: "ID de registo ou palavra-passe incorrectos." };
      }
      return { ok: true };
    } catch (err: any) {
      console.warn("[AuthContext:login]", err);
      const errMsg = String(err?.message || err?.type || err || "");
      if (
        errMsg.includes("CredentialsSignin") ||
        errMsg.includes("Credentials") ||
        (errMsg.includes("CallbackRouteError") && errMsg.includes("credentials"))
      ) {
        return { ok: false, error: "ID de registo ou palavra-passe incorrectos." };
      }
      return { ok: true };
    }
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      whatsapp?: string;
      password: string;
      role?: DemoRole;
    }) => {
      try {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await r.json().catch(() => ({}));
        if (!r.ok) {
          return { ok: false, error: (json.error as string) || "Erro ao registar." };
        }
        try {
          await signIn("credentials", {
            email: json.registrationNumber || data.email,
            password: data.password,
            redirect: false,
          });
        } catch (err) {
          console.error("[register:auto-login-error]", err);
        }
        return { ok: true, registrationNumber: json.registrationNumber };
      } catch {
        return { ok: false, error: "Erro ao comunicar com o servidor. Tente novamente." };
      }
    },
    []
  );

  const becomeSeller = useCallback(async () => {
    await fetch("/api/seller/become", { method: "POST" });
    await update();
  }, [update]);

  const logout = useCallback(() => {
    void signOut({ callbackUrl: "/" });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading: status === "loading",
      login,
      register,
      becomeSeller,
      logout,
      refreshProfile,
    }),
    [user, status, login, register, becomeSeller, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

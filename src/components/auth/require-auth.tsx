"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function RequireAuth({
  children,
  message = "Crie uma conta ou entre para continuar.",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/entrar?redirect=${encodeURIComponent(pathname)}&msg=${encodeURIComponent(message)}`);
    }
  }, [isAuthenticated, loading, router, pathname, message]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-mesclar-muted">
        A verificar sessão...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}

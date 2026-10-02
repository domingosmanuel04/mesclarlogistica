"use client";

import { RequireAuth } from "@/components/auth/require-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth message="Acesso administrativo requer autenticação.">
      {children}
    </RequireAuth>
  );
}

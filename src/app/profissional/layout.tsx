"use client";

import { RequireAuth } from "@/components/auth/require-auth";

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth message="Entre na sua conta para aceder à área profissional.">
      {children}
    </RequireAuth>
  );
}

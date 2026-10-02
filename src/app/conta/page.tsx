"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profissional");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-mesclar-muted">A redireccionar para o painel profissional...</p>
    </div>
  );
}

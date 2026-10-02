"use client";

import Link from "next/link";
import {
  DashboardShell,
  sellerNav,
  PanelCard,
} from "@/components/dashboard/dashboard-shell";
import { SellerBooksPanel } from "@/components/dashboard/panel-data";

export default function SellerBooksPage() {
  return (
    <DashboardShell
      title="Meus livros"
      subtitle="Livros publicados, pendentes e rejeitados"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <PanelCard title="Catálogo">
        <SellerBooksPanel />
      </PanelCard>
      <p className="text-sm text-mesclar-muted">
        Precisa de publicar?{" "}
        <Link href="/profissional/adicionar-livro" className="font-semibold text-mesclar-gold-dark underline">
          Ir para Publicar livro
        </Link>
      </p>
    </DashboardShell>
  );
}

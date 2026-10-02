"use client";

import Link from "next/link";
import {
  DashboardShell,
  adminNav,
  PanelCard,
} from "@/components/dashboard/dashboard-shell";
import { DashboardFeaturedCard } from "@/components/dashboard/dashboard-featured-card";
import { Button } from "@/components/ui/button";
import { AdminOverview } from "@/components/dashboard/panel-data";
import { ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      title="Painel Administrativo"
      subtitle="Visão global da plataforma Mesclar"
      nav={adminNav}
      roleLabel="Administração"
      rightSidebar={
        <DashboardFeaturedCard
          badge="Gestão do Catálogo"
          title="Manual de Procurement e Compras"
          author="Equipa Técnica Mesclar"
          coverUrl="/covers/supply-chain.jpg"
          rating={5.0}
          stats={[
            { label: "Módulos", value: "12" },
            { label: "Artigos", value: "48" },
            { label: "Profissionais", value: "25+" },
          ]}
          description="Controle o fluxo editorial, aprovação de obras, liquidações e parâmetros do ecossistema Mesclar."
          actionText="Gerir Livros"
          actionHref="/admin/livros"
        />
      }
    >
      <AdminOverview />
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard
          title="Ações rápidas"
          action={
            <Link href="/admin/livros-pendentes">
              <Button variant="ghost" size="sm" rightIcon={ArrowRight}>
                Pendentes
              </Button>
            </Link>
          }
        >
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/livros-pendentes">
              <Button variant="gold" size="sm">
                Aprovar livros
              </Button>
            </Link>
            <Link href="/admin/pagamentos">
              <Button variant="secondary" size="sm">
                Pagamentos
              </Button>
            </Link>
            <Link href="/admin/artigos">
              <Button variant="secondary" size="sm">
                Artigos
              </Button>
            </Link>
            <Link href="/admin/formacoes">
              <Button variant="secondary" size="sm">
                Formações
              </Button>
            </Link>
            <Link href="/admin/vagas">
              <Button variant="secondary" size="sm">
                Vagas
              </Button>
            </Link>
            <Link href="/admin/categorias">
              <Button variant="secondary" size="sm">
                Categorias
              </Button>
            </Link>
          </div>
        </PanelCard>
        <PanelCard title="Pedidos">
          <Link href="/admin/pedidos">
            <Button variant="outline" size="sm">
              Ver todos os pedidos
            </Button>
          </Link>
        </PanelCard>
      </div>
    </DashboardShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  DashboardShell,
  sellerNav,
  StatCard,
  PanelCard,
} from "@/components/dashboard/dashboard-shell";
import { DashboardFeaturedCard } from "@/components/dashboard/dashboard-featured-card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  TrendingUp,
  Wallet,
  Library,
  Clock,
  FileCheck,
  PlusCircle,
  ArrowRight,
  BookPlus,
  PenTool,
  FileText,
  UserCheck,
  UserCog,
  GraduationCap,
  ClipboardList,
  ShoppingBag,
} from "lucide-react";

type Stats = {
  books: number;
  published: number;
  pending: number;
  sales: number;
  received: number;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt?: string;
  items: { book: { title: string } }[];
};

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [articlesCount, setArticlesCount] = useState<number | null>(null);

  useEffect(() => {
    void fetch("/api/seller/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setStats(d.stats);
      });

    void fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d.slice(0, 5) : []));

    void fetch("/api/seller/articles")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setArticlesCount(d.length);
      })
      .catch(() => {});
  }, []);

  const pendingProofs = orders.filter(
    (o) => o.status === "PROOF_SENT" || o.status === "PAYMENT_UNDER_REVIEW"
  ).length;

  function renderStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "PICKED_UP":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Concluído
          </span>
        );
      case "PAYMENT_APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            Pago
          </span>
        );
      case "PROOF_SENT":
      case "PAYMENT_UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            Comprovativo em análise
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-mesclar-cream px-2.5 py-1 text-xs font-bold text-mesclar-gold-dark border border-mesclar-gold/30">
            {status}
          </span>
        );
    }
  }

  return (
    <DashboardShell
      title="Meu Painel"
      subtitle="Publique livros, escreva artigos e acompanhe suas publicações e vendas"
      nav={sellerNav}
      roleLabel={user?.name ? `Olá, ${user.name}` : "Olá"}
      rightSidebar={
        <DashboardFeaturedCard
          badge="Destaque da Plataforma"
          title="Gestão de Cadeia de Abastecimento"
          author="Mesclar Editorial"
          coverUrl="/covers/supply-chain.jpg"
          rating={4.9}
          description="Acompanhe o desempenho das suas obras e lance novos materiais formativos para o mercado angolano."
          actionText="Publicar Novo Livro"
          actionHref="/profissional/adicionar-livro"
        />
      }
    >
      {/* Banner Principal com CTAs de Ação Rápida */}
      <div className="relative overflow-hidden rounded-3xl border border-mesclar-gold/30 bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black dark:!bg-[#0A192F] dark:!bg-none dark:from-[#0A192F] dark:via-[#0A192F] dark:to-[#0A192F] dark:border-[#1e3a5f] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mesclar-gold/15 blur-3xl dark:opacity-0" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-40 w-40 rounded-full bg-mesclar-gold/10 blur-2xl dark:opacity-0" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mesclar-gold-light backdrop-blur-sm">
              Gestão de Conteúdos e Publicações
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Ambiente de trabalho
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Partilhe o seu conhecimento em logística. Publique livros digitais ou físicos (gratuitos ou pagos), redija artigos especializados e faça a gestão das suas encomendas.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link href="/profissional/adicionar-livro">
              <Button variant="gold" size="lg" leftIcon={BookPlus} className="shadow-lg shadow-mesclar-gold/20">
                Publicar Livro
              </Button>
            </Link>
            <Link href="/profissional/artigos/novo">
              <Button
                variant="outline"
                size="lg"
                leftIcon={PenTool}
                className="border-white/30 text-white hover:bg-white hover:text-mesclar-black"
              >
                Escrever Artigo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total de vendas"
          value={String(stats?.sales ?? "0")}
          hint="Exemplares adquiridos"
          icon={TrendingUp}
        />
        <StatCard
          label="Total recebido"
          value={stats ? formatPrice(stats.received) : "0 Kz"}
          hint="Valores libertados"
          icon={Wallet}
        />
        <StatCard
          label="Livros publicados"
          value={String(stats?.published ?? "0")}
          hint="Disponíveis na plataforma"
          icon={Library}
        />
        <StatCard
          label="Artigos publicados"
          value={articlesCount !== null ? String(articlesCount) : "—"}
          hint="Análises técnicas no site"
          icon={FileText}
        />
        <StatCard
          label="Pendentes de moderação"
          value={String(stats?.pending ?? "0")}
          hint="Em análise pela equipa"
          icon={Clock}
        />
        <StatCard
          label="Comprovativos a validar"
          value={String(pendingProofs)}
          hint="Requerem confirmação"
          icon={FileCheck}
        />
      </div>

      {/* Atalhos Rápidos */}
      <PanelCard
        title="Atalhos Rápidos"
        action={
          <Link href="/profissional/adicionar-livro">
            <Button variant="gold" size="sm" leftIcon={PlusCircle}>
              Novo Livro
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Link
            href="/profissional/adicionar-livro"
            className="group flex flex-col items-center justify-center rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/50 hover:bg-[#FAFBFD] dark:hover:bg-[#0E223F] shadow-sm hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] dark:bg-[#0E223F] text-mesclar-black dark:text-white shadow-xs group-hover:scale-105 group-hover:text-mesclar-gold-dark dark:group-hover:text-mesclar-gold-light transition-all">
              <BookPlus className="h-5 w-5 drop-shadow-xs" />
            </span>
            <span className="mt-2.5 text-xs font-bold text-mesclar-black dark:text-white">Publicar Livro</span>
            <span className="text-[10px] text-mesclar-muted dark:text-gray-300">Gratuito ou pago</span>
          </Link>

          <Link
            href="/profissional/artigos/novo"
            className="group flex flex-col items-center justify-center rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/50 hover:bg-[#FAFBFD] dark:hover:bg-[#0E223F] shadow-sm hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] dark:bg-[#0E223F] text-mesclar-black dark:text-white shadow-xs group-hover:scale-105 group-hover:text-mesclar-gold-dark dark:group-hover:text-mesclar-gold-light transition-all">
              <PenTool className="h-5 w-5 drop-shadow-xs" />
            </span>
            <span className="mt-2.5 text-xs font-bold text-mesclar-black dark:text-white">Escrever Artigo</span>
            <span className="text-[10px] text-mesclar-muted dark:text-gray-300">Publicar no blog</span>
          </Link>

          <Link
            href="/profissional/livros"
            className="group flex flex-col items-center justify-center rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/50 hover:bg-[#FAFBFD] dark:hover:bg-[#0E223F] shadow-sm hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] dark:bg-[#0E223F] text-mesclar-black dark:text-white shadow-xs group-hover:scale-105 group-hover:text-mesclar-gold-dark dark:group-hover:text-mesclar-gold-light transition-all">
              <Library className="h-5 w-5 drop-shadow-xs" />
            </span>
            <span className="mt-2.5 text-xs font-bold text-mesclar-black dark:text-white">Meus Livros</span>
            <span className="text-[10px] text-mesclar-muted dark:text-gray-300">Catálogo pessoal</span>
          </Link>

          <Link
            href="/profissional/perfil"
            className="group flex flex-col items-center justify-center rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/50 hover:bg-[#FAFBFD] dark:hover:bg-[#0E223F] shadow-sm hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] dark:bg-[#0E223F] text-mesclar-black dark:text-white shadow-xs group-hover:scale-105 group-hover:text-mesclar-gold-dark dark:group-hover:text-mesclar-gold-light transition-all">
              <UserCog className="h-5 w-5 drop-shadow-xs" />
            </span>
            <span className="mt-2.5 text-xs font-bold text-mesclar-black dark:text-white">Editar Perfil</span>
            <span className="text-[10px] text-mesclar-muted dark:text-gray-300">Nome, senha e foto</span>
          </Link>

          <Link
            href="/profissional/perfil-profissional"
            className="group flex flex-col items-center justify-center rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/50 hover:bg-[#FAFBFD] dark:hover:bg-[#0E223F] shadow-sm hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] dark:bg-[#0E223F] text-mesclar-black dark:text-white shadow-xs group-hover:scale-105 group-hover:text-mesclar-gold-dark dark:group-hover:text-mesclar-gold-light transition-all">
              <UserCheck className="h-5 w-5 drop-shadow-xs" />
            </span>
            <span className="mt-2.5 text-xs font-bold text-mesclar-black dark:text-white">Perfil e CV</span>
            <span className="text-[10px] text-mesclar-muted dark:text-gray-300">Ficha profissional</span>
          </Link>
        </div>
      </PanelCard>

      {/* Pedidos Recentes */}
      <PanelCard
        title="Pedidos Recentes"
        action={
          <Link href="/profissional/pedidos">
            <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-mesclar-muted dark:text-gray-300 hover:text-mesclar-black dark:hover:text-white">
              Ver todos os pedidos
            </Button>
          </Link>
        }
      >
        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mesclar-cream dark:bg-[#192338] text-mesclar-gold-dark dark:text-mesclar-gold">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-mesclar-black dark:text-white">Ainda sem pedidos recebidos</p>
            <p className="mt-1 text-xs text-mesclar-muted dark:text-gray-400 max-w-sm mx-auto">
              Quando os leitores adquirirem os seus livros ou descarregarem as suas publicações, os registos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-mesclar-muted dark:text-gray-400 border-b border-mesclar-border/80 dark:border-[#1d263b] pb-3">
                <tr>
                  <th className="pb-3 font-semibold">Nº Pedido</th>
                  <th className="pb-3 font-semibold">Livro / Publicação</th>
                  <th className="pb-3 font-semibold">Valor Total</th>
                  <th className="pb-3 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mesclar-border/70 dark:divide-[#1d263b]">
                {orders.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-mesclar-cream/20 dark:hover:bg-white/5">
                    <td className="py-3.5 font-bold text-mesclar-black dark:text-white">{r.orderNumber}</td>
                    <td className="py-3.5 font-medium text-mesclar-muted dark:text-gray-300">
                      {r.items.map((i) => i.book.title).join(", ") || "—"}
                    </td>
                    <td className="py-3.5 font-bold text-mesclar-black dark:text-white">{formatPrice(r.total)}</td>
                    <td className="py-3.5 text-right">{renderStatusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>
    </DashboardShell>
  );
}

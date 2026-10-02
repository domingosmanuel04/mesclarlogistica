"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Building2,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: { book: { title: string }; quantity: number }[];
}

export function SellerFinanceView() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  useEffect(() => {
    void fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const completedOrders = orders.filter(
    (o) =>
      o.status === "PAYMENT_APPROVED" ||
      o.status === "COMPLETED" ||
      o.status === "DELIVERED" ||
      o.status === "PICKED_UP"
  );

  const grossSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const platformFee = Math.round(grossSales * 0.15); // 15% platform commission
  const netEarnings = grossSales - platformFee; // 85% to seller
  const pendingOrdersValue = orders
    .filter((o) => o.status === "PROOF_SENT" || o.status === "PAYMENT_UNDER_REVIEW")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    if (netEarnings <= 0) return;
    setPayoutRequested(true);
    setTimeout(() => {
      setPayoutRequested(false);
    }, 5000);
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface-card h-28 p-5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Sales */}
        <div className="surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mesclar-gold/10 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Vendas Brutas
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-mesclar-black">
                {formatPrice(grossSales)}
              </p>
              <p className="mt-1 text-xs text-mesclar-muted">
                {completedOrders.length} {completedOrders.length === 1 ? "venda paga" : "vendas pagas"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black to-mesclar-gray text-mesclar-gold shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Platform Fee */}
        <div className="surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Comissão Mesclar (15%)
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-amber-700">
                {formatPrice(platformFee)}
              </p>
              <p className="mt-1 text-xs text-mesclar-muted">
                Taxa de serviço e infraestrutura
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
              <Percent className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Net Earnings */}
        <div className="surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Receita Líquida (85%)
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-emerald-700">
                {formatPrice(netEarnings)}
              </p>
              <p className="mt-1 text-xs text-emerald-700 font-semibold">
                Lucro real do autor
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Em Validação
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-mesclar-black">
                {formatPrice(pendingOrdersValue)}
              </p>
              <p className="mt-1 text-xs text-mesclar-muted">
                Aguardando comprovativo
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Payout Action Card */}
      <div className="surface-card overflow-hidden p-6 bg-gradient-to-r from-mesclar-cream/30 via-white to-mesclar-cream/20 dark:from-[#0A192F] dark:via-[#0A192F] dark:to-[#0E223F] dark:border-[#1e3a5f]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-mesclar-black dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-mesclar-gold-dark" />
              Solicitação de Levantamento (Transferência)
            </h3>
            <p className="mt-1 text-xs text-mesclar-muted dark:text-slate-400 max-w-xl">
              O montante solicitado será transferido para as coordenadas bancárias (IBAN) cadastradas no seu perfil em até 24h a 48h úteis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              disabled={netEarnings <= 0 || payoutRequested}
              onClick={handleRequestPayout}
              leftIcon={ArrowUpRight}
            >
              {payoutRequested ? "Solicitação Registada!" : "Solicitar Transferência"}
            </Button>
          </div>
        </div>

        {payoutRequested && (
          <div className="mt-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>
              Pedido de levantamento de {formatPrice(netEarnings)} enviado à equipa financeira da Mesclar. Notificaremos por email assim que a TED/ordem de pagamento for liquidada.
            </span>
          </div>
        )}
      </div>

      {/* Transactions Breakdown Table */}
      <div className="surface-card overflow-hidden dark:bg-[#0A192F] dark:border-[#1e3a5f]">
        <div className="border-b border-mesclar-border/80 dark:border-[#1e3a5f] px-6 py-4 flex items-center justify-between">
          <h3 className="font-extrabold text-mesclar-black dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-mesclar-gold-dark" />
            Extrato de Vendas e Divisão de Comissões
          </h3>
          <a href="/api/reports/csv">
            <Button variant="secondary" size="sm">
              Exportar CSV
            </Button>
          </a>
        </div>

        {completedOrders.length === 0 ? (
          <div className="p-12 text-center text-sm text-mesclar-muted dark:text-slate-400">
            Ainda não há vendas finalizadas registadas para este profissional.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mesclar-cream/50 dark:bg-[#0E223F] text-[10px] font-bold uppercase tracking-wider text-mesclar-muted dark:text-slate-300 border-b border-mesclar-border/60 dark:border-[#1e3a5f]">
                <tr>
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-6 py-3">Conteúdo</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3 text-right">Valor Bruto</th>
                  <th className="px-6 py-3 text-right">Mesclar (15%)</th>
                  <th className="px-6 py-3 text-right text-emerald-700">Líquido (85%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mesclar-border/40 font-medium">
                {completedOrders.map((order) => {
                  const fee = Math.round(order.total * 0.15);
                  const net = order.total - fee;
                  const date = new Date(order.createdAt).toLocaleDateString("pt-AO");

                  return (
                    <tr key={order.id} className="hover:bg-mesclar-gold/5 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-mesclar-black">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-3.5 max-w-xs truncate text-mesclar-gray">
                        {order.items.map((i) => i.book.title).join(", ")}
                      </td>
                      <td className="px-6 py-3.5 text-mesclar-muted">{date}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-mesclar-black">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-3.5 text-right text-amber-700">
                        -{formatPrice(fee)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-black text-emerald-700">
                        {formatPrice(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

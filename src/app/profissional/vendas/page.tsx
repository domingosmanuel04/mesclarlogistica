import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { SalesPanel } from "@/components/dashboard/panel-data";

export default function SellerSalesPage() {
  return (
    <DashboardShell
      title="Vendas"
      subtitle="Análise de performance e receitas"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <SalesPanel />
    </DashboardShell>
  );
}

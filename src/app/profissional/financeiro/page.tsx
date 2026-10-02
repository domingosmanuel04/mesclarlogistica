import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { SellerProfileForm } from "@/components/dashboard/panel-data";
import { SellerFinanceView } from "@/components/dashboard/seller-finance-view";

export default function SellerFinancePage() {
  return (
    <DashboardShell
      title="Financeiro"
      subtitle="Totais, divisão de comissões e dados bancários"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <div className="space-y-8">
        <SellerFinanceView />
        <div className="pt-4 border-t border-mesclar-border/70">
          <h3 className="text-lg font-bold text-mesclar-black mb-4">
            Coordenadas Bancárias para Recebimento
          </h3>
          <SellerProfileForm />
        </div>
      </div>
    </DashboardShell>
  );
}

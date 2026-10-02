import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { OrdersPanel } from "@/components/dashboard/panel-data";

export default function SellerOrdersPage() {
  return (
    <DashboardShell
      title="Pedidos"
      subtitle="Gestão e acompanhamento de pedidos recebidos"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <OrdersPanel mode="seller" />
    </DashboardShell>
  );
}

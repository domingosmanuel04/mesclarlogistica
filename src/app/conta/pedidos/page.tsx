import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { OrdersPanel } from "@/components/dashboard/panel-data";

export default function CustomerOrdersPage() {
  return (
    <DashboardShell title="Meus pedidos" subtitle="Histórico de compras" nav={customerNav}>
      <OrdersPanel mode="customer" />
    </DashboardShell>
  );
}

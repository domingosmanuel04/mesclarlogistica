import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { OrdersPanel } from "@/components/dashboard/panel-data";

export default function AdminOrdersPage() {
  return (
    <DashboardShell title="Pedidos" subtitle="Visão global" nav={adminNav}>
      <OrdersPanel mode="admin" />
    </DashboardShell>
  );
}

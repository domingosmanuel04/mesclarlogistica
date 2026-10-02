import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { OrdersPanel } from "@/components/dashboard/panel-data";

export default function AdminPaymentsPage() {
  return (
    <DashboardShell title="Pagamentos" subtitle="Comprovativos em análise" nav={adminNav}>
      <OrdersPanel mode="admin" />
    </DashboardShell>
  );
}

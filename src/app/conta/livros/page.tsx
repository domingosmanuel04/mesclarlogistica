import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { OrdersPanel } from "@/components/dashboard/panel-data";

export default function CustomerBooksPage() {
  return (
    <DashboardShell title="Meus livros" subtitle="Aquisições físicas e digitais" nav={customerNav}>
      <OrdersPanel mode="customer" />
    </DashboardShell>
  );
}

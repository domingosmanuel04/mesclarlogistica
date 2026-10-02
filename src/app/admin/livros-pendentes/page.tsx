import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { PendingBooksAdmin } from "@/components/dashboard/panel-data";

export default function PendingBooksPage() {
  return (
    <DashboardShell title="Administração" subtitle="Livros pendentes" nav={adminNav}>
      <PendingBooksAdmin />
    </DashboardShell>
  );
}

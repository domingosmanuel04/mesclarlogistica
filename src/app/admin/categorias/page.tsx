import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminResourceList } from "@/components/dashboard/panel-data";

export default function AdminCategoriesPage() {
  return (
    <DashboardShell title="Categorias" subtitle="Taxonomia logística" nav={adminNav}>
      <AdminResourceList resource="categories" />
    </DashboardShell>
  );
}

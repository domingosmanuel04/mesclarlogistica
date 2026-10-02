import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminSellersManager } from "@/components/dashboard/admin-sellers-manager";

export default function AdminSellersPage() {
  return (
    <DashboardShell
      title="Gestão de Profissionais"
      subtitle="Controlo completo de contas de formadores, consultores, validações e painéis"
      nav={adminNav}
    >
      <AdminSellersManager />
    </DashboardShell>
  );
}

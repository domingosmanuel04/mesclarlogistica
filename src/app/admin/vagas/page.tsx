import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminJobsManager } from "@/components/dashboard/admin-jobs-manager";

export default function AdminVagasPage() {
  return (
    <DashboardShell
      title="Vagas de Emprego"
      subtitle="Oportunidades de carreira, canais de candidatura e banners"
      nav={adminNav}
    >
      <AdminJobsManager />
    </DashboardShell>
  );
}

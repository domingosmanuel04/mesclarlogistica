import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminTrainingsManager } from "@/components/dashboard/admin-trainings-manager";

export default function AdminTrainingsPage() {
  return (
    <DashboardShell
      title="Gestão de Formações"
      subtitle="Controle de banners, cursos executivos e eventos da vitrine"
      nav={adminNav}
    >
      <AdminTrainingsManager />
    </DashboardShell>
  );
}

import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminProfileForm } from "@/components/dashboard/panel-data";

export default function AdminProfilePage() {
  return (
    <DashboardShell
      title="Editar Perfil"
      subtitle="Actualização de nome, palavra-passe (password) e foto de perfil de administrador"
      nav={adminNav}
      roleLabel="Administrador"
    >
      <AdminProfileForm />
    </DashboardShell>
  );
}

import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminCompaniesManager } from "@/components/dashboard/admin-companies-manager";

export default function AdminEmpresasPage() {
  return (
    <DashboardShell
      title="Directório de Empresas"
      subtitle="Aprovação, certificação e gestão de operadores e fornecedores logísticos"
      nav={adminNav}
    >
      <AdminCompaniesManager />
    </DashboardShell>
  );
}

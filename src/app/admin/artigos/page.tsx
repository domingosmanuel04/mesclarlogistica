import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminArticlesManager } from "@/components/dashboard/admin-articles-manager";

export default function AdminArticlesPage() {
  return (
    <DashboardShell
      title="Gestão de Artigos"
      subtitle="Moderação, publicação e gestão do canal de conhecimento técnico"
      nav={adminNav}
    >
      <AdminArticlesManager />
    </DashboardShell>
  );
}

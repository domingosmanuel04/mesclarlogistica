import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { AdminBooksManager } from "@/components/dashboard/admin-books-manager";

export default function AdminBooksPage() {
  return (
    <DashboardShell
      title="Gestão de Livros"
      subtitle="Catálogo completo de obras, publicações, stock e destaques"
      nav={adminNav}
    >
      <AdminBooksManager />
    </DashboardShell>
  );
}

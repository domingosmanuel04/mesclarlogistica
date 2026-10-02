import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { LibraryPanel } from "@/components/dashboard/panel-data";

export default function CustomerEbooksPage() {
  return (
    <DashboardShell title="Meus eBooks" subtitle="Conteúdos digitais libertados" nav={customerNav}>
      <LibraryPanel />
    </DashboardShell>
  );
}

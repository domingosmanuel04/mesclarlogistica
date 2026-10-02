import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { LibraryPanel } from "@/components/dashboard/panel-data";

export default function CustomerDownloadsPage() {
  return (
    <DashboardShell title="Downloads" subtitle="Links seguros temporários" nav={customerNav}>
      <LibraryPanel />
    </DashboardShell>
  );
}

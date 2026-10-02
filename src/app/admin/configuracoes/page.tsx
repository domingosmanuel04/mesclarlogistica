import { DashboardShell, adminNav } from "@/components/dashboard/dashboard-shell";
import { SettingsForm } from "@/components/dashboard/panel-data";

export default function AdminSettingsPage() {
  return (
    <DashboardShell title="Configurações" subtitle="Contactos e integrações" nav={adminNav}>
      <SettingsForm />
    </DashboardShell>
  );
}

import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { AccountForms } from "@/components/dashboard/panel-data";

export default function CustomerDataPage() {
  return (
    <DashboardShell title="Meus dados" subtitle="Perfil da conta" nav={customerNav}>
      <AccountForms />
    </DashboardShell>
  );
}

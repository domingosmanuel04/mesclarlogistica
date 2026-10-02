import { DashboardShell, customerNav } from "@/components/dashboard/dashboard-shell";
import { AccountForms } from "@/components/dashboard/panel-data";

export default function CustomerPasswordPage() {
  return (
    <DashboardShell title="Palavra-passe" subtitle="Segurança da conta" nav={customerNav}>
      <AccountForms />
    </DashboardShell>
  );
}

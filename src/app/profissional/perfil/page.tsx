import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { SellerProfileForm } from "@/components/dashboard/panel-data";

export default function SellerProfilePage() {
  return (
    <DashboardShell
      title="Editar Perfil"
      subtitle="Nome, palavra-passe, foto de perfil e dados bancários"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <SellerProfileForm />
    </DashboardShell>
  );
}

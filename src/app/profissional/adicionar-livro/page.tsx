import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { PublishBookForm } from "@/components/profissional/publish-book-form";
import { listCategories } from "@/lib/catalog";

export default async function AddBookPage() {
  const categories = await listCategories();

  return (
    <DashboardShell
      title="Publicar Livro"
      subtitle="Cadastre o seu livro ou eBook (gratuito ou pago). Ficará imediatamente disponível na plataforma pública."
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <div className="surface-card overflow-hidden rounded-3xl border border-mesclar-border bg-white dark:bg-[#0A192F] dark:border-[#1e3a5f] p-6 shadow-sm md:p-8">
        <PublishBookForm categories={categories} />
      </div>
    </DashboardShell>
  );
}

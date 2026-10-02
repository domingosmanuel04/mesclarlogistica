import type { Metadata } from "next";
import { listAuthors, getBooksByAuthor } from "@/lib/catalog";
import { PageHero } from "@/components/ui/page-hero";
import { Users, Award, Briefcase, GraduationCap } from "lucide-react";
import { ProfissionaisList, type AuthorWithBookCount } from "@/components/profissionais/profissionais-list";

export const metadata: Metadata = {
  title: "Profissionais | Perfis Currículos e Networking — Mesclar Logística",
  description:
    "Comunidade de profissionais, especialistas e consultores da cadeia logística e procurement em Angola. Explore perfis e currículos validados.",
};

export const dynamic = "force-dynamic";

export default async function ProfissionaisPage() {
  const authors = await listAuthors();

  const authorsWithBooks: AuthorWithBookCount[] = await Promise.all(
    authors.map(async (author) => {
      const books = await getBooksByAuthor(author.id);
      return {
        ...author,
        bookCount: books.length,
      };
    })
  );

  return (
    <div>
      <PageHero
        eyebrow="Área Profissionais"
        title="Perfis Currículos e Networking do Sector"
        description="A maior rede qualificada de profissionais de Compras, Armazéns, Frotas, Importação e Supply Chain em Angola. Encontre talentos comprovados ou partilhe a sua trajectória."
      />

      {/* Estatísticas e Destaques da Rede */}
      <section className="border-b border-mesclar-border/60 bg-mesclar-surface/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                icon: Users,
                label: "Profissionais Registados",
                val: `${authors.length}+`,
              },
              {
                icon: Award,
                label: "Perfis Verificados",
                val: `${authors.filter((a) => a.isValidated).length || authors.length}`,
              },
              {
                icon: Briefcase,
                label: "Especialidades Diversas",
                val: "10+ Áreas",
              },
              {
                icon: GraduationCap,
                label: "Certificações e Ensino",
                val: "Ensino Superior e Pós-Grad.",
              },
            ].map((stat) => (
              <div key={stat.label} className="surface-card flex items-center gap-4 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark">
                  <stat.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xl font-bold text-mesclar-black">{stat.val}</p>
                  <p className="text-xs text-mesclar-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid e Paginação de Perfis Profissionais (Inicial de 6 por página) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProfissionaisList authors={authorsWithBooks} />
      </section>
    </div>
  );
}

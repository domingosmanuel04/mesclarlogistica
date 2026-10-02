import Link from "next/link";
import {
  BookOpen,
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  Calculator,
  ArrowRight,
} from "lucide-react";

export function PlatformPillars() {
  const pillars = [
    {
      num: "01",
      title: "Conhecimento",
      desc: "E-books, artigos, manuais e estudos de caso",
      icon: BookOpen,
      href: "/conhecimento",
      highlights: ["E-books Técnicos", "Artigos e Análises", "Estudos de Caso"],
    },
    {
      num: "02",
      title: "Profissionais",
      desc: "Perfis currículos e networking",
      icon: Users,
      href: "/profissionais",
      highlights: ["Perfis Verificados", "Currículos do Sector", "Networking"],
    },
    {
      num: "03",
      title: "Academia",
      desc: "Formações, competências técnicas e certificações",
      icon: GraduationCap,
      href: "/academia",
      highlights: ["Cursos Especializados", "Formações Práticas", "Certificados"],
    },
    {
      num: "04",
      title: "Oportunidades",
      desc: "Vagas, serviço e consultoria",
      icon: Briefcase,
      href: "/oportunidades",
      highlights: ["Vagas Recentes", "Serviços Logísticos", "Cotação / Informação"],
    },
    {
      num: "05",
      title: "Ferramentas",
      desc: "Calculadoras, modelos e recursos técnicos",
      icon: Calculator,
      href: "/ferramentas",
      highlights: ["Calculadora CBM", "Lote Económico EOQ", "Modelos e Checklists"],
    },
  ];

  return (
    <section className="section-padding mx-auto max-w-7xl px-4 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-mesclar-gold-dark">
          Estrutura da Plataforma
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-mesclar-black sm:text-3xl lg:text-4xl">
          Áreas de Navegação
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mesclar-muted sm:text-base">
          Operação e carreira logística organizadas de forma clara e objectiva.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="surface-card surface-card-hover group relative flex flex-col justify-between overflow-hidden p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-mesclar-gold/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-gold-dark group-hover:bg-mesclar-gold group-hover:text-mesclar-black transition-colors shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-xs font-bold tracking-wider text-mesclar-muted">
                    {item.num}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-mesclar-black group-hover:text-mesclar-gold-dark transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mesclar-muted font-medium">
                  {item.desc}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {item.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-mesclar-surface px-2.5 py-0.5 text-[11px] font-medium text-mesclar-black/75 border border-mesclar-border/70"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-mesclar-border/60 pt-4">
                <span className="text-xs font-semibold text-mesclar-gold-dark group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Aceder a {item.title}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { PlatformPillars } from "@/components/home/platform-pillars";
import { CategoryGrid } from "@/components/home/category-grid";
import { SectionHeading } from "@/components/home/section-heading";
import { BookGrid } from "@/components/books/book-grid";
import { prisma } from "@/lib/prisma";
import {
  listAuthors,
  getFeaturedBooks,
  getBestsellers,
  getNewBooks,
  getFreeEbooks,
  getPremiumEbooks,
} from "@/lib/catalog";
import { academicLabel } from "@/lib/professional";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { PublishBookButton } from "@/components/auth/publish-book-button";
import {
  Search,
  ShoppingBag,
  Upload,
  Download,
  UserPlus,
  BookOpen,
  Clock,
  TrendingUp,
  ShoppingCart,
  Info,
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FileText,
} from "lucide-react";

import { JobActionButton } from "@/components/oportunidades/job-action-button";
import { getJobsWithInitialSeed } from "@/lib/jobs-seed";

function formatJobDate(date: Date) {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  return new Date(date).toLocaleDateString("pt-AO");
}


export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    featured,
    bestsellers,
    newBooks,
    freeAll,
    premiumAll,
    authors,
    featuredTrainings,
    recentArticles,
    allJobs,
  ] = await Promise.all([
    getFeaturedBooks(),
    getBestsellers(),
    getNewBooks(),
    getFreeEbooks(),
    getPremiumEbooks(),
    listAuthors(),
    prisma.training.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        seller: {
          include: {
            user: true,
          },
        },
      },
    }),
    getJobsWithInitialSeed(),
  ]);

  const recentJobs = allJobs.slice(0, 3);


  const free = freeAll.slice(0, 4);
  const premium = premiumAll.slice(0, 4);

  return (
    <>
      <Hero />
      <TrustStrip />

      {/* 1. ÁREAS DE NAVEGAÇÃO (CONHECIMENTO, PROFISSIONAIS, ACADEMIA, OPORTUNIDADES, EMPRESAS, FERRAMENTAS) */}
      <PlatformPillars />

      {/* 2. DESTAQUE 1: PROFISSIONAIS REGISTADOS (PROFISSIONAIS) */}
      <section className="section-padding border-y border-mesclar-border/60 bg-mesclar-surface/70">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Profissionais"
            title="Profissionais Registados"
            subtitle="Rede de talentos, especialistas, directores e consultores verificados do sector em Angola."
            href="/profissionais"
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {authors.slice(0, 5).map((author) => {
              const acadStatus = academicLabel(author.academicStatus);
              return (
                <Link
                  key={author.id}
                  href={`/autores/${author.slug}`}
                  className="surface-card surface-card-hover group p-5 text-center flex flex-col justify-between"
                >
                  <div>
                    <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-mesclar-border transition group-hover:ring-mesclar-gold/50 shadow-sm">
                      <Image
                        src={author.photoUrl || "/placeholder-author.jpg"}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <h3 className="font-bold text-sm text-mesclar-black group-hover:text-mesclar-gold-dark transition-colors truncate">
                        {author.name}
                      </h3>
                      {author.isValidated && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-mesclar-gold" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-mesclar-gold-dark line-clamp-1">
                      {author.specialty || "Profissional de Logística"}
                    </p>
                    {acadStatus && (
                      <p className="mt-1 text-[10px] text-mesclar-muted truncate">
                        {acadStatus}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-mesclar-border/60 text-[11px] font-semibold text-mesclar-gold-dark flex items-center justify-center gap-1">
                    Ver currículo <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. DESTAQUE 2: VAGAS RECENTES (OPORTUNIDADES) */}
      <section className="section-padding mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Oportunidades"
          title="Vagas Recentes"
          subtitle="Oportunidades de carreira na cadeia de abastecimento e logística."
          href="/oportunidades"
        />

        <div className="grid gap-4">
          {recentJobs.length === 0 ? (
            <div className="surface-card p-8 text-center rounded-2xl">
              <Briefcase className="mx-auto h-8 w-8 text-mesclar-gold/50 mb-2" />
              <p className="text-xs text-mesclar-muted">Nenhuma vaga registada no momento.</p>
            </div>
          ) : (
            recentJobs.map((job) => {
              const jobTags = job.tags
                ? job.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : [];
              return (
                <div
                  key={job.id}
                  className="surface-card surface-card-hover flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 transition-all duration-200"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-mesclar-black">{job.title}</h3>
                      <span className="rounded-full bg-mesclar-black px-2.5 py-0.5 text-[10px] font-semibold text-mesclar-gold-light">
                        {job.type}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                      <span className="flex items-center gap-1 font-medium text-mesclar-black">
                        <Building2 className="h-3.5 w-3.5 text-mesclar-gold-dark" /> {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatJobDate(job.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-mesclar-muted">
                      {job.description}
                    </p>
                    {jobTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {jobTags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[10px] font-medium text-mesclar-gold-dark"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <JobActionButton job={job} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. DESTAQUE 3: NOVOS ARTIGOS (CONHECIMENTO) */}
      {recentArticles.length > 0 && (
        <section className="section-padding border-t border-mesclar-border/60 bg-mesclar-surface/60">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              eyebrow="Conhecimento"
              title="Novos Artigos e Publicações"
              subtitle="Análises técnicas, estudos de caso e metodologias para a cadeia de suprimentos."
              href="/artigos"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/artigos/${article.slug}`}
                  className="surface-card surface-card-hover group flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-mesclar-cream/50">
                    {article.coverUrl ? (
                      <Image
                        src={article.coverUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mesclar-cream to-white p-4">
                        <FileText className="h-10 w-10 text-mesclar-gold/50" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-mesclar-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-mesclar-gold">
                      {article.category || "Logística"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-xs text-mesclar-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {article.readTime || 5} min de leitura
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold leading-snug text-mesclar-black group-hover:text-mesclar-gold-dark transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-mesclar-muted">
                      {article.excerpt || "Leia o artigo completo para aprofundar esta análise."}
                    </p>
                    <div className="mt-auto pt-4 text-xs font-semibold text-mesclar-gold-dark flex items-center gap-1">
                      Ler artigo completo <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. DESTAQUE 4: CURSOS EM DESTAQUE (ACADEMIA) */}
      <section className="section-padding mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Academia"
          title="Cursos em Destaque"
          subtitle="Capacitação prática em procurement, armazenagem, transportes e aduanas."
          href="/academia"
        />

        {featuredTrainings.length === 0 ? (
          <div className="surface-card p-10 text-center rounded-2xl">
            <GraduationCap className="mx-auto h-10 w-10 text-mesclar-gold-dark" />
            <h3 className="mt-3 text-base font-bold text-mesclar-black">
              Novas turmas executivas a anunciar
            </h3>
            <p className="mt-1 text-xs text-mesclar-muted">
              Consulte a programação completa na área da Academia.
            </p>
            <Link href="/academia" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Explorar Academia
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTrainings.map((item) => (
              <a
                key={item.id}
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="surface-card surface-card-hover group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-mesclar-gold/50"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-mesclar-black">
                  <Image
                    src={item.bannerUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={item.bannerUrl.startsWith("/api/")}
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-mesclar-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-mesclar-gold flex items-center gap-1">
                    Formação Aberta
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-base font-bold leading-snug text-mesclar-black group-hover:text-mesclar-gold-dark transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-xs leading-relaxed text-mesclar-muted line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-mesclar-border/60">
                    <span className="text-xs font-semibold text-mesclar-gold-dark flex items-center gap-1">
                      Inscrição e Detalhes{" "}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <ExternalLink className="h-4 w-4 text-mesclar-muted" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIAS E ACERVO DE LIVROS */}
      <section className="section-padding border-t border-mesclar-border/60 bg-mesclar-surface/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Explorar Acervo"
            title="Categorias Técnicas"
            subtitle="Conteúdos exclusivos para a cadeia logística."
            centered
          />
          <CategoryGrid />
        </div>
      </section>

      {/* EBOOKS EM DESTAQUE */}
      <section className="section-padding border-t border-mesclar-border/60">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Destaques Digitais"
            title="eBooks em Destaque"
            href="/ebooks"
          />
          <BookGrid books={featured.length ? featured : bestsellers.slice(0, 3)} columns={3} />
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="section-padding border-t border-mesclar-border/60 bg-mesclar-surface/60">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Popularidade"
            title="Mais Vendidos"
            subtitle="Os favoritos da comunidade logística e de compras."
            href="/ebooks?sort=vendas"
          />
          <BookGrid books={bestsellers} columns={3} />
        </div>
      </section>

      {/* EBOOKS GRATUITOS */}
      <section className="section-padding mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading
          eyebrow="Acesso Livre"
          title="eBooks Gratuitos"
          subtitle="Faça download imediato de manuais introdutórios."
          href="/ebooks?preco=gratis"
        />
        <BookGrid books={free} columns={3} downloadOnly />
      </section>

      {/* EBOOKS PREMIUM */}
      <section className="section-padding bg-gradient-to-b from-mesclar-cream/50 to-background border-t border-mesclar-border/60">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Premium"
            title="eBooks Premium"
            subtitle="Conteúdo aprofundado para decisões estratégicas e direcção executiva."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {premium.map((book) => (
              <div
                key={book.id}
                className="surface-card surface-card-hover flex gap-5 p-5 md:p-6"
              >
                <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl shadow-inner">
                  <Image src={book.coverUrl} alt="" fill className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-mesclar-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mesclar-gold-dark">
                    Premium
                  </span>
                  <h3 className="mt-2 font-bold leading-snug">{book.title}</h3>
                  <p className="text-sm text-mesclar-muted">{book.authorName}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mesclar-muted">
                    {book.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="text-xl font-bold text-mesclar-gold-dark">
                      Kz {book.priceEbook.toLocaleString("pt-AO")}
                    </span>
                    <Link href={`/livros/${book.slug}`}>
                      <Button variant="gold" size="sm" leftIcon={ShoppingCart}>
                        Comprar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="section-padding bg-mesclar-surface/80 border-t border-mesclar-border/60">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading eyebrow="Processo" title="Como Funciona a Plataforma" centered />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-mesclar-gold-dark">
                Para Leitores e Profissionais
              </h3>
              <ol className="mt-8 space-y-6">
                {[
                  {
                    icon: Search,
                    t: "Explore as Áreas de Navegação",
                    d: "Navegue por Conhecimento, Profissionais, Academia, Oportunidades, Empresas e Ferramentas.",
                  },
                  {
                    icon: ShoppingBag,
                    t: "Adquira Conteúdos ou Formações",
                    d: "Escolha livros digitais, livros físicos ou inscreva-se em capacitações da Academia.",
                  },
                  {
                    icon: Upload,
                    t: "Pagamento e Confirmação Segura",
                    d: "Envio prático de comprovativo ou acesso imediato a recursos gratuitos.",
                  },
                  {
                    icon: Download,
                    t: "Networking e Acesso Imediato",
                    d: "Descarregue e-books, utilize calculadoras e conecte-se aos profissionais da rede.",
                  },
                ].map((item, i) => (
                  <li key={item.t} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mesclar-black text-sm font-bold text-mesclar-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{item.t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-mesclar-muted">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="surface-card border-mesclar-gold/20 bg-gradient-to-br from-white to-mesclar-cream/40 p-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-mesclar-gold-dark">
                Para Autores e Empresas
              </h3>
              <ol className="mt-8 space-y-6">
                {[
                  {
                    t: "Crie o Seu Perfil Profissional",
                    d: "Cadastre formação, competências técnicas, softwares e histórico da sua carreira.",
                  },
                  {
                    t: "Publique Obras e Artigos",
                    d: "Partilhe o seu conhecimento em e-books ou artigos técnicos validados pela equipa editorial.",
                  },
                  {
                    t: "Divulgue Vagas e Serviços",
                    d: "Conecte a sua empresa aos melhores quadros operacionais e de gestão em Angola.",
                  },
                  {
                    t: "Gere Parcerias e Negócios",
                    d: "Receba pedidos de cotação e estabeleça networking directo com quem decide.",
                  },
                ].map((item, i) => (
                  <li key={item.t} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-mesclar-gold bg-white text-sm font-bold text-mesclar-gold-dark">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{item.t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-mesclar-muted">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA DE PUBLICAÇÃO */}
      <section className="relative overflow-hidden bg-mesclar-black py-24 text-white">
        <div className="absolute inset-0 grid-pattern opacity-[0.05]" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
          <BookOpen className="mx-auto h-12 w-12 text-mesclar-gold" strokeWidth={1.25} />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Publicar o seu Livro ou Artigo</h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/65">
            Partilhe conhecimento especializado com a maior comunidade logística de Angola. O seu conteúdo passará por curadoria temática rigorosa.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <PublishBookButton size="lg" />
            <Link href="/profissional/perfil-profissional">
              <Button variant="secondary" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Criar Perfil Profissional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE A MESCLAR - TEXTO INTEGRALMENTE JUSTIFICADO */}
      <section className="section-padding mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mesclar-gold-dark">
              Sobre nós
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Sobre a Mesclar</h2>
            <p className="mt-5 leading-relaxed text-mesclar-muted text-justify">
              A Mesclar Logística | Procurement é a plataforma digital e marketplace dedicado
              exclusivamente à cadeia de abastecimento. Reunimos autores, profissionais e
              organizações que produzem conhecimento em logística, compras, importação, armazéns,
              frotas e tecnologia aplicada — com curadoria para garantir relevância temática.
            </p>
            <p className="mt-4 text-sm font-semibold text-mesclar-gold-dark">
              Conhecimento, estratégia e eficiência para a cadeia logística.
            </p>
            <Link href="/sobre" className="mt-8 inline-block">
              <Button variant="outline" leftIcon={Info}>
                Saiba mais
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: TrendingUp, label: "Marketplace especializado" },
              { icon: Clock, label: "Acesso digital imediato" },
              { icon: UserPlus, label: "Profissionais verificados" },
              { icon: BookOpen, label: "Só temática logística" },
            ].map((item) => (
              <div
                key={item.label}
                className="surface-card flex flex-col items-center p-6 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold">
                  <item.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <p className="mt-4 text-sm font-semibold leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Clock,
  Calendar,
  User,
  ArrowRight,
  Search,
  BookOpen,
  PenTool,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Artigos e Publicações Especializadas | Mesclar Logística",
  description:
    "Análises técnicas, estudos de caso e artigos especializados em Procurement, Gestão de Contratos, Cadeia de Abastecimento e Logística.",
};

const CATEGORIES = [
  "Todos",
  "Gestão de Contratos",
  "Procurement e Compras Estratégicas",
  "Cadeia de Abastecimento (Supply Chain)",
  "Gestão de Stocks e Armazenagem",
  "Gestão de Fornecedores e Terceiros",
  "Governança e Compliance Logístico",
];

interface Props {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
  }>;
}

export default async function ArtigosPage({ searchParams }: Props) {
  const { categoria, q } = await searchParams;

  const where: any = {
    status: "PUBLISHED",
  };

  if (categoria && categoria !== "Todos") {
    where.category = { equals: categoria, mode: "insensitive" };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }

  let articles: any[] = [];
  try {
    articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                author: {
                  select: {
                    name: true,
                    slug: true,
                    photoUrl: true,
                    specialty: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error loading articles:", err);
    articles = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mesclar-cream/40 via-white to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mesclar-black py-16 text-white sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.06]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-mesclar-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-mesclar-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-mesclar-gold/30 bg-mesclar-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-mesclar-gold-light">
            Conhecimento e Melhores Práticas
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Artigos e Publicações <span className="text-gradient-gold">Especializadas</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
            Análises estratégicas, metodologias aplicadas e estudos práticos sobre procurement, contratos e gestão da cadeia logística escritos por especialistas da área.
          </p>

          {/* Barra de Pesquisa */}
          <form className="mx-auto mt-8 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Pesquisar por tema, palavra-chave ou autor..."
                className="w-full rounded-2xl border border-white/20 bg-white/10 pl-12 pr-28 py-3.5 text-sm text-white placeholder-white/50 backdrop-blur-md focus:border-mesclar-gold focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-mesclar-gold/30"
              />
              <button
                type="submit"
                className="absolute right-2 rounded-xl bg-mesclar-gold px-4 py-2 text-xs font-bold text-mesclar-black shadow-md hover:bg-mesclar-gold-light transition"
              >
                Pesquisar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Navegação por Categorias */}
      <section className="border-b border-mesclar-border/80 bg-white/95 backdrop-blur-md py-3.5 sticky top-16 z-20 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {CATEGORIES.map((cat) => {
              const isActive = (categoria ?? "Todos") === cat;
              const href = cat === "Todos" ? "/artigos" : `/artigos?categoria=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`rounded-full px-4 py-2 font-medium transition ${
                    isActive
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm font-semibold"
                      : "bg-mesclar-cream/80 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listagem de Artigos */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-mesclar-border bg-white p-12 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-gold mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-mesclar-black">Nenhum artigo encontrado</h3>
            <p className="mt-1 max-w-md text-sm text-mesclar-muted">
              Não foram encontrados artigos para a pesquisa ou categoria selecionada.
            </p>
            <Link href="/artigos" className="mt-6">
              <Button variant="secondary" size="sm">
                Limpar filtros e ver todos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const authorData = article.seller?.user?.author;
              const authorName = authorData?.name || article.seller?.user?.name || "Especialista Mesclar";
              const authorSlug = authorData?.slug;
              const authorPhoto = authorData?.photoUrl || "/authors/default.jpg";

              return (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-mesclar-border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-mesclar-gold/50 hover:shadow-xl"
                >
                  {/* Capa do Artigo */}
                  <Link href={`/artigos/${article.slug}`} className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={article.coverUrl || "/services/gestao-contratos.jpg"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-mesclar-black/85 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-mesclar-gold shadow-sm">
                      {article.category || "Geral"}
                    </span>
                  </Link>

                  {/* Conteúdo do Card */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-mesclar-muted mb-2.5">
                      <Clock className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                      <span>{article.readTime || 5} min de leitura</span>
                      <span>•</span>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-AO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <Link href={`/artigos/${article.slug}`}>
                      <h2 className="text-lg font-bold leading-snug text-mesclar-black group-hover:text-mesclar-gold-dark transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                    </Link>

                    <p className="mt-2 text-xs leading-relaxed text-mesclar-muted line-clamp-3">
                      {article.excerpt || "Leia o artigo completo para entender as abordagens técnicas e frameworks operacionais..."}
                    </p>

                    {/* Autor e Botão de Leitura */}
                    <div className="mt-auto pt-6 border-t border-mesclar-border/70 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-mesclar-border bg-slate-100">
                          <Image
                            src={authorPhoto}
                            alt={authorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 truncate">
                          {authorSlug ? (
                            <Link
                              href={`/autores/${authorSlug}`}
                              className="text-xs font-semibold text-mesclar-black hover:underline truncate block"
                            >
                              {authorName}
                            </Link>
                          ) : (
                            <span className="text-xs font-semibold text-mesclar-black truncate block">
                              {authorName}
                            </span>
                          )}
                          <span className="text-[10px] text-mesclar-muted block truncate">
                            {authorData?.specialty || "Autor"}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/artigos/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-mesclar-gold-dark group-hover:translate-x-0.5 transition-transform"
                      >
                        Ler
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* CTA para novos autores / profissionais */}
        <div className="mt-16 rounded-[2rem] border border-mesclar-border/80 bg-gradient-to-br from-mesclar-cream/70 via-white to-white p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
              <PenTool className="h-3.5 w-3.5" />
              Partilhe o seu Conhecimento
            </span>
            <h3 className="text-2xl font-bold text-mesclar-black">
              É profissional ou especialista na área logística?
            </h3>
            <p className="text-sm text-mesclar-muted leading-relaxed">
              Crie a sua conta profissional ou aceda ao painel para redigir artigos, publicar estudos de caso e divulgar o seu perfil certificado.
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-3">
            <Link href="/profissional/artigos/novo">
              <Button variant="gold" size="lg" leftIcon={PenTool}>
                Escrever Artigo
              </Button>
            </Link>
            <Link href="/criar-conta">
              <Button variant="secondary" size="lg">
                Criar Conta Profissional
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

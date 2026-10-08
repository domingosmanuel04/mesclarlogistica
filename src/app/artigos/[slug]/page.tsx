import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  Eye,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { title: true, excerpt: true, coverUrl: true },
    });

    if (!article) return { title: "Artigo não encontrado" };

    return {
      title: `${article.title} | Mesclar Logística`,
      description: article.excerpt || "Artigo especializado em logística, procurement e cadeia de abastecimento.",
      openGraph: {
        title: article.title,
        description: article.excerpt || undefined,
        images: article.coverUrl ? [article.coverUrl] : undefined,
      },
    };
  } catch {
    return { title: "Artigo | Mesclar Logística" };
  }
}

export default async function ArtigoSinglePage({ params }: Props) {
  const { slug } = await params;

  let article: any = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    photoUrl: true,
                    specialty: true,
                    bio: true,
                    contactWhatsapp: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch {
    article = null;
  }

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view counter asynchronously
  void prisma.article
    .update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => null);

  const author = article.seller?.user?.author;
  const authorName = author?.name || article.seller?.user?.name || "Especialista Mesclar";
  const authorPhoto = author?.photoUrl || "/authors/default.jpg";
  const authorSpecialty = author?.specialty || "Autor e Especialista em Cadeia Logística";

  // Recommended articles (excluding current)
  let relatedArticles: any[] = [];
  try {
    relatedArticles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    relatedArticles = [];
  }

  const articleUrl = `https://mesclarlogistica.ao/artigos/${article.slug}`;
  const whatsappShareText = encodeURIComponent(
    `*${article.title}*\n\nLeia este artigo na Mesclar Logística: ${articleUrl}`
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-mesclar-cream/30 via-white to-white pb-20">
      {/* Barra de Topo / Breadcrumbs */}
      <div className="border-b border-mesclar-border/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/artigos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-mesclar-muted hover:text-mesclar-black transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para todos os artigos
          </Link>

          <span className="rounded-full bg-mesclar-cream px-3 py-1 text-[11px] font-bold text-mesclar-black border border-mesclar-border/80">
            {article.category || "Logística"}
          </span>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Cabeçalho do Artigo */}
        <header className="space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-mesclar-black sm:text-4xl lg:text-5xl leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg leading-relaxed text-mesclar-muted font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Dados do Autor e Data */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-mesclar-border/80 py-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-mesclar-gold/40 shadow-xs">
                <Image
                  src={authorPhoto}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                {author?.slug ? (
                  <Link
                    href={`/autores/${author.slug}`}
                    className="text-sm font-bold text-mesclar-black hover:text-mesclar-gold-dark hover:underline"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <p className="text-sm font-bold text-mesclar-black">{authorName}</p>
                )}
                <p className="text-xs text-mesclar-muted">{authorSpecialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-mesclar-muted">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-mesclar-gold-dark" />
                <span>
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString("pt-AO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-mesclar-gold-dark" />
                <span>{article.readTime || 5} min de leitura</span>
              </div>
            </div>
          </div>
        </header>

        {/* Capa Principal */}
        {article.coverUrl && (
          <div className="relative mt-8 h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-mesclar-border shadow-md">
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              unoptimized={Boolean(article.coverUrl.startsWith("/api/"))}
            />
          </div>
        )}

        {/* Barra de Partilha Rápida */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-mesclar-border/70 bg-white p-3 shadow-xs">
          <span className="text-xs font-semibold text-mesclar-muted flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5 text-mesclar-gold" />
            Partilhar este artigo:
          </span>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Conteúdo Renderizado (HTML Formatado do Editor) */}
        <div className="mt-10 rounded-3xl border border-mesclar-border/70 bg-white p-6 sm:p-10 shadow-xs">
          <div
            className="prose prose-slate max-w-none text-slate-800 leading-relaxed
              prose-headings:text-mesclar-black prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
              prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-mesclar-gold-dark prose-a:font-semibold hover:prose-a:underline
              prose-strong:text-mesclar-black prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-mesclar-gold prose-blockquote:bg-mesclar-cream/30 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
              prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
              prose-li:my-1
              prose-table:w-full prose-table:border-collapse prose-table:my-6
              prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:p-3 prose-th:text-left
              prose-td:border prose-td:border-slate-200 prose-td:p-3"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Caixa do Autor */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-mesclar-border bg-gradient-to-br from-mesclar-cream/50 via-white to-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-mesclar-gold shadow-md">
              <Image
                src={authorPhoto}
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                Sobre o Autor
              </span>
              <h3 className="text-lg font-bold text-mesclar-black mt-0.5">
                {authorName}
              </h3>
              <p className="text-xs text-mesclar-muted mt-1 leading-relaxed">
                {author?.bio || "Profissional e autor cadastrado na Mesclar Logística, focado na difusão de conhecimento e práticas avançadas de suprimentos."}
              </p>
            </div>
            {author?.slug && (
              <div className="shrink-0">
                <Link href={`/autores/${author.slug}`}>
                  <Button variant="gold" size="sm" rightIcon={ArrowRight}>
                    Ver Perfil Completo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Artigos Recomendados */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-mesclar-black">
                Outros Artigos Recomendados
              </h3>
              <Link
                href="/artigos"
                className="text-xs font-bold text-mesclar-gold-dark hover:underline flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/artigos/${rel.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-mesclar-border bg-white shadow-xs hover:border-mesclar-gold/50 hover:shadow-md transition"
                >
                  <div className="relative h-32 w-full bg-slate-100">
                    <Image
                      src={rel.coverUrl || "/services/gestao-contratos.jpg"}
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-1 flex-col">
                    <span className="text-[10px] font-semibold text-mesclar-gold-dark">
                      {rel.category || "Geral"}
                    </span>
                    <h4 className="mt-1 font-bold text-xs text-mesclar-black line-clamp-2 group-hover:text-mesclar-gold-dark transition-colors">
                      {rel.title}
                    </h4>
                    <span className="mt-auto pt-3 text-[10px] text-mesclar-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {rel.readTime || 5} min de leitura
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

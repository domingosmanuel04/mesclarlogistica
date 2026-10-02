import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Mail, CheckCircle2 } from "lucide-react";
import { getAuthorBySlug, getBooksByAuthor } from "@/lib/catalog";
import { BookGrid } from "@/components/books/book-grid";
import { AuthorProfileTabs } from "@/components/books/author-profile-tabs";
import { academicLabel, employmentLabel } from "@/lib/professional";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { AuthorValidationModal } from "@/components/books/author-validation-modal";
import { generateVerificationCode, getVerificationUrl } from "@/lib/author-verification";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  return { title: author?.name ?? "Profissional" };
}

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();
  const session = await auth();
  const isOwner = Boolean(
    session?.user?.id && (
      author.userId === session.user.id ||
      session.user.role === "ADMIN" ||
      (!author.userId && session.user.email?.toLowerCase() === author.contactEmail?.toLowerCase())
    )
  );
  const books = await getBooksByAuthor(author.id);
  const academic = academicLabel(author.academicStatus);
  const employment = employmentLabel(author.employmentStatus);
  const wa = author.contactWhatsapp?.replace(/\D/g, "");
  const verificationCode = generateVerificationCode(author.id, author.slug);
  const verificationUrl = getVerificationUrl(verificationCode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mesclar-cream/60 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-mesclar-border bg-white shadow-[0_30px_80px_-40px_rgba(10,10,10,0.35)]">
          {/* Banner hero com gradiente overlay */}
          <div className="relative h-36 w-full overflow-hidden bg-mesclar-cream sm:h-48 md:h-56 lg:h-64">
            <Image
              src={author.coverUrl || "/services/gestao-contratos.jpg"}
              alt={`Capa de ${author.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover object-center"
              unoptimized={Boolean(author.coverUrl?.startsWith("/api/"))}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mesclar-black via-mesclar-black/50 to-mesclar-black/20" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-mesclar-gold/30 via-transparent to-transparent opacity-60 mix-blend-overlay" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(201,162,39,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.8) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute bottom-5 right-6 flex items-center sm:bottom-8 sm:right-10">
              <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                <BookOpen className="h-3.5 w-3.5 text-mesclar-gold-light" />
                <span className="text-[11px] font-bold text-white">
                  {books.length}
                  <span className="ml-1 font-medium text-white/75">
                    {books.length === 1 ? "publicação" : "publicações"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Cabeçalho com avatar e dados */}
          <div className="px-6 pb-10 sm:px-10">
            <div className="relative -mt-20 sm:-mt-24">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                {/* Bloco do perfil: Foto e abaixo dela o elemento que estava atrás, nome e especialidade */}
                <div className="flex flex-col items-center sm:items-start">
                  {/* Foto de perfil */}
                  <div className="relative">
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark opacity-90 blur-[1px]" />
                    <div className="absolute -inset-[5px] rounded-full bg-gradient-to-br from-mesclar-gold via-mesclar-gold-dark to-mesclar-black opacity-50" />
                    <div className="relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-white shadow-[0_20px_40px_-15px_rgba(10,10,10,0.6)] sm:h-44 sm:w-44">
                      <Image src={author.photoUrl} alt={author.name} fill className="object-cover" />
                    </div>
                  </div>

                  {/* Por baixo da foto de perfil: Elemento que estava atrás da foto + Nome + Especialidade + Badges */}
                  <div className="mt-4 flex flex-col items-center text-center sm:items-start sm:text-left">
                    {/* Elemento que estava por trás da foto */}
                    <div className="inline-flex items-center rounded-full border border-mesclar-gold/30 bg-gradient-to-r from-mesclar-cream via-white to-mesclar-cream px-3.5 py-1 text-xs font-semibold text-mesclar-black shadow-sm">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-mesclar-gold-dark">
                        Perfil profissional
                      </span>
                    </div>

                  {/* Nome do profissional */}
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-mesclar-black sm:text-4xl lg:text-[2.6rem]">
                    {author.name}
                  </h1>

                  {/* Especialidade / Área */}
                  {author.specialty && (
                    <p className="mt-1 text-base font-medium text-mesclar-gold-dark sm:text-lg">
                      {author.specialty}
                    </p>
                  )}

                  {/* Badges adicionais: Validação */}
                  {author.isValidated && (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Currículo Validado
                      </span>
                    </div>
                  )}
                </div>
              </div>

                {/* CTAs de contacto e validação */}
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-2.5 sm:self-end sm:pb-1">
                  {author.contactEmail && (
                    <a
                      href={`mailto:${author.contactEmail}`}
                      className="group inline-flex items-center gap-2 rounded-2xl border border-mesclar-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-mesclar-black shadow-sm transition-all hover:-translate-y-0.5 hover:border-mesclar-black/40 hover:shadow-md"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-black/95 text-mesclar-gold-light transition group-hover:bg-mesclar-black">
                        <Mail className="h-4 w-4" />
                      </span>
                      Enviar email
                    </a>
                  )}
                  {author.contactWhatsapp && (
                    <a
                      href={
                        wa
                          ? `https://wa.me/${wa.startsWith("244") ? wa : `244${wa}`}`
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-[0_6px_20px_-14px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_10px_26px_-14px_rgba(16,185,129,0.8)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md">
                        <WhatsAppIcon className="h-4 w-4" />
                      </span>
                      WhatsApp
                    </a>
                  )}

                  {/* Validação de Perfil (Dono valida / Outros escaneiam QR Code após validação) */}
                  <AuthorValidationModal
                    author={author}
                    code={verificationCode}
                    verificationUrl={verificationUrl}
                    isOwner={isOwner}
                  />
                </div>
              </div>

              {/* Estatísticas rápidas */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-mesclar-cream/60 via-white to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:shadow-[0_14px_30px_-18px_rgba(10,10,10,0.25)]">
                  <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-mesclar-gold/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted">
                    Estado profissional
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm font-bold text-mesclar-black">
                    {employment || "—"}
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-mesclar-gold/[0.10] via-mesclar-gold/[0.05] to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:shadow-[0_14px_30px_-18px_rgba(10,10,10,0.25)]">
                  <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-mesclar-gold/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted">
                    Especialidade
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm font-bold text-mesclar-black">
                    {author.specialty || "—"}
                  </p>
                </div>

                <div className="group col-span-2 relative overflow-hidden rounded-2xl border border-mesclar-black/20 bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black p-4 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(10,10,10,0.7)] sm:col-span-1">
                  <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-mesclar-gold/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(201,162,39,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.8) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-gold-light/90">
                    Status académico
                  </p>
                  <p className="relative mt-1 line-clamp-1 text-sm font-bold">
                    {academic || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-mesclar-border/80 bg-white">
            <AuthorProfileTabs author={author} />
          </div>
        </div>

        {/* Publicações */}
        <section className="mt-16 sm:mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-lg">
                <BookOpen className="h-5.5 w-5.5" strokeWidth={1.9} />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-mesclar-black sm:text-[1.8rem]">
                  Publicações do profissional
                </h2>
                <p className="mt-0.5 text-sm text-mesclar-muted">
                  {books.length > 0
                    ? `Colecção com ${books.length} ${books.length === 1 ? "livro" : "livros"} no catálogo Mesclar`
                    : "Ainda sem publicações no catálogo"}
                </p>
              </div>
            </div>
            {books.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-mesclar-border bg-white px-4 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mesclar-gold/15 text-mesclar-gold-dark">
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold text-mesclar-black">
                  {books.length} {books.length === 1 ? "conteúdo" : "conteúdos"}
                </span>
              </div>
            )}
          </div>

          {books.length > 0 ? (
            <div className="relative">
              <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-mesclar-gold/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-mesclar-gold/5 blur-3xl" />
              <div className="relative">
                <BookGrid books={books} columns={3} />
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-mesclar-cream/50 via-white to-mesclar-cream/30 px-6 py-20 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(201,162,39,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold/20 via-mesclar-gold/10 to-mesclar-gold/20 text-mesclar-gold-dark shadow-inner">
                <BookOpen className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="relative mt-5 text-lg font-bold text-mesclar-black">
                Sem publicações listadas
              </p>
              <p className="relative mt-1.5 text-sm text-mesclar-muted max-w-sm mx-auto">
                Este profissional ainda não tem livros publicados no nosso catálogo. Volte em breve para novidades.
              </p>
            </div>
          )}

          <div className="mt-14 flex items-center justify-center">
            <Link
              href="/autores"
              className="group inline-flex items-center gap-2.5 rounded-2xl border border-mesclar-border bg-white px-6 py-3 text-sm font-bold text-mesclar-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-mesclar-gold/50 hover:bg-mesclar-gold/5 hover:shadow-[0_10px_30px_-16px_rgba(201,162,39,0.35)]"
            >
              <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Voltar à lista de profissionais
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

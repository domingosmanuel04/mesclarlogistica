import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Download,
  CheckCircle2,
  Calendar,
  Building2,
  Award,
  GraduationCap,
  Briefcase,
  Share2,
  Search,
  BookOpen,
} from "lucide-react";
import { findAuthorByVerificationCode, getVerificationUrl } from "@/lib/author-verification";
import { academicLabel, employmentLabel } from "@/lib/professional";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const result = await findAuthorByVerificationCode(code);

  if (!result) {
    return {
      title: "Verificação de Perfil — Certificado Não Encontrado | Mesclar",
    };
  }

  return {
    title: `Validação Oficial: ${result.author.name} — Mesclar Logística`,
    description: `Perfil profissional verificado e autenticado pela Mesclar Logística. Código: ${result.certificateId}`,
  };
}

export default async function ValidateProfilePage({ params }: PageProps) {
  const { code } = await params;
  const result = await findAuthorByVerificationCode(code);

  // CASE 1: INVALID / NOT FOUND
  if (!result) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-rose-50/50 via-white to-mesclar-cream/30 py-16 px-4">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl border-2 border-rose-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-inner">
              <AlertTriangle className="h-10 w-10" />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Certificado Não Reconhecido
            </div>

            <h1 className="mt-4 text-2xl font-black text-mesclar-black sm:text-3xl">
              QR Code ou Código Inválido
            </h1>

            <p className="mt-3 text-sm text-mesclar-muted leading-relaxed">
              O código de verificação <strong className="font-mono text-mesclar-black bg-slate-100 px-2 py-0.5 rounded">{code}</strong> não corresponde a nenhum perfil profissional autenticado na plataforma Mesclar Logística.
            </p>

            <div className="mt-6 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 text-left text-xs text-rose-900 leading-relaxed">
              <p className="font-bold mb-1 flex items-center gap-1.5 text-rose-950">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                Alerta de Segurança e Autenticidade:
              </p>
              Documentos profissionais autênticos emitidos pela Mesclar Logística contêm códigos QR gerados exclusivamente em nosso sistema. Se recebeu um ficheiro com este código, o certificado pode ser falso ou ter sido revogado.
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/autores">
                <Button variant="gold" leftIcon={Search} className="w-full sm:w-auto">
                  Consultar Profissionais Verificados
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASE 1.5: PROFILE FOUND BUT NOT YET VALIDATED BY OWNER
  if (!result.isValidated) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-amber-50/50 via-white to-mesclar-cream/30 py-16 px-4">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 shadow-inner">
              <AlertTriangle className="h-10 w-10" />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Pendente de Validação
            </div>

            <h1 className="mt-4 text-2xl font-black text-mesclar-black sm:text-3xl">
              Currículo Aguardando Validação
            </h1>

            <p className="mt-3 text-sm text-mesclar-muted leading-relaxed">
              O perfil de <strong className="text-mesclar-black">{result.author.name}</strong> está registado no sistema, mas ainda não foi validado oficialmente pelo próprio titular.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left text-xs text-amber-900 leading-relaxed">
              Apenas perfis devidamente validados pelo profissional exibem o selo oficial e QR Code ativo para consulta pública.
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/autores/${result.author.slug}`}>
                <Button variant="gold" className="w-full sm:w-auto">
                  Ver Ficha Pública
                </Button>
              </Link>
              <Link href="/autores">
                <Button variant="outline" className="w-full sm:w-auto">
                  Outros Profissionais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: VALID / AUTHENTIC PROFILE
  const { author, certificateId, verifiedAt } = result;
  const statusStr = employmentLabel(author.employmentStatus);
  const academicStr = academicLabel(author.academicStatus);

  const formattedDate = verifiedAt.toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-mesclar-cream/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Certificate Card */}
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-2xl ring-1 ring-emerald-500/10">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-mesclar-black via-mesclar-gray to-mesclar-black p-6 sm:p-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Selo de Autenticidade Ativo
                  </span>
                  <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-white">
                    Perfil Profissional Validado
                  </h1>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-mesclar-gold-light/80">
                  Código de Certificação
                </p>
                <p className="font-mono text-sm sm:text-base font-black text-mesclar-gold">
                  {certificateId}
                </p>
              </div>
            </div>
          </div>

          {/* Validation Notice Bar */}
          <div className="border-b border-emerald-100 bg-emerald-50/80 px-6 py-3.5 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Certificado autêntico emitido por <strong>Mesclar Logística | Procurement</strong>.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verificado em: {formattedDate}</span>
            </div>
          </div>

          {/* Profile Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Photo */}
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl ring-4 ring-mesclar-gold/30 shadow-lg">
                <Image
                  src={author.photoUrl || "/authors/carlos-mendes.jpg"}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-black text-mesclar-black tracking-tight">
                  {author.name}
                </h2>
                {author.specialty && (
                  <p className="text-sm font-bold text-mesclar-gold-dark">
                    {author.specialty}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {statusStr && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mesclar-black px-3 py-1 text-xs font-semibold text-mesclar-gold-light">
                      <Briefcase className="h-3 w-3" />
                      {statusStr}
                    </span>
                  )}
                  {academicStr && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-mesclar-gold/30 bg-mesclar-cream px-3 py-1 text-xs font-semibold text-mesclar-black">
                      <GraduationCap className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                      {academicStr}
                    </span>
                  )}
                </div>

                {author.bio && (
                  <p className="pt-2 text-xs text-mesclar-muted leading-relaxed line-clamp-3">
                    {author.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Validation Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-mesclar-border/70 pt-6">
              <div className="rounded-xl border border-mesclar-border/70 bg-mesclar-cream/30 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                  Emissor
                </p>
                <p className="mt-1 text-xs font-bold text-mesclar-black flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                  Mesclar Logística
                </p>
              </div>

              <div className="rounded-xl border border-mesclar-border/70 bg-mesclar-cream/30 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                  Estado do Registo
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Ativo e Válido
                </p>
              </div>

              <div className="rounded-xl border border-mesclar-border/70 bg-mesclar-cream/30 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                  Certificado ID
                </p>
                <p className="mt-1 text-xs font-mono font-bold text-mesclar-black truncate">
                  {certificateId}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-mesclar-border/70">
              <Link href={`/autores/${author.slug}`} className="flex-1">
                <Button variant="gold" className="w-full" rightIcon={ArrowRight}>
                  Ver Perfil Completo na Mesclar
                </Button>
              </Link>
              <a href={`/api/authors/${author.slug}/pdf`} className="flex-1">
                <Button variant="secondary" className="w-full" leftIcon={Download}>
                  Baixar Ficha Validada (PDF)
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Informative Security Banner */}
        <div className="rounded-2xl border border-mesclar-border/80 bg-white p-5 text-xs text-mesclar-muted flex items-start gap-3 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-mesclar-black">
              Sobre a Validação Profissional Mesclar
            </p>
            <p className="mt-0.5 leading-relaxed">
              O selo de validação confirma que os dados do profissional foram revistos de acordo com as informações curriculares, qualificações e diretrizes de conformidade da Mesclar Logística.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

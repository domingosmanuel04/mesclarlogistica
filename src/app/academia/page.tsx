import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { prisma } from "@/lib/prisma";
import {
  GraduationCap,
  Award,
  BookCheck,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stripHtml } from "@/lib/html-utils";

export const metadata: Metadata = {
  title: "Academia Logística | Formações, Competências Técnicas e Certificações — Mesclar",
  description:
    "Cursos especializados, capacitação técnica, programas de avaliação e certificados profissionais para profissionais e empresas do sector logístico.",
};

export const dynamic = "force-dynamic";

export default async function AcademiaPage() {
  let trainings: any[] = [];
  try {
    trainings = await prisma.training.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Error loading trainings:", err);
    trainings = [];
  }

  const academicTracks = [
    {
      title: "Procurement e Compras Estratégicas",
      desc: "Negociação de contratos, matriz Kraljic, RFP/RFQ e qualificação de fornecedores globais e locais.",
      icon: Award,
    },
    {
      title: "Gestão Avançada de Armazéns e Stocks",
      desc: "WMS, controlo de inventário (FIFO/LIFO/FEFO), layout logístico e indicadores de produtividade.",
      icon: BookCheck,
    },
    {
      title: "Transporte, Frotas e Distribuição",
      desc: "Roteirização em Angola, cálculo de custo por quilómetro, manutenção preventiva e telemetria.",
      icon: Clock,
    },
    {
      title: "Aduanas e Comércio Internacional",
      desc: "Pauta Aduaneira, Desembaraço, Incoterms 2020 e trâmites portuários/aeroportuários.",
      icon: GraduationCap,
    },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Área Academia"
        title="Formações, Competências Técnicas e Certificações"
        description="Desenvolva competências práticas e estratégicas com formações e capacitações desenhadas para a realidade operacional de Angola e do comércio internacional."
      />

      {/* Pilares Formativos */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {academicTracks.map((track) => {
            const Icon = track.icon;
            return (
              <div
                key={track.title}
                className="surface-card flex flex-col justify-between p-6"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-bold text-mesclar-black">{track.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mesclar-muted">{track.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-mesclar-border/60">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mesclar-gold-dark">
                    <CheckCircle className="h-3.5 w-3.5" /> Certificado Incluído
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lista de Cursos / Formações Disponíveis */}
      <section className="border-t border-mesclar-border/60 bg-mesclar-surface/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-mesclar-gold-dark">
              Inscrições Abertas
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-mesclar-black sm:text-3xl">
              Cursos e Formações em Destaque
            </h2>
          </div>

          {trainings.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-mesclar-border bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-gold-dark">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-mesclar-black">
                Novas turmas em planeamento
              </h3>
              <p className="mt-1 text-sm text-mesclar-muted max-w-md mx-auto">
                As próximas datas de cursos executivos e capacitações serão anunciadas brevemente.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.map((item) => (
                <a
                  key={item.id}
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group surface-card surface-card-hover flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-mesclar-gold/50"
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
                      Formação Activa
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold leading-snug text-mesclar-black group-hover:text-mesclar-gold-dark transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-xs leading-relaxed text-mesclar-muted line-clamp-3">
                        {stripHtml(item.description)}
                      </p>
                    )}
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-mesclar-border/60">
                      <span className="text-xs font-semibold text-mesclar-gold-dark flex items-center gap-1">
                        Saber mais e Inscrição <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <ExternalLink className="h-4 w-4 text-mesclar-muted" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

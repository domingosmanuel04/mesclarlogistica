import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import {
  Briefcase,
  Layers,
  FileSpreadsheet,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  ArrowRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

import { JobActionButton } from "@/components/oportunidades/job-action-button";
import { getJobsWithInitialSeed } from "@/lib/jobs-seed";

export const metadata: Metadata = {
  title: "Oportunidades | Vagas, Serviço e Consultoria — Mesclar Logística",
  description:
    "Portal de vagas de emprego, consultoria especializada e pedidos de cotação para o sector de logística e compras em Angola.",
};

function formatPostedDate(date: Date) {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  return new Date(date).toLocaleDateString("pt-AO");
}

export default async function OportunidadesPage() {
  const jobs = await getJobsWithInitialSeed();

  return (
    <div>
      <PageHero
        eyebrow="Área Oportunidades"
        title="Vagas / Serviço / Consultoria"
        description="Conectamos empresas a profissionais capacitados, consultorias de alto impacto e fornecedores prontos para atender pedidos de cotação do sector logístico."
      />

      {/* 3 Blocos de Oportunidades */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="surface-card flex flex-col justify-between p-6">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark">
                <Briefcase className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-mesclar-black">Vagas de Emprego</h3>
              <p className="mt-2 text-sm text-mesclar-muted leading-relaxed">
                Oportunidades de carreira para operadores, coordenadores e gestores de supply chain e procurement.
              </p>
            </div>
            <a href="#vagas" className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-mesclar-gold-dark">
              Ver vagas recentes <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="surface-card flex flex-col justify-between p-6">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark">
                <Layers className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-mesclar-black">Serviços Especializados</h3>
              <p className="mt-2 text-sm text-mesclar-muted leading-relaxed">
                Consultoria em gestão de contratos, auditoria de fornecedores, diagnósticos de armazenagem e governança.
              </p>
            </div>
            <Link href="/servicos" className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-mesclar-gold-dark">
              Conhecer serviços <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="surface-card flex flex-col justify-between p-6">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark">
                <FileSpreadsheet className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-mesclar-black">Cotação / Informação</h3>
              <p className="mt-2 text-sm text-mesclar-muted leading-relaxed">
                Canal para empresas solicitarem orçamentos de frete, armazenagem, consultoria ou fornecimento especializado.
              </p>
            </div>
            <a href="#cotacao" className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-mesclar-gold-dark">
              Solicitar cotação <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Lista de Vagas Recentes */}
      <section id="vagas" className="border-t border-mesclar-border/60 bg-mesclar-surface/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-mesclar-gold-dark">
                Recrutamento do Sector
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-mesclar-black sm:text-3xl">
                Vagas Recentes
              </h2>
            </div>
            <Link href="/profissional/vagas">
              <Button variant="gold" size="sm" leftIcon={Briefcase}>
                Anunciar Vaga
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {jobs.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-mesclar-gold/50 mb-3" />
                <h3 className="text-base font-bold text-mesclar-black">Nenhuma vaga registada no momento</h3>
                <p className="mt-1 text-xs text-mesclar-muted">
                  Novas oportunidades serão publicadas em breve. Fique atento!
                </p>
              </div>
            ) : (
              jobs.map((job) => {
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
                          <Clock className="h-3.5 w-3.5" /> {formatPostedDate(job.createdAt)}
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
        </div>
      </section>

      {/* Secção de Pedido de Cotação */}
      <section id="cotacao" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-mesclar-gold/30 bg-gradient-to-br from-mesclar-black to-[#1a1a1a] p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-mesclar-gold">
              Cotação / informação
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Precisa de Propostas de Consultoria?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Descreva a sua necessidade operacional. Conectamos a sua empresa aos melhores prestadores qualificados e certificados da nossa rede.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/244921522885?text=Olá,%20gostaria%20de%20solicitar%20uma%20cotação/informação%20para%20a%20minha%20empresa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="gold" size="md" leftIcon={WhatsAppIcon}>
                  Enviar Pedido via WhatsApp
                </Button>
              </a>
              <Link href="/servicos">
                <Button variant="outline" size="md" className="border-white/20 text-white hover:bg-white/10">
                  Consultar Serviços Oferecidos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

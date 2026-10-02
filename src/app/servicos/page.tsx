import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Gestão de contratos, fornecedores, terceiros, governança, melhoria de processos e diagnósticos estratégicos — Mesclar Logística | Procurement.",
};

const WHATSAPP = "244921522885";

const services = [
  {
    number: "01",
    title: "Gestão de Contratos",
    tagline: "O ciclo de vida contratual sob controle, do primeiro rascunho à renovação.",
    description:
      "Implantação e operação do ciclo completo do contrato: repositório único, obrigações, SLAs, prazos, aditivos, renovações e rescisões — com trilha de auditoria e visão executiva.",
    points: [
      "Repositório único e gestão de obrigações",
      "Fim das renovações automáticas indesejadas",
      "Redução de riscos jurídicos e financeiros",
    ],
    image: "/services/gestao-contratos.jpg",
    imageAlt: "Gestão de contratos e ciclo de vida contratual",
  },
  {
    number: "02",
    title: "Gestão de Fornecedores",
    tagline: "Base de fornecedores qualificada, monitorada e orientada a performance.",
    description:
      "Homologação, segmentação, avaliação de desempenho e gestão de riscos da cadeia de suprimentos, com critérios objetivos e rituais de acompanhamento.",
    points: [
      "Homologação e segmentação por criticidade",
      "SRM, scorecards e planos de melhoria",
      "Gestão de riscos e dependência da cadeia",
    ],
    image: "/services/gestao-fornecedores.jpg",
    imageAlt: "Gestão e homologação de fornecedores",
  },
  {
    number: "03",
    title: "Gestão de Terceiros",
    tagline: "Terceirização com conformidade documental e segurança para o contratante.",
    description:
      "Controle de documentação, obrigações trabalhistas e previdenciárias, fiscalização de postos e mitigação de passivos em contratos de mão de obra terceirizada.",
    points: [
      "Checklist documental e conformidade mensal",
      "Mitigação de passivo trabalhista e solidário",
      "Fiscalização de postos, escopo e efetivo",
    ],
    image: "/services/gestao-terceiros.jpg",
    imageAlt: "Gestão de terceiros e conformidade",
  },
  {
    number: "04",
    title: "Governança e Compliance",
    tagline: "Políticas, alçadas e controles que sustentam decisões defensáveis.",
    description:
      "Estruturação de governança de compras e contratos: políticas corporativas, matriz de alçadas, controles internos, integridade e aderência regulatória.",
    points: [
      "Políticas, alçadas e matriz de responsabilidades",
      "Controles internos e trilha de auditoria",
      "Programa de integridade e due diligence",
    ],
    image: "/services/governanca-compliance.jpg",
    imageAlt: "Governança e compliance em compras",
  },
  {
    number: "05",
    title: "Melhoria de Processos",
    tagline: "Menos retrabalho, mais previsibilidade: o processo redesenhado para escalar.",
    description:
      "Mapeamento AS-IS/TO-BE, eliminação de gargalos, padronização de fluxos e automação do processo de source-to-contract e contract-to-pay.",
    points: [
      "Mapeamento AS-IS/TO-BE e redesenho de fluxos",
      "Indicadores, SLAs internos e rituais de gestão",
      "Automação e digitalização do ciclo",
    ],
    image: "/services/melhoria-processos.jpg",
    imageAlt: "Melhoria e redesenho de processos",
  },
  {
    number: "06",
    title: "Diagnósticos Estratégicos",
    tagline: "Avaliação de maturidade com plano de 30, 60, 90 e 120 dias.",
    description:
      "Diagnósticos rápidos e profundos que revelam gaps, prioridades e oportunidades de valor em contratos, fornecedores, terceiros, governança e processos.",
    points: [
      "Avaliação de maturidade em 6 dimensões",
      "Priorização de ações e quick wins",
      "Plano de 30-60-90-120 dias com entregáveis",
    ],
    image: "/services/diagnosticos-estrategicos.jpg",
    imageAlt: "Diagnósticos estratégicos e plano de maturidade",
  },
] as const;

function expertHref(serviceTitle: string) {
  const text = encodeURIComponent(
    `Olá! Quero falar com um especialista sobre: ${serviceTitle}.`
  );
  return `https://wa.me/${WHATSAPP}?text=${text}`;
}

export default function ServicosPage() {
  return (
    <div>
      <PageHero
        eyebrow="Consultoria Mesclar"
        title="Serviços especializados"
        description="Do contrato ao fornecedor, da conformidade à melhoria de processos — estruturamos a cadeia de compras e contratos com método, governança e entregáveis claros."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              className="group flex flex-col overflow-hidden rounded-2xl border border-mesclar-border bg-white shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-mesclar-gold/50 hover:shadow-[0_24px_50px_-28px_rgba(201,162,39,0.45)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-mesclar-black">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mesclar-black/80 via-mesclar-black/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-mesclar-gold/40 bg-mesclar-black/70 px-3 py-1 text-xs font-bold tracking-[0.2em] text-mesclar-gold-light backdrop-blur-sm">
                  {service.number}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-bold tracking-tight text-mesclar-black">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm font-medium leading-snug text-mesclar-gold-dark">
                  {service.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-mesclar-muted">
                  {service.description}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm text-mesclar-gray">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-mesclar-gold"
                        strokeWidth={2.5}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={expertHref(service.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-mesclar-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-mesclar-gold hover:text-mesclar-black"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Falar com o especialista
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

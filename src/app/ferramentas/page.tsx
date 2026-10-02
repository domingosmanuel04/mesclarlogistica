import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { LogisticsCalculators } from "./calculators";

export const metadata: Metadata = {
  title: "Ferramentas Logísticas | Calculadoras Operacionais — Mesclar",
  description:
    "Calculadoras operacionais de CBM, peso volumétrico e Lote Económico de Compras (EOQ) para a cadeia de abastecimento e compras.",
};

export default function FerramentasPage() {
  return (
    <div>
      <PageHero
        eyebrow="Área Ferramentas"
        title="Calculadoras e Recursos Técnicos"
        description="Ferramentas práticas para o dia a dia operacional e estratégico da cadeia de abastecimento. Faça simulações imediatas de cubagem, frete e custos de inventário."
      />

      {/* Calculadoras Interactivas */}
      <section id="calculadoras" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-mesclar-gold-dark">
            Simulação Online
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-mesclar-black sm:text-3xl">
            Calculadoras Operacionais
          </h2>
        </div>

        <LogisticsCalculators />
      </section>
    </div>
  );
}

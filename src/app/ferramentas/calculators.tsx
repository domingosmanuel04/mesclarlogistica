"use client";

import { useState } from "react";
import { Calculator, Box, TrendingDown, Layers, FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogisticsCalculators() {
  const [activeTab, setActiveTab] = useState<"cbm" | "eoq">("cbm");

  // CBM State
  const [lengthCm, setLengthCm] = useState<number>(100);
  const [widthCm, setWidthCm] = useState<number>(80);
  const [heightCm, setHeightCm] = useState<number>(120);
  const [units, setUnits] = useState<number>(10);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(500);

  // Calculations CBM
  const singleVolM3 = (lengthCm * widthCm * heightCm) / 1_000_000;
  const totalCbm = singleVolM3 * units;
  const airVolumetricWeight = totalCbm * 167; // Air rule: 1 m3 = 167 kg
  const seaVolumetricWeight = totalCbm * 1000; // Sea rule: 1 m3 = 1000 kg
  const airChargeableWeight = Math.max(grossWeightKg, airVolumetricWeight);
  const seaChargeableWeight = Math.max(grossWeightKg, seaVolumetricWeight);

  // EOQ State
  const [annualDemand, setAnnualDemand] = useState<number>(12000);
  const [orderCost, setOrderCost] = useState<number>(25000);
  const [holdingCost, setHoldingCost] = useState<number>(1500);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(15);

  // Calculations EOQ
  const eoq = Math.round(Math.sqrt((2 * annualDemand * orderCost) / (holdingCost || 1)));
  const dailyDemand = annualDemand / 365;
  const reorderPoint = Math.round(dailyDemand * leadTimeDays);

  return (
    <div className="surface-card overflow-hidden rounded-3xl border border-mesclar-border shadow-sm">
      {/* Selector Tabs */}
      <div className="flex border-b border-mesclar-border bg-mesclar-surface/60">
        <button
          type="button"
          onClick={() => setActiveTab("cbm")}
          className={`flex flex-1 items-center justify-center gap-2 py-4 px-6 text-sm font-bold transition-all ${
            activeTab === "cbm"
              ? "border-b-2 border-mesclar-gold bg-white text-mesclar-black"
              : "text-mesclar-muted hover:text-mesclar-black"
          }`}
        >
          <Box className="h-4 w-4 text-mesclar-gold-dark" />
          <span>Calculadora de CBM e Peso Taxável</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("eoq")}
          className={`flex flex-1 items-center justify-center gap-2 py-4 px-6 text-sm font-bold transition-all ${
            activeTab === "eoq"
              ? "border-b-2 border-mesclar-gold bg-white text-mesclar-black"
              : "text-mesclar-muted hover:text-mesclar-black"
          }`}
        >
          <TrendingDown className="h-4 w-4 text-mesclar-gold-dark" />
          <span>Lote Económico (EOQ) e Ponto de Pedido</span>
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === "cbm" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-mesclar-black">
                Dimensões da Carga e Quantidade
              </h3>
              <p className="mt-1 text-xs text-mesclar-muted">
                Introduza as medidas em centímetros de cada volume e o peso real total.
              </p>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Comprimento (cm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Largura (cm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={widthCm}
                      onChange={(e) => setWidthCm(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Quantidade de Caixas/Paletes
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={units}
                      onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Peso Bruto Total (kg)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={grossWeightKg}
                      onChange={(e) => setGrossWeightKg(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado CBM */}
            <div className="rounded-2xl border border-mesclar-gold/30 bg-mesclar-cream/30 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Resultados da Cubicagem
                </span>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="surface-card p-4 rounded-xl">
                    <p className="text-xs text-mesclar-muted">Volume Total (CBM)</p>
                    <p className="mt-1 text-2xl font-bold text-mesclar-black">
                      {totalCbm.toFixed(3)} <span className="text-sm font-medium">m³</span>
                    </p>
                  </div>
                  <div className="surface-card p-4 rounded-xl">
                    <p className="text-xs text-mesclar-muted">Peso Bruto Real</p>
                    <p className="mt-1 text-2xl font-bold text-mesclar-black">
                      {grossWeightKg} <span className="text-sm font-medium">kg</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="surface-card p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-mesclar-black">Frete Aéreo (IATA 1:6000)</p>
                      <p className="text-[11px] text-mesclar-muted">
                        Peso Volumétrico: {airVolumetricWeight.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-mesclar-muted">Peso Taxável</p>
                      <p className="text-base font-bold text-mesclar-gold-dark">
                        {airChargeableWeight.toFixed(1)} kg
                      </p>
                    </div>
                  </div>

                  <div className="surface-card p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-mesclar-black">Frete Marítimo LCL (1 CBM = 1000 kg)</p>
                      <p className="text-[11px] text-mesclar-muted">
                        Base: Tonelada ou Metro Cúbico (W/M)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-mesclar-muted">Medida Taxável</p>
                      <p className="text-base font-bold text-mesclar-gold-dark">
                        {Math.max(totalCbm, grossWeightKg / 1000).toFixed(2)} W/M
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-mesclar-muted">
                *O peso taxável é o valor considerado pelas companhias aéreas e marítimas para cobrança do frete.
              </p>
            </div>
          </div>
        )}

        {activeTab === "eoq" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-mesclar-black">
                Parâmetros de Gestão de Stocks
              </h3>
              <p className="mt-1 text-xs text-mesclar-muted">
                Calcule a quantidade óptima de compra que minimiza o custo total de encomenda e armazenagem.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                    Demanda Anual (unidades consumidas/ano)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={annualDemand}
                    onChange={(e) => setAnnualDemand(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Custo de Pedido (Kz por ordem)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={orderCost}
                      onChange={(e) => setOrderCost(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                      Custo de Posse Unitário (Kz/ano)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={holdingCost}
                      onChange={(e) => setHoldingCost(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mesclar-muted mb-1">
                    Tempo de Reposição / Lead Time do Fornecedor (dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-mesclar-border bg-white px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Resultado EOQ */}
            <div className="rounded-2xl border border-mesclar-gold/30 bg-mesclar-cream/30 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Decisão Óptima de Compras
                </span>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="surface-card p-4 rounded-xl">
                    <p className="text-xs text-mesclar-muted">Lote Económico (EOQ)</p>
                    <p className="mt-1 text-2xl font-bold text-mesclar-black">
                      {eoq.toLocaleString("pt-AO")}{" "}
                      <span className="text-sm font-medium">unid.</span>
                    </p>
                    <p className="mt-1 text-[11px] text-mesclar-muted">por pedido</p>
                  </div>
                  <div className="surface-card p-4 rounded-xl">
                    <p className="text-xs text-mesclar-muted">Ponto de Encomenda</p>
                    <p className="mt-1 text-2xl font-bold text-mesclar-gold-dark">
                      {reorderPoint.toLocaleString("pt-AO")}{" "}
                      <span className="text-sm font-medium">unid.</span>
                    </p>
                    <p className="mt-1 text-[11px] text-mesclar-muted">momento de disparar compra</p>
                  </div>
                </div>

                <div className="mt-4 surface-card p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-mesclar-muted">Consumo Diário Médio:</span>
                    <span className="font-semibold text-mesclar-black">
                      {dailyDemand.toFixed(1)} unid./dia
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mesclar-muted">Número de Pedidos por Ano:</span>
                    <span className="font-semibold text-mesclar-black">
                      {eoq > 0 ? (annualDemand / eoq).toFixed(1) : 0} ordens
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-mesclar-muted">
                *O Ponto de Encomenda garante que o novo lote chegue exactamente quando o stock atingir o nível de segurança.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

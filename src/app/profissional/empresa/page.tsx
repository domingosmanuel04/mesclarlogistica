"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  DashboardShell,
  sellerNav,
  PanelCard,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Upload,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export type SellerCompany = {
  id: string;
  name: string;
  category: string;
  location: string;
  coverage: string;
  services: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  certified: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_OPTIONS = [
  "Operador Logístico e Armazenagem",
  "Transitário Internacional e Despacho",
  "Transporte Rodoviário de Cargas",
  "Parque de Contentores e Armazém",
  "Fornecedor de Equipamentos e Paletes",
  "Despachante Aduaneiro Oficial",
  "Consultoria e Supply Chain",
  "Segurança e Rastreamento de Frotas",
  "Outro Sector Logístico",
];

export default function SellerEmpresaPage() {
  const [company, setCompany] = useState<SellerCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [location, setLocation] = useState("Luanda");
  const [coverage, setCoverage] = useState("Nacional (18 Províncias)");
  const [services, setServices] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const loadCompany = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/seller/company");
      if (!res.ok) throw new Error("Erro ao carregar dados da empresa.");
      const data: SellerCompany | null = await res.json();
      if (data && data.id) {
        setCompany(data);
        setName(data.name || "");
        setCategory(data.category || CATEGORY_OPTIONS[0]);
        setLocation(data.location || "Luanda");
        setCoverage(data.coverage || "Nacional");
        setServices(data.services || "");
        setDescription(data.description || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setWhatsapp(data.whatsapp || "");
        setWebsite(data.website || "");
        setLogoPreview(data.logoUrl || null);
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Erro de ligação." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !services.trim()) {
      setMessage({
        type: "error",
        text: "Nome da Empresa, Categoria e Serviços Principais são obrigatórios.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("category", category.trim());
      fd.append("location", location.trim());
      fd.append("coverage", coverage.trim());
      fd.append("services", services.trim());
      fd.append("description", description.trim());
      fd.append("email", email.trim());
      fd.append("phone", phone.trim());
      fd.append("whatsapp", whatsapp.trim());
      fd.append("website", website.trim());
      if (logoFile) {
        fd.append("logoFile", logoFile);
      }

      const res = await fetch("/api/seller/company", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível guardar os dados da empresa.");
      }

      setCompany(data);
      setMessage({
        type: "success",
        text: "Dados da empresa guardados com sucesso! O cadastro foi submetido para aprovação do Administrador.",
      });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Erro ao guardar dados." });
    } finally {
      setSaving(false);
    }
  }

  const parsedServicesList = services
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <DashboardShell
      title="Minha Empresa"
      subtitle="Cadastre o perfil da sua empresa de logística para constar no Directório Empresarial oficial da Mesclar após aprovação administrativa."
      nav={sellerNav}
      roleLabel="Painel do Profissional"
    >
      {/* STATUS BANNER */}
      {company && (
        <div>
          {company.status === "PENDING" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4.5 text-xs text-amber-900 flex items-start gap-3.5 shadow-xs">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950 text-sm">
                  Empresa em Análise de Aprovação
                </p>
                <p className="text-amber-800 leading-relaxed">
                  O cadastro da sua empresa foi submetido e está a ser avaliado pela equipa de administradores da Mesclar. Assim que for validado, o seu perfil ficará imediatamente público e acessível em <span className="font-semibold">Empresas / Directório</span>.
                </p>
              </div>
            </div>
          )}

          {company.status === "APPROVED" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4.5 text-xs text-emerald-900 flex items-start gap-3.5 shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-950 text-sm">
                  Empresa Aprovada e Activa no Directório Oficial!
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  A sua empresa está publicada e visível para operadores, directores de procurement e clientes de todo o país. Se editar as informações abaixo, a empresa voltará temporariamente para revisão.
                </p>
              </div>
            </div>
          )}

          {company.status === "REJECTED" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4.5 text-xs text-rose-900 flex items-start gap-3.5 shadow-xs">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-950 text-sm">
                  Candidatura Rejeitada pelo Administrador
                </p>
                {company.rejectionReason && (
                  <p className="text-rose-800 leading-relaxed font-medium">
                    Motivo: {company.rejectionReason}
                  </p>
                )}
                <p className="text-rose-700 leading-relaxed">
                  Pode ajustar os dados do formulário abaixo e clicar em Guardar para submeter uma nova solicitação de aprovação.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-medium border ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <div className="lg:col-span-2">
          <PanelCard title="Dados da Empresa e Directório">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-mesclar-gold border-t-transparent" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-mesclar-black">
                      Nome Comercial / Razão Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: TransLog Angola 3PL"
                      className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mesclar-black">
                      Categoria / Ramo de Actividade <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none bg-white"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-mesclar-black">
                      Localização / Sede
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Viana Park, Luanda"
                      className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mesclar-black">
                      Área de Cobertura
                    </label>
                    <input
                      type="text"
                      value={coverage}
                      onChange={(e) => setCoverage(e.target.value)}
                      placeholder="Ex: Nacional (18 Províncias) ou Internacional"
                      className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Serviços Principais Oferecidos <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-mesclar-muted mb-1.5">
                    Separe os serviços por vírgula ou quebras de linha (ex: Armazenagem climatizada, Cross-docking, Rastreio 24/7).
                  </p>
                  <textarea
                    rows={3}
                    required
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="Armazenagem com temperatura controlada&#10;Cross-docking&#10;Distribuição capilar nacional"
                    className="w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Descrição Institucional (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve resumo da trajetória da empresa, capacidade de frota, armazéns e certificações de qualidade..."
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                {/* CONTACTOS */}
                <div className="border-t border-[#F0F2F6] pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark mb-3">
                    Canais de Contacto da Empresa
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-mesclar-black">
                        Email Comercial
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="comercial@suaempresa.ao"
                        className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mesclar-black">
                        WhatsApp Corporativo
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+244 921 522 885"
                        className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mesclar-black">
                        Telefone Fixo / Móvel
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+244 222 000 000"
                        className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mesclar-black">
                        Website Oficial
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://www.suaempresa.ao"
                        className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* UPLOAD DE LOGÓTIPO */}
                <div className="border-t border-[#F0F2F6] pt-4">
                  <label className="block text-xs font-bold text-mesclar-black">
                    Logótipo Oficial da Empresa
                  </label>
                  <p className="text-[11px] text-mesclar-muted mb-2">
                    Formatos recomendados: PNG ou JPG com fundo transparente ou branco.
                  </p>

                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs">
                      <Upload className="h-4 w-4 text-mesclar-gold-dark" />
                      <span>{logoPreview ? "Substituir Logótipo" : "Carregar Logótipo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLogoFile(file);
                            setLogoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>

                    {logoFile && (
                      <span className="text-xs text-gray-600 truncate max-w-[200px]">
                        {logoFile.name}
                      </span>
                    )}
                  </div>

                  {logoPreview && (
                    <div className="mt-3 relative h-20 w-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-center">
                      <Image
                        src={logoPreview}
                        alt="Logótipo"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#F0F2F6] flex justify-end">
                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    disabled={saving}
                    leftIcon={saving ? RefreshCw : CheckCircle2}
                  >
                    {saving ? "A guardar..." : "Guardar & Submeter para Aprovação"}
                  </Button>
                </div>
              </form>
            )}
          </PanelCard>
        </div>

        {/* PRÉ-VISUALIZAÇÃO DO CARD NO DIRECTÓRIO */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-mesclar-muted mb-3">
              Pré-visualização no Directório
            </h3>

            <div className="surface-card flex flex-col justify-between p-6 rounded-3xl border border-mesclar-border bg-white shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                        <Image
                          src={logoPreview}
                          alt={name || "Empresa"}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark shrink-0">
                        <Building2 className="h-6 w-6" />
                      </span>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-mesclar-black line-clamp-1">
                        {name || "Nome da Sua Empresa"}
                      </h4>
                      <p className="text-xs font-medium text-mesclar-gold-dark">
                        {category}
                      </p>
                    </div>
                  </div>

                  {company?.certified && (
                    <span
                      title="Operador Certificado Mesclar"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-mesclar-cream text-mesclar-gold-dark shrink-0"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-mesclar-muted">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-mesclar-gold-dark shrink-0" />
                    <span>{location || "Luanda"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-mesclar-gold-dark shrink-0" />
                    <span>{coverage || "Nacional"}</span>
                  </p>
                </div>

                <div className="mt-5 border-t border-mesclar-border/60 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-mesclar-black">
                    Serviços Principais:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {parsedServicesList.length > 0 ? (
                      parsedServicesList.slice(0, 4).map((svc, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-mesclar-muted">
                          <CheckCircle className="h-3 w-3 text-mesclar-gold-dark shrink-0" />
                          <span className="line-clamp-1">{svc}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-gray-400 italic">
                        Insira os serviços para visualizar aqui.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-mesclar-border/60">
                <span className="text-xs font-semibold text-mesclar-gold-dark flex items-center gap-1.5">
                  <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Solicitar contacto via WhatsApp
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600">
              <p className="font-semibold text-gray-900 mb-1">Como funciona a aprovação?</p>
              <p className="leading-relaxed">
                A moderação verifica a congruência dos dados da sua empresa no sector logístico. Ao aprovar, o selo de certificação e a visibilidade são ativados no site para milhares de visitantes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

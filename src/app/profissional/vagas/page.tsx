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
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Pencil,
  X,
  Upload,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
  MapPin,
  Tag,
  Globe,
  FileImage,
  Info,
  Archive,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { LinkedInIcon } from "@/components/icons/linkedin-icon";

export type SellerJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  tags?: string | null;
  linkType: "WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER";
  linkUrl: string;
  bannerUrl?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  rejectionReason?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const CONTRACT_TYPES = [
  "Tempo Inteiro",
  "Meio Período",
  "Freelancer / Projecto",
  "Estágio Profissional",
  "Consultoria",
];

const LINK_TYPE_OPTIONS = [
  {
    type: "WHATSAPP" as const,
    label: "WhatsApp",
    sublabel: "Candidatura via WhatsApp",
    icon: WhatsAppIcon,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    urlPlaceholder: "+244 921 522 885 ou https://wa.me/244921522885",
  },
  {
    type: "LINKEDIN" as const,
    label: "LinkedIn",
    sublabel: "Link do anúncio no LinkedIn",
    icon: LinkedInIcon,
    color: "text-blue-700 bg-blue-50 border-blue-200",
    urlPlaceholder: "https://www.linkedin.com/jobs/view/...",
  },
  {
    type: "WEBSITE" as const,
    label: "Website",
    sublabel: "Portal ou formulário da empresa",
    icon: Globe,
    color: "text-amber-800 bg-amber-50 border-amber-200",
    urlPlaceholder: "https://www.empresa.co.ao/vagas/...",
  },
];

export default function SellerVagasPage() {
  const [jobs, setJobs] = useState<SellerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Luanda");
  const [type, setType] = useState("Tempo Inteiro");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [linkType, setLinkType] = useState<"WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER">("WHATSAPP");
  const [linkUrl, setLinkUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Edit Modal
  const [editingJob, setEditingJob] = useState<SellerJob | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLinkType, setEditLinkType] = useState<"WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER">("WHATSAPP");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seller/jobs");
      if (!res.ok) {
        setJobs([]);
        return;
      }
      const data = await res.json().catch(() => []);
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function resetCreateForm() {
    setTitle("");
    setCompany("");
    setLocation("Luanda");
    setType("Tempo Inteiro");
    setDescription("");
    setTags("");
    setLinkType("WHATSAPP");
    setLinkUrl("");
    setBannerFile(null);
    setBannerPreview(null);
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      setError("Indique o título do cargo e o nome da empresa.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("company", company.trim());
      fd.append("location", location.trim());
      fd.append("type", type.trim());
      fd.append("description", description.trim());
      fd.append("tags", tags.trim());
      fd.append("linkType", linkType);
      fd.append("linkUrl", linkUrl.trim());
      if (bannerFile) {
        fd.append("bannerFile", bannerFile);
      }

      const res = await fetch("/api/seller/jobs", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível submeter a vaga.");
      }

      resetCreateForm();
      setCreateModalOpen(false);
      loadJobs();
    } catch (e: any) {
      setError(e.message || "Erro ao criar vaga.");
    } finally {
      setBusy(false);
    }
  }

  function openEditModal(job: SellerJob) {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditCompany(job.company);
    setEditLocation(job.location);
    setEditType(job.type);
    setEditDescription(job.description || "");
    setEditTags(job.tags || "");
    setEditLinkType(job.linkType);
    setEditLinkUrl(job.linkUrl || "");
    setEditBannerFile(null);
    setEditBannerPreview(job.bannerUrl || null);
    setEditError("");
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingJob) return;
    if (!editTitle.trim() || !editCompany.trim()) {
      setEditError("Indique o título do cargo e a empresa.");
      return;
    }

    setEditSaving(true);
    setEditError("");
    try {
      const fd = new FormData();
      fd.append("id", editingJob.id);
      fd.append("title", editTitle.trim());
      fd.append("company", editCompany.trim());
      fd.append("location", editLocation.trim());
      fd.append("type", editType.trim());
      fd.append("description", editDescription.trim());
      fd.append("tags", editTags.trim());
      fd.append("linkType", editLinkType);
      fd.append("linkUrl", editLinkUrl.trim());
      if (editBannerFile) {
        fd.append("bannerFile", editBannerFile);
      }

      const res = await fetch("/api/seller/jobs", {
        method: "PATCH",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível guardar as alterações.");
      }

      setEditingJob(null);
      loadJobs();
    } catch (e: any) {
      setEditError(e.message || "Erro ao atualizar vaga.");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleCloseJob(id: string) {
    if (!confirm("Deseja marcar esta vaga como encerrada? Ela deixará de estar visível publicamente.")) {
      return;
    }

    try {
      const res = await fetch("/api/seller/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "close" }),
      });
      if (!res.ok) throw new Error("Erro ao encerrar vaga.");
      loadJobs();
    } catch (e: any) {
      alert(e.message || "Erro ao encerrar vaga.");
    }
  }

  async function handleDeleteJob(id: string) {
    if (!confirm("Tem a certeza que deseja eliminar permanentemente esta vaga?")) {
      return;
    }

    try {
      const res = await fetch(`/api/seller/jobs?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao eliminar vaga.");
      loadJobs();
    } catch (e: any) {
      alert(e.message || "Erro ao eliminar vaga.");
    }
  }

  function renderStatusBadge(status: SellerJob["status"]) {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprovada & Publicada
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Pendente de Aprovação
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            Rejeitada
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
            <Archive className="h-3.5 w-3.5" />
            Encerrada
          </span>
        );
    }
  }

  return (
    <DashboardShell
      title="Vagas de Emprego"
      subtitle="Publique anúncios de recrutamento. As vagas passam por verificação e aprovação da equipa Mesclar antes de serem exibidas no site."
      nav={sellerNav}
      roleLabel="Painel do Profissional"
    >
      {/* AVISO INFORMATIVO DE APROVAÇÃO */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            Processo de Moderação e Publicação
          </p>
          <p className="text-amber-800 leading-relaxed">
            Para garantir a credibilidade das ofertas na comunidade de logística em Angola, todas as vagas submetidas por profissionais são analisadas por um administrador antes de ficarem visíveis publicamente na página de <span className="font-semibold">Oportunidades</span>.
          </p>
        </div>
      </div>

      <PanelCard
        title="Minhas Vagas de Emprego"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadJobs}
              disabled={loading}
              leftIcon={RefreshCw}
            >
              Atualizar
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => {
                resetCreateForm();
                setCreateModalOpen(true);
              }}
              leftIcon={Plus}
            >
              Publicar Nova Vaga
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-mesclar-gold border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-base font-bold text-mesclar-black">Nenhuma vaga registada</h3>
            <p className="mt-1 text-xs text-mesclar-muted max-w-sm mx-auto">
              Ainda não cadastrou oportunidades de emprego. Clique no botão abaixo para submeter a primeira vaga da sua empresa ou cliente.
            </p>
            <div className="mt-6">
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  resetCreateForm();
                  setCreateModalOpen(true);
                }}
                leftIcon={Plus}
              >
                Publicar Nova Vaga
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-[#E2E6EE] p-5 hover:border-mesclar-gold/50 transition bg-white shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {job.bannerUrl ? (
                      <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                        <Image
                          src={job.bannerUrl}
                          alt={job.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark border border-mesclar-gold/20">
                        <Briefcase className="h-6 w-6" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-mesclar-black truncate">
                          {job.title}
                        </h4>
                        {renderStatusBadge(job.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-mesclar-muted">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <Building2 className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {job.type}
                        </span>
                      </div>

                      {job.rejectionReason && job.status === "REJECTED" && (
                        <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800">
                          <p className="font-semibold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            Motivo da Rejeição pelo Administrador:
                          </p>
                          <p className="mt-0.5 text-rose-700 leading-relaxed pl-4.5">
                            {job.rejectionReason}
                          </p>
                          <p className="mt-1 text-[11px] text-rose-600 pl-4.5">
                            Pode clicar em <strong>Editar</strong> para corrigir as informações e submeter novamente para aprovação.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(job)}
                      leftIcon={Pencil}
                    >
                      Editar
                    </Button>
                    {job.status !== "CLOSED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCloseJob(job.id)}
                        className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-xs"
                      >
                        Encerrar
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Eliminar vaga"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>

      {/* ======================================================== */}
      {/* MODAL: CRIAR NOVA VAGA                                   */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-mesclar-border overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-[#F0F2F6] px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-mesclar-black">Publicar Vaga de Emprego</h3>
                <p className="text-xs text-mesclar-muted">Preencha os detalhes da oportunidade para envio e análise.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Título da Vaga / Cargo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Gestor de Armazém e Logística"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Empresa Anunciante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Operador Logístico 3PL"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Localização (Província / Município)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Luanda (Viana)"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Tipo de Contrato
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none bg-white"
                  >
                    {CONTRACT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Descrição e Requisitos da Vaga
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades, requisitos académicos, experiência prévia e benefícios..."
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Competências / Palavras-chave (Tags)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: WMS, Inventário, Gestão de Frotas, Primavera ERP"
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              {/* TIPO DE CONTACTO / CANDIDATURA */}
              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1.5">
                  Canal de Candidatura
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LINK_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = linkType === opt.type;
                    return (
                      <button
                        type="button"
                        key={opt.type}
                        onClick={() => setLinkType(opt.type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                          active
                            ? "border-mesclar-gold bg-mesclar-cream/60 ring-2 ring-mesclar-gold/30 text-mesclar-black"
                            : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1 ${active ? "text-mesclar-gold-dark" : "text-gray-500"}`} />
                        <span className="text-xs font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  {linkType === "WHATSAPP"
                    ? "Contacto WhatsApp para Candidatura"
                    : linkType === "LINKEDIN"
                    ? "Link da Vaga no LinkedIn"
                    : linkType === "WEBSITE"
                    ? "Website ou Link de Candidatura"
                    : "URL ou Informação do Anúncio"}
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={
                    LINK_TYPE_OPTIONS.find((o) => o.type === linkType)?.urlPlaceholder
                  }
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              {/* UPLOAD DE BANNER / CARTAZ */}
              <div className="border-t border-[#F0F2F6] pt-4">
                <label className="block text-xs font-bold text-mesclar-black">
                  Cartaz ou Imagem da Vaga (Opcional)
                </label>
                <p className="text-[11px] text-mesclar-muted mb-2">
                  Caso possua um panfleto ou cartaz publicitário da vaga, anexe aqui.
                </p>

                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs">
                    <Upload className="h-4 w-4 text-mesclar-gold-dark" />
                    <span>Selecionar Ficheiro</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBannerFile(file);
                          setBannerPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {bannerFile && (
                    <span className="text-xs text-gray-600 truncate max-w-[200px]">
                      {bannerFile.name}
                    </span>
                  )}
                </div>

                {bannerPreview && (
                  <div className="mt-3 relative h-32 w-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={bannerPreview}
                      alt="Pré-visualização"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(null);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#F0F2F6] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={busy}
                  leftIcon={busy ? RefreshCw : CheckCircle2}
                >
                  {busy ? "A submeter..." : "Submeter Vaga para Análise"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR VAGA EXISTENTE                            */}
      {/* ======================================================== */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-mesclar-border overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-[#F0F2F6] px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-mesclar-black">Editar Vaga de Emprego</h3>
                <p className="text-xs text-mesclar-muted">
                  Ao atualizar, a vaga passará novamente por revisão da moderação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {editError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {editError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Título da Vaga / Cargo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Empresa Anunciante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Localização (Província / Município)
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Tipo de Contrato
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none bg-white"
                  >
                    {CONTRACT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Descrição e Requisitos da Vaga
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Competências / Palavras-chave (Tags)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1.5">
                  Canal de Candidatura
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LINK_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = editLinkType === opt.type;
                    return (
                      <button
                        type="button"
                        key={opt.type}
                        onClick={() => setEditLinkType(opt.type)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                          active
                            ? "border-mesclar-gold bg-mesclar-cream/60 ring-2 ring-mesclar-gold/30 text-mesclar-black"
                            : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1 ${active ? "text-mesclar-gold-dark" : "text-gray-500"}`} />
                        <span className="text-xs font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Link ou Telefone
                </label>
                <input
                  type="text"
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              {/* UPLOAD OU ALTERAÇÃO DE BANNER */}
              <div className="border-t border-[#F0F2F6] pt-4">
                <label className="block text-xs font-bold text-mesclar-black">
                  Cartaz ou Imagem da Vaga
                </label>

                <div className="flex items-center gap-4 mt-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs">
                    <Upload className="h-4 w-4 text-mesclar-gold-dark" />
                    <span>Substituir Ficheiro</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditBannerFile(file);
                          setEditBannerPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {editBannerFile && (
                    <span className="text-xs text-gray-600 truncate max-w-[200px]">
                      {editBannerFile.name}
                    </span>
                  )}
                </div>

                {editBannerPreview && (
                  <div className="mt-3 relative h-32 w-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={editBannerPreview}
                      alt="Pré-visualização"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#F0F2F6] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingJob(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={editSaving}
                  leftIcon={editSaving ? RefreshCw : CheckCircle2}
                >
                  {editSaving ? "A guardar..." : "Guardar & Reenviar para Moderação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

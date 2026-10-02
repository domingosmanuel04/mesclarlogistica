"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Briefcase,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  FileImage,
  Upload,
  Layers,
  Building2,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { LinkedInIcon } from "@/components/icons/linkedin-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminJobRow = {
  id: string;
  sellerId?: string | null;
  seller?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  tags: string;
  linkType: "WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER";
  linkUrl: string;
  bannerUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  rejectionReason?: string | null;
  sortOrder: number;
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
    sublabel: "Mensagem directa",
    icon: WhatsAppIcon,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    activeColor: "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-500",
    urlLabel: "Número de Telefone ou Link WhatsApp",
    urlPlaceholder: "+244 921 522 885 ou https://wa.me/244921522885",
    helperText: "Os candidatos enviarão mensagem directa com o título da vaga pré-preenchido.",
  },
  {
    type: "LINKEDIN" as const,
    label: "LinkedIn",
    sublabel: "Página de vagas",
    icon: LinkedInIcon,
    color: "text-blue-700 bg-blue-50 border-blue-200",
    activeColor: "ring-2 ring-blue-500 bg-blue-50 border-blue-500",
    urlLabel: "URL da Vaga ou Perfil no LinkedIn",
    urlPlaceholder: "https://www.linkedin.com/jobs/view/... ou perfil da empresa",
    helperText: "Redireciona directamente para o anúncio no LinkedIn.",
  },
  {
    type: "WEBSITE" as const,
    label: "Link do Site",
    sublabel: "Portal da empresa",
    icon: Globe,
    color: "text-amber-800 bg-amber-50 border-amber-200",
    activeColor: "ring-2 ring-amber-500 bg-amber-50 border-amber-500",
    urlLabel: "URL do Website ou Formulário de Candidatura",
    urlPlaceholder: "https://www.empresa.co.ao/carreiras/...",
    helperText: "Redireciona para o portal corporativo ou formulário oficial.",
  },
];

export function AdminJobsManager() {
  const [jobs, setJobs] = useState<AdminJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [linkTypeFilter, setLinkTypeFilter] = useState<string>("ALL");
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<AdminJobRow | null>(null);
  const [deleteJob, setDeleteJob] = useState<AdminJobRow | null>(null);
  const [previewBannerJob, setPreviewBannerJob] = useState<AdminJobRow | null>(null);
  const [rejectionModalJob, setRejectionModalJob] = useState<AdminJobRow | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "Luanda, Angola",
    type: "Tempo Inteiro",
    description: "",
    tags: "",
    linkType: "WHATSAPP" as "WHATSAPP" | "LINKEDIN" | "WEBSITE" | "BANNER",
    linkUrl: "",
    bannerUrl: "",
    sortOrder: 0,
    active: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showMessage(text: string, type: "success" | "error") {
    setFeedback({ text, type });
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      if (!res.ok) throw new Error("Erro ao carregar vagas.");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function resetForm() {
    setFormData({
      title: "",
      company: "",
      location: "Luanda, Angola",
      type: "Tempo Inteiro",
      description: "",
      tags: "",
      linkType: "WHATSAPP",
      linkUrl: "",
      bannerUrl: "",
      sortOrder: 0,
      active: true,
    });
    setSelectedFile(null);
    setPreviewFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openCreateModal() {
    resetForm();
    setCreateModalOpen(true);
  }

  function openEditModal(job: AdminJobRow) {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description || "",
      tags: job.tags || "",
      linkType: job.linkType,
      linkUrl: job.linkUrl || "",
      bannerUrl: job.bannerUrl || "",
      sortOrder: job.sortOrder,
      active: job.active,
    });
    setSelectedFile(null);
    setPreviewFileUrl(job.bannerUrl || null);
    setEditJob(job);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewFileUrl(url);
    }
  }

  async function handleSaveJob(isEdit: boolean) {
    if (!formData.title.trim()) {
      showMessage("Indique o título da vaga.", "error");
      return;
    }
    if (!formData.company.trim()) {
      showMessage("Indique a empresa contratante.", "error");
      return;
    }

    if (formData.linkType !== "BANNER" && !formData.linkUrl.trim()) {
      showMessage(`Por favor, indique o link ou contacto para ${formData.linkType}.`, "error");
      return;
    }

    setActionLoading(isEdit ? "edit" : "create");
    try {
      const bodyData = new FormData();
      bodyData.append("action", isEdit ? "edit" : "create");
      if (isEdit && editJob) {
        bodyData.append("jobId", editJob.id);
      }
      bodyData.append("title", formData.title.trim());
      bodyData.append("company", formData.company.trim());
      bodyData.append("location", formData.location.trim());
      bodyData.append("type", formData.type.trim());
      bodyData.append("description", formData.description.trim());
      bodyData.append("tags", formData.tags.trim());
      bodyData.append("linkType", formData.linkType);
      bodyData.append("linkUrl", formData.linkUrl.trim());
      bodyData.append("bannerUrl", formData.bannerUrl.trim());
      bodyData.append("sortOrder", String(formData.sortOrder));
      bodyData.append("active", formData.active ? "true" : "false");

      if (selectedFile) {
        bodyData.append("bannerFile", selectedFile);
      }

      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        body: bodyData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao guardar vaga.");

      showMessage(isEdit ? "Vaga actualizada com sucesso!" : "Vaga criada com sucesso!", "success");
      setCreateModalOpen(false);
      setEditJob(null);
      resetForm();
      fetchJobs();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao guardar.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleActive(job: AdminJobRow) {
    setActionLoading(`toggle-${job.id}`);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-active",
          jobId: job.id,
          active: !job.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar estado.");

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, active: !j.active } : j))
      );
      showMessage(`Vaga ${!job.active ? "activada" : "desactivada"} com sucesso.`, "success");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao alterar estado.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteJob() {
    if (!deleteJob) return;
    setActionLoading(`delete-${deleteJob.id}`);
    try {
      const res = await fetch(`/api/admin/jobs?id=${deleteJob.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao eliminar vaga.");

      setJobs((prev) => prev.filter((j) => j.id !== deleteJob.id));
      showMessage("Vaga eliminada com sucesso.", "success");
      setDeleteJob(null);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao eliminar.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApproveJob(job: AdminJobRow) {
    setActionLoading(`approve-${job.id}`);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aprovar vaga.");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? { ...j, status: "APPROVED", active: true, rejectionReason: null }
            : j
        )
      );
      showMessage("Vaga aprovada com sucesso! Já está pública no portal.", "success");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao aprovar vaga.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectJob() {
    if (!rejectionModalJob) return;
    setActionLoading(`reject-${rejectionModalJob.id}`);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectionModalJob.id,
          action: "reject",
          reason: rejectionReasonInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao rejeitar vaga.");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === rejectionModalJob.id
            ? {
                ...j,
                status: "REJECTED",
                active: false,
                rejectionReason: rejectionReasonInput.trim(),
              }
            : j
        )
      );
      showMessage("Vaga rejeitada. O profissional poderá consultar o motivo.", "success");
      setRejectionModalJob(null);
      setRejectionReasonInput("");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao rejeitar vaga.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, approvalFilter, linkTypeFilter]);

  // Filtered list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search.trim() === "" ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && job.active) ||
        (statusFilter === "INACTIVE" && !job.active);

      const matchesApproval =
        approvalFilter === "ALL" ||
        job.status === approvalFilter ||
        (!job.status && approvalFilter === "APPROVED");

      const matchesLinkType =
        linkTypeFilter === "ALL" || job.linkType === linkTypeFilter;

      return matchesSearch && matchesStatus && matchesApproval && matchesLinkType;
    });
  }, [jobs, search, statusFilter, approvalFilter, linkTypeFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const pagedJobs = useMemo(() => {
    return filteredJobs.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredJobs, page]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "PENDING").length,
      approved: jobs.filter((j) => j.status === "APPROVED" || !j.status).length,
      rejected: jobs.filter((j) => j.status === "REJECTED").length,
      active: jobs.filter((j) => j.active).length,
      whatsapp: jobs.filter((j) => j.linkType === "WHATSAPP").length,
      linkedin: jobs.filter((j) => j.linkType === "LINKEDIN").length,
      website: jobs.filter((j) => j.linkType === "WEBSITE").length,
      banner: jobs.filter((j) => j.linkType === "BANNER").length,
    };
  }, [jobs]);

  const selectedLinkConfig = LINK_TYPE_OPTIONS.find((opt) => opt.type === formData.linkType)!;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium shadow-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header com Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-mesclar-black flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-mesclar-gold-dark" />
            Vagas de Emprego e Oportunidades
          </h2>
          <p className="mt-1 text-xs text-mesclar-muted">
            Registe e faça a gestão das vagas exibidas na página de Oportunidades e na Home. Configure o canal de candidatura (WhatsApp, LinkedIn ou Site).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchJobs}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="gold"
            size="sm"
            leftIcon={Plus}
            onClick={openCreateModal}
          >
            Nova Vaga
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="surface-card p-4 rounded-2xl border border-mesclar-border/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
            Total Vagas
          </span>
          <p className="mt-1 text-2xl font-bold text-mesclar-black">{stats.total}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Activas no Portal
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.active}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-emerald-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <WhatsAppIcon className="h-3 w-3" /> WhatsApp
          </span>
          <p className="mt-1 text-2xl font-bold text-mesclar-black">{stats.whatsapp}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-blue-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <LinkedInIcon className="h-3 w-3" /> LinkedIn
          </span>
          <p className="mt-1 text-2xl font-bold text-mesclar-black">{stats.linkedin}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-amber-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Site Web
          </span>
          <p className="mt-1 text-2xl font-bold text-mesclar-black">{stats.website}</p>
        </div>
      </div>

      {/* Abas de Moderação e Aprovação */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F0F2F6] pb-3">
        <button
          type="button"
          onClick={() => setApprovalFilter("ALL")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
            approvalFilter === "ALL"
              ? "bg-mesclar-black text-mesclar-gold shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Todas ({stats.total})
        </button>

        <button
          type="button"
          onClick={() => setApprovalFilter("PENDING")}
          className={`relative rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            approvalFilter === "PENDING"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Pendentes</span>
          {stats.pending > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white font-extrabold animate-pulse">
              {stats.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setApprovalFilter("APPROVED")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            approvalFilter === "APPROVED"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Aprovadas ({stats.approved})</span>
        </button>

        <button
          type="button"
          onClick={() => setApprovalFilter("REJECTED")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            approvalFilter === "REJECTED"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
          }`}
        >
          <X className="h-3.5 w-3.5" />
          <span>Rejeitadas ({stats.rejected})</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="surface-card p-4 rounded-2xl border border-mesclar-border/80 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mesclar-muted" />
          <input
            type="text"
            placeholder="Pesquisar por cargo, empresa, localização ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
          >
            <option value="ALL">Todos os estados</option>
            <option value="ACTIVE">Apenas Activas</option>
            <option value="INACTIVE">Apenas Inactivas</option>
          </select>

          <select
            value={linkTypeFilter}
            onChange={(e) => setLinkTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
          >
            <option value="ALL">Todos os tipos de link</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="WEBSITE">Site Web</option>
          </select>
        </div>
      </div>

      {/* Lista de Vagas */}
      {loading ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-mesclar-gold" />
          <p className="mt-3 text-xs text-mesclar-muted">A carregar vagas...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <Briefcase className="mx-auto h-12 w-12 text-mesclar-gold/40 mb-3" />
          <h3 className="text-base font-bold text-mesclar-black">Nenhuma vaga encontrada</h3>
          <p className="mt-1 text-xs text-mesclar-muted">
            {search || statusFilter !== "ALL" || approvalFilter !== "ALL" || linkTypeFilter !== "ALL"
              ? "Tente ajustar os filtros ou a pesquisa."
              : "Clique em 'Nova Vaga' para registar a primeira oportunidade."}
          </p>
          {(search || statusFilter !== "ALL" || approvalFilter !== "ALL" || linkTypeFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setApprovalFilter("ALL");
                setLinkTypeFilter("ALL");
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {pagedJobs.map((job) => {
            const tagsList = job.tags ? job.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
            const isToggling = actionLoading === `toggle-${job.id}`;
            const isDeleting = actionLoading === `delete-${job.id}`;

            return (
              <div
                key={job.id}
                className={`surface-card p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  job.active ? "border-mesclar-border" : "border-gray-200 bg-gray-50/60 opacity-80"
                }`}
              >
                {/* Informações da vaga */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-mesclar-black">{job.title}</h3>
                    <span className="rounded-full bg-mesclar-black px-2.5 py-0.5 text-[10px] font-semibold text-mesclar-gold-light">
                      {job.type}
                    </span>
                    {/* Status de Moderação */}
                    {job.status === "PENDING" && (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                        🟡 Pendente
                      </span>
                    )}
                    {job.status === "REJECTED" && (
                      <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                        🔴 Rejeitada
                      </span>
                    )}
                    {job.status === "APPROVED" && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        🟢 Aprovada
                      </span>
                    )}
                    {/* Autor */}
                    {job.seller ? (
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        Profissional: {job.seller.user.name}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                        Admin
                      </span>
                    )}
                    {!job.active && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        Inactiva
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                    <span className="flex items-center gap-1 font-semibold text-mesclar-black">
                      <Building2 className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Ordem: #{job.sortOrder}
                    </span>
                  </div>

                  {job.description && (
                    <p className="mt-2 text-xs text-mesclar-muted line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  {tagsList.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {tagsList.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[10px] font-medium text-mesclar-gold-dark"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Canal de Candidatura configurado */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-mesclar-muted">Canal escolhido:</span>
                    {job.linkType === "WHATSAPP" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                        <WhatsAppIcon className="h-3 w-3" /> WhatsApp: {job.linkUrl || "Configurado"}
                      </span>
                    )}
                    {job.linkType === "LINKEDIN" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200">
                        <LinkedInIcon className="h-3 w-3" /> LinkedIn ({job.linkUrl ? "Link activo" : "Sem link"})
                      </span>
                    )}
                    {job.linkType === "WEBSITE" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200">
                        <Globe className="h-3 w-3" /> Site da Empresa
                      </span>
                    )}
                    {job.linkType === "BANNER" && (
                      <button
                        type="button"
                        onClick={() => setPreviewBannerJob(job)}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800 border border-purple-200 hover:bg-purple-100 transition"
                      >
                        <FileImage className="h-3 w-3" /> Cartaz da Vaga (Ver Imagem)
                      </button>
                    )}
                  </div>

                  {job.status === "REJECTED" && job.rejectionReason && (
                    <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-rose-800">
                      <strong>Motivo da rejeição:</strong> {job.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Ações da vaga */}
                <div className="shrink-0 flex flex-wrap md:flex-col items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-mesclar-border/60">
                  {job.status === "PENDING" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <button
                        type="button"
                        onClick={() => handleApproveJob(job)}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition shadow-xs"
                        title="Aprovar e publicar no site"
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionModalJob(job);
                          setRejectionReasonInput("");
                        }}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition"
                        title="Rejeitar vaga"
                      >
                        <X className="h-3.5 w-3.5" /> Rejeitar
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* Botão de alternar activo */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(job)}
                      disabled={isToggling}
                      title={job.active ? "Desactivar vaga" : "Activar vaga"}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        job.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {isToggling ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : job.active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>

                    {/* Botão de editar */}
                    <button
                      type="button"
                      onClick={() => openEditModal(job)}
                      className="p-2 rounded-xl text-xs font-semibold bg-white border border-mesclar-border text-mesclar-black hover:bg-mesclar-surface transition"
                      title="Editar vaga"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Botão de eliminar */}
                    <button
                      type="button"
                      onClick={() => setDeleteJob(job)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition"
                      title="Eliminar vaga"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Teste do botão como o utilizador vê */}
                  <div className="mt-1">
                    {job.linkType === "WHATSAPP" && (
                      <a
                        href={
                          job.linkUrl.startsWith("http")
                            ? job.linkUrl
                            : `https://wa.me/${job.linkUrl.replace(/\D/g, "")}?text=Olá,%20tenho%20interesse%20na%20vaga:%20${encodeURIComponent(
                                job.title
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Testar link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {(job.linkType === "LINKEDIN" || job.linkType === "WEBSITE") && (
                      <a
                        href={job.linkUrl.startsWith("http") ? job.linkUrl : `https://${job.linkUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-mesclar-gold-dark hover:underline"
                      >
                        Testar link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {job.linkType === "BANNER" && (
                      <button
                        type="button"
                        onClick={() => setPreviewBannerJob(job)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline"
                      >
                        Visualizar cartaz <Eye className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-mesclar-border/60 bg-mesclar-cream/20 px-6 py-4 rounded-2xl">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </Button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all",
                    n === page
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm font-bold"
                      : "text-gray-500 hover:bg-white hover:text-mesclar-black"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Seguinte →
            </Button>
          </div>
        )}
      </>
    )}

      {/* MODAL: CRIAR / EDITAR VAGA */}
      {(createModalOpen || editJob) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-mesclar-border">
              <div>
                <h3 className="text-lg font-bold text-mesclar-black flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-mesclar-gold-dark" />
                  {editJob ? "Editar Vaga de Emprego" : "Registar Nova Vaga"}
                </h3>
                <p className="text-xs text-mesclar-muted mt-0.5">
                  Escolha o canal correcto para os profissionais submeterem a candidatura.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditJob(null);
                }}
                className="rounded-full p-2 text-mesclar-muted hover:bg-black/5 hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveJob(Boolean(editJob));
              }}
              className="mt-6 space-y-5"
            >
              {/* Título e Empresa */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Título da Vaga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gestor de Armazém e Stock"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Empresa Contratante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Operador Logístico 3PL"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                  />
                </div>
              </div>

              {/* Localização e Regime */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Localização (Província / Município)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Viana, Luanda"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Tipo de Contrato
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Breve Descrição / Requisitos
                </label>
                <textarea
                  rows={3}
                  placeholder="Resuma as responsabilidades principais, requisitos e perfil desejado..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1 flex items-center justify-between">
                  <span>Tags / Palavras-chave</span>
                  <span className="text-[10px] text-mesclar-muted font-normal">Separadas por vírgula</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: WMS, Inventário, Liderança, Excel"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                />
              </div>

              {/* ESCOLHA DO CANAL DE CANDIDATURA (LINK TYPE) */}
              <div className="pt-2 border-t border-mesclar-border">
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Canal de Candidatura (O que deve aparecer ao utilizador?) <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-mesclar-muted mb-3">
                  Escolha como os candidatos devem aceder ou candidatar-se a esta vaga:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {LINK_TYPE_OPTIONS.map((opt) => {
                    const isSelected = formData.linkType === opt.type;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, linkType: opt.type })}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? opt.activeColor
                            : "border-mesclar-border bg-white hover:bg-mesclar-surface text-mesclar-black"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl mb-1.5 ${
                            isSelected ? "bg-white shadow-sm" : "bg-mesclar-surface"
                          }`}
                        >
                          <IconComp className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] text-mesclar-muted mt-0.5">{opt.sublabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input condicional baseado no linkType escolhido */}
                <div className="mt-4 p-4 rounded-2xl bg-mesclar-surface/80 border border-mesclar-border">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedLinkConfig.type === "WHATSAPP" && (
                      <WhatsAppIcon className="h-4 w-4 text-emerald-600" />
                    )}
                    {selectedLinkConfig.type === "LINKEDIN" && (
                      <LinkedInIcon className="h-4 w-4 text-blue-600" />
                    )}
                    {selectedLinkConfig.type === "WEBSITE" && (
                      <Globe className="h-4 w-4 text-amber-700" />
                    )}
                    <span className="text-xs font-bold text-mesclar-black">
                      Configuração do {selectedLinkConfig.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-mesclar-muted mb-3">
                    {selectedLinkConfig.helperText}
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-mesclar-black mb-1">
                      {selectedLinkConfig.urlLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedLinkConfig.urlPlaceholder}
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Ordem e Estado */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-mesclar-border">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
                  />
                  <span className="text-[10px] text-mesclar-muted">
                    Valores menores aparecem primeiro (ex: 1, 2, 3).
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-xs font-bold text-mesclar-black">
                    {formData.active ? "Activa no portal" : "Inactiva (Oculta)"}
                  </span>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-mesclar-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditJob(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={actionLoading !== null}
                >
                  {actionLoading ? "A guardar..." : editJob ? "Guardar Alterações" : "Criar Vaga"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINAÇÃO */}
      {deleteJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <span className="rounded-full bg-red-100 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-mesclar-black">Eliminar Vaga</h3>
            </div>
            <p className="text-xs text-mesclar-muted leading-relaxed">
              Tem a certeza de que deseja eliminar permanentemente a vaga{" "}
              <strong className="text-mesclar-black font-semibold">"{deleteJob.title}"</strong> da empresa{" "}
              <strong className="text-mesclar-black font-semibold">{deleteJob.company}</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteJob(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteJob}
                disabled={actionLoading !== null}
              >
                {actionLoading ? "A eliminar..." : "Sim, Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DE CARTAZ */}
      {previewBannerJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewBannerJob(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl w-full overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-mesclar-border px-6 py-4 bg-mesclar-surface">
              <div>
                <h3 className="font-bold text-mesclar-black">{previewBannerJob.title}</h3>
                <p className="text-xs text-mesclar-muted">{previewBannerJob.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBannerJob(null)}
                className="rounded-full p-2 text-mesclar-muted hover:bg-black/5 hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full bg-mesclar-black max-h-[65vh]">
              <Image
                src={previewBannerJob.bannerUrl || previewBannerJob.linkUrl || "/covers/supply-chain.jpg"}
                alt={`Cartaz da vaga ${previewBannerJob.title}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="flex items-center justify-between border-t border-mesclar-border px-6 py-3 bg-mesclar-surface text-xs text-mesclar-muted">
              <span>Cartaz oficial da vaga</span>
              <a
                href={previewBannerJob.bannerUrl || previewBannerJob.linkUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-mesclar-gold-dark hover:underline"
              >
                Abrir imagem em tamanho real <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJEITAR VAGA COM MOTIVO */}
      {rejectionModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="rounded-full bg-rose-100 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-mesclar-black">Rejeitar Vaga de Emprego</h3>
            </div>
            <p className="text-xs text-mesclar-muted leading-relaxed">
              Indique ao profissional o motivo da rejeição da vaga{" "}
              <strong className="text-mesclar-black font-semibold">"{rejectionModalJob.title}"</strong>. Esta mensagem será exibida com transparência no painel dele.
            </p>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Ex: A descrição está incompleta / É necessário informar os contactos oficiais válidos..."
              className="mt-3 w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
            />
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectionModalJob(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleRejectJob}
                disabled={actionLoading !== null}
              >
                {actionLoading ? "A rejeitar..." : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

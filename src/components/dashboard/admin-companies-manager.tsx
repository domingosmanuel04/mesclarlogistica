"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Building2,
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
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MapPin,
  Truck,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminCompanyRow = {
  id: string;
  sellerId?: string | null;
  seller?: {
    id: string;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  } | null;
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
  sortOrder: number;
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

export function AdminCompaniesManager() {
  const [companies, setCompanies] = useState<AdminCompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AdminCompanyRow | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<AdminCompanyRow | null>(null);
  const [rejectionModalCompany, setRejectionModalCompany] = useState<AdminCompanyRow | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORY_OPTIONS[0]);
  const [formLocation, setFormLocation] = useState("Luanda");
  const [formCoverage, setFormCoverage] = useState("Nacional (18 Províncias)");
  const [formServices, setFormServices] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formCertified, setFormCertified] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formLogoFile, setFormLogoFile] = useState<File | null>(null);
  const [formLogoPreview, setFormLogoPreview] = useState<string | null>(null);

  function showMessage(text: string, type: "success" | "error") {
    setFeedback({ text, type });
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao carregar empresas.");
      }
      setCompanies(Array.isArray(data) ? data : []);
    } catch (e: any) {
      showMessage(e.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  function resetForm() {
    setFormName("");
    setFormCategory(CATEGORY_OPTIONS[0]);
    setFormLocation("Luanda");
    setFormCoverage("Nacional (18 Províncias)");
    setFormServices("");
    setFormDescription("");
    setFormEmail("");
    setFormPhone("");
    setFormWhatsapp("");
    setFormWebsite("");
    setFormCertified(false);
    setFormActive(true);
    setFormLogoFile(null);
    setFormLogoPreview(null);
  }

  function openCreateModal() {
    resetForm();
    setEditingCompany(null);
    setCreateModalOpen(true);
  }

  function openEditModal(c: AdminCompanyRow) {
    setEditingCompany(c);
    setFormName(c.name);
    setFormCategory(c.category);
    setFormLocation(c.location);
    setFormCoverage(c.coverage);
    setFormServices(c.services);
    setFormDescription(c.description || "");
    setFormEmail(c.email || "");
    setFormPhone(c.phone || "");
    setFormWhatsapp(c.whatsapp || "");
    setWebsite(c.website || "");
    setFormCertified(c.certified);
    setFormActive(c.active);
    setFormLogoFile(null);
    setFormLogoPreview(c.logoUrl || null);
    setCreateModalOpen(true);
  }

  function setWebsite(url: string) {
    setFormWebsite(url);
  }

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim() || !formServices.trim()) {
      showMessage("Nome da Empresa, Categoria e Serviços Principais são obrigatórios.", "error");
      return;
    }

    setActionLoading("save");
    try {
      const fd = new FormData();
      if (editingCompany) {
        fd.append("id", editingCompany.id);
      }
      fd.append("name", formName.trim());
      fd.append("category", formCategory.trim());
      fd.append("location", formLocation.trim());
      fd.append("coverage", formCoverage.trim());
      fd.append("services", formServices.trim());
      fd.append("description", formDescription.trim());
      fd.append("email", formEmail.trim());
      fd.append("phone", formPhone.trim());
      fd.append("whatsapp", formWhatsapp.trim());
      fd.append("website", formWebsite.trim());
      fd.append("certified", formCertified ? "true" : "false");
      fd.append("active", formActive ? "true" : "false");
      if (formLogoFile) {
        fd.append("logoFile", formLogoFile);
      }

      const url = "/api/admin/companies";
      const method = editingCompany ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar empresa.");

      showMessage(
        editingCompany ? "Empresa actualizada com sucesso." : "Empresa criada com sucesso.",
        "success"
      );
      setCreateModalOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (e: any) {
      showMessage(e.message || "Erro ao guardar.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApproveCompany(company: AdminCompanyRow) {
    setActionLoading(`approve-${company.id}`);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: company.id, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aprovar empresa.");

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id
            ? { ...c, status: "APPROVED", active: true, rejectionReason: null }
            : c
        )
      );
      showMessage("Empresa aprovada com sucesso! Já está pública no Directório.", "success");
    } catch (e: any) {
      showMessage(e.message || "Erro ao aprovar empresa.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectCompany() {
    if (!rejectionModalCompany) return;
    setActionLoading(`reject-${rejectionModalCompany.id}`);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectionModalCompany.id,
          action: "reject",
          reason: rejectionReasonInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao rejeitar empresa.");

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === rejectionModalCompany.id
            ? {
                ...c,
                status: "REJECTED",
                active: false,
                rejectionReason: rejectionReasonInput.trim(),
              }
            : c
        )
      );
      showMessage("Candidatura da empresa rejeitada. O profissional foi notificado do motivo.", "success");
      setRejectionModalCompany(null);
      setRejectionReasonInput("");
    } catch (e: any) {
      showMessage(e.message || "Erro ao rejeitar.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleCertified(c: AdminCompanyRow) {
    setActionLoading(`cert-${c.id}`);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, action: "toggle-certified", certified: !c.certified }),
      });
      if (!res.ok) throw new Error("Erro ao alternar certificação.");
      setCompanies((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, certified: !item.certified } : item))
      );
      showMessage(`Selo de certificação ${!c.certified ? "atribuído" : "removido"}.`, "success");
    } catch (e: any) {
      showMessage(e.message || "Erro.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleActive(c: AdminCompanyRow) {
    setActionLoading(`active-${c.id}`);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, action: "toggle-active", active: !c.active }),
      });
      if (!res.ok) throw new Error("Erro ao alternar visibilidade.");
      setCompanies((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, active: !item.active } : item))
      );
      showMessage(`Empresa ${!c.active ? "activada" : "oculta"} no directório.`, "success");
    } catch (e: any) {
      showMessage(e.message || "Erro.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteCompany() {
    if (!deleteCompany) return;
    setActionLoading(`delete-${deleteCompany.id}`);
    try {
      const res = await fetch(`/api/admin/companies?id=${deleteCompany.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao eliminar empresa.");
      setCompanies((prev) => prev.filter((item) => item.id !== deleteCompany.id));
      showMessage("Empresa eliminada com sucesso.", "success");
      setDeleteCompany(null);
    } catch (e: any) {
      showMessage(e.message || "Erro ao eliminar.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.services.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [companies, search, categoryFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const pagedCompanies = useMemo(() => {
    return filteredCompanies.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredCompanies, page]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      pending: companies.filter((c) => c.status === "PENDING").length,
      approved: companies.filter((c) => c.status === "APPROVED").length,
      rejected: companies.filter((c) => c.status === "REJECTED").length,
      certified: companies.filter((c) => c.certified).length,
    };
  }, [companies]);

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-xl transition-all duration-300 ${
            feedback.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Top Header Card */}
      <div className="surface-card p-6 rounded-3xl border border-mesclar-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-gold-dark">
            Directório Empresarial
          </span>
          <h2 className="mt-1 text-xl font-extrabold text-mesclar-black">
            Gestão de Empresas e Prestadores
          </h2>
          <p className="mt-1 text-xs text-mesclar-muted max-w-xl">
            Aprove candidaturas de empresas submetidas por profissionais, gira certificações oficiais e publique fornecedores de logística no ecossistema Mesclar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchCompanies}
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
            Adicionar Empresa
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="surface-card p-4 rounded-2xl border border-mesclar-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
            Total Empresas
          </span>
          <p className="mt-1 text-2xl font-bold text-mesclar-black">{stats.total}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Pendentes
          </span>
          <p className="mt-1 text-2xl font-bold text-amber-900">{stats.pending}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Aprovadas
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{stats.approved}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-rose-200/80 bg-rose-50/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
            Rejeitadas
          </span>
          <p className="mt-1 text-2xl font-bold text-rose-900">{stats.rejected}</p>
        </div>
        <div className="surface-card p-4 rounded-2xl border border-mesclar-cream bg-mesclar-cream/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-mesclar-gold-dark flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Certificadas
          </span>
          <p className="mt-1 text-2xl font-bold text-mesclar-black">{stats.certified}</p>
        </div>
      </div>

      {/* Abas de Moderação e Status */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F0F2F6] pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
            statusFilter === "ALL"
              ? "bg-mesclar-black text-mesclar-gold shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          Todas ({stats.total})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`relative rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === "PENDING"
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
          onClick={() => setStatusFilter("APPROVED")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === "APPROVED"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Aprovadas ({stats.approved})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === "REJECTED"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
          }`}
        >
          <X className="h-3.5 w-3.5" />
          <span>Rejeitadas ({stats.rejected})</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="surface-card p-4 rounded-2xl border border-mesclar-border flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mesclar-muted" />
          <input
            type="text"
            placeholder="Pesquisar por nome da empresa, categoria, localização ou serviços..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-mesclar-border bg-white text-mesclar-black focus:outline-none focus:ring-2 focus:ring-mesclar-gold"
        >
          <option value="ALL">Todas as categorias</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Empresas */}
      {loading ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-mesclar-gold" />
          <p className="mt-3 text-xs text-mesclar-muted">A carregar directório...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <Building2 className="mx-auto h-12 w-12 text-mesclar-gold/40 mb-3" />
          <h3 className="text-base font-bold text-mesclar-black">Nenhuma empresa encontrada</h3>
          <p className="mt-1 text-xs text-mesclar-muted">
            {search || categoryFilter !== "ALL" || statusFilter !== "ALL"
              ? "Tente ajustar os filtros ou os termos de pesquisa."
              : "Clique em 'Adicionar Empresa' para registar a primeira."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {pagedCompanies.map((c) => {
            const isCertifying = actionLoading === `cert-${c.id}`;
            const isActivating = actionLoading === `active-${c.id}`;
            const servicesList = c.services
              ? c.services
                  .split(/[\n,;]+/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];

            return (
              <div
                key={c.id}
                className={`surface-card p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-5 ${
                  c.active ? "border-mesclar-border" : "border-gray-200 bg-gray-50/60 opacity-80"
                }`}
              >
                {/* Logo + Dados da Empresa */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {c.logoUrl ? (
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 p-1 flex items-center justify-center">
                      <Image
                        src={c.logoUrl}
                        alt={c.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-gold-dark border border-mesclar-gold/20">
                      <Building2 className="h-7 w-7" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-mesclar-black">{c.name}</h3>

                      {/* Status Badge */}
                      {c.status === "PENDING" && (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          🟡 Pendente
                        </span>
                      )}
                      {c.status === "APPROVED" && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          🟢 Aprovada
                        </span>
                      )}
                      {c.status === "REJECTED" && (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                          🔴 Rejeitada
                        </span>
                      )}

                      {/* Selo Certificada */}
                      {c.certified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-mesclar-cream border border-mesclar-gold/40 px-2.5 py-0.5 text-[10px] font-bold text-mesclar-gold-dark">
                          <ShieldCheck className="h-3 w-3" /> Certificada
                        </span>
                      )}

                      {/* Autor */}
                      {c.seller ? (
                        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                          Profissional: {c.seller.user.name} ({c.seller.user.email})
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                          Admin
                        </span>
                      )}

                      {!c.active && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                          Oculta no directório
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-mesclar-muted pt-0.5">
                      <span className="font-semibold text-mesclar-gold-dark">
                        {c.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {c.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-gray-400" />
                        {c.coverage}
                      </span>
                    </div>

                    {c.description && (
                      <p className="mt-1.5 text-xs text-mesclar-muted line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}

                    {/* Serviços */}
                    {servicesList.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {servicesList.map((svc, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-mesclar-surface px-2 py-0.5 text-[10px] font-medium text-mesclar-black border border-mesclar-border"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contactos */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-mesclar-muted pt-1">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                          <span>{c.whatsapp}</span>
                        </a>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{c.phone}</span>
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span>{c.email}</span>
                        </span>
                      )}
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-mesclar-gold-dark hover:underline font-semibold"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>Website</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>

                    {/* Alerta de motivo de rejeição */}
                    {c.status === "REJECTED" && c.rejectionReason && (
                      <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800">
                        <strong>Motivo da rejeição:</strong> {c.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acções */}
                <div className="shrink-0 flex flex-wrap md:flex-col items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-mesclar-border/60">
                  {/* Botões de Aprovação Rápida se Pendente */}
                  {c.status === "PENDING" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <button
                        type="button"
                        onClick={() => handleApproveCompany(c)}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionModalCompany(c);
                          setRejectionReasonInput("");
                        }}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition"
                      >
                        <X className="h-3.5 w-3.5" /> Rejeitar
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* Botão de alternar Certificação Mesclar */}
                    <button
                      type="button"
                      onClick={() => handleToggleCertified(c)}
                      disabled={isCertifying}
                      title={c.certified ? "Remover selo de certificação" : "Atribuir selo de certificação"}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        c.certified
                          ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </button>

                    {/* Botão de alternar visibilidade */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      disabled={isActivating}
                      title={c.active ? "Ocultar do directório" : "Tornar visível no directório"}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        c.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {c.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {/* Botão de editar */}
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-2 rounded-xl text-xs font-semibold bg-white border border-mesclar-border text-mesclar-black hover:bg-mesclar-surface transition"
                      title="Editar empresa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Botão de eliminar */}
                    <button
                      type="button"
                      onClick={() => setDeleteCompany(c)}
                      className="p-2 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition"
                      title="Eliminar empresa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

      {/* ======================================================== */}
      {/* MODAL: CRIAR / EDITAR EMPRESA                            */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-mesclar-border overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-[#F0F2F6] px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-mesclar-black">
                  {editingCompany ? "Editar Empresa" : "Registar Nova Empresa"}
                </h3>
                <p className="text-xs text-mesclar-muted">
                  Preencha as informações para publicação no directório oficial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Nome da Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: TransLog Angola 3PL"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: Viana Park, Luanda"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Cobertura Geográfica
                  </label>
                  <input
                    type="text"
                    value={formCoverage}
                    onChange={(e) => setFormCoverage(e.target.value)}
                    placeholder="Ex: Nacional (18 Províncias)"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Serviços Oferecidos <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-mesclar-muted mb-1.5">
                  Separe os serviços por vírgula ou quebras de linha.
                </p>
                <textarea
                  rows={3}
                  required
                  value={formServices}
                  onChange={(e) => setFormServices(e.target.value)}
                  placeholder="Armazenagem com temperatura controlada&#10;Cross-docking&#10;Distribuição capilar"
                  className="w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black">
                  Descrição / Apresentação Institucional
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Breve descrição da empresa e capacidade operacional..."
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="comercial@empresa.ao"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="+244 921 522 885"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mesclar-black">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
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
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://www.empresa.ao"
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Logótipo */}
              <div className="border-t border-[#F0F2F6] pt-4">
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Logótipo da Empresa
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs">
                    <Upload className="h-4 w-4 text-mesclar-gold-dark" />
                    <span>Carregar Logótipo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormLogoFile(file);
                          setFormLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {formLogoPreview && (
                    <div className="relative h-12 w-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <Image
                        src={formLogoPreview}
                        alt="Logo"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Opções de Certificação e Actividade */}
              <div className="border-t border-[#F0F2F6] pt-4 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-mesclar-black">
                  <input
                    type="checkbox"
                    checked={formCertified}
                    onChange={(e) => setFormCertified(e.target.checked)}
                    className="h-4 w-4 rounded text-mesclar-gold focus:ring-mesclar-gold"
                  />
                  <span>Atribuir Selo de Empresa Certificada Mesclar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-mesclar-black">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="h-4 w-4 rounded text-mesclar-gold focus:ring-mesclar-gold"
                  />
                  <span>Activa no Directório Público</span>
                </label>
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
                  disabled={actionLoading !== null}
                  leftIcon={actionLoading ? RefreshCw : CheckCircle2}
                >
                  {actionLoading ? "A guardar..." : editingCompany ? "Guardar Alterações" : "Criar Empresa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REJEITAR CANDIDATURA DE EMPRESA                  */}
      {/* ======================================================== */}
      {rejectionModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="rounded-full bg-rose-100 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-mesclar-black">Rejeitar Empresa</h3>
            </div>
            <p className="text-xs text-mesclar-muted leading-relaxed">
              Indique ao profissional o motivo da recusa do registo da empresa{" "}
              <strong className="text-mesclar-black font-semibold">"{rejectionModalCompany.name}"</strong>.
            </p>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Ex: A documentação/contactos fornecidos não são válidos..."
              className="mt-3 w-full rounded-xl border border-mesclar-border p-3 text-xs text-mesclar-black focus:border-mesclar-gold focus:outline-none"
            />
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectionModalCompany(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleRejectCompany}
                disabled={actionLoading !== null}
              >
                {actionLoading ? "A rejeitar..." : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR ELIMINAÇÃO                             */}
      {/* ======================================================== */}
      {deleteCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <span className="rounded-full bg-red-100 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-mesclar-black">Eliminar Empresa</h3>
            </div>
            <p className="text-xs text-mesclar-muted leading-relaxed">
              Tem a certeza de que deseja eliminar permanentemente a empresa{" "}
              <strong className="text-mesclar-black font-semibold">"{deleteCompany.name}"</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCompany(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteCompany}
                disabled={actionLoading !== null}
              >
                {actionLoading ? "A eliminar..." : "Sim, Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

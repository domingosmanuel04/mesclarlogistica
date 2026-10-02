"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  KeyRound,
  LogIn,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Receipt,
  Mail,
  Phone,
  MessageCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  BookOpen,
  ShoppingBag,
  Lock,
  ArrowUpRight,
  Filter,
  GraduationCap,
  FileText,
  BadgeCheck,
  QrCode,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";

export type AdminSellerRow = {
  id: string;
  userId: string;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    role: "SELLER" | "ADMIN" | "CUSTOMER";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    orders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      total: number;
      createdAt: string;
      payment: {
        id: string;
        approvedAt: string | null;
      } | null;
    }>;
    _count: {
      orders: number;
      downloads: number;
    };
  };
  author?: {
    id: string;
    userId: string | null;
    name: string;
    slug: string;
    specialty: string | null;
    bio: string | null;
    photoUrl: string | null;
    isValidated: boolean;
    validatedAt: string | null;
  } | null;
  _count: {
    books: number;
    orders: number;
    trainings: number;
    articles: number;
  };
  books: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    priceEbook: number;
    pricePhysical: number | null;
    productType: string;
  }>;
  trainings: Array<{
    id: string;
    title: string;
    active: boolean;
  }>;
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: "Pag. Pendente", color: "text-amber-700 bg-amber-50 border-amber-200" },
  PAYMENT_APPROVED: { label: "Aprovado / Pago", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  DELIVERED: { label: "Entregue", color: "text-blue-700 bg-blue-50 border-blue-200" },
  CANCELLED: { label: "Cancelado", color: "text-rose-700 bg-rose-50 border-rose-200" },
};

export function AdminSellersManager() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [sellers, setSellers] = useState<AdminSellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [validatedFilter, setValidatedFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editSeller, setEditSeller] = useState<AdminSellerRow | null>(null);
  const [passwordSeller, setPasswordSeller] = useState<AdminSellerRow | null>(null);
  const [renewSeller, setRenewSeller] = useState<AdminSellerRow | null>(null);
  const [deleteSeller, setDeleteSeller] = useState<AdminSellerRow | null>(null);

  // Form states
  const [newSellerData, setNewSellerData] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "Consultor de Logística e Supply Chain",
    bio: "",
    phone: "",
    whatsapp: "",
    isActive: true,
    isValidated: true,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    bio: "",
    phone: "",
    whatsapp: "",
    isActive: true,
    isValidated: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function showMessage(text: string, type: "success" | "error") {
    setFeedback({ text, type });
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchSellers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      if (!res.ok) throw new Error("Erro ao carregar lista de profissionais.");
      const data = await res.json();
      setSellers(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSellers();
  }, []);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, validatedFilter]);

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.user.name.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        (s.author?.specialty && s.author.specialty.toLowerCase().includes(q)) ||
        (s.user.phone && s.user.phone.includes(q)) ||
        (s.user.whatsapp && s.user.whatsapp.includes(q));

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && s.isActive && s.user.isActive) ||
        (statusFilter === "INACTIVE" && (!s.isActive || !s.user.isActive));

      const matchValidated =
        validatedFilter === "ALL" ||
        (validatedFilter === "VALIDATED" && s.author?.isValidated) ||
        (validatedFilter === "PENDING" && !s.author?.isValidated);

      return matchQuery && matchStatus && matchValidated;
    });
  }, [sellers, search, statusFilter, validatedFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredSellers.length / pageSize));
  const pagedSellers = useMemo(() => {
    return filteredSellers.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredSellers, page]);

  // Totals
  const stats = useMemo(() => {
    const total = sellers.length;
    const active = sellers.filter((s) => s.isActive && s.user.isActive).length;
    const inactive = total - active;
    const validated = sellers.filter((s) => s.author?.isValidated).length;
    const totalBooks = sellers.reduce((acc, s) => acc + (s._count?.books || 0), 0);
    const totalTrainings = sellers.reduce((acc, s) => acc + (s._count?.trainings || 0), 0);
    return { total, active, inactive, validated, totalBooks, totalTrainings };
  }, [sellers]);

  // 1. Toggle Active
  async function handleToggleActive(seller: AdminSellerRow) {
    if (seller.userId === currentUserId) {
      showMessage("Não pode desactivar a sua própria conta de administrador.", "error");
      return;
    }

    const nextState = !(seller.isActive && seller.user.isActive);
    setActionLoading(`toggle-${seller.id}`);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-active",
          sellerId: seller.id,
          userId: seller.userId,
          isActive: nextState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar estado.");

      setSellers((prev) =>
        prev.map((s) =>
          s.id === seller.id
            ? { ...s, isActive: nextState, user: { ...s.user, isActive: nextState } }
            : s
        )
      );
      showMessage(
        nextState
          ? `Profissional "${seller.user.name}" activado com sucesso.`
          : `Profissional "${seller.user.name}" foi desactivado.`,
        "success"
      );
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao actualizar estado.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 2. Toggle Validated (Selo e QR Code)
  async function handleToggleValidate(seller: AdminSellerRow) {
    const nextVal = !seller.author?.isValidated;
    setActionLoading(`validate-${seller.id}`);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-validate",
          userId: seller.userId,
          authorId: seller.author?.id,
          isValidated: nextVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar validação.");

      setSellers((prev) =>
        prev.map((s) =>
          s.id === seller.id
            ? {
                ...s,
                author: s.author
                  ? { ...s.author, isValidated: nextVal, validatedAt: nextVal ? new Date().toISOString() : null }
                  : null,
              }
            : s
        )
      );
      showMessage(
        nextVal
          ? `Perfil de "${seller.user.name}" VALIDADO com selo oficial e QR Code!`
          : `Validação do perfil de "${seller.user.name}" foi removida.`,
        "success"
      );
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao alterar validação.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 3. Change Password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordSeller) return;
    if (newPassword.length < 6) {
      showMessage("A nova palavra-passe deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    setActionLoading("password");
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          userId: passwordSeller.userId,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar palavra-passe.");

      showMessage(`Palavra-passe de "${passwordSeller.user.name}" alterada com sucesso!`, "success");
      setPasswordSeller(null);
      setNewPassword("");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao alterar palavra-passe.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 4. Create Professional
  async function handleCreateSeller(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("create");
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newSellerData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar profissional.");

      showMessage(`Profissional "${newSellerData.name}" criado com perfil de autor activo!`, "success");
      setCreateModalOpen(false);
      setNewSellerData({
        name: "",
        email: "",
        password: "",
        specialty: "Consultor de Logística e Supply Chain",
        bio: "",
        phone: "",
        whatsapp: "",
        isActive: true,
        isValidated: true,
      });
      fetchSellers();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao criar profissional.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 5. Edit Professional
  function openEditModal(seller: AdminSellerRow) {
    setEditSeller(seller);
    setEditFormData({
      name: seller.user.name,
      email: seller.user.email,
      specialty: seller.author?.specialty || "",
      bio: seller.author?.bio || seller.bio || "",
      phone: seller.user.phone || "",
      whatsapp: seller.user.whatsapp || "",
      isActive: seller.isActive && seller.user.isActive,
      isValidated: Boolean(seller.author?.isValidated),
    });
  }

  async function handleEditSeller(e: React.FormEvent) {
    e.preventDefault();
    if (!editSeller) return;
    setActionLoading("edit");
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          sellerId: editSeller.id,
          userId: editSeller.userId,
          ...editFormData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar alterações.");

      showMessage(`Dados de "${editFormData.name}" actualizados com sucesso!`, "success");
      setEditSeller(null);
      fetchSellers();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao editar profissional.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 6. Delete Professional
  async function handleDeleteSeller() {
    if (!deleteSeller) return;
    if (deleteSeller.userId === currentUserId) {
      showMessage("Não pode eliminar a sua própria conta de administrador.", "error");
      return;
    }

    setActionLoading("delete");
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          sellerId: deleteSeller.id,
          userId: deleteSeller.userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao eliminar profissional.");

      setSellers((prev) => prev.filter((s) => s.id !== deleteSeller.id));
      showMessage(`Profissional "${deleteSeller.user.name}" eliminado com sucesso.`, "success");
      setDeleteSeller(null);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao eliminar profissional.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 7. Impersonate / Access Dashboard
  async function handleImpersonate(seller: AdminSellerRow) {
    setActionLoading(`impersonate-${seller.id}`);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "impersonate",
          sellerId: seller.id,
          userId: seller.userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar acesso ao painel.");

      showMessage(`Iniciando sessão no painel profissional de "${seller.user.name}"... A redireccionar...`, "success");

      const loginRes = await signIn("credentials", {
        impersonateToken: data.impersonateToken,
        redirect: false,
      });

      if (loginRes?.error) {
        throw new Error("Falha na autenticação directa: " + loginRes.error);
      }

      window.location.href = data.redirectUrl || "/profissional";
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao aceder ao painel.", "error");
      setActionLoading(null);
    }
  }

  // 8. Renew Payment
  async function handleRenewPayment(userId: string, orderId?: string) {
    setActionLoading(`renew-${userId}`);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "renew-payment",
          userId,
          orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao renovar pagamento.");

      showMessage(`Pagamento do pedido ${data.orderNumber} renovado e aprovado com sucesso!`, "success");
      setRenewSeller(null);
      fetchSellers();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao renovar pagamento.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-lg transition-all animate-in fade-in ${
            feedback.type === "success"
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white"
              : "border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white"
          }`}
        >
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
              feedback.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-rose-500 to-rose-700"
            }`}
          >
            {feedback.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold ${feedback.type === "success" ? "text-emerald-950" : "text-rose-950"}`}>
              {feedback.text}
            </p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-mesclar-muted hover:text-mesclar-black transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">Profissionais</span>
            <Briefcase className="h-4 w-4 text-mesclar-gold-dark" />
          </div>
          <p className="mt-2 text-2xl font-black text-mesclar-black">{stats.total}</p>
          <p className="text-[11px] text-mesclar-muted">Formadores, autores e consultores</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Activos</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.active}</p>
          <p className="text-[11px] text-mesclar-muted">Com loja e painel activos</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Validados</span>
            <BadgeCheck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.validated}</p>
          <p className="text-[11px] text-mesclar-muted">Com selo e QR Code oficial</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Publicações</span>
            <BookOpen className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-900">{stats.totalBooks}</p>
          <p className="text-[11px] text-mesclar-muted">Livros e obras activas</p>
        </div>
      </div>

      {/* Main Header Card with Controls */}
      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/10 via-white to-mesclar-gold/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-mesclar-black">
                Gestão Total de Profissionais
              </h2>
              <p className="text-xs text-mesclar-muted">
                Controlo de perfis de formadores, acesso a painéis, validação de selo e publicações
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="gold"
              leftIcon={Plus}
              onClick={() => setCreateModalOpen(true)}
              className="shadow-sm font-bold"
            >
              Novo Profissional
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchSellers}
              disabled={loading}
              title="Actualizar dados"
            >
              {loading ? "A carregar..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid gap-3 border-b border-mesclar-border/60 bg-mesclar-cream/20 p-4 sm:grid-cols-12 sm:items-center">
          <div className="relative sm:col-span-6 lg:col-span-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mesclar-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por profissional, email, especialidade ou telefone..."
              className="input-field w-full pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-6 lg:col-span-6 sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-mesclar-muted mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Validação:</span>
            </div>
            <select
              value={validatedFilter}
              onChange={(e) => setValidatedFilter(e.target.value)}
              className="rounded-xl border border-mesclar-border bg-white px-3 py-2 text-xs font-semibold text-mesclar-black shadow-sm focus:outline-none focus:ring-1 focus:ring-mesclar-gold"
            >
              <option value="ALL">Todas as Validações</option>
              <option value="VALIDATED">Apenas Validados (Selo/QR)</option>
              <option value="PENDING">Não Validados / Pendentes</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-mesclar-muted ml-2 mr-1">
              <span>Estado:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-mesclar-border bg-white px-3 py-2 text-xs font-semibold text-mesclar-black shadow-sm focus:outline-none focus:ring-1 focus:ring-mesclar-gold"
            >
              <option value="ALL">Todos os Estados</option>
              <option value="ACTIVE">Apenas Activos</option>
              <option value="INACTIVE">Apenas Inactivos</option>
            </select>
          </div>
        </div>

        {/* Sellers List */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-mesclar-cream/50" />
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-muted">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-bold text-mesclar-black">Nenhum profissional encontrado</h3>
            <p className="mt-1 text-xs text-mesclar-muted">
              Tente ajustar a pesquisa ou os filtros de selecção.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-mesclar-border/60">
            {pagedSellers.map((seller) => {
              const isSelf = seller.userId === currentUserId;
              const photo = seller.author?.photoUrl;
              const initials = seller.user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const isActive = seller.isActive && seller.user.isActive;
              const isValidated = Boolean(seller.author?.isValidated);
              const isActing = actionLoading?.includes(seller.id);

              return (
                <div
                  key={seller.id}
                  className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    !isActive ? "bg-rose-50/20 opacity-80" : "hover:bg-mesclar-cream/20"
                  }`}
                >
                  {/* Profile info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-mesclar-border bg-gradient-to-br from-mesclar-gray to-mesclar-black shadow-sm">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={seller.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-black text-mesclar-gold text-sm tracking-wider">
                          {initials}
                        </div>
                      )}
                      {/* Active / Inactive Dot */}
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          isActive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        title={isActive ? "Perfil Activo" : "Perfil Desactivado"}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-mesclar-black text-sm truncate">
                          {seller.user.name}
                        </h4>

                        {seller.author?.slug && (
                          <Link
                            href={`/autores/${seller.author.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-0.5 text-[11px] text-mesclar-gold-dark hover:underline font-semibold"
                            title="Ver perfil público"
                          >
                            <span>Ver perfil</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}

                        {isSelf && (
                          <span className="rounded-md bg-mesclar-black px-1.5 py-0.5 text-[10px] font-bold text-mesclar-gold">
                            Você
                          </span>
                        )}

                        {/* Validated Seal Badge */}
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                            isValidated
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isValidated ? (
                            <>
                              <BadgeCheck className="h-3 w-3 text-amber-600" />
                              <span>Validado (QR)</span>
                            </>
                          ) : (
                            <span>Pendente Validação</span>
                          )}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                            isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                          {isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      {seller.author?.specialty && (
                        <p className="text-xs font-semibold text-mesclar-gold-dark mt-0.5 truncate">
                          {seller.author.specialty}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-mesclar-muted" />
                          <span className="truncate">{seller.user.email}</span>
                        </span>
                        {(seller.user.phone || seller.user.whatsapp) && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-mesclar-muted" />
                            <span>{seller.user.whatsapp || seller.user.phone}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-mesclar-muted/80">
                          Membro desde: {new Date(seller.createdAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>

                      {/* Professional Works Counters */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[11px] font-medium text-mesclar-black">
                          <BookOpen className="h-3 w-3 text-mesclar-gold-dark" />
                          {seller._count?.books ?? 0} livros publicados
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[11px] font-medium text-mesclar-black">
                          <GraduationCap className="h-3 w-3 text-mesclar-muted" />
                          {seller._count?.trainings ?? 0} formações
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[11px] font-medium text-mesclar-black">
                          <FileText className="h-3 w-3 text-mesclar-muted" />
                          {seller._count?.articles ?? 0} artigos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-center">
                    {/* Acessar Painel (Impersonation to /profissional) */}
                    <Button
                      size="sm"
                      variant="gold"
                      leftIcon={isActing ? Loader2 : LogIn}
                      disabled={isActing}
                      onClick={() => handleImpersonate(seller)}
                      title="Acessar o painel profissional desta conta directamente"
                      className="text-xs h-8 px-2.5 font-bold"
                    >
                      {actionLoading === `impersonate-${seller.id}` ? "A entrar..." : "Acessar Painel"}
                    </Button>

                    {/* Validar / Retirar Selo */}
                    <Button
                      size="sm"
                      variant={isValidated ? "outline" : "secondary"}
                      leftIcon={BadgeCheck}
                      disabled={isActing}
                      onClick={() => handleToggleValidate(seller)}
                      title={isValidated ? "Remover validação oficial" : "Validar profissional e conceder QR Code"}
                      className={`text-xs h-8 px-2.5 ${
                        isValidated ? "border-amber-300 text-amber-900 bg-amber-50/50" : ""
                      }`}
                    >
                      {isValidated ? "Validado" : "Validar"}
                    </Button>

                    {/* Activar / Desactivar */}
                    {!isSelf && (
                      <Button
                        size="sm"
                        variant={isActive ? "outline" : "secondary"}
                        leftIcon={isActive ? UserX : UserCheck}
                        disabled={isActing}
                        onClick={() => handleToggleActive(seller)}
                        title={isActive ? "Desactivar profissional" : "Activar profissional"}
                        className={`text-xs h-8 px-2.5 ${
                          !isActive ? "border-emerald-300 text-emerald-800 bg-emerald-50" : ""
                        }`}
                      >
                        {isActive ? "Desactivar" : "Activar"}
                      </Button>
                    )}

                    {/* Trocar Palavra-passe */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={KeyRound}
                      disabled={isActing}
                      onClick={() => {
                        setPasswordSeller(seller);
                        setNewPassword("");
                      }}
                      title="Trocar palavra-passe da conta"
                      className="text-xs h-8 px-2 text-mesclar-black hover:bg-mesclar-cream"
                    >
                      Senha
                    </Button>

                    {/* Renovar Pagamento */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Receipt}
                      disabled={isActing}
                      onClick={() => setRenewSeller(seller)}
                      title="Renovar ou aprovar pagamentos deste profissional"
                      className="text-xs h-8 px-2 text-mesclar-black hover:bg-mesclar-cream"
                    >
                      Renovar Pag.
                    </Button>

                    {/* Editar */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Pencil}
                      disabled={isActing}
                      onClick={() => openEditModal(seller)}
                      title="Editar detalhes do profissional"
                      className="text-xs h-8 px-2 text-mesclar-black hover:bg-mesclar-cream"
                    >
                      Editar
                    </Button>

                    {/* Eliminar */}
                    {!isSelf && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={Trash2}
                        disabled={isActing}
                        onClick={() => setDeleteSeller(seller)}
                        title="Eliminar profissional permanentemente"
                        className="text-xs h-8 px-2 text-rose-600 hover:bg-rose-50"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 border-t border-mesclar-border/60 bg-mesclar-cream/20 px-6 py-4">
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
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR NOVO PROFISSIONAL */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Plus className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Criar Novo Profissional</h3>
                  <p className="text-xs text-mesclar-muted">Regista conta de formador, perfil de autor e acesso ao painel</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSeller} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Nome Completo *
                </label>
                <input
                  required
                  value={newSellerData.name}
                  onChange={(e) => setNewSellerData({ ...newSellerData, name: e.target.value })}
                  placeholder="Ex: Dr. Eduardo Silveira"
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Email de Acesso *
                  </label>
                  <input
                    required
                    type="email"
                    value={newSellerData.email}
                    onChange={(e) => setNewSellerData({ ...newSellerData, email: e.target.value })}
                    placeholder="eduardo@logistica.ao"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Palavra-passe Inicial *
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={newSellerData.password}
                    onChange={(e) => setNewSellerData({ ...newSellerData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Especialidade / Título Profissional
                </label>
                <input
                  value={newSellerData.specialty}
                  onChange={(e) => setNewSellerData({ ...newSellerData, specialty: e.target.value })}
                  placeholder="Ex: Especialista em Armazenagem e Procurement Internacional"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Biografia Resumida
                </label>
                <textarea
                  rows={2}
                  value={newSellerData.bio}
                  onChange={(e) => setNewSellerData({ ...newSellerData, bio: e.target.value })}
                  placeholder="Breve resumo da trajectória profissional..."
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Telefone
                  </label>
                  <input
                    value={newSellerData.phone}
                    onChange={(e) => setNewSellerData({ ...newSellerData, phone: e.target.value })}
                    placeholder="+244 9..."
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    value={newSellerData.whatsapp}
                    onChange={(e) => setNewSellerData({ ...newSellerData, whatsapp: e.target.value })}
                    placeholder="+244 9..."
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado Inicial
                  </label>
                  <select
                    value={newSellerData.isActive ? "true" : "false"}
                    onChange={(e) => setNewSellerData({ ...newSellerData, isActive: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Activo (Acesso Imediato)</option>
                    <option value="false">Inactivo (Suspenso)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Selo de Validação Oficial
                  </label>
                  <select
                    value={newSellerData.isValidated ? "true" : "false"}
                    onChange={(e) => setNewSellerData({ ...newSellerData, isValidated: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Validado (Exibir Selo e QR Code)</option>
                    <option value="false">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-mesclar-gold/40 bg-mesclar-gold/10 p-3.5 text-xs text-mesclar-black leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-mesclar-gold-dark">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Perfil Completo Integrado</span>
                </div>
                O profissional terá acesso imediato ao painel em <strong>/profissional</strong> para gerir as suas obras, formações e vendas, além da sua página pública oficial.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  leftIcon={actionLoading === "create" ? Loader2 : Check}
                  disabled={actionLoading === "create"}
                  className="font-bold"
                >
                  {actionLoading === "create" ? "A criar..." : "Criar Profissional"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR PROFISSIONAL */}
      {/* ========================================================================= */}
      {editSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Editar Profissional</h3>
                  <p className="text-xs text-mesclar-muted">{editSeller.user.name} ({editSeller.user.email})</p>
                </div>
              </div>
              <button
                onClick={() => setEditSeller(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSeller} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Nome Completo *
                </label>
                <input
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Email de Acesso *
                </label>
                <input
                  required
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Especialidade / Título
                </label>
                <input
                  value={editFormData.specialty}
                  onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Biografia
                </label>
                <textarea
                  rows={2}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Telefone
                  </label>
                  <input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+244 9..."
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    placeholder="+244 9..."
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado da Conta
                  </label>
                  <select
                    value={editFormData.isActive ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo / Suspenso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Validação Oficial (Selo e QR)
                  </label>
                  <select
                    value={editFormData.isValidated ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, isValidated: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Validado (Oficial)</option>
                    <option value="false">Não Validado</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditSeller(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  leftIcon={actionLoading === "edit" ? Loader2 : Check}
                  disabled={actionLoading === "edit"}
                  className="font-bold"
                >
                  {actionLoading === "edit" ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TROCAR PALAVRA-PASSE */}
      {/* ========================================================================= */}
      {passwordSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Trocar Palavra-passe</h3>
                  <p className="text-xs text-mesclar-muted">{passwordSeller.user.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordSeller(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed">
                A nova palavra-passe substituirá a anterior imediatamente. O profissional poderá entrar com este novo código.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Nova Palavra-passe *
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input-field w-full pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mesclar-muted hover:text-mesclar-black"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordSeller(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  leftIcon={actionLoading === "password" ? Loader2 : KeyRound}
                  disabled={actionLoading === "password" || newPassword.length < 6}
                  className="font-bold"
                >
                  {actionLoading === "password" ? "A alterar..." : "Definir Palavra-passe"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RENOVAR PAGAMENTO */}
      {/* ========================================================================= */}
      {renewSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-emerald-500/10 via-white to-emerald-500/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <Receipt className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Renovar Pagamento e Acesso</h3>
                  <p className="text-xs text-mesclar-muted">{renewSeller.user.name} ({renewSeller.user.email})</p>
                </div>
              </div>
              <button
                onClick={() => setRenewSeller(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 leading-relaxed">
                A renovação de pagamento define o pedido como <strong>PAGO / APROVADO</strong>, estende a validade dos links de download de ebooks por mais 30 dias e gera uma notificação no perfil.
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-mesclar-black mb-2">
                  Histórico de Pedidos Recentes
                </h4>

                {renewSeller.user.orders?.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-mesclar-border p-6 text-center text-xs text-mesclar-muted">
                    Este profissional ainda não tem pedidos registados no sistema.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renewSeller.user.orders.map((ord) => {
                      const st = ORDER_STATUS_LABELS[ord.status] || {
                        label: ord.status,
                        color: "text-slate-700 bg-slate-50 border-slate-200",
                      };
                      return (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-mesclar-border bg-mesclar-cream/20 p-3.5"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-mesclar-black text-sm">
                                {ord.orderNumber}
                              </span>
                              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                                {st.label}
                              </span>
                            </div>
                            <p className="text-xs text-mesclar-muted mt-0.5">
                              {formatPrice(ord.total)} • {new Date(ord.createdAt).toLocaleDateString("pt-PT")}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="gold"
                            disabled={actionLoading === `renew-${renewSeller.userId}`}
                            onClick={() => handleRenewPayment(renewSeller.userId, ord.id)}
                            className="text-xs font-bold"
                          >
                            {actionLoading === `renew-${renewSeller.userId}` ? "A renovar..." : "Renovar Este"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {renewSeller.user.orders?.length > 0 && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-xs font-bold"
                    disabled={actionLoading === `renew-${renewSeller.userId}`}
                    onClick={() => handleRenewPayment(renewSeller.userId)}
                  >
                    Renovar Último Pedido Automaticamente
                  </Button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenewSeller(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CONFIRMAR ELIMINAÇÃO */}
      {/* ========================================================================= */}
      {deleteSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-rose-950">Eliminar Profissional</h3>
                  <p className="text-xs text-rose-800">Esta acção é irreversível</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteSeller(null)}
                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed text-mesclar-black">
                Tem a certeza que deseja eliminar a conta profissional de{" "}
                <strong className="font-black text-mesclar-black">{deleteSeller.user.name}</strong> ({deleteSeller.user.email})?
              </p>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-900">
                Todos os dados de publicações, acessos ao painel e histórico associados serão desvinculados permanentemente. Se preferir manter os dados, pode apenas <strong>desactivar</strong> a conta.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteSeller(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={actionLoading === "delete" ? Loader2 : Trash2}
                  disabled={actionLoading === "delete"}
                  onClick={handleDeleteSeller}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {actionLoading === "delete" ? "A eliminar..." : "Sim, Eliminar Definitivamente"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

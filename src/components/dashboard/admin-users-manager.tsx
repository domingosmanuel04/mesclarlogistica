"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  isActive: boolean;
  phone: string | null;
  whatsapp: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    isActive: boolean;
    _count: { books: number; orders: number };
  } | null;
  author?: {
    id: string;
    slug: string;
    photoUrl: string | null;
    isValidated: boolean;
    specialty: string | null;
  } | null;
  _count: {
    orders: number;
    downloads: number;
  };
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
};

const ROLE_LABELS: Record<string, { label: string; badge: string }> = {
  ADMIN: {
    label: "Administrador",
    badge: "bg-purple-100 text-purple-900 border-purple-200",
  },
  SELLER: {
    label: "Profissional",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
  },
  CUSTOMER: {
    label: "Cliente",
    badge: "bg-sky-100 text-sky-900 border-sky-200",
  },
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: "Pag. Pendente", color: "text-amber-700 bg-amber-50 border-amber-200" },
  PAYMENT_APPROVED: { label: "Aprovado / Pago", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  DELIVERED: { label: "Entregue", color: "text-blue-700 bg-blue-50 border-blue-200" },
  CANCELLED: { label: "Cancelado", color: "text-rose-700 bg-rose-50 border-rose-200" },
};

export function AdminUsersManager() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [passwordUser, setPasswordUser] = useState<AdminUserRow | null>(null);
  const [renewUser, setRenewUser] = useState<AdminUserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUserRow | null>(null);
  const [impersonateUser, setImpersonateUser] = useState<AdminUserRow | null>(null);

  // Form states
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SELLER",
    phone: "",
    whatsapp: "",
    isActive: true,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "SELLER",
    phone: "",
    whatsapp: "",
    isActive: true,
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

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao carregar lista de utilizadores.");
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.whatsapp && u.whatsapp.includes(q));

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.isActive) ||
        (statusFilter === "INACTIVE" && !u.isActive);

      return matchQuery && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => {
    return filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredUsers, page]);

  // Totals
  const stats = useMemo(() => {
    const total = users.length;
    const sellers = users.filter((u) => u.role === "SELLER").length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    return { total, sellers, active, inactive };
  }, [users]);

  // 1. Toggle Active
  async function handleToggleActive(user: AdminUserRow) {
    if (user.id === currentUserId) {
      showMessage("Não pode desactivar a sua própria conta de administrador.", "error");
      return;
    }

    const nextState = !user.isActive;
    setActionLoading(`toggle-${user.id}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-active",
          userId: user.id,
          isActive: nextState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar estado.");

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u))
      );
      showMessage(
        nextState ? `Utilizador "${user.name}" activado com sucesso.` : `Utilizador "${user.name}" foi desactivado.`,
        "success"
      );
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao actualizar estado.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 2. Change Password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordUser) return;
    if (newPassword.length < 6) {
      showMessage("A nova palavra-passe deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    setActionLoading("password");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          userId: passwordUser.id,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar palavra-passe.");

      showMessage(`Palavra-passe de "${passwordUser.name}" alterada com sucesso!`, "success");
      setPasswordUser(null);
      setNewPassword("");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao alterar palavra-passe.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 3. Create User
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("create");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newUserData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar conta.");

      showMessage(`Utilizador "${newUserData.name}" criado com sucesso!`, "success");
      setCreateModalOpen(false);
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "SELLER",
        phone: "",
        whatsapp: "",
        isActive: true,
      });
      fetchUsers();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao criar conta.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 4. Edit User
  function openEditModal(user: AdminUserRow) {
    setEditUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      whatsapp: user.whatsapp || "",
      isActive: user.isActive,
    });
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setActionLoading("edit");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          userId: editUser.id,
          ...editFormData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar alterações.");

      showMessage(`Dados de "${editFormData.name}" actualizados com sucesso!`, "success");
      setEditUser(null);
      fetchUsers();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao editar conta.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 5. Delete User
  async function handleDeleteUser() {
    if (!deleteUser) return;
    if (deleteUser.id === currentUserId) {
      showMessage("Não pode eliminar a sua própria conta de administrador.", "error");
      return;
    }

    setActionLoading("delete");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          userId: deleteUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao eliminar conta.");

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      showMessage(`Conta de "${deleteUser.name}" eliminada com sucesso.`, "success");
      setDeleteUser(null);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao eliminar conta.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 6. Impersonate / Access Dashboard
  async function handleImpersonate(user: AdminUserRow) {
    setActionLoading(`impersonate-${user.id}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "impersonate",
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar acesso ao painel.");

      showMessage(`Iniciando sessão como "${user.name}"... A redireccionar...`, "success");

      // Executa login com o token de uso único
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

  // 7. Renew Payment
  async function handleRenewPayment(userId: string, orderId?: string) {
    setActionLoading(`renew-${userId}`);
    try {
      const res = await fetch("/api/admin/users", {
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
      setRenewUser(null);
      fetchUsers();
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
            <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">Total</span>
            <Users className="h-4 w-4 text-mesclar-gold-dark" />
          </div>
          <p className="mt-2 text-2xl font-black text-mesclar-black">{stats.total}</p>
          <p className="text-[11px] text-mesclar-muted">Contas registadas</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Profissionais</span>
            <BookOpen className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.sellers}</p>
          <p className="text-[11px] text-mesclar-muted">Formadores e autores</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Activos</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.active}</p>
          <p className="text-[11px] text-mesclar-muted">Contas funcionais</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Inactivos</span>
            <UserX className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-900">{stats.inactive}</p>
          <p className="text-[11px] text-mesclar-muted">Contas suspensas</p>
        </div>
      </div>

      {/* Main Header Card with Controls */}
      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/10 via-white to-mesclar-gold/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-mesclar-black">
                Gestão Total de Utilizadores
              </h2>
              <p className="text-xs text-mesclar-muted">
                Controlo total de acessos, palavras-passe, impersonação e pagamentos
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
              Novo Utilizador / Profissional
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchUsers}
              disabled={loading}
              title="Actualizar dados"
            >
              {loading ? "A carregar..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid gap-3 border-b border-mesclar-border/60 bg-mesclar-cream/20 p-4 sm:grid-cols-12 sm:items-center">
          <div className="relative sm:col-span-6 lg:col-span-5">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mesclar-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, email ou telefone..."
              className="input-field w-full pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-6 lg:col-span-7 sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-mesclar-muted mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Papel:</span>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-mesclar-border bg-white px-3 py-2 text-xs font-semibold text-mesclar-black shadow-sm focus:outline-none focus:ring-1 focus:ring-mesclar-gold"
            >
              <option value="ALL">Todos os Papéis</option>
              <option value="SELLER">Profissionais (Formadores/Autores)</option>
              <option value="ADMIN">Administradores</option>
              <option value="CUSTOMER">Clientes</option>
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

        {/* Users List / Table */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-mesclar-cream/50" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-muted">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-bold text-mesclar-black">Nenhum utilizador encontrado</h3>
            <p className="mt-1 text-xs text-mesclar-muted">
              Tente ajustar os termos de pesquisa ou os filtros de selecção.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-mesclar-border/60">
            {pagedUsers.map((user) => {
              const roleMeta = ROLE_LABELS[user.role] || {
                label: user.role,
                badge: "bg-slate-100 text-slate-800 border-slate-200",
              };
              const isSelf = user.id === currentUserId;
              const photo = user.author?.photoUrl;
              const initials = user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const recentOrder = user.orders?.[0];
              const isActing = actionLoading?.includes(user.id);

              return (
                <div
                  key={user.id}
                  className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    !user.isActive ? "bg-rose-50/20 opacity-80" : "hover:bg-mesclar-cream/20"
                  }`}
                >
                  {/* User Profile Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-mesclar-border bg-gradient-to-br from-mesclar-gray to-mesclar-black shadow-sm">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={user.name}
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
                          user.isActive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        title={user.isActive ? "Conta Activa" : "Conta Desactivada"}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-mesclar-black text-sm truncate">
                          {user.name}
                        </h4>
                        {isSelf && (
                          <span className="rounded-md bg-mesclar-black px-1.5 py-0.5 text-[10px] font-bold text-mesclar-gold">
                            Você
                          </span>
                        )}
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleMeta.badge}`}
                        >
                          {roleMeta.label}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                            user.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.isActive ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-mesclar-muted" />
                          <span className="truncate">{user.email}</span>
                        </span>
                        {(user.phone || user.whatsapp) && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-mesclar-muted" />
                            <span>{user.whatsapp || user.phone}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-mesclar-muted/80">
                          Registo: {new Date(user.createdAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>

                      {/* Orders & Books summary metrics */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {user.role === "SELLER" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[11px] font-medium text-mesclar-black">
                            <BookOpen className="h-3 w-3 text-mesclar-gold-dark" />
                            {user.seller?._count.books ?? 0} publicações
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[11px] font-medium text-mesclar-black">
                          <ShoppingBag className="h-3 w-3 text-mesclar-muted" />
                          {user._count?.orders ?? user.orders?.length ?? 0} compras / encomendas
                        </span>
                        {recentOrder && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-mesclar-border px-2 py-0.5 text-[10px] font-semibold text-mesclar-black">
                            Último pedido: {recentOrder.orderNumber} ({formatPrice(recentOrder.total)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-center">
                    {/* Acessar Painel (Impersonation) */}
                    <Button
                      size="sm"
                      variant="gold"
                      leftIcon={isActing ? Loader2 : LogIn}
                      disabled={isActing}
                      onClick={() => handleImpersonate(user)}
                      title="Acessar o painel desta conta directamente"
                      className="text-xs h-8 px-2.5 font-bold"
                    >
                      {actionLoading === `impersonate-${user.id}` ? "A entrar..." : "Acessar Painel"}
                    </Button>

                    {/* Activar / Desactivar */}
                    {!isSelf && (
                      <Button
                        size="sm"
                        variant={user.isActive ? "outline" : "secondary"}
                        leftIcon={user.isActive ? UserX : UserCheck}
                        disabled={isActing}
                        onClick={() => handleToggleActive(user)}
                        title={user.isActive ? "Desactivar conta" : "Activar conta"}
                        className={`text-xs h-8 px-2.5 ${
                          !user.isActive ? "border-emerald-300 text-emerald-800 bg-emerald-50" : ""
                        }`}
                      >
                        {user.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    )}

                    {/* Trocar Palavra-passe */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={KeyRound}
                      disabled={isActing}
                      onClick={() => {
                        setPasswordUser(user);
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
                      onClick={() => setRenewUser(user)}
                      title="Renovar ou aprovar pagamentos deste utilizador"
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
                      onClick={() => openEditModal(user)}
                      title="Editar detalhes do utilizador"
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
                        onClick={() => setDeleteUser(user)}
                        title="Eliminar utilizador permanentemente"
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
      {/* MODAL 1: CRIAR NOVO UTILIZADOR / PROFISSIONAL */}
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
                  <h3 className="text-base font-black text-mesclar-black">Criar Novo Utilizador</h3>
                  <p className="text-xs text-mesclar-muted">Registo directo no sistema pela administração</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Nome Completo *
                </label>
                <input
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Ex: Dra. Mariana Costa"
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
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="mariana@exemplo.ao"
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
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Papel na Plataforma
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="SELLER">Profissional (Formador / Autor / Consultor)</option>
                    <option value="ADMIN">Administrador do Sistema</option>
                    <option value="CUSTOMER">Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado Inicial
                  </label>
                  <select
                    value={newUserData.isActive ? "true" : "false"}
                    onChange={(e) => setNewUserData({ ...newUserData, isActive: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Activo (Acesso Imediato)</option>
                    <option value="false">Inactivo (Suspenso)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Telefone
                  </label>
                  <input
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="+244 9..."
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    value={newUserData.whatsapp}
                    onChange={(e) => setNewUserData({ ...newUserData, whatsapp: e.target.value })}
                    placeholder="+244 9..."
                    className="input-field w-full"
                  />
                </div>
              </div>

              {newUserData.role === "SELLER" && (
                <div className="rounded-xl border border-mesclar-gold/40 bg-mesclar-gold/10 p-3.5 text-xs text-mesclar-black leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-mesclar-gold-dark">
                    <UserCheck className="h-4 w-4" />
                    <span>Perfil Profissional Automático</span>
                  </div>
                  Ao criar com a função <strong>Profissional</strong>, o sistema cria automaticamente o perfil de autor com página pública, painel de publicações e ligação de contacto.
                </div>
              )}

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
                  {actionLoading === "create" ? "A criar..." : "Criar Utilizador"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR UTILIZADOR */}
      {/* ========================================================================= */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Editar Utilizador</h3>
                  <p className="text-xs text-mesclar-muted">{editUser.name} ({editUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Papel na Plataforma
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="SELLER">Profissional (Formador / Autor)</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="CUSTOMER">Cliente</option>
                  </select>
                </div>

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

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditUser(null)}
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
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Trocar Palavra-passe</h3>
                  <p className="text-xs text-mesclar-muted">{passwordUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordUser(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed">
                A nova palavra-passe substituirá a anterior imediatamente. O utilizador poderá entrar com este novo código.
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
                  onClick={() => setPasswordUser(null)}
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
      {renewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-emerald-500/10 via-white to-emerald-500/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <Receipt className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Renovar Pagamento e Acesso</h3>
                  <p className="text-xs text-mesclar-muted">{renewUser.name} ({renewUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setRenewUser(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 leading-relaxed">
                A renovação de pagamento define o pedido como <strong>PAGO / APROVADO</strong>, estende a validade dos links de download de ebooks por mais 30 dias e gera uma notificação no perfil do utilizador.
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-mesclar-black mb-2">
                  Histórico de Pedidos Recentes
                </h4>

                {renewUser.orders?.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-mesclar-border p-6 text-center text-xs text-mesclar-muted">
                    Este utilizador ainda não tem nenhum pedido registado no sistema.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renewUser.orders.map((ord) => {
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
                            disabled={actionLoading === `renew-${renewUser.id}`}
                            onClick={() => handleRenewPayment(renewUser.id, ord.id)}
                            className="text-xs font-bold"
                          >
                            {actionLoading === `renew-${renewUser.id}` ? "A renovar..." : "Renovar Este"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botão geral de renovação se houver ou se não houver pedidos */}
              {renewUser.orders?.length > 0 && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-xs font-bold"
                    disabled={actionLoading === `renew-${renewUser.id}`}
                    onClick={() => handleRenewPayment(renewUser.id)}
                  >
                    Renovar Último Pedido Automaticamente
                  </Button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRenewUser(null)}
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
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-rose-950">Eliminar Utilizador</h3>
                  <p className="text-xs text-rose-800">Esta acção é irreversível</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteUser(null)}
                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed text-mesclar-black">
                Tem a certeza que deseja eliminar a conta de{" "}
                <strong className="font-black text-mesclar-black">{deleteUser.name}</strong> ({deleteUser.email})?
              </p>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-900">
                Todos os dados de autenticação e acessos associados serão apagados permanentemente. Se preferir manter os registos para auditoria, pode apenas <strong>desactivar</strong> a conta.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteUser(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={actionLoading === "delete" ? Loader2 : Trash2}
                  disabled={actionLoading === "delete"}
                  onClick={handleDeleteUser}
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

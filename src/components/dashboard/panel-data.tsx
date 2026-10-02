"use client";

import { useEffect, useState, useRef, useId } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BookPlus,
  Check,
  Eye,
  MessageSquare,
  X,
  Package,
  Wallet,
  Clock,
  User,
  Camera,
  KeyRound,
  Upload,
  Lock,
  FileCheck,
  ClipboardList,
  BookOpen,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Download,
  Receipt,
  Library,
  GraduationCap,
  Briefcase,
  Tag,
  Award,
  FolderKanban,
  Settings,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  IdCard,
  CreditCard,
  Building2,
  ChevronRight,
  Star,
  BadgeCheck,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  Archive,
  RefreshCw,
  EyeOff,
  Share2,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PUBLISHED: "Publicado",
  REJECTED: "Rejeitado",
  CHANGES_REQUESTED: "Alterações",
};

type BookRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  productType: string;
  priceEbook: number;
  pricePhysical?: number | null;
  rejectionReason?: string | null;
};

const bookStatusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PENDING: {
    label: "Pendente",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  PUBLISHED: {
    label: "Publicado",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejeitado",
    bg: "bg-rose-50",
    text: "text-rose-900",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  CHANGES_REQUESTED: {
    label: "Alterações",
    bg: "bg-violet-50",
    text: "text-violet-900",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
};

function BookStatusBadge({ status }: { status: string }) {
  const cfg = bookStatusConfig[status] ?? {
    label: status,
    bg: "bg-mesclar-cream",
    text: "text-mesclar-black",
    border: "border-mesclar-border",
    dot: "bg-mesclar-gold",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.text} px-3 py-1 text-xs font-bold`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function SellerBooksPanel() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("TODOS");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    void fetch("/api/books")
      .then((r) => r.json())
      .then((d) => setBooks(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-card h-28 animate-pulse p-5">
            <div className="h-3 w-20 rounded bg-mesclar-border/70" />
            <div className="mt-3 h-7 w-16 rounded bg-mesclar-border/70" />
          </div>
        ))}
      </div>
    );
  }

  const total = books.length;
  const published = books.filter((b) => b.status === "PUBLISHED").length;
  const pending = books.filter((b) => b.status === "PENDING" || b.status === "CHANGES_REQUESTED").length;
  const rejected = books.filter((b) => b.status === "REJECTED").length;

  const filterOptions = ["TODOS", ...Array.from(new Set(books.map((b) => b.status)))];
  const filtered = filter === "TODOS" ? books : books.filter((b) => b.status === filter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mesclar-gold/10 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Total no catálogo
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {total}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-lg">
              <Library className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Publicados
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-700">
                {published}
              </p>
              {total > 0 && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  {Math.round((published / total) * 100)}% do total
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Em revisão
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-amber-700">
                {pending}
              </p>
              {pending > 0 && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  Precisa de atenção
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Rejeitados
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-rose-700">
                {rejected}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg">
              <X className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-cream/40 via-white to-mesclar-cream/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black to-mesclar-gray text-mesclar-gold shadow-md">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                Catálogo do autor
              </h2>
              <p className="text-xs text-mesclar-muted">
                {filtered.length} {filtered.length === 1 ? "livro" : "livros"} encontrado
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link href="/profissional/adicionar-livro">
            <Button variant="gold" leftIcon={BookPlus}>
              Publicar livro
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-mesclar-border/60 bg-white/50 px-5 py-3">
          {filterOptions.map((opt) => {
            const active = filter === opt;
            const label = opt === "TODOS" ? "Todos" : bookStatusConfig[opt]?.label ?? opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "border-mesclar-black bg-mesclar-black text-mesclar-gold-light shadow-md"
                    : "border-mesclar-border bg-white text-mesclar-muted hover:border-mesclar-gold/40 hover:bg-mesclar-gold/5 hover:text-mesclar-black"
                )}
              >
                {opt !== "TODOS" && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      bookStatusConfig[opt]?.dot ?? "bg-mesclar-gold"
                    }`}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {filtered.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-mesclar-cream/40 via-white to-mesclar-cream/20 px-6 py-20 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(201,162,39,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/15 blur-3xl" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold/20 via-mesclar-gold/10 to-mesclar-gold/20 text-mesclar-gold-dark shadow-inner ring-1 ring-mesclar-gold/20">
                <Library className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="relative mt-5 text-lg font-bold text-mesclar-black">
                Sem livros correspondentes
              </p>
              <p className="relative mt-1.5 mx-auto max-w-sm text-sm text-mesclar-muted">
                Não existem livros com o filtro seleccionado. Comece por publicar o seu primeiro conteúdo.
              </p>
              <div className="relative mt-6 flex items-center justify-center">
                <Link href="/profissional/adicionar-livro">
                  <Button variant="gold" leftIcon={BookPlus}>
                    Publicar primeiro livro
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {paged.map((book) => (
                  <li
                    key={book.id}
                    className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-mesclar-cream/30 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:shadow-[0_14px_30px_-18px_rgba(10,10,10,0.25)]"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mesclar-gold/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-black tracking-tight text-mesclar-black">
                            {book.title}
                          </p>
                          <BookStatusBadge status={book.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                            <BookOpen className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                            {book.productType}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                            <Wallet className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                            eBook: {formatPrice(book.priceEbook)}
                          </span>
                          {book.pricePhysical && (
                            <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                              <Package className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                              Físico: {formatPrice(book.pricePhysical)}
                            </span>
                          )}
                          {book.rejectionReason && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800 border border-rose-200">
                              <X className="h-3 w-3" />
                              {book.rejectionReason}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {book.status === "PUBLISHED" && (
                          <Link href={`/livros/${book.slug}`}>
                            <Button variant="secondary" size="sm" leftIcon={Eye}>
                              Ver
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {pageCount > 1 && (
                <div className="mt-5 flex items-center justify-center gap-3 border-t border-mesclar-border/60 pt-4">
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
                            ? "bg-mesclar-black text-mesclar-gold shadow-sm"
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
      </div>
    </div>
  );
}

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  createdAt: string;
  items: { book: { title: string }; productType: string }[];
  payment?: {
    id?: string;
    amount?: number;
    reference?: string;
    rejectionReason?: string | null;
    proof?: {
      id?: string;
      fileName: string;
      filePath: string;
      mimeType?: string;
      uploadedAt?: string;
    } | null;
  } | null;
};

const orderStatusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; icon: typeof Check }
> = {
  PENDING: {
    label: "Pendente",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: Check,
  },
  PROOF_SENT: {
    label: "Comprovativo enviado",
    bg: "bg-sky-50",
    text: "text-sky-900",
    border: "border-sky-200",
    dot: "bg-sky-500",
    icon: Check,
  },
  PAYMENT_UNDER_REVIEW: {
    label: "Pagamento em revisão",
    bg: "bg-violet-50",
    text: "text-violet-900",
    border: "border-violet-200",
    dot: "bg-violet-500",
    icon: Check,
  },
  PAYMENT_APPROVED: {
    label: "Pagamento aprovado",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: Check,
  },
  PAYMENT_REJECTED: {
    label: "Pagamento rejeitado",
    bg: "bg-rose-50",
    text: "text-rose-900",
    border: "border-rose-200",
    dot: "bg-rose-500",
    icon: X,
  },
  SHIPPED: {
    label: "Enviado",
    bg: "bg-indigo-50",
    text: "text-indigo-900",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    icon: Check,
  },
  AVAILABLE_PICKUP: {
    label: "Pronto para levantamento",
    bg: "bg-teal-50",
    text: "text-teal-900",
    border: "border-teal-200",
    dot: "bg-teal-500",
    icon: Check,
  },
  COMPLETED: {
    label: "Concluído",
    bg: "bg-mesclar-gold/15",
    text: "text-mesclar-gold-dark",
    border: "border-mesclar-gold/30",
    dot: "bg-mesclar-gold",
    icon: Check,
  },
  DELIVERED: {
    label: "Entregue",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: Check,
  },
  PICKED_UP: {
    label: "Levantado",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: Check,
  },
};

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = orderStatusConfig[status] ?? {
    label: status,
    bg: "bg-mesclar-cream",
    text: "text-mesclar-black",
    border: "border-mesclar-border",
    dot: "bg-mesclar-gold",
    icon: Check,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.text} px-3 py-1 text-xs font-bold`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function OrdersPanel({ mode }: { mode: "seller" | "customer" | "admin" }) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("TODOS");
  const [selectedProofOrder, setSelectedProofOrder] = useState<OrderRow | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const pageSize = 6;

  function reload() {
    setLoading(true);
    void fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  async function review(
    id: string,
    action: "approve" | "reject" | "ship" | "pickup_ready" | "deliver" | "picked_up",
    customReason?: string
  ) {
    const reason =
      action === "reject"
        ? customReason || window.prompt("Motivo da rejeição:") || "Comprovativo inválido"
        : undefined;
    const notes =
      action === "ship" ? window.prompt("Notas de envio (opcional):") || undefined : undefined;
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason, notes }),
    });
    if (res.ok) {
      setMsg("Pedido actualizado com sucesso.");
      reload();
      setTimeout(() => setMsg(""), 3500);
    } else {
      setMsg("Não foi possível actualizar o pedido.");
      setTimeout(() => setMsg(""), 3500);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-card h-28 animate-pulse p-5 rounded-3xl bg-white border border-[#E2E6EE]">
            <div className="h-3 w-20 rounded bg-mesclar-border/70" />
            <div className="mt-3 h-7 w-24 rounded bg-mesclar-border/70" />
          </div>
        ))}
      </div>
    );
  }

  const totalValue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingReview = orders.filter(
    (o) => o.status === "PROOF_SENT" || o.status === "PAYMENT_UNDER_REVIEW"
  ).length;
  const completed = orders.filter(
    (o) => o.status === "COMPLETED" || o.status === "DELIVERED" || o.status === "PICKED_UP"
  ).length;

  type FilterOption = {
    key: string;
    label: string;
    dot?: string;
    alert?: boolean;
  };

  const rawStatusOptions = Array.from(new Set(orders.map((o) => o.status)));
  const filterOptions: FilterOption[] = [
    { key: "TODOS", label: `Todos (${orders.length})` },
    ...(pendingReview > 0
      ? [{ key: "PROOF_PENDING", label: `Aguardam validação (${pendingReview})`, alert: true }]
      : []),
    ...rawStatusOptions.map((st) => ({
      key: st,
      label: `${orderStatusConfig[st]?.label ?? st} (${orders.filter((o) => o.status === st).length})`,
      dot: orderStatusConfig[st]?.dot,
    })),
  ];

  const filtered =
    filter === "TODOS"
      ? orders
      : filter === "PROOF_PENDING"
      ? orders.filter(
          (o) => o.status === "PROOF_SENT" || o.status === "PAYMENT_UNDER_REVIEW" || Boolean(o.payment?.proof)
        )
      : orders.filter((o) => o.status === filter);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {msg && (
        <div className="flex items-center gap-2 rounded-2xl border border-mesclar-gold/30 bg-mesclar-gold/10 px-4 py-3 text-sm font-semibold text-mesclar-gold-dark shadow-xs">
          <Check className="h-4 w-4" />
          {msg}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card group rounded-3xl p-5 border border-[#E2E6EE] bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Total de pedidos
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {totalOrders}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] text-mesclar-black shadow-xs">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="surface-card group rounded-3xl p-5 border border-[#E2E6EE] bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Valor total
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-mesclar-black truncate">
                {formatPrice(totalValue)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F6F9] text-mesclar-gold-dark shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setFilter("PROOF_PENDING")}
          className={cn(
            "surface-card group rounded-3xl p-5 border transition-all text-left cursor-pointer",
            filter === "PROOF_PENDING"
              ? "border-violet-500 bg-violet-50/40 shadow-md ring-2 ring-violet-500/20"
              : "border-[#E2E6EE] bg-white shadow-sm hover:shadow-md hover:border-violet-300"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Aguardam revisão
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {pendingReview}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          {pendingReview > 0 ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-900 border border-violet-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600" />
              Clique para validar comprovativos
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-gray-400 font-medium">Tudo em dia</p>
          )}
        </div>

        <div className="surface-card group rounded-3xl p-5 border border-[#E2E6EE] bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Concluídos
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {completed}
              </p>
              {totalOrders > 0 && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  {Math.round((completed / totalOrders) * 100)}% de sucesso
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs">
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Lista de Pedidos */}
      <div className="surface-card rounded-3xl overflow-hidden border border-[#E2E6EE] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F2F6] px-6 py-4.5 bg-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4F6F9] text-mesclar-black shadow-xs">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight text-mesclar-black">
                Gestão de Pedidos
              </h2>
              <p className="text-xs text-mesclar-muted">
                {filtered.length} {filtered.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(mode === "seller" || mode === "admin") && (
              <a href="/api/reports/csv">
                <Button size="sm" variant="secondary" leftIcon={FileCheck} className="text-xs">
                  Exportar CSV
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Barra de Filtros / Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#F0F2F6] bg-[#FAFAFC] px-6 py-3">
          {filterOptions.map((opt) => {
            const active = filter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "bg-mesclar-black text-mesclar-gold shadow-sm font-bold"
                    : opt.alert
                    ? "bg-violet-100 text-violet-900 border border-violet-200 hover:bg-violet-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-xs"
                )}
              >
                {opt.dot && <span className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />}
                {opt.alert && <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Lista */}
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-[#FAFAFC] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Package className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-bold text-mesclar-black">
                Sem pedidos correspondentes
              </p>
              <p className="mt-1 text-sm text-mesclar-muted">
                Não foram encontrados pedidos com o filtro selecionado.
              </p>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {paged.map((o) => {
                const date = new Date(o.createdAt);
                return (
                  <li
                    key={o.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-5 transition-all duration-200 hover:border-mesclar-gold/50 hover:shadow-md"
                  >
                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-black tracking-tight text-mesclar-black">
                            #{o.orderNumber}
                          </p>
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-gray-700">
                          {o.items.map((i) => i.book.title).join(", ")}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-mesclar-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            {o.customerName}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {date.toLocaleDateString("pt-AO")} ·{" "}
                            {date.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {o.items.length > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                              {o.items.length} {o.items.length === 1 ? "item" : "itens"}
                            </span>
                          )}
                          {o.payment?.proof?.fileName && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProofOrder(o);
                                setRejecting(false);
                                setRejectReason("");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800 border border-sky-200 hover:bg-sky-100 transition shadow-xs"
                            >
                              <Eye className="h-3.5 w-3.5 text-sky-600" />
                              Comprovativo anexado — Ver
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted">
                          Total
                        </p>
                        <p className="mt-0.5 text-xl font-black text-mesclar-black">
                          {formatPrice(o.total)}
                        </p>
                      </div>
                    </div>

                    {/* Ações do Pedido / Comprovativo */}
                    <div className="relative mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3.5">
                      {o.payment?.proof?.fileName && (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={Eye}
                          onClick={() => {
                            setSelectedProofOrder(o);
                            setRejecting(false);
                            setRejectReason("");
                          }}
                          className="border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 text-xs font-semibold"
                        >
                          Ver comprovativo
                        </Button>
                      )}

                      {(mode === "seller" || mode === "admin") &&
                        (o.status === "PROOF_SENT" || o.status === "PAYMENT_UNDER_REVIEW") && (
                          <>
                            <Button
                              size="sm"
                              variant="gold"
                              leftIcon={Check}
                              onClick={() => void review(o.id, "approve")}
                              className="text-xs shadow-xs"
                            >
                              Aprovar pagamento
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={X}
                              onClick={() => void review(o.id, "reject")}
                              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Rejeitar
                            </Button>
                          </>
                        )}

                      {(mode === "seller" || mode === "admin") &&
                        o.status === "PAYMENT_APPROVED" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void review(o.id, "ship")}
                              className="text-xs"
                            >
                              Marcar enviado
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void review(o.id, "pickup_ready")}
                              className="text-xs"
                            >
                              Pronto para levantamento
                            </Button>
                          </>
                        )}

                      {(mode === "seller" || mode === "admin") && o.status === "SHIPPED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void review(o.id, "deliver")}
                          className="text-xs"
                        >
                          Marcar entregue
                        </Button>
                      )}

                      {(mode === "seller" || mode === "admin") &&
                        o.status === "AVAILABLE_PICKUP" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void review(o.id, "picked_up")}
                            className="text-xs"
                          >
                            Marcar levantado
                          </Button>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Modal de Validação / Visualização do Comprovativo */}
        {selectedProofOrder && selectedProofOrder.payment?.proof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header do Modal */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-[#F8F9FB]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mesclar-gold-dark">
                      Validação de Comprovativo
                    </span>
                    <OrderStatusBadge status={selectedProofOrder.status} />
                  </div>
                  <h3 className="text-lg font-extrabold text-mesclar-black">
                    Pedido #{selectedProofOrder.orderNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProofOrder(null)}
                  className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-mesclar-black transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Corpo do Modal */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Resumo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F7F9FC] border border-gray-100 text-xs">
                  <div>
                    <p className="text-gray-400 font-medium">Cliente</p>
                    <p className="font-bold text-mesclar-black truncate">{selectedProofOrder.customerName}</p>
                    <p className="text-gray-500 truncate text-[11px]">{selectedProofOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Valor Total</p>
                    <p className="font-extrabold text-mesclar-black text-sm">{formatPrice(selectedProofOrder.total)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Referência</p>
                    <p className="font-bold text-mesclar-black truncate">
                      {selectedProofOrder.payment?.reference || selectedProofOrder.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Ficheiro</p>
                    <p className="font-bold text-mesclar-black truncate">{selectedProofOrder.payment.proof.fileName}</p>
                  </div>
                </div>

                {/* Exibição da Imagem ou Documento */}
                <div className="rounded-2xl border border-gray-200 bg-[#0E0E0E] p-4 text-center">
                  {selectedProofOrder.payment.proof.mimeType?.startsWith("image/") ||
                  /\.(jpe?g|png|webp|gif)$/i.test(selectedProofOrder.payment.proof.fileName) ? (
                    <div className="space-y-3">
                      <div className="relative max-h-[380px] overflow-hidden rounded-xl bg-black/40 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/uploads/${selectedProofOrder.payment.proof.filePath}`}
                          alt="Comprovativo de Pagamento"
                          className="max-h-[380px] w-auto object-contain rounded-lg shadow-sm"
                        />
                      </div>
                      <a
                        href={`/api/uploads/${selectedProofOrder.payment.proof.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mesclar-gold hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver imagem em tamanho real
                      </a>
                    </div>
                  ) : (
                    <div className="py-8 space-y-3">
                      <FileCheck className="h-12 w-12 text-mesclar-gold mx-auto" />
                      <p className="text-white font-bold text-sm">
                        Documento: {selectedProofOrder.payment.proof.fileName}
                      </p>
                      <a
                        href={`/api/uploads/${selectedProofOrder.payment.proof.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        <Button size="sm" variant="gold" leftIcon={Download}>
                          Descarregar Documento
                        </Button>
                      </a>
                    </div>
                  )}
                </div>

                {/* Motivo de Rejeição */}
                {rejecting && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2 animate-in fade-in">
                    <label className="text-xs font-bold text-red-900">Motivo da Rejeição:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex.: Comprovativo ilegível, valor divergente ou conta incorreta..."
                      className="w-full rounded-xl border border-red-300 bg-white px-3.5 py-2 text-xs text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                )}
              </div>

              {/* Rodapé de Ações do Modal */}
              <div className="border-t border-gray-100 px-6 py-4 bg-white flex flex-wrap items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedProofOrder(null)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Fechar
                </Button>

                {(mode === "seller" || mode === "admin") &&
                  (selectedProofOrder.status === "PROOF_SENT" || selectedProofOrder.status === "PAYMENT_UNDER_REVIEW") && (
                    <div className="flex items-center gap-2">
                      {!rejecting ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={X}
                            onClick={() => setRejecting(true)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            Rejeitar Comprovativo
                          </Button>
                          <Button
                            size="sm"
                            variant="gold"
                            leftIcon={Check}
                            onClick={async () => {
                              await review(selectedProofOrder.id, "approve");
                              setSelectedProofOrder(null);
                            }}
                          >
                            Aprovar Pagamento
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRejecting(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            leftIcon={X}
                            onClick={async () => {
                              await review(selectedProofOrder.id, "reject", rejectReason || "Comprovativo inválido");
                              setSelectedProofOrder(null);
                            }}
                          >
                            Confirmar Rejeição
                          </Button>
                        </>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-[#F0F2F6] bg-[#FAFAFC] px-6 py-4">
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
      </div>
    </div>
  );
}


export function SalesPanel() {
  const [stats, setStats] = useState<{
    received: number;
    books: number;
    sales: number;
    avgOrder: number;
  } | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90" | "all">("30");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/seller/profile")
        .then((r) => r.json())
        .then((d) =>
          setStats({
            received: d.stats?.received ?? 0,
            books: d.stats?.books ?? 0,
            sales: d.stats?.sales ?? 0,
            avgOrder:
              d.stats?.sales && d.stats?.sales > 0
                ? Math.round((d.stats.received ?? 0) / d.stats.sales)
                : 0,
          })
        )
        .catch(() => setStats({ received: 0, books: 0, sales: 0, avgOrder: 0 })),
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => {
          const all = Array.isArray(d) ? d : [];
          const filtered = all.filter(
            (o: OrderRow) =>
              o.status === "COMPLETED" ||
              o.status === "PAYMENT_APPROVED" ||
              o.status === "DELIVERED" ||
              o.status === "PICKED_UP"
          );
          setOrders(filtered);
        })
        .catch(() => setOrders([])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-card h-36 animate-pulse p-5">
            <div className="h-3 w-24 rounded bg-mesclar-border/70" />
            <div className="mt-4 h-8 w-32 rounded bg-mesclar-border/70" />
          </div>
        ))}
      </div>
    );
  }

  const totalReceived = stats?.received ?? 0;
  const totalSales = stats?.sales ?? 0;
  const totalBooks = stats?.books ?? 0;
  const avgOrder = stats?.avgOrder ?? 0;

  const lastCompleted = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  const monthlyData = (() => {
    const months: Record<string, { count: number; value: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("pt-AO", { month: "short" });
      months[key] = { count: 0, value: 0 };
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString("pt-AO", { month: "short" });
      if (months[key]) {
        months[key].count += 1;
        months[key].value += o.total || 0;
      }
    });
    return Object.entries(months).map(([label, v]) => ({ label, ...v }));
  })();

  const maxValue = Math.max(1, ...monthlyData.map((d) => d.value));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card group surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mesclar-gold/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Vendas concluídas
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {totalSales}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ArrowUpRight className="h-3 w-3" />
                Performance
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="surface-card group surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Recebido total
              </p>
              <p className="mt-2 bg-gradient-to-br from-mesclar-gold-dark via-mesclar-gold to-mesclar-gold-light bg-clip-text text-3xl font-black tracking-tight text-transparent">
                {formatPrice(totalReceived)}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-mesclar-muted">
                Valor liquidado
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-lg">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="surface-card group surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Ticket médio
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {formatPrice(avgOrder)}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-mesclar-muted">
                Por venda
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="surface-card group surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Livros no catálogo
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-black">
                {totalBooks}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-mesclar-muted">
                Publicações activas
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="surface-card overflow-hidden lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-cream/40 via-white to-mesclar-cream/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                  Evolução mensal
                </h2>
                <p className="text-xs text-mesclar-muted">
                  Vendas e valor facturado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-mesclar-cream/60 p-1">
              {(["7", "30", "90", "all"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all",
                    period === p
                      ? "bg-white text-mesclar-black shadow-sm"
                      : "text-mesclar-muted hover:text-mesclar-black"
                  )}
                >
                  {p === "7" ? "7 dias" : p === "30" ? "30 dias" : p === "90" ? "90 dias" : "Total"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between gap-3 pt-2" style={{ height: "200px" }}>
              {monthlyData.map((d, i) => {
                const height = Math.max(4, (d.value / maxValue) * 100);
                return (
                  <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-mesclar-gold via-mesclar-gold to-mesclar-gold-light shadow-[0_4px_14px_-6px_rgba(201,162,39,0.5)] transition-all duration-500 group-hover:from-mesclar-gold-dark group-hover:to-mesclar-gold-light"
                        style={{ height: `${height}%` }}
                      />
                      <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded-xl border border-mesclar-border bg-mesclar-black px-2.5 py-1.5 text-[10px] font-bold text-mesclar-gold-light opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                        {formatPrice(d.value)} · {d.count} {d.count === 1 ? "venda" : "vendas"}
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mesclar-cream/60 text-[10px] font-bold text-mesclar-gold-dark transition group-hover:bg-mesclar-black group-hover:text-mesclar-gold-light">
                      {d.count}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-mesclar-border/60 bg-mesclar-cream/30 px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-gradient-to-t from-mesclar-gold to-mesclar-gold-light" />
                <span className="font-semibold text-mesclar-gray">Valor facturado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mesclar-cream text-[10px] font-bold text-mesclar-gold-dark">
                  #
                </span>
                <span className="font-semibold text-mesclar-gray">Nº de vendas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-cream/40 via-white to-mesclar-cream/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                <Receipt className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                  Resumo rápido
                </h2>
                <p className="text-xs text-mesclar-muted">
                  KPIs de performance
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-2xl border border-mesclar-border/70 bg-gradient-to-br from-white via-white to-mesclar-cream/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">
                  Taxa de conclusão
                </span>
                <span className="text-sm font-black text-emerald-700">
                  {totalSales > 0 ? "100%" : "0%"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-mesclar-border/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${totalSales > 0 ? 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-mesclar-border/70 bg-gradient-to-br from-white via-white to-mesclar-cream/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">
                  Catálogo activo
                </span>
                <span className="text-sm font-black text-mesclar-black">
                  {totalBooks} {totalBooks === 1 ? "livro" : "livros"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-mesclar-border/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mesclar-black via-mesclar-gray to-mesclar-black"
                  style={{ width: `${Math.min(100, totalBooks * 10)}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-mesclar-gold/30 bg-gradient-to-br from-mesclar-gold/10 via-mesclar-gold/5 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
                  <Calendar className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                    Dica de crescimento
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-mesclar-gray">
                    Actualize regularmente os seus livros e promova as suas publicações para aumentar as vendas mensais.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="/api/reports/csv"
                className="group flex items-center justify-center gap-2 rounded-2xl border border-mesclar-border bg-white px-3 py-3 text-xs font-bold text-mesclar-black transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:bg-mesclar-gold/5 hover:shadow-md"
              >
                <Download className="h-4 w-4 text-mesclar-gold-dark" />
                Exportar CSV
              </a>
              <Link
                href="/profissional/adicionar-livro"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black px-3 py-3 text-xs font-bold text-mesclar-gold-light shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <BookPlus className="h-4 w-4" />
                Novo livro
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-cream/40 via-white to-mesclar-cream/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                Vendas recentes
              </h2>
              <p className="text-xs text-mesclar-muted">
                Últimas {lastCompleted.length} transacções concluídas
              </p>
            </div>
          </div>
          <Link href="/profissional/pedidos" className="shrink-0">
            <Button size="sm" variant="secondary" leftIcon={ArrowUpRight}>
              Ver todos os pedidos
            </Button>
          </Link>
        </div>

        <div className="p-5">
          {lastCompleted.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-mesclar-cream/40 via-white to-mesclar-cream/20 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-gold/15 text-mesclar-gold-dark">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-bold text-mesclar-black">
                Ainda sem vendas concluídas
              </p>
              <p className="mt-1 text-sm text-mesclar-muted">
                As suas vendas aparecerão aqui assim que forem concluídas.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-mesclar-border/60">
              {lastCompleted.map((o) => {
                const date = new Date(o.createdAt);
                return (
                  <li
                    key={o.id}
                    className="group flex flex-wrap items-center justify-between gap-4 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-mesclar-cream/20"
                  >
                    <div className="min-w-0 flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black tracking-tight text-mesclar-black">
                          #{o.orderNumber}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-mesclar-muted">
                          {o.items.map((i) => i.book.title).join(", ")}{" "}
                          <span className="mx-1 text-mesclar-border">·</span>
                          {o.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted">
                          {date.toLocaleDateString("pt-AO")}
                        </p>
                        <p className="mt-0.5 bg-gradient-to-br from-mesclar-gold-dark via-mesclar-gold to-mesclar-gold-light bg-clip-text text-lg font-black text-transparent">
                          {formatPrice(o.total)}
                        </p>
                      </div>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function PendingBooksAdmin() {
  const [books, setBooks] = useState<
    {
      id: string;
      title: string;
      slug?: string;
      author: { name: string };
      seller: { user: { name: string } };
      priceEbook?: number;
      productType?: string;
    }[]
  >([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    void fetch("/api/admin?resource=books&status=PENDING")
      .then((r) => r.json())
      .then((d) => setBooks(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function act(id: string, action: "approve" | "reject" | "request_changes") {
    setActingId(id);
    const reason =
      action !== "approve"
        ? window.prompt(action === "reject" ? "Motivo da rejeição:" : "Alterações pedidas:") ||
          "Revisão necessária"
        : undefined;
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    if (res.ok) {
      setMsg(action === "approve" ? "Livro aprovado com sucesso." : action === "reject" ? "Livro rejeitado." : "Alterações solicitadas.");
      load();
    }
    setActingId(null);
  }

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-card h-28 animate-pulse p-5">
            <div className="h-3 w-20 rounded bg-mesclar-border/70" />
            <div className="mt-3 h-7 w-16 rounded bg-mesclar-border/70" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Pendentes de revisão
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-amber-700">
                {books.length}
              </p>
              {books.length > 0 && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  Requer atenção
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Aprovações rápidas
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-700">
                OK
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                Cadeia logística verificada
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
              <BadgeCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mesclar-gold/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Critério de aprovação
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight text-mesclar-gold-dark">
                Logística
              </p>
              <p className="mt-1 text-xs font-semibold text-mesclar-muted">
                Alinhado com a visão Mesclar
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white px-5 py-4 text-sm">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
            <Check className="h-4 w-4" />
          </span>
          <p className="mt-1 font-semibold text-emerald-900">{msg}</p>
        </div>
      )}

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-amber-50/60 via-white to-amber-50/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                Livros pendentes de aprovação
              </h2>
              <p className="text-xs text-mesclar-muted">
                {books.length} {books.length === 1 ? "conteúdo" : "conteúdos"} aguardam revisão
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={RefreshCw} onClick={() => load()}>
            Actualizar
          </Button>
        </div>

        <div className="p-5">
          {books.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 px-6 py-20 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(16,185,129,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 text-emerald-700 shadow-inner ring-1 ring-emerald-200/60">
                <BadgeCheck className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="relative mt-5 text-lg font-bold text-mesclar-black">
                Todos os livros foram analisados
              </p>
              <p className="relative mt-1.5 mx-auto max-w-md text-sm text-mesclar-muted">
                Não existem conteúdos pendentes neste momento. Volte mais tarde para novas submissões.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {books.map((b) => {
                const isActing = actingId === b.id;
                return (
                  <li
                    key={b.id}
                    className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-amber-50/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-[0_14px_30px_-18px_rgba(245,158,11,0.25)]"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-black tracking-tight text-mesclar-black">
                              {b.title}
                            </p>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                              Pendente
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                              <User className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                              Autor: <span className="font-semibold text-mesclar-black">{b.author.name}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                              <Building2 className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                              Profissional: <span className="font-semibold text-mesclar-black">{b.seller.user.name}</span>
                            </span>
                            {b.productType && (
                              <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                                <BookOpen className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                                {b.productType}
                              </span>
                            )}
                            {typeof b.priceEbook === "number" && (
                              <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                                <Wallet className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                                eBook: <span className="font-bold text-mesclar-gold-dark">{formatPrice(b.priceEbook)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        {b.slug && (
                          <Link href={`/livros/${b.slug}`}>
                            <Button variant="secondary" size="sm" leftIcon={Eye}>
                              Pré-visualizar
                            </Button>
                          </Link>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-mesclar-border/60">
                        <Button
                          size="sm"
                          variant="gold"
                          leftIcon={Check}
                          disabled={isActing}
                          onClick={() => void act(b.id, "approve")}
                        >
                          {isActing ? "A processar..." : "Aprovar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={MessageSquare}
                          disabled={isActing}
                          onClick={() => void act(b.id, "request_changes")}
                        >
                          Solicitar alteração
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={X}
                          disabled={isActing}
                          onClick={() => void act(b.id, "reject")}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-700 ring-1 ring-amber-200/60">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold text-mesclar-black">
              Critérios de aprovação
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mesclar-muted">
              Aprovar apenas livros enquadrados na{" "}
              <strong className="text-mesclar-black">cadeia logística e supply chain</strong>.
              Conteúdos fora do âmbito Mesclar devem ser rejeitados com motivo claro, ou devolvidos
              para alterações se apenas forem necessários pequenos ajustes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountForms() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", whatsapp: "" });
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/account")
      .then((r) => r.json())
      .then((d) =>
        setProfile({
          name: d.name ?? "",
          email: d.email ?? "",
          phone: d.phone ?? "",
          whatsapp: d.whatsapp ?? "",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
      }),
    });
    setMsg(res.ok ? { text: "Dados pessoais guardados com sucesso.", type: "success" } : { text: "Erro ao guardar dados.", type: "error" });
  }

  async function savePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: fd.get("currentPassword"),
        newPassword: fd.get("newPassword"),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok ? { text: "Palavra-passe actualizada.", type: "success" } : { text: json.error || "Erro ao actualizar palavra-passe.", type: "error" });
  }

  if (loading) {
    return (
      <div className="surface-card h-80 animate-pulse p-6">
        <div className="h-4 w-32 rounded bg-mesclar-border/70" />
        <div className="mt-6 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 w-full rounded-xl bg-mesclar-border/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${
            msg.type === "success"
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white"
              : "border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white"
          }`}
        >
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
              msg.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-rose-500 to-rose-700"
            }`}
          >
            {msg.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </span>
          <p
            className={`mt-1 font-semibold ${
              msg.type === "success" ? "text-emerald-900" : "text-rose-900"
            }`}
          >
            {msg.text}
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="group surface-card surface-card-hover relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-xl ring-1 ring-mesclar-gold/20">
                <IdCard className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-black tracking-tight text-mesclar-black">
                Dados pessoais
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-mesclar-muted">
                Informação básica da sua conta. O email não pode ser alterado por razões de segurança.
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-mesclar-border/70 bg-mesclar-cream/30 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
                    <BadgeCheck className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                      Conta verificada
                    </p>
                    <p className="text-sm font-bold text-mesclar-black truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-mesclar-border/70 bg-white px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mesclar-gold/15 text-mesclar-gold-dark shadow-sm">
                    <Star className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                      Perfil Mesclar
                    </p>
                    <p className="text-sm font-bold text-mesclar-black">
                      Cliente desde sempre
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <form
            onSubmit={(e) => void saveProfile(e)}
            className="surface-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-mesclar-border/70 pb-4 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                  Editar perfil
                </h3>
                <p className="text-xs text-mesclar-muted">
                  Actualize as suas informações pessoais
                </p>
              </div>
            </div>

            <label className="block">
              <p className="text-xs font-bold text-mesclar-black mb-1.5 uppercase tracking-wider">
                Nome completo
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  className="input-field w-full pl-11"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Como quer ser chamado(a)?"
                />
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <p className="text-xs font-bold text-mesclar-black mb-1.5 uppercase tracking-wider">
                  Email (fixo)
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    className="input-field w-full pl-11 bg-mesclar-cream/40 text-mesclar-muted"
                    value={profile.email}
                    disabled
                  />
                </div>
              </label>
              <label className="block">
                <p className="text-xs font-bold text-mesclar-black mb-1.5 uppercase tracking-wider">
                  Telefone
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    className="input-field w-full pl-11"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+244 XXX XXX XXX"
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <p className="text-xs font-bold text-mesclar-black mb-1.5 uppercase tracking-wider">
                WhatsApp
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                  <MessageSquare className="h-4.5 w-4.5" />
                </span>
                <input
                  className="input-field w-full pl-11"
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  placeholder="+244 XXX XXX XXX"
                />
              </div>
              <p className="mt-1.5 text-xs text-mesclar-muted">
                Usado para notificações rápidas sobre os seus pedidos.
              </p>
            </label>

            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-mesclar-border/70 pt-4 mt-1">
              <Button type="submit" variant="gold" leftIcon={Check}>
                Guardar alterações
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void fetch("/api/account")
                    .then((r) => r.json())
                    .then((d) =>
                      setProfile({
                        name: d.name ?? "",
                        email: d.email ?? "",
                        phone: d.phone ?? "",
                        whatsapp: d.whatsapp ?? "",
                      })
                    );
                  setMsg({ text: "Formulário restaurado.", type: "success" });
                }}
              >
                Restaurar
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-violet-50/50 via-white to-violet-50/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                Segurança da conta
              </h2>
              <p className="text-xs text-mesclar-muted">
                Mantenha a sua palavra-passe actualizada
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Conta protegida
          </span>
        </div>

        <form onSubmit={(e) => void savePassword(e)} className="p-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <p className="text-xs font-bold text-mesclar-black mb-1.5 uppercase tracking-wider">
              Palavra-passe actual
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <IdCard className="h-4.5 w-4.5" />
              </span>
              <input
                name="currentPassword"
                type="password"
                required
                className="input-field w-full pl-11"
                placeholder="••••••••"
              />
            </div>
          </label>
          <label className="block sm:col-span-2">
            <p className="text-xs font-bold text-mesclar-black mb-1.5 uppercase tracking-wider">
              Nova palavra-passe
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
              <input
                name="newPassword"
                type="password"
                required
                minLength={6}
                className="input-field w-full pl-11"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <p className="mt-1.5 text-xs text-mesclar-muted">
              Use uma combinação forte de letras, números e símbolos.
            </p>
          </label>
          <div className="sm:col-span-2 flex items-center gap-3 border-t border-mesclar-border/70 pt-4 mt-1">
            <Button type="submit" variant="gold" leftIcon={RefreshCw}>
              Actualizar palavra-passe
            </Button>
          </div>
        </form>
      </div>

      <AddressesManager />
    </div>
  );
}

export function AddressesManager() {
  const [rows, setRows] = useState<
    {
      id: string;
      fullName: string;
      phone: string;
      province: string;
      municipality: string;
      neighborhood?: string;
      street: string;
      houseNumber: string;
      reference?: string;
      isDefault: boolean;
    }[]
  >([]);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    void fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fd.get("fullName"),
        phone: fd.get("phone"),
        whatsapp: fd.get("whatsapp") || undefined,
        province: fd.get("province"),
        municipality: fd.get("municipality"),
        neighborhood: fd.get("neighborhood"),
        street: fd.get("street"),
        houseNumber: fd.get("houseNumber"),
        reference: fd.get("reference") || undefined,
        isDefault: true,
      }),
    });
    if (res.ok) {
      e.currentTarget.reset();
      setMsg({ text: "Endereço adicionado com sucesso.", type: "success" });
      load();
    } else {
      setMsg({ text: "Erro ao guardar endereço.", type: "error" });
    }
  }

  async function remove(id: string) {
    setRemovingId(id);
    await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    setMsg({ text: "Endereço removido.", type: "success" });
    load();
    setRemovingId(null);
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-sky-50/50 via-white to-sky-50/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
              Endereços de entrega
            </h2>
            <p className="text-xs text-mesclar-muted">
              {rows.length} endereço{rows.length === 1 ? "" : "s"} guardado
              {rows.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-mesclar-border bg-white px-3.5 py-1.5 text-xs font-bold text-mesclar-black shadow-sm">
          <Package className="h-3.5 w-3.5 text-mesclar-gold-dark" />
          Entregas rápidas
        </div>
      </div>

      <div className="p-6 space-y-5">
        {msg && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              msg.type === "success"
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white"
                : "border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white"
            }`}
          >
            <span
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white shadow-md ${
                msg.type === "success"
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                  : "bg-gradient-to-br from-rose-500 to-rose-700"
              }`}
            >
              {msg.type === "success" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </span>
            <p
              className={`mt-0.5 font-semibold ${
                msg.type === "success" ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {msg.text}
            </p>
          </div>
        )}

        {loading ? (
          <ul className="space-y-3">
            {[0, 1].map((i) => (
              <li
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-mesclar-border/70 bg-white"
              />
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-sky-50/40 via-white to-sky-50/20 px-6 py-16 text-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(14,165,233,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,.8) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-sky-500/20 text-sky-700 shadow-inner ring-1 ring-sky-200/60">
              <MapPin className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <p className="relative mt-4 text-base font-bold text-mesclar-black">
              Ainda sem endereços de entrega
            </p>
            <p className="relative mt-1 text-sm text-mesclar-muted max-w-sm mx-auto">
              Adicione o seu primeiro endereço para finalizar compras mais rapidamente.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((a) => (
              <li
                key={a.id}
                className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-sky-50/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-[0_14px_30px_-18px_rgba(14,165,233,0.25)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-sky-500/5 text-sky-700 ring-1 ring-sky-200/60">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <p className="font-extrabold tracking-tight text-mesclar-black">
                        {a.fullName}
                      </p>
                      {a.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-mesclar-gold/40 bg-mesclar-gold/15 px-2.5 py-0.5 text-[10px] font-black text-mesclar-gold-dark">
                          <Star className="h-2.5 w-2.5 fill-mesclar-gold-dark" />
                          Predefinido
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs text-mesclar-muted">
                      <p className="font-medium">
                        <span className="text-mesclar-black font-semibold">Endereço: </span>
                        {a.street}, {a.houseNumber}
                        {a.neighborhood ? ` · ${a.neighborhood}` : ""}
                      </p>
                      <p className="font-medium">
                        <span className="text-mesclar-black font-semibold">Localização: </span>
                        {a.municipality}, {a.province}
                      </p>
                      {a.reference && (
                        <p className="font-medium">
                          <span className="text-mesclar-black font-semibold">Ref: </span>
                          {a.reference}
                        </p>
                      )}
                      <p className="inline-flex items-center gap-1.5 pt-1">
                        <Phone className="h-3 w-3 text-mesclar-gold-dark" />
                        <span className="font-semibold text-mesclar-black">{a.phone}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={Trash2}
                    disabled={removingId === a.id}
                    onClick={() => void remove(a.id)}
                  >
                    {removingId === a.id ? "A remover..." : "Remover"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-mesclar-cream/30 p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-mesclar-border/70">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                Adicionar novo endereço
              </h3>
              <p className="text-xs text-mesclar-muted">
                Preencha os campos para guardar um novo local de entrega
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => void save(e)}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="block sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Nome completo *
              </p>
              <input
                name="fullName"
                required
                placeholder="Nome do destinatário"
                className="input-field w-full"
              />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Telefone *
              </p>
              <input
                name="phone"
                required
                placeholder="+244 XXX XXX XXX"
                className="input-field w-full"
              />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                WhatsApp
              </p>
              <input
                name="whatsapp"
                placeholder="+244 XXX XXX XXX"
                className="input-field w-full"
              />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Província *
              </p>
              <input
                name="province"
                required
                placeholder="Ex: Luanda"
                className="input-field w-full"
              />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Município *
              </p>
              <input
                name="municipality"
                required
                placeholder="Ex: Talatona"
                className="input-field w-full"
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Bairro *
              </p>
              <input
                name="neighborhood"
                required
                placeholder="Ex: Camama"
                className="input-field w-full"
              />
            </label>
            <label className="block sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Rua / Avenida *
              </p>
              <input
                name="street"
                required
                placeholder="Rua, avenida ou caminho"
                className="input-field w-full"
              />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Nº da casa *
              </p>
              <input
                name="houseNumber"
                required
                placeholder="Ex: 123"
                className="input-field w-full"
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                Ponto de referência
              </p>
              <input
                name="reference"
                placeholder="Ex: Perto do supermercado X, edifício amarelo"
                className="input-field w-full"
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 border-t border-mesclar-border/70 pt-4 mt-1">
              <Button type="submit" variant="gold" leftIcon={MapPin}>
                Guardar endereço
              </Button>
              <span className="text-xs text-mesclar-muted inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Dados encriptados e seguros
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function LibraryPanel() {
  const [downloads, setDownloads] = useState<
    {
      id: string;
      token: string;
      expiresAt: string;
      book: { title: string; coverUrl?: string | null; slug?: string };
      order: { status: string };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/library")
      .then((r) => r.json())
      .then((d) => setDownloads(Array.isArray(d.downloads) ? d.downloads : []))
      .finally(() => setLoading(false));
  }, []);

  const ready = downloads.filter(
    (d) => d.order.status === "PAYMENT_APPROVED" || d.order.status === "COMPLETED"
  );

  const total = ready.length;
  const expiringSoon = ready.filter((d) => {
    const exp = new Date(d.expiresAt).getTime();
    const now = Date.now();
    return exp - now < 1000 * 60 * 60 * 24 * 7 && exp > now;
  }).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-card h-24 animate-pulse p-5" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-card h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                eBooks disponíveis
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-700">
                {total}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
              <Library className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mesclar-gold/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                A expirar brevemente
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-mesclar-gold-dark">
                {expiringSoon}
              </p>
              {expiringSoon > 0 && (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  Requer atenção
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                Aprendizado
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-violet-700">
                +{total}
              </p>
              <p className="mt-1 text-xs font-semibold text-violet-700">
                Conteúdos exclusivos
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                A sua biblioteca pessoal
              </h2>
              <p className="text-xs text-mesclar-muted">
                {total} {total === 1 ? "eBook" : "eBooks"} disponível
                {total === 1 ? "" : "eis"} para download
              </p>
            </div>
          </div>
          <Link href="/ebooks">
            <Button variant="ghost" size="sm" rightIcon={ChevronRight}>
              Explorar loja
            </Button>
          </Link>
        </div>

        <div className="p-6">
          {!ready.length ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-violet-50/40 via-white to-violet-50/20 px-6 py-20 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(139,92,246,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-violet-500/10 to-mesclar-gold/20 text-violet-700 shadow-inner ring-1 ring-violet-200/60">
                <Library className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="relative mt-5 text-lg font-bold text-mesclar-black">
                Biblioteca vazia
              </p>
              <p className="relative mt-1.5 mx-auto max-w-md text-sm text-mesclar-muted">
                Os eBooks comprados aparecerão aqui após a validação do pagamento. Explore a nossa
                colecção dedicada à logística e supply chain.
              </p>
              <div className="relative mt-6 flex items-center justify-center">
                <Link href="/ebooks">
                  <Button variant="gold" leftIcon={BookOpen}>
                    Explorar eBooks
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {ready.map((d) => {
                const expiresAt = new Date(d.expiresAt);
                const isExpiring =
                  expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7 &&
                  expiresAt.getTime() > Date.now();

                return (
                  <li
                    key={d.id}
                    className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-emerald-50/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-[0_14px_30px_-18px_rgba(16,185,129,0.25)]"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 flex items-start gap-4">
                        <div className="hidden sm:flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-lg">
                          <Library className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-black tracking-tight text-mesclar-black">
                              {d.book.title}
                            </p>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Liberado
                            </span>
                            {isExpiring && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-800">
                                <Clock className="h-3 w-3" />
                                Expira brevemente
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                              <Calendar className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                              Válido até{" "}
                              <span className="font-bold text-mesclar-black">
                                {expiresAt.toLocaleDateString("pt-AO")}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-mesclar-muted">
                              <Download className="h-3.5 w-3.5 text-mesclar-gold-dark" />
                              Download ilimitado até expirar
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {d.book.slug && (
                          <Link href={`/livros/${d.book.slug}`}>
                            <Button variant="secondary" size="sm" leftIcon={Eye}>
                              Ver
                            </Button>
                          </Link>
                        )}
                        <Link href={`/leitor/${d.token}`} target="_blank">
                          <Button variant="outline" size="sm" leftIcon={BookOpen}>
                            Ler Online
                          </Button>
                        </Link>
                        <a href={`/api/download/${d.token}`}>
                          <Button variant="gold" size="sm" leftIcon={Download}>
                            Descarregar
                          </Button>
                        </a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-700 ring-1 ring-emerald-200/60">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold text-mesclar-black">
              Aproveite ao máximo a sua biblioteca
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mesclar-muted">
              Os downloads têm data de validade por razões de segurança. Salve os ficheiros nos seus
              dispositivos pessoais para ter acesso permanente aos conteúdos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellerProfileForm() {
  const { refreshProfile } = useAuth();
  const { update } = useSession();
  const avatarInputId = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"account" | "commercial" | "reports">("account");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  // Account Profile State (Nome, Foto, Contactos)
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    phone: "",
    whatsapp: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [initialPhoto, setInitialPhoto] = useState<string | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);

  // Password State (Palavra-passe)
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPass, setSavingPass] = useState(false);

  // Commercial & Bank State (Bio, Dados Bancários)
  const [bio, setBio] = useState("");
  const [bank, setBank] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    expressPhone: "",
    accountNumber: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  // Stats State
  const [stats, setStats] = useState<{ received: number; books: number; sales: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [accRes, sellerRes] = await Promise.all([
          fetch("/api/account").then((r) => r.json()),
          fetch("/api/seller/profile").then((r) => r.json()),
        ]);

        if (isMounted) {
          if (accRes) {
            setAccountForm({
              name: accRes.name ?? "",
              email: accRes.email ?? "",
              registrationNumber: accRes.registrationNumber ?? "",
              phone: accRes.phone ?? "",
              whatsapp: accRes.whatsapp ?? "",
            });
            if (accRes.photoUrl) setInitialPhoto(accRes.photoUrl);
          }
          if (sellerRes) {
            setBio(sellerRes.bio ?? "");
            const b = sellerRes.bankAccounts?.[0];
            if (b) {
              setBank({
                bankName: b.bankName ?? "",
                accountHolder: b.accountHolder ?? "",
                iban: b.iban ?? "",
                expressPhone: b.expressPhone ?? "",
                accountNumber: b.accountNumber ?? "",
              });
            }
            if (sellerRes.stats) setStats(sellerRes.stats);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4500);
    return () => clearTimeout(t);
  }, [msg]);

  // Preview object URL management
  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreview(null);
    }
  }, [photoFile]);

  function handlePhotoPick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg({ text: "A foto de perfil deve ser uma imagem (JPG, PNG ou WebP).", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ text: "A foto excede o limite máximo de 5 MB.", type: "error" });
      return;
    }
    setPhotoFile(file);
    setMsg(null);
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!accountForm.name.trim() || accountForm.name.trim().length < 2) {
      setMsg({ text: "Insira um nome válido com pelo menos 2 caracteres.", type: "error" });
      return;
    }

    setSavingAccount(true);
    setMsg(null);

    try {
      const fd = new FormData();
      fd.append("name", accountForm.name.trim());
      fd.append("phone", accountForm.phone);
      fd.append("whatsapp", accountForm.whatsapp);
      if (photoFile) {
        fd.append("photo", photoFile);
      } else if (!initialPhoto && !photoPreview) {
        fd.append("removePhoto", "true");
      }

      const res = await fetch("/api/account", {
        method: "PATCH",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ text: json.error || "Erro ao guardar dados do perfil.", type: "error" });
        return;
      }

      if (json.photoUrl !== undefined) {
        setInitialPhoto(json.photoUrl);
        setPhotoFile(null);
      }

      await update();
      await refreshProfile();

      setMsg({ text: "Perfil (nome e foto) actualizado com sucesso!", type: "success" });
    } catch {
      setMsg({ text: "Erro de ligação ao guardar dados.", type: "error" });
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passForm.currentPassword) {
      setMsg({ text: "Insira a sua palavra-passe actual.", type: "error" });
      return;
    }
    if (!passForm.newPassword || passForm.newPassword.length < 6) {
      setMsg({ text: "A nova palavra-passe deve ter pelo menos 6 caracteres.", type: "error" });
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setMsg({ text: "A nova palavra-passe e a confirmação não coincidem.", type: "error" });
      return;
    }

    setSavingPass(true);
    setMsg(null);

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ text: json.error || "Erro ao alterar palavra-passe.", type: "error" });
        return;
      }

      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMsg({ text: "Palavra-passe alterada com sucesso!", type: "success" });
    } catch {
      setMsg({ text: "Erro de ligação ao alterar palavra-passe.", type: "error" });
    } finally {
      setSavingPass(false);
    }
  }

  async function handleSaveBank(e: React.FormEvent) {
    e.preventDefault();
    setSavingBank(true);
    setMsg(null);

    try {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, ...bank }),
      });

      if (res.ok) {
        setMsg({ text: "Dados comerciais e bancários guardados com sucesso!", type: "success" });
      } else {
        setMsg({ text: "Erro ao guardar dados bancários.", type: "error" });
      }
    } catch {
      setMsg({ text: "Erro de ligação ao guardar dados comerciais.", type: "error" });
    } finally {
      setSavingBank(false);
    }
  }

  const activePhoto = photoPreview || initialPhoto;

  return (
    <div className="space-y-6">
      {/* Alert message notification */}
      {msg && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-sm transition-all animate-in fade-in duration-200",
            msg.type === "success"
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white text-emerald-900"
              : "border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white text-rose-900"
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
              msg.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-rose-500 to-rose-700"
            )}
          >
            {msg.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="font-semibold">{msg.text}</p>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-mesclar-border/80 bg-white dark:bg-[#0A192F] dark:border-[#1e3a5f] p-2 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
            activeTab === "account"
              ? "bg-mesclar-black dark:bg-[#0E223F] text-mesclar-gold dark:text-mesclar-gold-light border border-transparent dark:border-mesclar-gold/30 shadow-md"
              : "text-mesclar-muted dark:text-white hover:text-mesclar-black dark:hover:text-white hover:bg-mesclar-cream/50 dark:hover:bg-[#0E223F]"
          )}
        >
          <User className="h-4 w-4" />
          <span>Editar perfil (Nome, Senha & Foto)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("commercial")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
            activeTab === "commercial"
              ? "bg-mesclar-black dark:bg-[#0E223F] text-mesclar-gold dark:text-mesclar-gold-light border border-transparent dark:border-mesclar-gold/30 shadow-md"
              : "text-mesclar-muted dark:text-white hover:text-mesclar-black dark:hover:text-white hover:bg-mesclar-cream/50 dark:hover:bg-[#0E223F]"
          )}
        >
          <CreditCard className="h-4 w-4" />
          <span>Dados Bancários & Bio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
            activeTab === "reports"
              ? "bg-mesclar-black dark:bg-[#0E223F] text-mesclar-gold dark:text-mesclar-gold-light border border-transparent dark:border-mesclar-gold/30 shadow-md"
              : "text-mesclar-muted dark:text-white hover:text-mesclar-black dark:hover:text-white hover:bg-mesclar-cream/50 dark:hover:bg-[#0E223F]"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Estatísticas & Relatórios</span>
        </button>
      </div>

      {/* TAB 1: EDITAR PERFIL (NOME, PASSWORD, IMAGEM DE PERFIL) */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Card 1: Imagem de Perfil (Avatar) */}
          <div className="surface-card p-6">
            <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-4 mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
                <Camera className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
                  Imagem de Perfil (Avatar)
                </h3>
                <p className="text-xs text-mesclar-muted dark:text-gray-300">
                  Esta foto será apresentada no seu painel, cabeçalho e publicações
                </p>
              </div>
            </div>

            <input
              ref={avatarInputRef}
              id={avatarInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="sr-only"
              onChange={(e) => {
                handlePhotoPick(e.target.files);
                e.target.value = "";
              }}
            />

            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-gradient-to-br from-mesclar-cream/30 via-white to-mesclar-cream/20 dark:from-[#0A192F] dark:via-[#0A192F] dark:to-[#0E223F] p-5">
              <div className="relative group shrink-0">
                <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-mesclar-gold/50 shadow-lg bg-mesclar-black flex items-center justify-center">
                  {activePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activePhoto}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-mesclar-gold">
                      <User className="h-12 w-12 opacity-80" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-mesclar-gold text-mesclar-black shadow-md transition hover:scale-105 hover:bg-mesclar-gold-light"
                  title="Alterar foto de perfil"
                >
                  <Camera className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <p className="text-sm font-bold text-mesclar-black dark:text-white">
                  {photoFile
                    ? photoFile.name
                    : activePhoto
                    ? "Foto de perfil carregada"
                    : "Nenhuma foto de perfil definida"}
                </p>
                <p className="text-xs text-mesclar-muted dark:text-gray-300">
                  Formato aceito: JPG, PNG ou WebP. Tamanho máximo recomendado: 5 MB.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={Upload}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {activePhoto ? "Trocar foto" : "Carregar foto"}
                  </Button>

                  {activePhoto && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={Trash2}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        setInitialPhoto(null);
                      }}
                    >
                      Remover foto
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dados Pessoais & Nome */}
          <form onSubmit={(e) => void handleSaveAccount(e)} className="surface-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
                  Identificação Pessoal
                </h3>
                <p className="text-xs text-mesclar-muted dark:text-gray-300">
                  Actualize o seu nome completo e números de contacto
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  Nome completo *
                </p>
                <input
                  required
                  className="input-field w-full"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Ex.: Carlos Mendes"
                />
              </label>

              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  Email da conta
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    disabled
                    className="input-field w-full pl-10 bg-mesclar-cream/40 dark:bg-[#0A192F] text-mesclar-muted opacity-80 cursor-not-allowed"
                    value={accountForm.email}
                  />
                </div>
              </label>

              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  ID de Registo
                </p>
                <input
                  disabled
                  className="input-field w-full bg-mesclar-cream/40 dark:bg-[#0A192F] font-mono text-mesclar-gold-dark dark:text-mesclar-gold font-bold opacity-80 cursor-not-allowed"
                  value={accountForm.registrationNumber || "Indisponível"}
                />
              </label>

              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  Telefone
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    className="input-field w-full pl-10"
                    value={accountForm.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+ ]/g, "");
                      setAccountForm({ ...accountForm, phone: val });
                    }}
                    onKeyDown={(e) => {
                      if (e.key.length === 1 && !/[0-9+ ]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
              </label>

              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  WhatsApp
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    className="input-field w-full pl-10"
                    value={accountForm.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+ ]/g, "");
                      setAccountForm({ ...accountForm, whatsapp: val });
                    }}
                    onKeyDown={(e) => {
                      if (e.key.length === 1 && !/[0-9+ ]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="gold" size="lg" disabled={savingAccount} leftIcon={Check}>
                {savingAccount ? "A guardar..." : "Guardar Nome e Foto"}
              </Button>
            </div>
          </form>

          {/* Card 3: Alterar Palavra-passe */}
          <form onSubmit={(e) => void handleSavePassword(e)} className="surface-card p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
                  Alterar Palavra-passe (Password)
                </h3>
                <p className="text-xs text-mesclar-muted dark:text-gray-300">
                  Garanta a segurança da sua conta definindo uma nova palavra-passe forte
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  Palavra-passe actual *
                </p>
                <input
                  type="password"
                  required
                  className="input-field w-full"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  Nova palavra-passe *
                </p>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field w-full"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="Mín. 6 caracteres"
                />
              </label>

              <label className="block">
                <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                  Confirmar nova palavra-passe *
                </p>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field w-full"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  placeholder="Repita a palavra-passe"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="gold" size="lg" disabled={savingPass} leftIcon={ShieldCheck}>
                {savingPass ? "A actualizar..." : "Alterar Palavra-passe"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DADOS COMERCIAIS E BANCÁRIOS */}
      {activeTab === "commercial" && (
        <form onSubmit={(e) => void handleSaveBank(e)} className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="group surface-card surface-card-hover relative overflow-hidden p-6 h-full">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-xl ring-1 ring-mesclar-gold/20">
                  <Briefcase className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight text-mesclar-black dark:text-white">
                  Apresentação Comercial
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-mesclar-muted dark:text-gray-300">
                  Apresentação pública que aparece na sua ficha de autor. Use este espaço para se destacar e contar a sua história.
                </p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-mesclar-border/70 dark:border-[#1e3a5f] bg-mesclar-cream/30 dark:bg-[#0E223F] px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#0A192F] text-emerald-600 shadow-sm">
                      <Award className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted dark:text-gray-300">
                        Dica profissional
                      </p>
                      <p className="text-sm font-semibold text-mesclar-black dark:text-white">
                        Seja autêntico e humanizado.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-mesclar-border/70 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mesclar-gold/15 text-mesclar-gold-dark dark:text-mesclar-gold-light shadow-sm">
                      <BadgeCheck className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted dark:text-gray-300">
                        Confiança
                      </p>
                      <p className="text-sm font-bold text-mesclar-black dark:text-white">
                        Dados bancários seguros
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1d263b] pb-4 mb-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
                    Bio / Apresentação
                  </h3>
                  <p className="text-xs text-mesclar-muted dark:text-gray-400">
                    Aparece na página pública do seu perfil
                  </p>
                </div>
              </div>

              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white">
                    Sobre você
                  </p>
                  <span className={`text-[10px] font-bold ${bio.length > 500 ? "text-rose-600" : "text-mesclar-muted"}`}>
                    {bio.length} caracteres
                  </span>
                </div>
                <textarea
                  className="input-field w-full h-36 resize-y"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Escreva um parágrafo sobre si, a sua jornada e o que os leitores podem esperar dos seus livros..."
                />
              </label>
            </div>

            <div className="surface-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 dark:border-[#1d263b] bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/30 dark:from-[#162423] dark:via-[#151c2c] dark:to-[#162423] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
                      Conta Bancária
                    </h3>
                    <p className="text-xs text-mesclar-muted dark:text-gray-400">
                      Dados para recebimento das suas vendas
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Encriptado
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                      Banco *
                    </p>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                        <Building2 className="h-4.5 w-4.5" />
                      </span>
                      <input
                        className="input-field w-full pl-11"
                        value={bank.bankName}
                        onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                        placeholder="Ex: Banco BAI"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                      Titular da conta *
                    </p>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                        <IdCard className="h-4.5 w-4.5" />
                      </span>
                      <input
                        className="input-field w-full pl-11"
                        value={bank.accountHolder}
                        onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
                        placeholder="Nome completo do titular"
                      />
                    </div>
                  </label>

                  <label className="block sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                      IBAN
                    </p>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                        <IdCard className="h-4.5 w-4.5" />
                      </span>
                      <input
                        className="input-field w-full pl-11 font-mono tracking-wider text-sm"
                        value={bank.iban}
                        onChange={(e) => setBank({ ...bank, iban: e.target.value })}
                        placeholder="AO06 0000 0000 0000 0000 0000 0"
                      />
                    </div>
                  </label>

                  <label className="block sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                      Número Express (MULTICAIXA Express)
                    </p>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                        <Smartphone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="tel"
                        className="input-field w-full pl-11 font-mono tracking-wider text-sm"
                        value={bank.expressPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9+ ]/g, "");
                          setBank({ ...bank, expressPhone: val });
                        }}
                        onKeyDown={(e) => {
                          if (e.key.length === 1 && !/[0-9+ ]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="+244 921 522 885"
                      />
                    </div>
                  </label>

                  <label className="block sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
                      Número da conta
                    </p>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                        <CreditCard className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        className="input-field w-full pl-11 font-mono tracking-wider text-sm"
                        value={bank.accountNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.-]/g, "");
                          setBank({ ...bank, accountNumber: val });
                        }}
                        onKeyDown={(e) => {
                          if (e.key.length === 1 && !/[0-9.-]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="0000.0000.0000-0"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              <Button type="submit" variant="gold" size="lg" disabled={savingBank} leftIcon={Check}>
                {savingBank ? "A guardar..." : "Guardar Dados Comerciais"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: ESTATÍSTICAS E RELATÓRIOS */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {!loading && stats && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-500/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted dark:text-gray-400">
                      Catálogo
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-sky-700 dark:text-sky-400">
                      {stats.books}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-mesclar-muted dark:text-gray-400">
                      {stats.books === 1 ? "Livro publicado" : "Livros publicados"}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-lg">
                    <Library className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted dark:text-gray-400">
                      Vendas
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-violet-700 dark:text-violet-400">
                      {stats.sales}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-mesclar-muted dark:text-gray-400">
                      {stats.sales === 1 ? "exemplar vendido" : "exemplares vendidos"}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="group surface-card surface-card-hover relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mesclar-gold/20 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted dark:text-gray-400">
                      Total recebido
                    </p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-gradient-gold">
                      {formatPrice(stats.received)}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-mesclar-muted dark:text-gray-400">
                      Movimentação líquida
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-lg">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="surface-card overflow-hidden p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
                  <Download className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
                    Exportação de Relatórios
                  </h3>
                  <p className="text-xs text-mesclar-muted dark:text-gray-400">
                    Descarregue os registos detalhados das suas vendas em formato CSV
                  </p>
                </div>
              </div>

              <a href="/api/reports/csv">
                <Button variant="gold" size="lg" leftIcon={FileText}>
                  Exportar vendas (.csv)
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminProfileForm() {
  const { update } = useSession();
  const { refreshProfile } = useAuth();
  const avatarInputId = useId();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Account State
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    phone: "",
    whatsapp: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);

  // Photo State
  const [initialPhoto, setInitialPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const accRes = await fetch("/api/account").then((r) => r.json());
        if (isMounted && accRes) {
          setAccountForm({
            name: accRes.name ?? "",
            email: accRes.email ?? "",
            registrationNumber: accRes.registrationNumber ?? "",
            phone: accRes.phone ?? "",
            whatsapp: accRes.whatsapp ?? "",
          });
          if (accRes.photoUrl) setInitialPhoto(accRes.photoUrl);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4500);
    return () => clearTimeout(t);
  }, [msg]);

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreview(null);
    }
  }, [photoFile]);

  function handlePhotoPick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg({ text: "A foto de perfil deve ser uma imagem (JPG, PNG ou WebP).", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ text: "A foto excede o limite máximo de 5 MB.", type: "error" });
      return;
    }
    setPhotoFile(file);
    setMsg(null);
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!accountForm.name.trim() || accountForm.name.trim().length < 2) {
      setMsg({ text: "Insira um nome válido com pelo menos 2 caracteres.", type: "error" });
      return;
    }

    setSavingAccount(true);
    setMsg(null);

    try {
      const fd = new FormData();
      fd.append("name", accountForm.name.trim());
      fd.append("phone", accountForm.phone);
      fd.append("whatsapp", accountForm.whatsapp);
      if (photoFile) {
        fd.append("photo", photoFile);
      } else if (!initialPhoto && !photoPreview) {
        fd.append("removePhoto", "true");
      }

      const res = await fetch("/api/account", {
        method: "PATCH",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ text: json.error || "Erro ao guardar dados do perfil.", type: "error" });
        return;
      }

      if (json.photoUrl !== undefined) {
        setInitialPhoto(json.photoUrl);
        setPhotoFile(null);
      }

      await update();
      await refreshProfile();

      setMsg({ text: "Perfil de administrador (nome e foto) actualizado com sucesso!", type: "success" });
    } catch {
      setMsg({ text: "Erro de ligação ao guardar dados.", type: "error" });
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passForm.currentPassword) {
      setMsg({ text: "Insira a sua palavra-passe actual.", type: "error" });
      return;
    }
    if (!passForm.newPassword || passForm.newPassword.length < 6) {
      setMsg({ text: "A nova palavra-passe deve ter pelo menos 6 caracteres.", type: "error" });
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setMsg({ text: "A nova palavra-passe e a confirmação não coincidem.", type: "error" });
      return;
    }

    setSavingPass(true);
    setMsg(null);

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ text: json.error || "Erro ao alterar palavra-passe.", type: "error" });
        return;
      }

      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMsg({ text: "Palavra-passe alterada com sucesso!", type: "success" });
    } catch {
      setMsg({ text: "Erro de ligação ao alterar palavra-passe.", type: "error" });
    } finally {
      setSavingPass(false);
    }
  }

  const activePhoto = photoPreview || initialPhoto;

  if (loading) {
    return <div className="surface-card max-w-3xl h-96 animate-pulse p-6" />;
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm animate-in fade-in duration-200",
            msg.type === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
              msg.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-rose-500 to-rose-700"
            )}
          >
            {msg.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="font-semibold">{msg.text}</p>
          </div>
        </div>
      )}

      {/* Card 1: Imagem de Perfil (Avatar) */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-4 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
              Imagem de Perfil de Administrador
            </h3>
            <p className="text-xs text-mesclar-muted dark:text-gray-300">
              Esta foto será apresentada no cabeçalho e acções do painel administrativo
            </p>
          </div>
        </div>

        <input
          ref={avatarInputRef}
          id={avatarInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          onChange={(e) => {
            handlePhotoPick(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-mesclar-border/80 dark:border-[#1e3a5f] bg-gradient-to-br from-mesclar-cream/30 via-white to-mesclar-cream/20 dark:from-[#0A192F] dark:via-[#0A192F] dark:to-[#0E223F] p-5">
          <div className="relative group shrink-0">
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-mesclar-gold/50 shadow-lg bg-mesclar-black flex items-center justify-center">
              {activePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePhoto}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-mesclar-gold">
                  <User className="h-12 w-12 opacity-80" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-mesclar-gold text-mesclar-black shadow-md transition hover:scale-105 hover:bg-mesclar-gold-light"
              title="Alterar foto de perfil"
            >
              <Camera className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <p className="text-sm font-bold text-mesclar-black dark:text-white">
              {photoFile
                ? photoFile.name
                : activePhoto
                ? "Foto de perfil carregada"
                : "Nenhuma foto de perfil definida"}
            </p>
            <p className="text-xs text-mesclar-muted dark:text-gray-300">
              Formato aceito: JPG, PNG ou WebP. Tamanho máximo recomendado: 5 MB.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={Upload}
                onClick={() => avatarInputRef.current?.click()}
              >
                {activePhoto ? "Trocar foto" : "Carregar foto"}
              </Button>

              {activePhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={Trash2}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setInitialPhoto(null);
                  }}
                >
                  Remover foto
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Identificação Pessoal & Nome */}
      <form onSubmit={(e) => void handleSaveAccount(e)} className="surface-card p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
              Identificação do Administrador
            </h3>
            <p className="text-xs text-mesclar-muted dark:text-gray-300">
              Actualize o seu nome completo e contactos
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              Nome completo *
            </p>
            <input
              required
              className="input-field w-full"
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              placeholder="Ex.: Administrador Principal"
            />
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              Email da conta
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                disabled
                className="input-field w-full pl-10 bg-mesclar-cream/40 dark:bg-[#0A192F] text-mesclar-muted opacity-80 cursor-not-allowed"
                value={accountForm.email}
              />
            </div>
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              ID de Registo
            </p>
            <input
              disabled
              className="input-field w-full bg-mesclar-cream/40 dark:bg-[#0A192F] font-mono text-mesclar-gold-dark dark:text-mesclar-gold font-bold opacity-80 cursor-not-allowed"
              value={accountForm.registrationNumber || "ADMIN"}
            />
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              Telefone
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <Phone className="h-4 w-4" />
              </span>
              <input
                className="input-field w-full pl-10"
                value={accountForm.phone}
                onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                placeholder="+244 9XX XXX XXX"
              />
            </div>
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              WhatsApp
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <Phone className="h-4 w-4" />
              </span>
              <input
                className="input-field w-full pl-10"
                value={accountForm.whatsapp}
                onChange={(e) => setAccountForm({ ...accountForm, whatsapp: e.target.value })}
                placeholder="+244 9XX XXX XXX"
              />
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gold" size="lg" disabled={savingAccount} leftIcon={Check}>
            {savingAccount ? "A guardar..." : "Guardar Nome e Foto"}
          </Button>
        </div>
      </form>

      {/* Card 3: Alterar Palavra-passe (Password) */}
      <form onSubmit={(e) => void handleSavePassword(e)} className="surface-card p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 dark:border-[#1e3a5f] pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black dark:text-white">
              Alterar Palavra-passe (Password)
            </h3>
            <p className="text-xs text-mesclar-muted dark:text-gray-300">
              Garanta a segurança do acesso administrativo definindo uma nova palavra-passe forte
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              Palavra-passe actual *
            </p>
            <input
              type="password"
              required
              className="input-field w-full"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              placeholder="Sua senha atual"
            />
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              Nova palavra-passe *
            </p>
            <input
              type="password"
              required
              minLength={6}
              className="input-field w-full"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              placeholder="Mín. 6 caracteres"
            />
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black dark:text-white mb-1.5">
              Confirmar nova palavra-passe *
            </p>
            <input
              type="password"
              required
              minLength={6}
              className="input-field w-full"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              placeholder="Repita a palavra-passe"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gold" size="lg" disabled={savingPass} leftIcon={ShieldCheck}>
            {savingPass ? "A actualizar..." : "Alterar Palavra-passe"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminOverview() {
  const [data, setData] = useState<{
    users: number;
    books: number;
    orders: number;
    pendingBooks: number;
    pendingPayments: number;
    sellers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="surface-card h-28 animate-pulse p-5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-sm text-mesclar-muted">Sem dados.</p>;

  const kpiList: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    accent: string;
    badge?: { label: string; tone: "amber" | "emerald" | "rose" } | null;
  }[] = [
    {
      label: "Usuários registados",
      value: data.users,
      icon: Users,
      color: "from-sky-500 to-sky-700",
      accent: "bg-sky-500/15",
      badge: null,
    },
    {
      label: "Profissionais",
      value: data.sellers ?? 0,
      icon: Briefcase,
      color: "from-indigo-500 to-indigo-700",
      accent: "bg-indigo-500/15",
      badge: null,
    },
    {
      label: "Livros no catálogo",
      value: data.books,
      icon: Library,
      color: "from-emerald-500 to-emerald-700",
      accent: "bg-emerald-500/15",
      badge: null,
    },
    {
      label: "Pedidos totais",
      value: data.orders,
      icon: ShoppingCart,
      color: "from-violet-500 to-violet-700",
      accent: "bg-violet-500/15",
      badge: null,
    },
    {
      label: "Livros pendentes",
      value: data.pendingBooks,
      icon: Clock,
      color: "from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark",
      accent: "bg-mesclar-gold/20",
      badge:
        data.pendingBooks > 0
          ? { label: "Atenção necessária", tone: "amber" as const }
          : null,
    },
    {
      label: "Pagamentos a validar",
      value: data.pendingPayments,
      icon: DollarSign,
      color: "from-rose-500 to-rose-700",
      accent: "bg-rose-500/15",
      badge:
        data.pendingPayments > 0
          ? { label: "Pendentes", tone: "rose" as const }
          : { label: "Em dia", tone: "emerald" as const },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpiList.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="group surface-card surface-card-hover relative overflow-hidden p-5"
            >
              <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${k.accent}`} />
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mesclar-muted">
                    {k.label}
                  </p>
                  <p
                    className={`mt-2 text-3xl font-black tracking-tight ${
                      k.color.includes("mesclar")
                        ? "text-gradient-gold"
                        : k.color.includes("emerald")
                          ? "text-emerald-700"
                          : k.color.includes("rose")
                            ? "text-rose-700"
                            : k.color.includes("sky")
                              ? "text-sky-700"
                              : k.color.includes("violet")
                                ? "text-violet-700"
                                : "text-indigo-700"
                    }`}
                  >
                    {k.value}
                  </p>
                  {k.badge && (
                    <p
                      className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                        k.badge.tone === "amber"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : k.badge.tone === "rose"
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {k.badge.tone !== "emerald" && (
                        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                          k.badge.tone === "amber" ? "bg-amber-500" : "bg-rose-500"
                        }`} />
                      )}
                      {k.badge.label}
                    </p>
                  )}
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${k.color} ${
                    k.color.includes("mesclar") ? "text-mesclar-black" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-amber-50/60 via-white to-amber-50/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-mesclar-black">
                  Áreas que requerem atenção
                </h3>
                <p className="text-xs text-mesclar-muted">
                  Validações pendentes
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {data.pendingBooks > 0 && (
              <Link
                href="/admin/livros-pendentes"
                className="group flex items-center justify-between rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-16px_rgba(245,158,11,0.35)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md">
                    <Clock className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-extrabold text-mesclar-black">
                      {data.pendingBooks} livros em análise
                    </p>
                    <p className="text-xs text-mesclar-muted">
                      Reveja e aprove publicações pendentes
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-mesclar-gold-dark transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {data.pendingPayments > 0 && (
              <Link
                href="/admin/pagamentos"
                className="group flex items-center justify-between rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50 via-white to-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-16px_rgba(244,63,94,0.35)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-md">
                    <DollarSign className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-extrabold text-mesclar-black">
                      {data.pendingPayments} pagamentos por validar
                    </p>
                    <p className="text-xs text-mesclar-muted">
                      Confirme pagamentos de clientes
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-rose-600 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {data.pendingBooks === 0 && data.pendingPayments === 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                  <Check className="h-6 w-6" />
                </div>
                <p className="mt-3 font-extrabold text-mesclar-black">
                  Tudo em dia!
                </p>
                <p className="mt-1 text-xs text-mesclar-muted">
                  Não existem validações pendentes.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 bg-gradient-to-r from-sky-50/60 via-white to-sky-50/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
                <FolderKanban className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-mesclar-black">
                  Acesso rápido
                </h3>
                <p className="text-xs text-mesclar-muted">Secções administrativas</p>
              </div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              ["Profissionais", "/admin/profissionais", Briefcase, "from-indigo-500/15", "text-indigo-700"],
              ["Livros", "/admin/livros", Library, "from-emerald-500/15", "text-emerald-700"],
              ["Pedidos", "/admin/pedidos", ShoppingCart, "from-violet-500/15", "text-violet-700"],
              ["Categorias", "/admin/categorias", FolderKanban, "from-mesclar-gold/15", "text-mesclar-gold-dark"],
              ["Pagamentos", "/admin/pagamentos", DollarSign, "from-rose-500/15", "text-rose-700"],
            ].map(([label, href, Icon, bg, text]) => (
              <Link
                key={href as string}
                href={href as string}
                className={`group flex items-center gap-3 rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white ${bg} p-3.5 transition-all hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:shadow-[0_10px_22px_-16px_rgba(0,0,0,0.25)]`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white to-mesclar-cream shadow-sm ${text}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="font-bold text-mesclar-black text-sm">{label as string}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminResourceList({ resource }: { resource: string }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    void fetch(`/api/admin?resource=${resource}`)
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [resource]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-category", name }),
    });
    setName("");
    setMsg({ text: "Categoria adicionada.", type: "success" });
    load();
  }

  async function addPickup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-pickup",
        name: fd.get("name"),
        address: fd.get("address"),
        province: fd.get("province"),
        municipality: fd.get("municipality"),
        phone: fd.get("phone"),
      }),
    });
    e.currentTarget.reset();
    setMsg({ text: "Ponto de recolha adicionado.", type: "success" });
    load();
  }

  async function toggleSeller(id: string, isActive: boolean) {
    setActingId(id);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-seller", id, isActive }),
    });
    setMsg({ text: isActive ? "Profissional activado." : "Profissional desactivado.", type: "success" });
    load();
    setActingId(null);
  }

  async function setBookStatus(id: string, action: "unpublish-book" | "publish-book") {
    setActingId(id);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    setMsg({
      text: action === "publish-book" ? "Livro publicado." : "Livro removido do catálogo.",
      type: "success",
    });
    load();
    setActingId(null);
  }

  const titles: Record<string, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; accent: string }> = {
    categories: { title: "Categorias do catálogo", subtitle: "Organize os livros por áreas temáticas", icon: FolderKanban, accent: "bg-gradient-to-r from-mesclar-gold/10 via-white to-mesclar-gold/5" },
    "pickup-points": { title: "Pontos de recolha", subtitle: "Locais de entrega para os clientes", icon: MapPin, accent: "bg-gradient-to-r from-sky-500/10 via-white to-sky-500/5" },
    books: { title: "Gestão de livros", subtitle: "Controle de publicações no catálogo", icon: Library, accent: "bg-gradient-to-r from-emerald-500/10 via-white to-emerald-500/5" },
    sellers: { title: "Gestão de profissionais", subtitle: "Activar e desactivar profissionais", icon: Briefcase, accent: "bg-gradient-to-r from-violet-500/10 via-white to-violet-500/5" },
    users: { title: "Usuários", subtitle: "Visão geral dos utilizadores registados", icon: Users, accent: "bg-gradient-to-r from-sky-500/10 via-white to-sky-500/5" },
    orders: { title: "Histórico de pedidos", subtitle: "Acompanhe todas as encomendas", icon: ShoppingCart, accent: "bg-gradient-to-r from-indigo-500/10 via-white to-indigo-500/5" },
    payments: { title: "Validar pagamentos", subtitle: "Confirme comprovativos enviados", icon: DollarSign, accent: "bg-gradient-to-r from-rose-500/10 via-white to-rose-500/5" },
    coupons: { title: "Cupões de desconto", subtitle: "Crie e gere promoções", icon: Tag, accent: "bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5" },
  };
  const meta = titles[resource] ?? { title: "Recursos", subtitle: `Gestão de ${resource}`, icon: FolderKanban, accent: "bg-gradient-to-r from-slate-500/10 via-white to-slate-500/5" };
  const MetaIcon = meta.icon;

  return (
    <div className="space-y-5">
      {msg && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${
            msg.type === "success"
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white"
              : "border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white"
          }`}
        >
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
              msg.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-rose-500 to-rose-700"
            }`}
          >
            {msg.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </span>
          <p className={`mt-1 font-semibold ${msg.type === "success" ? "text-emerald-900" : "text-rose-900"}`}>
            {msg.text}
          </p>
        </div>
      )}

      <div className={`surface-card overflow-hidden border-b-none`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-mesclar-border/80 ${meta.accent} px-6 py-4`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <MetaIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-mesclar-black">{meta.title}</h2>
              <p className="text-xs text-mesclar-muted">{meta.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mesclar-border bg-white px-3.5 py-1.5 text-xs font-bold text-mesclar-black shadow-sm">
              {rows.length} {rows.length === 1 ? "item" : "itens"}
            </span>
            {(resource === "orders" || resource === "payments" || resource === "sellers") && (
              <a href={`/api/reports/csv?type=${resource === "payments" ? "orders" : resource}`}>
                <Button variant="secondary" size="sm" leftIcon={FileText}>
                  Exportar CSV
                </Button>
              </a>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => load()}
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {resource === "categories" && (
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-mesclar-border/70">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mesclar-gold-light via-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
              <Plus className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-extrabold text-mesclar-black">Nova categoria</h3>
              <p className="text-xs text-mesclar-muted">Adicione uma área temática ao catálogo</p>
            </div>
          </div>
          <form onSubmit={(e) => void addCategory(e)} className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <FolderKanban className="h-4.5 w-4.5" />
              </span>
              <input
                className="input-field w-full pl-11"
                placeholder="Ex: Gestão de Armazéns, Transportes Internacionais..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="gold" leftIcon={Plus}>
              Adicionar
            </Button>
          </form>
        </div>
      )}

      {resource === "pickup-points" && (
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-mesclar-border/70">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md">
              <Plus className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-extrabold text-mesclar-black">Novo ponto de recolha</h3>
              <p className="text-xs text-mesclar-muted">
                Registre locais para levantamento de encomendas
              </p>
            </div>
          </div>
          <form onSubmit={(e) => void addPickup(e)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">Nome do ponto *</p>
              <input name="name" required placeholder="Ex: Loja Talatona" className="input-field w-full" />
            </label>
            <label className="block sm:col-span-2 lg:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">Morada completa *</p>
              <input name="address" required placeholder="Rua, avenida, nº e edifício" className="input-field w-full" />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">Província *</p>
              <input name="province" required placeholder="Ex: Luanda" className="input-field w-full" />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">Município *</p>
              <input name="municipality" required placeholder="Ex: Belas" className="input-field w-full" />
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-black mb-1.5">Telefone</p>
              <input name="phone" placeholder="+244 XXX XXX XXX" className="input-field w-full" />
            </label>
            <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-3 border-t border-mesclar-border/70 pt-4 mt-1">
              <Button type="submit" variant="gold" leftIcon={MapPin}>
                Guardar ponto
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="surface-card h-20 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-mesclar-border bg-gradient-to-br from-mesclar-cream/30 via-white to-mesclar-gold/5 px-6 py-20 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(10,10,10,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black/5 via-mesclar-gold/10 to-mesclar-gold/20 text-mesclar-gold-dark shadow-inner ring-1 ring-mesclar-gold/20">
            <MetaIcon className="h-7 w-7" />
          </div>
          <p className="relative mt-4 text-lg font-bold text-mesclar-black">
            Nenhum item encontrado
          </p>
          <p className="relative mt-1 mx-auto max-w-md text-sm text-mesclar-muted">
            {resource === "categories"
              ? "Crie a primeira categoria para organizar os livros do catálogo."
              : resource === "pickup-points"
                ? "Adicione o primeiro ponto de recolha para facilitar as entregas."
                : "A lista está vazia neste momento."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => {
            const id = (r.id as string) || String(i);
            const title =
              (r.name as string) ||
              (r.title as string) ||
              ((r.user as { name?: string })?.name) ||
              (r.orderNumber as string) ||
              "Item";
            const sub =
              (r.email as string) ||
              (r.slug as string) ||
              (r.status as string) ||
              (r.address as string) ||
              ((r.user as { email?: string })?.email) ||
              "";
            return (
              <li
                key={id}
                className="group relative overflow-hidden rounded-2xl border border-mesclar-border/80 bg-gradient-to-br from-white via-white to-mesclar-cream/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-mesclar-gold/40 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.25)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mesclar-gold/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 flex items-start gap-3">
                    <span className="hidden sm:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-cream via-white to-mesclar-cream text-mesclar-gold-dark ring-1 ring-mesclar-gold/20 shadow-sm">
                      <MetaIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold tracking-tight text-mesclar-black">{title}</p>
                      {sub && (
                        <p className="mt-1 truncate text-xs text-mesclar-muted">{sub}</p>
                      )}
                      {resource === "sellers" && (
                        <div className="mt-2 flex items-center gap-2">
                          {(r.isActive as boolean) ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Inactivo
                            </span>
                          )}
                        </div>
                      )}
                      {resource === "books" && (r.status as string) && (
                        <div className="mt-2">
                          {(r.status as string) in bookStatusConfig ? (
                            <BookStatusBadge status={r.status as string} />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-800">
                              {r.status as string}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resource === "sellers" && (
                      <Button
                        size="sm"
                        variant={(r.isActive as boolean) ? "outline" : "gold"}
                        leftIcon={(r.isActive as boolean) ? EyeOff : Check}
                        disabled={actingId === id}
                        onClick={() => void toggleSeller(id, !(r.isActive as boolean))}
                      >
                        {actingId === id ? "..." : (r.isActive as boolean) ? "Desactivar" : "Activar"}
                      </Button>
                    )}
                    {resource === "books" && (r.status as string) === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={EyeOff}
                        disabled={actingId === id}
                        onClick={() => void setBookStatus(id, "unpublish-book")}
                      >
                        {actingId === id ? "..." : "Remover catálogo"}
                      </Button>
                    )}
                    {resource === "books" && (r.status as string) !== "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="gold"
                        leftIcon={Check}
                        disabled={actingId === id}
                        onClick={() => void setBookStatus(id, "publish-book")}
                      >
                        {actingId === id ? "..." : "Publicar"}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SettingsForm() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin?resource=settings")
      .then((r) => r.json())
      .then((d) => {
        setEmail(d?.contactEmail ?? "");
        setWhatsapp(d?.contactWhatsapp ?? "");
        setAboutText(d?.aboutText ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "settings",
        contactEmail: email,
        contactWhatsapp: whatsapp,
        aboutText: aboutText,
      }),
    });
    setMsg(res.ok ? { text: "Definições guardadas.", type: "success" } : { text: "Erro ao guardar.", type: "error" });
  }

  if (loading) {
    return (
      <div className="surface-card max-w-xl h-80 animate-pulse p-6" />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5 items-start">
      <div className="lg:col-span-2">
        <div className="group surface-card surface-card-hover relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mesclar-gold/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-xl ring-1 ring-mesclar-gold/20">
              <Settings className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-black tracking-tight text-mesclar-black">
              Definições gerais
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-mesclar-muted">
              Canais de contacto públicos que aparecem aos clientes na loja, emails transaccionais
              e página de suporte.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-mesclar-border/70 bg-mesclar-cream/30 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                    Informação confidencial
                  </p>
                  <p className="text-sm font-bold text-mesclar-black truncate">
                    Apenas visível para admins
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-mesclar-border/70 bg-white px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mesclar-gold/15 text-mesclar-gold-dark shadow-sm">
                  <Award className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-mesclar-muted">
                    Actualização em tempo real
                  </p>
                  <p className="text-sm font-bold text-mesclar-black">
                    Alterações imediatas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <form onSubmit={(e) => void save(e)} className="surface-card max-w-none p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-mesclar-border/70 pb-4 mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-mesclar-black">
                Contactos da marca
              </h3>
              <p className="text-xs text-mesclar-muted">
                Estes dados aparecem em várias comunicações com o cliente
              </p>
            </div>
          </div>

          {msg && (
            <div
              className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${
                msg.type === "success"
                  ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white"
                  : "border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white"
              }`}
            >
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                  msg.type === "success"
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                    : "bg-gradient-to-br from-rose-500 to-rose-700"
                }`}
              >
                {msg.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </span>
              <p className={`mt-1 font-semibold ${msg.type === "success" ? "text-emerald-900" : "text-rose-900"}`}>
                {msg.text}
              </p>
            </div>
          )}

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
              Email de contacto
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mesclar-muted">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                className="input-field w-full pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="geral@mesclar.ao"
                type="email"
              />
            </div>
          </label>

          <label className="block">
            <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
              WhatsApp de contacto
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                <MessageSquare className="h-4.5 w-4.5" />
              </span>
              <input
                className="input-field w-full pl-11"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+244 XXX XXX XXX"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-mesclar-black">
                Sobre a plataforma
              </p>
              <span className={`text-[10px] font-bold ${aboutText.length > 5000 ? "text-rose-600" : "text-mesclar-muted"}`}>
                {aboutText.length} caracteres
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-mesclar-muted">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <textarea
                className="input-field w-full pl-11 h-72 resize-y"
                rows={10}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Escreva o texto que aparece na página Sobre da plataforma..."
              />
            </div>
            <p className="mt-1.5 text-xs text-mesclar-muted">
              Separe parágrafos com uma linha em branco. Este conteúdo aparece publicamente na página /sobre.
            </p>
          </label>

          <div className="flex flex-wrap items-center gap-3 justify-end border-t border-mesclar-border/70 pt-4 mt-1">
            <Button type="submit" variant="gold" leftIcon={Check}>
              Guardar definições
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

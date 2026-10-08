"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Library,
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
  BookOpen,
  Filter,
  Loader2,
  Calendar,
  Clock,
  User,
  Star,
  Package,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export type AdminBookRow = {
  id: string;
  title: string;
  slug: string;
  status: "PENDING" | "PUBLISHED" | "REJECTED" | "CHANGES_REQUESTED";
  rejectionReason: string | null;
  productType: "EBOOK" | "PHYSICAL" | "BOTH";
  priceEbook: number;
  pricePhysical: number | null;
  coverUrl: string | null;
  stockQuantity: number;
  featured: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    slug: string;
    photoUrl: string | null;
    specialty: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  _count: {
    orderItems: number;
    reviews: number;
  };
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PUBLISHED: {
    label: "Publicado",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pendente",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  REJECTED: {
    label: "Rejeitado / Removido",
    bg: "bg-rose-50",
    text: "text-rose-900",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  CHANGES_REQUESTED: {
    label: "Alterações Solicitadas",
    bg: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
};

export function AdminBooksManager() {
  const [books, setBooks] = useState<AdminBookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [formatFilter, setFormatFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [editBook, setEditBook] = useState<AdminBookRow | null>(null);
  const [rejectBook, setRejectBook] = useState<AdminBookRow | null>(null);
  const [deleteBook, setDeleteBook] = useState<AdminBookRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [editFormData, setEditFormData] = useState({
    title: "",
    priceEbook: 0,
    pricePhysical: 0,
    stockQuantity: 0,
    status: "PUBLISHED" as any,
  });

  function showMessage(text: string, type: "success" | "error") {
    setFeedback({ text, type });
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchBooks() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/books");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao carregar catálogo de livros.");
      }
      setBooks(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.name.toLowerCase().includes(q) ||
        b.category.name.toLowerCase().includes(q) ||
        b.seller.user.name.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchFormat = formatFilter === "ALL" || b.productType === formatFilter;

      return matchQuery && matchStatus && matchFormat;
    });
  }, [books, search, statusFilter, formatFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = books.length;
    const published = books.filter((b) => b.status === "PUBLISHED").length;
    const pending = books.filter((b) => b.status === "PENDING").length;
    const physical = books.filter((b) => b.productType === "PHYSICAL" || b.productType === "BOTH").length;
    return { total, published, pending, physical };
  }, [books]);

  // 1. Publish Book
  async function handlePublish(book: AdminBookRow) {
    setActionLoading(`publish-${book.id}`);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", bookId: book.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao publicar.");

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, status: "PUBLISHED", rejectionReason: null } : b))
      );
      showMessage(`Livro "${book.title}" publicado com sucesso no catálogo!`, "success");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao publicar livro.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 2. Reject Book
  async function handleReject() {
    if (!rejectBook) return;
    setActionLoading("reject");
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          bookId: rejectBook.id,
          reason: rejectReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao rejeitar/remover.");

      setBooks((prev) =>
        prev.map((b) => (b.id === rejectBook.id ? { ...b, status: "REJECTED", rejectionReason: rejectReason } : b))
      );
      showMessage(`Livro "${rejectBook.title}" removido do catálogo.`, "success");
      setRejectBook(null);
      setRejectReason("");
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao rejeitar livro.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 3. Toggle Feature
  async function handleToggleFeature(book: AdminBookRow) {
    const nextVal = !book.featured;
    setActionLoading(`feature-${book.id}`);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-feature",
          bookId: book.id,
          featured: nextVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar destaque.");

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, featured: nextVal } : b))
      );
      showMessage(
        nextVal
          ? `Livro "${book.title}" adicionado aos DESTAQUES da página inicial!`
          : `Livro "${book.title}" retirado dos destaques.`,
        "success"
      );
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao alterar destaque.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 4. Edit Book
  function openEditModal(book: AdminBookRow) {
    setEditBook(book);
    setEditFormData({
      title: book.title,
      priceEbook: book.priceEbook,
      pricePhysical: book.pricePhysical || 0,
      stockQuantity: book.stockQuantity || 0,
      status: book.status,
    });
  }

  async function handleEditBook(e: React.FormEvent) {
    e.preventDefault();
    if (!editBook) return;
    setActionLoading("edit");
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          bookId: editBook.id,
          title: editFormData.title,
          priceEbook: Number(editFormData.priceEbook),
          pricePhysical: editBook.productType !== "EBOOK" ? Number(editFormData.pricePhysical) : null,
          stockQuantity: Number(editFormData.stockQuantity),
          status: editFormData.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar alterações.");

      showMessage(`Livro "${editFormData.title}" actualizado com sucesso!`, "success");
      setEditBook(null);
      fetchBooks();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao editar livro.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 5. Delete Book
  async function handleDeleteBook() {
    if (!deleteBook) return;
    setActionLoading("delete");
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          bookId: deleteBook.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao eliminar livro.");

      setBooks((prev) => prev.filter((b) => b.id !== deleteBook.id));
      showMessage(`Livro "${deleteBook.title}" eliminado com sucesso.`, "success");
      setDeleteBook(null);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao eliminar livro.", "error");
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
            <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">Total Obras</span>
            <Library className="h-4 w-4 text-mesclar-gold-dark" />
          </div>
          <p className="mt-2 text-2xl font-black text-mesclar-black">{stats.total}</p>
          <p className="text-[11px] text-mesclar-muted">Livros no catálogo</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Publicados</span>
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.published}</p>
          <p className="text-[11px] text-mesclar-muted">Disponíveis para compra</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pendentes</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.pending}</p>
          <p className="text-[11px] text-mesclar-muted">Aguardando aprovação</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Livros Físicos</span>
            <Package className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-900">{stats.physical}</p>
          <p className="text-[11px] text-mesclar-muted">Com stock e logística física</p>
        </div>
      </div>

      {/* Main Header Card with Controls */}
      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/10 via-white to-mesclar-gold/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <Library className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-mesclar-black">
                Gestão Geral de Livros e Catálogo
              </h2>
              <p className="text-xs text-mesclar-muted">
                Controle de publicações, preços, aprovações de novos livros e destaques da loja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/livros-pendentes">
              <Button
                type="button"
                variant="gold"
                leftIcon={Clock}
                className="shadow-sm font-bold text-xs"
              >
                Ver Livros Pendentes ({stats.pending})
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchBooks}
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
              placeholder="Pesquisar por livro, autor, categoria ou vendedor..."
              className="input-field w-full pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-6 lg:col-span-6 sm:justify-end">
            <div className="flex items-center gap-1 text-xs text-mesclar-muted mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Estado:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-mesclar-border bg-white px-3 py-2 text-xs font-semibold text-mesclar-black shadow-sm focus:outline-none focus:ring-1 focus:ring-mesclar-gold"
            >
              <option value="ALL">Todos os Estados</option>
              <option value="PUBLISHED">Apenas Publicados</option>
              <option value="PENDING">Apenas Pendentes</option>
              <option value="REJECTED">Apenas Rejeitados</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-mesclar-muted ml-2 mr-1">
              <span>Formato:</span>
            </div>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="rounded-xl border border-mesclar-border bg-white px-3 py-2 text-xs font-semibold text-mesclar-black shadow-sm focus:outline-none focus:ring-1 focus:ring-mesclar-gold"
            >
              <option value="ALL">Todos os Formatos</option>
              <option value="EBOOK">Apenas E-Book</option>
              <option value="PHYSICAL">Apenas Físico</option>
              <option value="BOTH">Ambos (Físico + Digital)</option>
            </select>
          </div>
        </div>

        {/* Books List */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-mesclar-cream/50" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-muted">
              <Library className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-bold text-mesclar-black">Nenhum livro encontrado</h3>
            <p className="mt-1 text-xs text-mesclar-muted">
              Tente ajustar os filtros ou os termos de pesquisa.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-mesclar-border/60">
            {filteredBooks.map((book) => {
              const st = STATUS_CONFIG[book.status] || STATUS_CONFIG.PENDING;
              const isActing = actionLoading?.includes(book.id);

              return (
                <div
                  key={book.id}
                  className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    book.status !== "PUBLISHED" ? "bg-amber-50/15" : "hover:bg-mesclar-cream/20"
                  }`}
                >
                  {/* Book Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-mesclar-border bg-gradient-to-br from-mesclar-gray to-mesclar-black shadow-sm">
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-mesclar-gold">
                          <BookOpen className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-mesclar-black text-sm truncate">
                          {book.title}
                        </h4>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1.5 ${st.bg} ${st.text} ${st.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>

                        {book.featured && (
                          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            Destaque
                          </span>
                        )}

                        <span className="rounded-full border border-mesclar-border bg-white px-2 py-0.5 text-[10px] font-bold text-mesclar-black">
                          {book.productType === "BOTH" ? "E-Book + Físico" : book.productType === "EBOOK" ? "E-Book Digital" : "Livro Físico"}
                        </span>

                        <Link
                          href={`/livros/${book.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-[11px] text-mesclar-gold-dark hover:underline font-semibold"
                          title="Ver na loja"
                        >
                          <span>Ver na loja</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-mesclar-gold-dark" />
                          <span className="font-semibold text-mesclar-black">
                            {book.author?.name || book.seller?.user?.name}
                          </span>
                        </span>

                        <span className="font-medium text-mesclar-black">
                          {book.category?.name}
                        </span>

                        <span className="text-[11px] text-mesclar-muted/80">
                          Vendas: {book.salesCount} exemplares
                        </span>

                        {book.productType !== "EBOOK" && (
                          <span className="text-[11px] text-mesclar-muted/80">
                            Stock Físico: {book.stockQuantity} un.
                          </span>
                        )}
                      </div>

                      {/* Prices */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {book.priceEbook > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-mesclar-cream/70 px-2 py-0.5 text-[11px] font-bold text-mesclar-black">
                            E-Book: {formatPrice(book.priceEbook)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                            E-Book Gratuito
                          </span>
                        )}

                        {book.pricePhysical && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-mesclar-border px-2 py-0.5 text-[11px] font-bold text-mesclar-black">
                            Físico: {formatPrice(book.pricePhysical)}
                          </span>
                        )}

                        {book.rejectionReason && (
                          <span className="text-[11px] text-rose-700 italic">
                            Motivo: {book.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-center">
                    {/* Publicar se não publicado */}
                    {book.status !== "PUBLISHED" ? (
                      <Button
                        size="sm"
                        variant="gold"
                        leftIcon={Check}
                        disabled={isActing}
                        onClick={() => handlePublish(book)}
                        className="text-xs h-8 px-2.5 font-bold"
                      >
                        {isActing ? "..." : "Publicar"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={EyeOff}
                        disabled={isActing}
                        onClick={() => {
                          setRejectBook(book);
                          setRejectReason("Removido do catálogo pela administração");
                        }}
                        className="text-xs h-8 px-2.5 font-bold"
                      >
                        Remover
                      </Button>
                    )}

                    {/* Destaque */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Star}
                      disabled={isActing}
                      onClick={() => handleToggleFeature(book)}
                      title={book.featured ? "Remover destaque" : "Destacar livro na homepage"}
                      className={`text-xs h-8 px-2 ${
                        book.featured ? "text-amber-600 bg-amber-50" : "text-mesclar-black hover:bg-mesclar-cream"
                      }`}
                    >
                      {book.featured ? "Destacado" : "Destacar"}
                    </Button>

                    {/* Editar */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Pencil}
                      disabled={isActing}
                      onClick={() => openEditModal(book)}
                      className="text-xs h-8 px-2 text-mesclar-black hover:bg-mesclar-cream"
                    >
                      Editar
                    </Button>

                    {/* Eliminar */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Trash2}
                      disabled={isActing}
                      onClick={() => setDeleteBook(book)}
                      className="text-xs h-8 px-2 text-rose-600 hover:bg-rose-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDITAR LIVRO */}
      {/* ========================================================================= */}
      {editBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Editar Livro</h3>
                  <p className="text-xs text-mesclar-muted">{editBook.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEditBook(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditBook} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Título da Obra *
                </label>
                <input
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Preço E-Book (Kz)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.priceEbook}
                    onChange={(e) => setEditFormData({ ...editFormData, priceEbook: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                  <p className="text-[10px] text-mesclar-muted mt-1">Coloque 0 se for gratuito.</p>
                </div>

                {editBook.productType !== "EBOOK" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                      Preço Livro Físico (Kz)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editFormData.pricePhysical}
                      onChange={(e) => setEditFormData({ ...editFormData, pricePhysical: Number(e.target.value) })}
                      className="input-field w-full"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Stock Físico (Unidades)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.stockQuantity}
                    onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado do Livro
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="PUBLISHED">Publicado</option>
                    <option value="PENDING">Pendente</option>
                    <option value="REJECTED">Rejeitado</option>
                    <option value="CHANGES_REQUESTED">Alterações Solicitadas</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditBook(null)}
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
      {/* MODAL: REJEITAR / REMOVER LIVRO */}
      {/* ========================================================================= */}
      {rejectBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                  <EyeOff className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-rose-950">Remover do Catálogo</h3>
                  <p className="text-xs text-rose-800">{rejectBook.title}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectBook(null)}
                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-mesclar-muted leading-relaxed">
                Ao retirar este livro do catálogo, os clientes não poderão mais visualizá-lo nem comprá-lo na loja.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Motivo da Remoção / Rejeição *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Não atende aos critérios técnicos de qualidade, conteúdo protegido..."
                  className="input-field w-full"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectBook(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={actionLoading === "reject" ? Loader2 : EyeOff}
                  disabled={actionLoading === "reject"}
                  onClick={handleReject}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {actionLoading === "reject" ? "A remover..." : "Confirmar Remoção"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ELIMINAR LIVRO */}
      {/* ========================================================================= */}
      {deleteBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-rose-950">Eliminar Livro</h3>
                  <p className="text-xs text-rose-800">Esta acção é irreversível</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteBook(null)}
                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed text-mesclar-black">
                Tem a certeza que deseja eliminar o livro{" "}
                <strong className="font-black text-mesclar-black">{deleteBook.title}</strong>?
              </p>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-900">
                A obra e todos os seus ficheiros serão removidos permanentemente.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteBook(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={actionLoading === "delete" ? Loader2 : Trash2}
                  disabled={actionLoading === "delete"}
                  onClick={handleDeleteBook}
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

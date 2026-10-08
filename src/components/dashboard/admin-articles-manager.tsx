"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
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
  Archive,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  category: string | null;
  tags: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  readTime: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      author?: {
        id: string;
        slug: string;
        photoUrl: string | null;
        specialty: string | null;
      } | null;
    };
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
  DRAFT: {
    label: "Rascunho",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  ARCHIVED: {
    label: "Arquivado",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export function AdminArticlesManager() {
  const [articles, setArticles] = useState<AdminArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<AdminArticleRow | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<AdminArticleRow | null>(null);

  // Form states
  const [newArticleData, setNewArticleData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Logística e Procurement",
    tags: "Logística, Cadeia de Suprimentos, Angola",
    readTime: 5,
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    readTime: 5,
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT" | "ARCHIVED",
  });

  function showMessage(text: string, type: "success" | "error") {
    setFeedback({ text, type });
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao carregar artigos.");
      }
      setArticles(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  // Filtered articles
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.tags && a.tags.toLowerCase().includes(q)) ||
        a.seller.user.name.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [articles, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const pagedArticles = useMemo(() => {
    return filteredArticles.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredArticles, page]);

  // Stats
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === "PUBLISHED").length;
    const drafts = articles.filter((a) => a.status === "DRAFT").length;
    const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
    return { total, published, drafts, totalViews };
  }, [articles]);

  // 1. Toggle Status
  async function handleToggleStatus(article: AdminArticleRow) {
    const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionLoading(`toggle-${article.id}`);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-status",
          articleId: article.id,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar estado.");

      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: nextStatus } : a))
      );
      showMessage(
        nextStatus === "PUBLISHED"
          ? `Artigo "${article.title}" publicado com sucesso.`
          : `Artigo "${article.title}" revertido para rascunho.`,
        "success"
      );
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao actualizar estado.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 2. Create Article
  async function handleCreateArticle(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("create");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newArticleData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar artigo.");

      showMessage(`Artigo "${newArticleData.title}" criado com sucesso!`, "success");
      setCreateModalOpen(false);
      setNewArticleData({
        title: "",
        excerpt: "",
        content: "",
        category: "Logística e Procurement",
        tags: "Logística, Cadeia de Suprimentos, Angola",
        readTime: 5,
        status: "PUBLISHED",
      });
      fetchArticles();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao criar artigo.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 3. Edit Article
  function openEditModal(article: AdminArticleRow) {
    setEditArticle(article);
    setEditFormData({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content,
      category: article.category || "Logística e Procurement",
      tags: article.tags || "",
      readTime: article.readTime || 5,
      status: article.status,
    });
  }

  async function handleEditArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!editArticle) return;
    setActionLoading("edit");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          articleId: editArticle.id,
          ...editFormData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao actualizar artigo.");

      showMessage(`Artigo "${editFormData.title}" actualizado com sucesso!`, "success");
      setEditArticle(null);
      fetchArticles();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao editar artigo.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 4. Delete Article
  async function handleDeleteArticle() {
    if (!deleteArticle) return;
    setActionLoading("delete");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          articleId: deleteArticle.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao eliminar artigo.");

      setArticles((prev) => prev.filter((a) => a.id !== deleteArticle.id));
      showMessage(`Artigo "${deleteArticle.title}" eliminado com sucesso.`, "success");
      setDeleteArticle(null);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao eliminar artigo.", "error");
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
            <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">Total Artigos</span>
            <FileText className="h-4 w-4 text-mesclar-gold-dark" />
          </div>
          <p className="mt-2 text-2xl font-black text-mesclar-black">{stats.total}</p>
          <p className="text-[11px] text-mesclar-muted">Publicações técnicas no blog</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Publicados</span>
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.published}</p>
          <p className="text-[11px] text-mesclar-muted">Visíveis para todos os leitores</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Rascunhos</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.drafts}</p>
          <p className="text-[11px] text-mesclar-muted">Em preparação ou análise</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Leituras / Vistas</span>
            <Eye className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-900">{stats.totalViews}</p>
          <p className="text-[11px] text-mesclar-muted">Visualizações somadas</p>
        </div>
      </div>

      {/* Main Header Card with Controls */}
      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/10 via-white to-mesclar-gold/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-mesclar-black">
                Gestão de Artigos e Publicações
              </h2>
              <p className="text-xs text-mesclar-muted">
                Moderação, publicação e controle de artigos técnicos da plataforma
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
              Novo Artigo
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchArticles}
              disabled={loading}
              title="Actualizar dados"
            >
              {loading ? "A carregar..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid gap-3 border-b border-mesclar-border/60 bg-mesclar-cream/20 p-4 sm:grid-cols-12 sm:items-center">
          <div className="relative sm:col-span-8 lg:col-span-7">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mesclar-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por título, autor, categoria ou etiquetas..."
              className="input-field w-full pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:col-span-4 lg:col-span-5 sm:justify-end">
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
              <option value="DRAFT">Apenas Rascunhos</option>
              <option value="ARCHIVED">Apenas Arquivados</option>
            </select>
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-mesclar-cream/50" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-muted">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-bold text-mesclar-black">Nenhum artigo encontrado</h3>
            <p className="mt-1 text-xs text-mesclar-muted">
              Tente ajustar os filtros de pesquisa ou crie um novo artigo técnico.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-mesclar-border/60">
              {pagedArticles.map((article) => {
              const st = STATUS_CONFIG[article.status] || STATUS_CONFIG.DRAFT;
              const isActing = actionLoading?.includes(article.id);
              const authorPhoto = article.seller.user.author?.photoUrl;

              return (
                <div
                  key={article.id}
                  className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    article.status !== "PUBLISHED" ? "bg-amber-50/15" : "hover:bg-mesclar-cream/20"
                  }`}
                >
                  {/* Article content info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-mesclar-border bg-gradient-to-br from-mesclar-gray to-mesclar-black shadow-sm">
                      {article.coverUrl ? (
                        <Image
                          src={article.coverUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-mesclar-gold">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-mesclar-black text-sm truncate">
                          {article.title}
                        </h4>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1.5 ${st.bg} ${st.text} ${st.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>

                        {article.category && (
                          <span className="rounded-full border border-mesclar-border bg-white px-2 py-0.5 text-[10px] font-semibold text-mesclar-black">
                            {article.category}
                          </span>
                        )}

                        <Link
                          href={`/artigos/${article.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-0.5 text-[11px] text-mesclar-gold-dark hover:underline font-semibold"
                          title="Ler artigo na plataforma"
                        >
                          <span>Ver online</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      {article.excerpt && (
                        <p className="mt-1 text-xs text-mesclar-muted line-clamp-1">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-mesclar-gold-dark" />
                          <span className="font-semibold text-mesclar-black">
                            {article.seller.user.name}
                          </span>
                        </span>

                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-mesclar-muted" />
                          <span>{article.views} visualizações</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-mesclar-muted" />
                          <span>{article.readTime || 5} min de leitura</span>
                        </span>

                        <span className="text-[11px] text-mesclar-muted/80">
                          {new Date(article.createdAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-center">
                    {/* Publicar / Reverter Rascunho */}
                    <Button
                      size="sm"
                      variant={article.status === "PUBLISHED" ? "outline" : "gold"}
                      leftIcon={article.status === "PUBLISHED" ? EyeOff : Check}
                      disabled={isActing}
                      onClick={() => handleToggleStatus(article)}
                      className="text-xs h-8 px-2.5 font-bold"
                    >
                      {isActing ? "..." : article.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                    </Button>

                    {/* Editar */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Pencil}
                      disabled={isActing}
                      onClick={() => openEditModal(article)}
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
                      onClick={() => setDeleteArticle(article)}
                      className="text-xs h-8 px-2 text-rose-600 hover:bg-rose-50"
                    >
                      Eliminar
                    </Button>
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
      {/* MODAL: CRIAR NOVO ARTIGO */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Plus className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Criar Novo Artigo</h3>
                  <p className="text-xs text-mesclar-muted">Publicação directa no canal de conhecimento técnico</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Título do Artigo *
                </label>
                <input
                  required
                  value={newArticleData.title}
                  onChange={(e) => setNewArticleData({ ...newArticleData, title: e.target.value })}
                  placeholder="Ex: O Impacto dos Corredores Logísticos no Comércio em Angola"
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Categoria
                  </label>
                  <input
                    value={newArticleData.category}
                    onChange={(e) => setNewArticleData({ ...newArticleData, category: e.target.value })}
                    placeholder="Ex: Logística e Procurement"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Tempo Estimado (minutos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newArticleData.readTime}
                    onChange={(e) => setNewArticleData({ ...newArticleData, readTime: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Resumo / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={newArticleData.excerpt}
                  onChange={(e) => setNewArticleData({ ...newArticleData, excerpt: e.target.value })}
                  placeholder="Breve sumário atraente para os cartões de leitura..."
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Conteúdo do Artigo (Markdown / Texto) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={newArticleData.content}
                  onChange={(e) => setNewArticleData({ ...newArticleData, content: e.target.value })}
                  placeholder="Escreva aqui o artigo completo..."
                  className="input-field w-full font-mono text-xs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Etiquetas / Tags (separadas por vírgula)
                  </label>
                  <input
                    value={newArticleData.tags}
                    onChange={(e) => setNewArticleData({ ...newArticleData, tags: e.target.value })}
                    placeholder="Logística, Cadeia de Suprimentos, Angola"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado Inicial
                  </label>
                  <select
                    value={newArticleData.status}
                    onChange={(e) => setNewArticleData({ ...newArticleData, status: e.target.value as any })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="PUBLISHED">Publicado Directamente</option>
                    <option value="DRAFT">Rascunho (Privado)</option>
                  </select>
                </div>
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
                  {actionLoading === "create" ? "A criar..." : "Criar Artigo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR ARTIGO */}
      {/* ========================================================================= */}
      {editArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Editar Artigo</h3>
                  <p className="text-xs text-mesclar-muted">{editArticle.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEditArticle(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditArticle} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Título do Artigo *
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
                    Categoria
                  </label>
                  <input
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Tempo Estimado (minutos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editFormData.readTime}
                    onChange={(e) => setEditFormData({ ...editFormData, readTime: Number(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Resumo / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={editFormData.excerpt}
                  onChange={(e) => setEditFormData({ ...editFormData, excerpt: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Conteúdo do Artigo *
                </label>
                <textarea
                  required
                  rows={8}
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  className="input-field w-full font-mono text-xs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Etiquetas / Tags
                  </label>
                  <input
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado do Artigo
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="PUBLISHED">Publicado</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="ARCHIVED">Arquivado</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditArticle(null)}
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
      {/* MODAL: ELIMINAR ARTIGO */}
      {/* ========================================================================= */}
      {deleteArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-rose-950">Eliminar Artigo</h3>
                  <p className="text-xs text-rose-800">Esta acção é irreversível</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteArticle(null)}
                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed text-mesclar-black">
                Tem a certeza que deseja eliminar o artigo{" "}
                <strong className="font-black text-mesclar-black">{deleteArticle.title}</strong>?
              </p>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-900">
                O artigo será permanentemente removido da base de dados e não estará mais disponível no catálogo público.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteArticle(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={actionLoading === "delete" ? Loader2 : Trash2}
                  disabled={actionLoading === "delete"}
                  onClick={handleDeleteArticle}
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

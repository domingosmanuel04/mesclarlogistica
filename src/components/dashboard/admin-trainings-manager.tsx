"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
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
  ArrowUpRight,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type AdminTrainingRow = {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  bannerUrl: string;
  linkUrl: string;
  active: boolean;
  sortOrder: number;
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

export function AdminTrainingsManager() {
  const [trainings, setTrainings] = useState<AdminTrainingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<AdminTrainingRow | null>(null);
  const [deleteTraining, setDeleteTraining] = useState<AdminTrainingRow | null>(null);

  // Form states
  const [newTrainingData, setNewTrainingData] = useState({
    title: "",
    description: "",
    bannerUrl: "/covers/supply-chain.jpg",
    linkUrl: "",
    sortOrder: 0,
    active: true,
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    bannerUrl: "",
    linkUrl: "",
    sortOrder: 0,
    active: true,
  });

  function showMessage(text: string, type: "success" | "error") {
    setFeedback({ text, type });
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchTrainings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trainings");
      if (!res.ok) throw new Error("Erro ao carregar formações.");
      const data = await res.json();
      setTrainings(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro de ligação.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrainings();
  }, []);

  // Filtered trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.linkUrl.toLowerCase().includes(q) ||
        t.seller.user.name.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && t.active) ||
        (statusFilter === "INACTIVE" && !t.active);

      return matchQuery && matchStatus;
    });
  }, [trainings, search, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = trainings.length;
    const active = trainings.filter((t) => t.active).length;
    const inactive = total - active;
    const uniqueSellers = new Set(trainings.map((t) => t.sellerId)).size;
    return { total, active, inactive, uniqueSellers };
  }, [trainings]);

  // 1. Toggle Active
  async function handleToggleActive(training: AdminTrainingRow) {
    const nextActive = !training.active;
    setActionLoading(`toggle-${training.id}`);
    try {
      const res = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-active",
          trainingId: training.id,
          active: nextActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar estado.");

      setTrainings((prev) =>
        prev.map((t) => (t.id === training.id ? { ...t, active: nextActive } : t))
      );
      showMessage(
        nextActive
          ? `Formação "${training.title}" activada com sucesso!`
          : `Formação "${training.title}" foi desactivada.`,
        "success"
      );
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao actualizar estado.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 2. Create Training
  async function handleCreateTraining(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("create");
    try {
      const res = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newTrainingData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registar formação.");

      showMessage(`Formação "${newTrainingData.title}" criada com sucesso!`, "success");
      setCreateModalOpen(false);
      setNewTrainingData({
        title: "",
        description: "",
        bannerUrl: "/covers/supply-chain.jpg",
        linkUrl: "",
        sortOrder: 0,
        active: true,
      });
      fetchTrainings();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao criar formação.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 3. Edit Training
  function openEditModal(training: AdminTrainingRow) {
    setEditTraining(training);
    setEditFormData({
      title: training.title,
      description: training.description || "",
      bannerUrl: training.bannerUrl,
      linkUrl: training.linkUrl,
      sortOrder: training.sortOrder,
      active: training.active,
    });
  }

  async function handleEditTraining(e: React.FormEvent) {
    e.preventDefault();
    if (!editTraining) return;
    setActionLoading("edit");
    try {
      const res = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          trainingId: editTraining.id,
          ...editFormData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao actualizar formação.");

      showMessage(`Formação "${editFormData.title}" actualizada com sucesso!`, "success");
      setEditTraining(null);
      fetchTrainings();
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao editar formação.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // 4. Delete Training
  async function handleDeleteTraining() {
    if (!deleteTraining) return;
    setActionLoading("delete");
    try {
      const res = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          trainingId: deleteTraining.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao eliminar formação.");

      setTrainings((prev) => prev.filter((t) => t.id !== deleteTraining.id));
      showMessage(`Formação "${deleteTraining.title}" eliminada com sucesso.`, "success");
      setDeleteTraining(null);
    } catch (e: unknown) {
      const err = e as Error;
      showMessage(err.message || "Erro ao eliminar formação.", "error");
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
            <span className="text-xs font-bold uppercase tracking-wider text-mesclar-muted">Total Formações</span>
            <GraduationCap className="h-4 w-4 text-mesclar-gold-dark" />
          </div>
          <p className="mt-2 text-2xl font-black text-mesclar-black">{stats.total}</p>
          <p className="text-[11px] text-mesclar-muted">Cursos e workshops</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Activas</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.active}</p>
          <p className="text-[11px] text-mesclar-muted">Em exibição em /formacao</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Inactivas</span>
            <EyeOff className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-900">{stats.inactive}</p>
          <p className="text-[11px] text-mesclar-muted">Ocultas ou encerradas</p>
        </div>

        <div className="surface-card relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Formadores</span>
            <User className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-900">{stats.uniqueSellers}</p>
          <p className="text-[11px] text-mesclar-muted">Profissionais com cursos</p>
        </div>
      </div>

      {/* Main Header Card with Controls */}
      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/10 via-white to-mesclar-gold/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black via-mesclar-gray to-mesclar-black text-mesclar-gold shadow-md">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-mesclar-black">
                Gestão de Formações e Cursos
              </h2>
              <p className="text-xs text-mesclar-muted">
                Controle de cursos executivos, banners promocionais e links de inscrição
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
              Nova Formação
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchTrainings}
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
              placeholder="Pesquisar por título, formador, link ou descrição..."
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
              <option value="ALL">Todas as Formações</option>
              <option value="ACTIVE">Apenas Activas (Online)</option>
              <option value="INACTIVE">Apenas Inactivas</option>
            </select>
          </div>
        </div>

        {/* Trainings List */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-mesclar-cream/50" />
            ))}
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-muted">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-bold text-mesclar-black">Nenhuma formação encontrada</h3>
            <p className="mt-1 text-xs text-mesclar-muted">
              Tente ajustar os termos de pesquisa ou crie uma nova formação para a vitrine.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-mesclar-border/60">
            {filteredTrainings.map((training) => {
              const isActing = actionLoading?.includes(training.id);

              return (
                <div
                  key={training.id}
                  className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    !training.active ? "bg-rose-50/15 opacity-80" : "hover:bg-mesclar-cream/20"
                  }`}
                >
                  {/* Banner & Content info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-mesclar-border bg-gradient-to-br from-mesclar-gray to-mesclar-black shadow-sm">
                      <Image
                        src={training.bannerUrl}
                        alt={training.title}
                        fill
                        className="object-cover"
                      />
                      <span
                        className={`absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full border-2 border-white ${
                          training.active ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        title={training.active ? "Activa no portal" : "Inactiva"}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-mesclar-black text-sm truncate">
                          {training.title}
                        </h4>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                            training.active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              training.active ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                          {training.active ? "Activa" : "Inactiva"}
                        </span>

                        <span className="rounded-full border border-mesclar-border bg-white px-2 py-0.5 text-[10px] font-bold text-mesclar-black">
                          Ordem: #{training.sortOrder}
                        </span>

                        {training.linkUrl && (
                          <a
                            href={training.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] text-mesclar-gold-dark hover:underline font-semibold"
                            title="Aceder ao link de destino / inscrição"
                          >
                            <span>Link Inscrição</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {training.description && (
                        <p className="mt-1 text-xs text-mesclar-muted line-clamp-2">
                          {training.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mesclar-muted">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-mesclar-gold-dark" />
                          <span className="font-semibold text-mesclar-black">
                            {training.seller.user.name}
                          </span>
                        </span>

                        <span className="text-[11px] text-mesclar-muted/80">
                          Criada: {new Date(training.createdAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-center">
                    {/* Activar / Desactivar */}
                    <Button
                      size="sm"
                      variant={training.active ? "outline" : "gold"}
                      leftIcon={training.active ? EyeOff : Check}
                      disabled={isActing}
                      onClick={() => handleToggleActive(training)}
                      className="text-xs h-8 px-2.5 font-bold"
                    >
                      {isActing ? "..." : training.active ? "Desactivar" : "Activar"}
                    </Button>

                    {/* Editar */}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={Pencil}
                      disabled={isActing}
                      onClick={() => openEditModal(training)}
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
                      onClick={() => setDeleteTraining(training)}
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
      {/* MODAL: CRIAR NOVA FORMAÇÃO */}
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
                  <h3 className="text-base font-black text-mesclar-black">Registar Nova Formação</h3>
                  <p className="text-xs text-mesclar-muted">Disponibilização de banner e inscrições na vitrine</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Título da Formação / Curso *
                </label>
                <input
                  required
                  value={newTrainingData.title}
                  onChange={(e) => setNewTrainingData({ ...newTrainingData, title: e.target.value })}
                  placeholder="Ex: Gestão de Armazenagem e Controlo de Stock em WMS"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Descrição / Objectivos
                </label>
                <textarea
                  rows={3}
                  value={newTrainingData.description}
                  onChange={(e) => setNewTrainingData({ ...newTrainingData, description: e.target.value })}
                  placeholder="Conteúdo programático, carga horária, público-alvo e certificação..."
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  URL do Banner / Imagem *
                </label>
                <input
                  required
                  value={newTrainingData.bannerUrl}
                  onChange={(e) => setNewTrainingData({ ...newTrainingData, bannerUrl: e.target.value })}
                  placeholder="Ex: /covers/supply-chain.jpg ou link da imagem"
                  className="input-field w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Link de Inscrição / WhatsApp *
                </label>
                <input
                  required
                  value={newTrainingData.linkUrl}
                  onChange={(e) => setNewTrainingData({ ...newTrainingData, linkUrl: e.target.value })}
                  placeholder="Ex: https://wa.me/2449... ou página de inscrição"
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={newTrainingData.sortOrder}
                    onChange={(e) => setNewTrainingData({ ...newTrainingData, sortOrder: Number(e.target.value) })}
                    className="input-field w-full font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado Inicial
                  </label>
                  <select
                    value={newTrainingData.active ? "true" : "false"}
                    onChange={(e) => setNewTrainingData({ ...newTrainingData, active: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Activa (Exibir na Vitrine)</option>
                    <option value="false">Inactiva (Oculta)</option>
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
                  {actionLoading === "create" ? "A criar..." : "Registar Formação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR FORMAÇÃO */}
      {/* ========================================================================= */}
      {editTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-mesclar-border">
            <div className="flex items-center justify-between border-b border-mesclar-border/80 bg-gradient-to-r from-mesclar-gold/15 via-white to-mesclar-gold/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-mesclar-black">Editar Formação</h3>
                  <p className="text-xs text-mesclar-muted">{editTraining.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEditTraining(null)}
                className="rounded-lg p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditTraining} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Título da Formação *
                </label>
                <input
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Descrição / Objectivos
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  URL do Banner *
                </label>
                <input
                  required
                  value={editFormData.bannerUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, bannerUrl: e.target.value })}
                  className="input-field w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                  Link de Inscrição *
                </label>
                <input
                  required
                  value={editFormData.linkUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, linkUrl: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={editFormData.sortOrder}
                    onChange={(e) => setEditFormData({ ...editFormData, sortOrder: Number(e.target.value) })}
                    className="input-field w-full font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-black mb-1.5">
                    Estado da Formação
                  </label>
                  <select
                    value={editFormData.active ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, active: e.target.value === "true" })}
                    className="input-field w-full font-semibold"
                  >
                    <option value="true">Activa (Visível)</option>
                    <option value="false">Inactiva (Oculta)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTraining(null)}
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
      {/* MODAL: ELIMINAR FORMAÇÃO */}
      {/* ========================================================================= */}
      {deleteTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-rose-950">Eliminar Formação</h3>
                  <p className="text-xs text-rose-800">Esta acção é irreversível</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTraining(null)}
                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed text-mesclar-black">
                Tem a certeza que deseja eliminar a formação{" "}
                <strong className="font-black text-mesclar-black">{deleteTraining.title}</strong>?
              </p>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-900">
                O banner e link serão removidos permanentemente da vitrine de cursos.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-mesclar-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTraining(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={actionLoading === "delete" ? Loader2 : Trash2}
                  disabled={actionLoading === "delete"}
                  onClick={handleDeleteTraining}
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

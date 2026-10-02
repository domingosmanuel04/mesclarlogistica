"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  DashboardShell,
  sellerNav,
  PanelCard,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ArticleCoverUploader } from "@/components/editor/article-cover-uploader";
import {
  Video,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  X,
  Upload,
  RefreshCw,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";

type Webinar = {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  linkUrl: string;
  speaker?: string | null;
  eventDate?: string | null;
  active: boolean;
  sortOrder: number;
};

export default function SellerWebinarsPage() {
  const [rows, setRows] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Create Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Edit Modal States
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editBanner, setEditBanner] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/webinars?mine=1");
    const json = await res.json().catch(() => []);
    setRows(Array.isArray(json) ? json : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!banner) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(banner);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [banner]);

  useEffect(() => {
    if (!editBanner) return;
    const url = URL.createObjectURL(editBanner);
    setEditPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editBanner]);

  function openEditModal(row: Webinar) {
    setEditingWebinar(row);
    setEditTitle(row.title);
    setEditDescription(row.description || "");
    setEditLinkUrl(row.linkUrl);
    setEditSpeaker(row.speaker || "");
    setEditEventDate(
      row.eventDate
        ? new Date(row.eventDate).toISOString().slice(0, 16)
        : ""
    );
    setEditBanner(null);
    setEditPreview(row.bannerUrl);
    setEditActive(row.active);
    setEditError("");
  }

  function closeEditModal() {
    setEditingWebinar(null);
    setEditBanner(null);
    setEditPreview(null);
    setEditError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!banner) {
      setError("Selecione a imagem do banner do webinar.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      fd.set("linkUrl", linkUrl);
      if (speaker.trim()) fd.set("speaker", speaker.trim());
      if (eventDate) fd.set("eventDate", eventDate);
      fd.set("banner", banner);
      fd.set("active", "true");

      const res = await fetch("/api/webinars", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível criar o webinar.");
        setBusy(false);
        return;
      }

      setTitle("");
      setDescription("");
      setLinkUrl("");
      setSpeaker("");
      setEventDate("");
      setBanner(null);
      setPreview(null);
      setSuccessMsg("Webinar publicado com sucesso!");
      await load();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingWebinar) return;
    setEditError("");
    setEditSaving(true);
    try {
      const fd = new FormData();
      fd.set("id", editingWebinar.id);
      fd.set("title", editTitle);
      fd.set("description", editDescription);
      fd.set("linkUrl", editLinkUrl);
      fd.set("speaker", editSpeaker);
      fd.set("eventDate", editEventDate);
      fd.set("active", editActive ? "true" : "false");
      if (editBanner) {
        fd.set("banner", editBanner);
      }

      const res = await fetch("/api/webinars", {
        method: "PATCH",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Não foi possível atualizar o webinar.");
        setEditSaving(false);
        return;
      }

      closeEditModal();
      await load();
    } catch {
      setEditError("Erro ao guardar alterações.");
    } finally {
      setEditSaving(false);
    }
  }

  async function toggleActive(row: Webinar) {
    const next = !row.active;
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, active: next } : r))
    );
    const res = await fetch("/api/webinars", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, active: next }),
    });
    if (!res.ok) {
      await load();
    }
  }

  async function removeRow(id: string) {
    if (!confirm("Tem certeza de que deseja eliminar este webinar?")) return;
    const res = await fetch(`/api/webinars?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Não foi possível eliminar.");
    }
  }

  return (
    <DashboardShell
      title="Gestão de Webinars"
      subtitle="Publique conferências, masterclasses e transmissões online para a comunidade da cadeia logística."
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <div className="space-y-10">
        {/* Formulário de Criação */}
        <PanelCard
          title="Registar Novo Webinar"
          subtitle="Preencha o título, link de acesso, descrição e anexe o banner de divulgação."
        >
          <form onSubmit={handleCreate} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {successMsg}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Título do Webinar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Masterclass de Negociação de Fretes Internacionais"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-3 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Link de Acesso (URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://zoom.us/j/... ou https://youtube.com/live/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-3 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Palestrante / Formador (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Eng. Carlos Mendes — Especialista em Aduanas"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-3 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Data e Hora do Evento (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-3 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                Descrição do Webinar *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Apresente os objectivos da sessão, tópicos abordados, público-alvo e o que os participantes irão aprender..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-3 text-sm leading-relaxed text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
              />
            </div>

            {/* Upload de Banner */}
            <ArticleCoverUploader
              label="Banner de Divulgação *"
              title="Clique aqui para carregar o banner de divulgação"
              recommendationText="Formatos aceites: JPG, PNG, WEBP (Recomendado 1200×675px, máx. 6MB)"
              previewUrl={preview || undefined}
              onFileSelectDirect={(file) => setBanner(file)}
              onClear={() => setBanner(null)}
            />

            <div className="pt-2">
              <Button type="submit" variant="gold" size="lg" disabled={busy} leftIcon={busy ? RefreshCw : Plus}>
                {busy ? "A publicar..." : "Publicar Webinar"}
              </Button>
            </div>
          </form>
        </PanelCard>

        {/* Lista de Meus Webinars */}
        <PanelCard
          title="Meus Webinars Publicados"
          subtitle="Faça a gestão das suas transmissões, edite dados ou ative/desative a visibilidade pública."
        >
          {loading ? (
            <p className="py-12 text-center text-sm text-mesclar-muted">A carregar webinars...</p>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="mx-auto h-10 w-10 text-mesclar-gold/50 mb-3" />
              <p className="text-sm font-semibold text-mesclar-black">Ainda não registou nenhum webinar.</p>
              <p className="mt-1 text-xs text-mesclar-muted">
                Preencha o formulário acima para publicar a sua primeira conferência online.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-mesclar-border bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-mesclar-cream">
                    <Image
                      src={row.bannerUrl}
                      alt={row.title}
                      fill
                      className="object-cover"
                      unoptimized={row.bannerUrl.startsWith("/api/")}
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          row.active ? "bg-emerald-600 text-white" : "bg-mesclar-black/80 text-white/80"
                        }`}
                      >
                        {row.active ? "Visível" : "Oculto"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    {row.speaker && (
                      <p className="text-xs font-semibold text-mesclar-gold-dark flex items-center gap-1 truncate mb-1">
                        <User className="h-3 w-3 shrink-0" />
                        {row.speaker}
                      </p>
                    )}
                    <h4 className="text-base font-bold text-mesclar-black line-clamp-2 leading-tight">
                      {row.title}
                    </h4>
                    <p className="mt-2 flex-1 text-xs text-mesclar-muted line-clamp-2 leading-relaxed">
                      {row.description}
                    </p>

                    {row.eventDate && (
                      <p className="mt-3 text-[11px] font-semibold text-mesclar-black/80 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-mesclar-gold-dark shrink-0" />
                        {new Date(row.eventDate).toLocaleDateString("pt-AO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-mesclar-border/60 pt-3">
                      <a
                        href={row.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-mesclar-gold-dark hover:underline"
                      >
                        Link do Webinar <ExternalLink className="h-3 w-3" />
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-mesclar-border text-mesclar-muted hover:bg-mesclar-cream/60 transition"
                          title={row.active ? "Ocultar" : "Mostrar"}
                        >
                          {row.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-mesclar-border text-mesclar-muted hover:bg-mesclar-cream/60 transition"
                          title="Editar Webinar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>

      {/* Modal de Edição */}
      {editingWebinar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-mesclar-border bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-mesclar-border px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-mesclar-black">Editar Webinar</h3>
                <p className="text-xs text-mesclar-muted">Atualize as informações ou altere o banner.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-mesclar-border hover:bg-mesclar-cream transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto p-6 space-y-5">
              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                  {editError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Título do Webinar *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Link de Acesso (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                    Palestrante (opcional)
                  </label>
                  <input
                    type="text"
                    value={editSpeaker}
                    onChange={(e) => setEditSpeaker(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                    Data e Hora (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-medium text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-mesclar-gold-dark">
                  Descrição do Webinar *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm leading-relaxed text-mesclar-black focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <ArticleCoverUploader
                label="Substituir Imagem do Banner (opcional)"
                title="Clique aqui para carregar a imagem do banner"
                recommendationText="Formatos aceites: JPG, PNG, WEBP (Recomendado 1200×675px, máx. 6MB)"
                previewUrl={editPreview || undefined}
                onFileSelectDirect={(file) => setEditBanner(file)}
                onClear={() => setEditBanner(null)}
              />

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-mesclar-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="h-4 w-4 rounded border-mesclar-border text-mesclar-gold focus:ring-mesclar-gold"
                  />
                  <span>Webinar visível publicamente</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-mesclar-border pt-4">
                <Button type="button" variant="outline" size="sm" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gold" size="sm" disabled={editSaving}>
                  {editSaving ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

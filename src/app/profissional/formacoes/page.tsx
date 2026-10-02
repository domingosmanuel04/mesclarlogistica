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
  GraduationCap,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  X,
  Upload,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

type Training = {
  id: string;
  title: string;
  description?: string | null;
  bannerUrl: string;
  linkUrl: string;
  active: boolean;
  sortOrder: number;
};

export default function SellerTrainingsPage() {
  const [rows, setRows] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Edit Modal States
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editBanner, setEditBanner] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/trainings?mine=1");
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

  function openEditModal(row: Training) {
    setEditingTraining(row);
    setEditTitle(row.title);
    setEditDescription(row.description || "");
    setEditLinkUrl(row.linkUrl);
    setEditBanner(null);
    setEditPreview(row.bannerUrl);
    setEditActive(row.active);
    setEditError("");
  }

  function closeEditModal() {
    setEditingTraining(null);
    setEditBanner(null);
    setEditPreview(null);
    setEditError("");
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTraining) return;
    if (!editTitle.trim()) {
      setEditError("O título é obrigatório.");
      return;
    }
    if (!editLinkUrl.trim()) {
      setEditError("O link é obrigatório.");
      return;
    }

    setEditSaving(true);
    setEditError("");

    try {
      const fd = new FormData();
      fd.set("id", editingTraining.id);
      fd.set("title", editTitle.trim());
      fd.set("description", editDescription.trim());
      fd.set("linkUrl", editLinkUrl.trim());
      fd.set("active", editActive ? "true" : "false");
      if (editBanner) {
        fd.set("banner", editBanner);
      }

      const res = await fetch("/api/trainings", {
        method: "PATCH",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erro ao guardar alterações.");
      }

      closeEditModal();
      await load();
    } catch (err: any) {
      setEditError(err.message || "Erro ao actualizar a formação.");
    } finally {
      setEditSaving(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!banner) {
      setError("Seleccione o banner.");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.set("title", title);
    if (description.trim()) fd.set("description", description.trim());
    fd.set("linkUrl", linkUrl);
    fd.set("banner", banner);
    fd.set("active", "true");
    const res = await fetch("/api/trainings", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Erro ao guardar.");
      return;
    }
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setBanner(null);
    await load();
  }

  async function toggleActive(row: Training) {
    await fetch("/api/trainings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, active: !row.active }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Remover esta formação?")) return;
    await fetch(`/api/trainings?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  return (
    <DashboardShell
      title="Formações"
      subtitle="Cadastre banners que aparecem em /formacao"
      nav={sellerNav}
      roleLabel="Profissional"
    >
      <PanelCard title="Nova formação">
        <form onSubmit={(e) => void onCreate(e)} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <label className="block text-sm font-medium">
            Título
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-mesclar-border px-3 py-2"
              placeholder="Ex: Curso de Procurement Estratégico"
            />
          </label>
          <label className="block text-sm font-medium">
            Descrição da formação
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-mesclar-border px-3 py-2 text-sm focus:border-mesclar-gold focus:outline-none focus:ring-1 focus:ring-mesclar-gold"
              placeholder="Descreva brevemente os objectivos, temas abordados e público-alvo da formação..."
            />
          </label>
          <label className="block text-sm font-medium">
            Link (URL externa)
            <input
              required
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mt-1 w-full rounded-md border border-mesclar-border px-3 py-2"
              placeholder="https://..."
            />
          </label>
          <ArticleCoverUploader
            label="Imagem do banner *"
            title="Clique aqui para carregar a imagem do banner"
            recommendationText="Formatos aceites: JPG, PNG, WEBP (Recomendado 1200×675px, máx. 8MB)"
            previewUrl={preview || undefined}
            onFileSelectDirect={(file) => setBanner(file)}
            onClear={() => setBanner(null)}
          />
          <Button type="submit" disabled={busy} leftIcon={Plus}>
            {busy ? "A guardar..." : "Publicar formação"}
          </Button>
        </form>
      </PanelCard>

      <PanelCard title="Banners cadastrados">
        {loading ? (
          <p className="text-sm text-mesclar-muted">A carregar...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-mesclar-muted">Nenhum banner cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-mesclar-border">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md bg-black sm:w-44">
                  <Image
                    src={row.bannerUrl}
                    alt={row.title}
                    fill
                    className="object-contain p-1.5"
                    unoptimized={row.bannerUrl.startsWith("/api/")}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{row.title}</p>
                    {row.description && (
                      <p className="mt-1 text-xs text-mesclar-muted line-clamp-2 max-w-xl leading-relaxed">
                        {row.description}
                      </p>
                    )}
                    <a
                      href={row.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-mesclar-gold-dark hover:underline"
                    >
                      {row.linkUrl} <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="mt-1 text-xs text-mesclar-muted">
                      {row.active ? "Activa na página Formação" : "Oculta"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      leftIcon={row.active ? EyeOff : Eye}
                      onClick={() => void toggleActive(row)}
                    >
                      {row.active ? "Ocultar" : "Mostrar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      leftIcon={Pencil}
                      onClick={() => openEditModal(row)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      leftIcon={Trash2}
                      onClick={() => void remove(row.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      {/* MODAL EDITAR FORMAÇÃO */}
      {editingTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-mesclar-border my-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-mesclar-black flex items-center gap-2">
                <Pencil className="h-4 w-4 text-mesclar-gold-dark" />
                Editar Formação
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSaveEdit} className="mt-4 space-y-4">
              {editError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {editError}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Título da Formação <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                  placeholder="Ex: Curso de Procurement Estratégico"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Descrição da Formação
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                  placeholder="Objectivos, temas e público-alvo..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Link (URL de destino) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="url"
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  className="w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs font-mono focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                  placeholder="https://..."
                />
              </div>

              <ArticleCoverUploader
                label="Imagem do Banner"
                title="Clique aqui para carregar a imagem do banner"
                recommendationText="Formatos aceites: JPG, PNG, WEBP (Recomendado 1200×675px, máx. 8MB)"
                previewUrl={editPreview || undefined}
                onFileSelectDirect={(file) => setEditBanner(file)}
                onClear={() => setEditBanner(null)}
              />

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input
                  type="checkbox"
                  id="editActiveCheck"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-mesclar-gold focus:ring-mesclar-gold"
                />
                <label htmlFor="editActiveCheck" className="text-xs font-semibold text-mesclar-black cursor-pointer">
                  Activa na vitrine de formação
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeEditModal}
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

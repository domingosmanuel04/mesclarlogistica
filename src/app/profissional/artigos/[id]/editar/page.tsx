"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Send,
  Save,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react";
import { DashboardShell, sellerNav } from "@/components/dashboard/dashboard-shell";
import { RichHtmlEditor } from "@/components/editor/rich-html-editor";
import { ArticleCoverUploader } from "@/components/editor/article-cover-uploader";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Gestão de Contratos",
  "Procurement e Compras Estratégicas",
  "Cadeia de Abastecimento (Supply Chain)",
  "Gestão de Stocks e Armazenagem",
  "Gestão de Fornecedores e Terceiros",
  "Transporte e Distribuição",
  "Comércio Internacional e Alfândegas",
  "Governança e Compliance Logístico",
  "Inovação e Tecnologia em Logística",
];

const SAMPLE_COVERS = [
  { url: "/services/gestao-contratos.jpg", label: "Gestão de Contratos" },
  { url: "/services/gestao-fornecedores.jpg", label: "Fornecedores" },
  { url: "/services/governanca-terceiros.jpg", label: "Governança" },
  { url: "/services/melhoria-processos.jpg", label: "Processos" },
  { url: "/services/diagnosticos-estrategicos.jpg", label: "Diagnósticos" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditarArtigoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("/services/gestao-contratos.jpg");
  const [tags, setTags] = useState("");
  const [readTime, setReadTime] = useState(5);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) {
      void loadArticle();
    }
  }, [id]);

  async function loadArticle() {
    setLoadingInitial(true);
    setError("");
    try {
      const res = await fetch(`/api/seller/articles/${id}`);
      if (!res.ok) {
        throw new Error("Não foi possível carregar o artigo.");
      }
      const data = await res.json();
      setTitle(data.title || "");
      setSlug(data.slug || "");
      setCategory(data.category || CATEGORIES[0]);
      setExcerpt(data.excerpt || "");
      setCoverUrl(data.coverUrl || "/services/gestao-contratos.jpg");
      setTags(data.tags || "");
      setReadTime(data.readTime || 5);
      setContent(data.content || "");
      setStatus(data.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do artigo.");
    } finally {
      setLoadingInitial(false);
    }
  }

  async function handleSave(targetStatus: "PUBLISHED" | "DRAFT") {
    if (!title.trim()) {
      setError("Por favor, introduza um título para o artigo.");
      return;
    }
    if (!content.trim() || content.trim().length < 15) {
      setError("O conteúdo do artigo não pode estar vazio.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/seller/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          content,
          coverUrl: coverUrl.trim() || undefined,
          category,
          tags: tags.trim() || undefined,
          readTime: Number(readTime) || 5,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar o artigo.");
      }

      setSuccess("Artigo guardado com sucesso!");
      setTimeout(() => {
        router.push("/profissional/artigos");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Falha na comunicação com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return (
      <DashboardShell title="Editar Artigo" subtitle="A carregar dados..." nav={sellerNav}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mesclar-gold" />
          <span className="ml-2 text-sm text-mesclar-muted">A carregar artigo...</span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Editar Artigo"
      subtitle="Altere o conteúdo, layout visual ou estado do artigo"
      nav={sellerNav}
    >
      <div className="space-y-6">
        {/* Barra superior de navegação / voltar */}
        <div className="flex items-center justify-between">
          <Link
            href="/profissional/artigos"
            className="inline-flex items-center gap-2 text-sm font-medium text-mesclar-muted hover:text-mesclar-black transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para meus artigos
          </Link>
          <div className="flex items-center gap-2">
            {slug && (
              <Link
                href={`/artigos/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-xl border border-mesclar-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-mesclar-gold"
              >
                <Eye className="h-3.5 w-3.5" />
                Pré-visualizar
              </Link>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => handleSave("DRAFT")}
              leftIcon={Save}
            >
              Guardar rascunho
            </Button>
            <Button
              type="button"
              variant="gold"
              size="sm"
              disabled={saving}
              onClick={() => handleSave("PUBLISHED")}
              leftIcon={Send}
            >
              {saving ? "A guardar..." : "Guardar e Publicar"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {success}
          </div>
        )}

        {/* Informações Principais */}
        <div className="surface-card p-6 space-y-5">
          <h2 className="text-base font-bold text-mesclar-black flex items-center gap-2">
            <FileText className="h-4 w-4 text-mesclar-gold" />
            Dados do Artigo
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
              Título do artigo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Gestão de Fornecedores na Era Digital"
              className="w-full rounded-xl border border-mesclar-border px-4 py-3 text-base font-medium focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
                URL amigável (Slug)
              </label>
              <div className="flex items-center rounded-xl border border-mesclar-border bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                <span className="shrink-0 text-slate-400">/artigos/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full bg-transparent font-mono text-slate-800 focus:outline-none ml-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-mesclar-border bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
              Resumo / Excerto curto
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Uma síntese do artigo..."
              className="w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Logística, Procurement"
                className="w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
                Tempo estimado de leitura (minutos)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={readTime}
                onChange={(e) => setReadTime(parseInt(e.target.value, 10) || 5)}
                className="w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
              />
            </div>
          </div>

          {/* Imagem de Capa com Upload Directo */}
          <ArticleCoverUploader
            value={coverUrl}
            onChange={setCoverUrl}
            sampleCovers={SAMPLE_COVERS}
          />
        </div>

        {/* Editor WYSIWYG Estilo CKEditor */}
        <div>
          <RichHtmlEditor
            value={content}
            onChange={setContent}
            placeholder="Edite o corpo do seu artigo..."
            minHeight={420}
          />
        </div>

        {/* Rodapé de Ações */}
        <div className="surface-card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-mesclar-muted">
              Estado de publicação:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus("PUBLISHED")}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  status === "PUBLISHED"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                    : "border-mesclar-border bg-white text-mesclar-muted hover:border-slate-400"
                }`}
              >
                ● Publicado
              </button>
              <button
                type="button"
                onClick={() => setStatus("DRAFT")}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  status === "DRAFT"
                    ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
                    : "border-mesclar-border bg-white text-mesclar-muted hover:border-slate-400"
                }`}
              >
                ○ Rascunho
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profissional/artigos">
              <Button type="button" variant="ghost" size="sm">
                Cancelar
              </Button>
            </Link>
            <Button
              type="button"
              variant="gold"
              disabled={saving}
              onClick={() => handleSave(status)}
              leftIcon={saving ? Loader2 : Send}
            >
              {saving
                ? "A guardar..."
                : status === "PUBLISHED"
                ? "Guardar e Publicar"
                : "Guardar Rascunho"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

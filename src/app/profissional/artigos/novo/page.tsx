"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PenTool,
  ArrowLeft,
  CheckCircle,
  FileText,
  Clock,
  Tag,
  ImageIcon,
  FolderOpen,
  Send,
  Save,
  Loader2,
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

export default function CriarArtigoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("Logística, Procurement, Gestão");
  const [readTime, setReadTime] = useState(5);
  const [content, setContent] = useState(
    `<p class="lead-text">Introduza aqui o tema central do seu artigo de logística ou procurement...</p><h2>1. Contextualização e Desafios</h2><p>Descreva os principais desafios operacionais ou estratégicos enfrentados pelas organizações.</p><h2>2. Melhores Práticas e Soluções</h2><p>Apresente metodologias, ferramentas e frameworks recomendados para mitigar riscos e otimizar processos.</p>`
  );

  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(slugify(val));
  }

  async function handleSubmit(targetStatus: "PUBLISHED" | "DRAFT") {
    if (!title.trim()) {
      setError("Por favor, introduza um título para o artigo.");
      return;
    }
    if (!content.trim() || content.trim().length < 15) {
      setError("O conteúdo do artigo não pode estar vazio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/seller/articles", {
        method: "POST",
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
        throw new Error(data.error || "Erro ao publicar artigo.");
      }

      router.push("/profissional/artigos");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      title="Criar Artigo"
      subtitle="Escreva e publique artigos e análises técnicas sobre a cadeia logística"
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleSubmit("DRAFT")}
              leftIcon={Save}
            >
              Guardar rascunho
            </Button>
            <Button
              type="button"
              variant="gold"
              size="sm"
              disabled={loading}
              onClick={() => handleSubmit("PUBLISHED")}
              leftIcon={Send}
            >
              {loading ? "A publicar..." : "Publicar artigo"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex: Estratégias Avançadas para Gestão de Riscos na Cadeia de Abastecimento"
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
                  placeholder="estrategias-avancadas-gestao"
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
              placeholder="Uma síntese objetiva de 1 a 2 frases para os cartões de partilha e listagem..."
              className="w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted mb-1.5">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Logística, Procurement, Auditoria"
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

        {/* Editor WYSIWYG Estilo CKEditor (conforme imagem do usuário) */}
        <div>
          <RichHtmlEditor
            value={content}
            onChange={setContent}
            placeholder="Comece a redigir o seu artigo especializado..."
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
                ● Publicar imediatamente
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
                ○ Guardar como rascunho
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
              disabled={loading}
              onClick={() => handleSubmit(status)}
              leftIcon={loading ? Loader2 : Send}
            >
              {loading
                ? "A processar..."
                : status === "PUBLISHED"
                ? "Publicar Artigo"
                : "Guardar Rascunho"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

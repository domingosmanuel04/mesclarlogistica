"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Send,
  ImagePlus,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Gift,
  Tag,
  BookOpen,
  Package,
  Layers,
  Info,
  Calendar,
  Building2,
  Hash,
  Library,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
};

const MAX_COVER_MB = 5;
const MAX_PDF_MB = 50;

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function FileDropzone({
  label,
  hint,
  accept,
  icon: Icon,
  file,
  previewUrl,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  accept: string;
  icon: typeof ImagePlus;
  file: File | null;
  previewUrl?: string | null;
  onFile: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(list: FileList | null) {
    onFile(list?.[0] ?? null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-mesclar-black">{label}</p>
        <p className="text-[11px] font-medium text-mesclar-muted">{hint}</p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />

      {!file ? (
        <label
          htmlFor={inputId}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files);
          }}
          className={cn(
            "group flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200",
            dragging
              ? "border-mesclar-gold bg-mesclar-gold/10 scale-[0.99]"
              : "border-mesclar-border bg-mesclar-cream/30 dark:bg-[#0E223F]/50 dark:border-[#1e3a5f] hover:border-mesclar-gold/70 hover:bg-mesclar-gold/5"
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mesclar-black text-mesclar-gold shadow-sm transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-bold text-mesclar-black dark:text-white">
            Arraste o ficheiro ou clique para escolher
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-mesclar-muted dark:text-slate-300 font-medium">
            <Upload className="h-3.5 w-3.5" />
            Formatos suportados no dispositivo
          </span>
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-mesclar-border bg-white dark:bg-[#0A192F] dark:border-[#1e3a5f] shadow-sm p-4">
          <div className="flex gap-4 items-center">
            {previewUrl ? (
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-mesclar-border bg-mesclar-cream dark:bg-[#0E223F] shadow-sm">
                <Image
                  src={previewUrl}
                  alt="Preview capa"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-sm">
                <FileText className="h-8 w-8" />
                <span className="mt-1 text-[10px] font-black uppercase tracking-wider">PDF</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ficheiro carregado
              </span>
              <p className="mt-1.5 truncate text-sm font-bold text-mesclar-black dark:text-white" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-mesclar-muted dark:text-slate-400 font-medium">{formatBytes(file.size)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-xl border border-mesclar-border bg-white dark:bg-[#0E223F] dark:border-[#1e3a5f] dark:text-white px-3 py-1.5 text-xs font-semibold text-mesclar-black transition hover:border-mesclar-gold hover:bg-mesclar-cream/60"
                >
                  Substituir
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PublishBookForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pricing model: FREE vs PAID
  const [pricingType, setPricingType] = useState<"PAID" | "FREE">("PAID");
  const [priceValue, setPriceValue] = useState<number>(3500);
  const [physicalPriceValue, setPhysicalPriceValue] = useState<number>(6500);

  // Product type: EBOOK, PHYSICAL, BOTH
  const [productType, setProductType] = useState<"EBOOK" | "PHYSICAL" | "BOTH">("EBOOK");

  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  );

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const subs = categories.find((c) => c.slug === categorySlug)?.subcategories ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (pricingType === "PAID" && productType !== "PHYSICAL" && Number(priceValue) <= 0) {
      setError("Defina um preço superior a 0 Kz para o eBook.");
      setLoading(false);
      return;
    }

    if (pricingType === "PAID" && (productType === "PHYSICAL" || productType === "BOTH") && Number(physicalPriceValue) <= 0) {
      setError("Defina um preço superior a 0 Kz para o livro físico.");
      setLoading(false);
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Apply pricing values
    if (pricingType === "FREE") {
      fd.set("price", "0");
      fd.set("priceEbook", "0");
      fd.set("pricePhysical", "0");
    } else {
      fd.set("price", String(priceValue));
      fd.set("priceEbook", String(priceValue));
      if (productType === "BOTH" || productType === "PHYSICAL") {
        fd.set("pricePhysical", String(physicalPriceValue));
      }
    }

    fd.set("productType", productType);
    if (coverFile) fd.set("cover", coverFile);
    if (pdfFile) fd.set("pdf", pdfFile);

    const res = await fetch("/api/books", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : "Erro ao enviar livro.");
      return;
    }
    setSubmitted(true);
    router.refresh();
  }

  function onCover(file: File | null) {
    if (!file) {
      setCoverFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("A capa deve ser uma imagem (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > MAX_COVER_MB * 1024 * 1024) {
      setError(`Capa no máximo ${MAX_COVER_MB} MB.`);
      return;
    }
    setError("");
    setCoverFile(file);
  }

  function onPdf(file: File | null) {
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("O ficheiro do eBook deve ser PDF.");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setError(`PDF no máximo ${MAX_PDF_MB} MB.`);
      return;
    }
    setError("");
    setPdfFile(file);
  }

  if (submitted) {
    return (
      <div className="overflow-hidden rounded-3xl border border-mesclar-gold/40 bg-gradient-to-br from-mesclar-cream/70 via-white to-white p-8 sm:p-12 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mesclar-black text-mesclar-gold shadow-md">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-2xl font-black text-mesclar-black tracking-tight">
          Livro publicado com sucesso!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-mesclar-muted leading-relaxed">
          O seu livro foi publicado com sucesso e já se encontra imediatamente acessível na plataforma pública da <strong>Mesclar Logística</strong>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="gold" size="lg" leftIcon={Library} onClick={() => router.push("/profissional/livros")}>
            Ver Meus Livros
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setSubmitted(false);
              setCoverFile(null);
              setPdfFile(null);
            }}
          >
            Publicar Outro Livro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {/* Aviso introdutório */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-mesclar-gold/30 bg-mesclar-cream/50 p-4 sm:p-5 text-sm">
        <Info className="h-5 w-5 shrink-0 text-mesclar-gold-dark mt-0.5" />
        <div>
          <p className="font-semibold text-mesclar-black">Directrizes de Publicação</p>
          <p className="mt-0.5 text-xs text-mesclar-muted leading-relaxed">
            Apenas obras e manuais técnicos relacionados com cadeia logística, procurement, compras, armazéns, transportes e supply chain serão aprovados para publicação na plataforma.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* SECÇÃO 1: INFORMAÇÕES BÁSICAS */}
      <div className="rounded-2xl border border-mesclar-border bg-white p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-black text-xs font-black text-mesclar-gold">
            1
          </span>
          <div>
            <h3 className="text-base font-bold text-mesclar-black">Informações da Obra</h3>
            <p className="text-xs text-mesclar-muted">Título, autor e enquadramento temático</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Título do Livro <span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              required
              placeholder="Ex: Gestão Estratégica de Armazéns e Logística Portuária"
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Nome do Autor / Especialista <span className="text-rose-500">*</span>
            </label>
            <input
              name="author"
              required
              placeholder="Nome do autor da obra"
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Categoria Principal <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              required
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Subcategoria Específica
            </label>
            <select
              name="subcategory"
              className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            >
              <option value="">Selecione uma subcategoria (opcional)</option>
              {subs.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Sinopse / Descrição da Obra <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Apresente um resumo claro e atraente sobre o conteúdo e competências que o leitor irá adquirir..."
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>
        </div>
      </div>

      {/* SECÇÃO 2: MODELO DE DISPONIBILIZAÇÃO (GRATUITO OU PAGO) */}
      <div className="rounded-2xl border border-mesclar-border bg-white p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-gold text-xs font-black text-mesclar-black">
            2
          </span>
          <div>
            <h3 className="text-base font-bold text-mesclar-black">Modelo de Disponibilização e Preço</h3>
            <p className="text-xs text-mesclar-muted">Escolha se o livro será gratuito ou comercializado</p>
          </div>
        </div>

        {/* Escolha Gratuito vs Pago */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
            Regime de Acesso <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Cartão Gratuito */}
            <button
              type="button"
              onClick={() => setPricingType("FREE")}
              className={cn(
                "relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all duration-200",
                pricingType === "FREE"
                  ? "border-mesclar-gold bg-gradient-to-br from-mesclar-gold/15 via-mesclar-cream/40 to-white shadow-md ring-2 ring-mesclar-gold/30"
                  : "border-mesclar-border/80 bg-white hover:border-mesclar-muted/60 hover:bg-mesclar-cream/20"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition",
                    pricingType === "FREE"
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm"
                      : "bg-mesclar-cream text-mesclar-muted"
                  )}
                >
                  <Gift className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  0 Kz · Gratuito
                </span>
              </div>
              <span className="mt-3.5 text-base font-bold text-mesclar-black">
                Livro Gratuito
              </span>
              <span className="mt-1 text-xs text-mesclar-muted leading-relaxed">
                Acesso e download livres para toda a comunidade profissional. Excelente para gerar visibilidade e autoridade.
              </span>
              {pricingType === "FREE" && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-mesclar-gold-dark">
                  <CheckCircle2 className="h-4 w-4" /> Selecionado como Gratuito
                </div>
              )}
            </button>

            {/* Cartão Pago */}
            <button
              type="button"
              onClick={() => setPricingType("PAID")}
              className={cn(
                "relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all duration-200",
                pricingType === "PAID"
                  ? "border-mesclar-gold bg-gradient-to-br from-mesclar-gold/15 via-mesclar-cream/40 to-white shadow-md ring-2 ring-mesclar-gold/30"
                  : "border-mesclar-border/80 bg-white hover:border-mesclar-muted/60 hover:bg-mesclar-cream/20"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition",
                    pricingType === "PAID"
                      ? "bg-mesclar-black text-mesclar-gold shadow-sm"
                      : "bg-mesclar-cream text-mesclar-muted"
                  )}
                >
                  <Tag className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-mesclar-gold/20 px-3 py-1 text-xs font-extrabold text-mesclar-black">
                  Preço em Kwanzas
                </span>
              </div>
              <span className="mt-3.5 text-base font-bold text-mesclar-black">
                Livro Pago (Comercial)
              </span>
              <span className="mt-1 text-xs text-mesclar-muted leading-relaxed">
                Venda o seu livro digital e/ou físico. Receba o valor diretamente na sua conta bancária após confirmação.
              </span>
              {pricingType === "PAID" && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-mesclar-gold-dark">
                  <CheckCircle2 className="h-4 w-4" /> Selecionado como Pago
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Formato da Obra */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted mb-2">
            Formato de Disponibilização <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "EBOOK", label: "eBook Digital", desc: "Apenas PDF seguro", icon: BookOpen },
              { id: "PHYSICAL", label: "Livro Físico", desc: "Exemplar impresso", icon: Package },
              { id: "BOTH", label: "Ambos os Formatos", desc: "Digital + Físico", icon: Layers },
            ].map((f) => {
              const Icon = f.icon;
              const active = productType === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setProductType(f.id as typeof productType)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border p-3.5 text-center transition-all",
                    active
                      ? "border-mesclar-gold bg-mesclar-gold/10 font-bold text-mesclar-black shadow-sm"
                      : "border-mesclar-border bg-white text-mesclar-muted hover:border-mesclar-gold/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-mesclar-black" : "text-mesclar-muted")} />
                  <span className="mt-1.5 text-xs font-bold">{f.label}</span>
                  <span className="mt-0.5 text-[10px] text-mesclar-muted hidden sm:inline">{f.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs de Preço e Stock quando Pago */}
        {pricingType === "PAID" ? (
          <div className="rounded-xl border border-mesclar-gold/30 bg-mesclar-cream/30 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
            <div className="grid gap-4 sm:grid-cols-2">
              {productType !== "PHYSICAL" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
                    Preço do eBook (Kz) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      name="price"
                      type="number"
                      min={100}
                      step={100}
                      value={priceValue}
                      onChange={(e) => setPriceValue(Number(e.target.value))}
                      required
                      placeholder="Ex: 3500"
                      className="w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 pr-14 text-sm font-bold text-mesclar-black transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                    />
                    <span className="pointer-events-none absolute right-4 top-2.5 text-xs font-black text-mesclar-gold-dark">
                      Kz
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-mesclar-muted">Valor em Kwanzas para download da versão digital.</p>
                </div>
              )}

              {(productType === "PHYSICAL" || productType === "BOTH") && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
                    Preço do Livro Físico (Kz) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      name="pricePhysical"
                      type="number"
                      min={100}
                      step={100}
                      value={physicalPriceValue}
                      onChange={(e) => setPhysicalPriceValue(Number(e.target.value))}
                      required
                      placeholder="Ex: 6500"
                      className="w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 pr-14 text-sm font-bold text-mesclar-black transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                    />
                    <span className="pointer-events-none absolute right-4 top-2.5 text-xs font-black text-mesclar-gold-dark">
                      Kz
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-mesclar-muted">Valor de venda para o exemplar em papel.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
                  Quantidade / Stock Inicial
                </label>
                <input
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={productType === "EBOOK" ? 999 : 25}
                  className="mt-1.5 w-full rounded-xl border border-mesclar-border bg-white px-4 py-2.5 text-sm font-bold text-mesclar-black transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
                <p className="mt-1 text-[11px] text-mesclar-muted">
                  {productType === "EBOOK" ? "Acessos digitais ilimitados" : "Exemplares disponíveis para entrega"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed font-medium">
              Obra marcada como <strong>Gratuita</strong> (0 Kz). Os utilizadores poderão baixar o ficheiro PDF imediatamente após a validação da moderação.
            </p>
          </div>
        )}
      </div>

      {/* SECÇÃO 3: FICHEIROS E MÍDIA */}
      <div className="rounded-2xl border border-mesclar-border bg-white p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-black text-xs font-black text-mesclar-gold">
            3
          </span>
          <div>
            <h3 className="text-base font-bold text-mesclar-black">Ficheiros da Obra</h3>
            <p className="text-xs text-mesclar-muted">Capa ilustrativa e ficheiro PDF</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FileDropzone
            label="Capa do Livro"
            hint={`JPG/PNG/WebP · máx. ${MAX_COVER_MB} MB`}
            accept="image/jpeg,image/png,image/webp,image/*"
            icon={ImagePlus}
            file={coverFile}
            previewUrl={coverPreview}
            onFile={onCover}
            onClear={() => onCover(null)}
          />

          <FileDropzone
            label="Documento PDF da Obra"
            hint={`Ficheiro PDF · máx. ${MAX_PDF_MB} MB`}
            accept=".pdf,application/pdf"
            icon={FileText}
            file={pdfFile}
            onFile={onPdf}
            onClear={() => onPdf(null)}
          />
        </div>
      </div>

      {/* SECÇÃO 4: DETALHES EDITORIAIS (OPCIONAIS) */}
      <div className="rounded-2xl border border-mesclar-border bg-white p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-mesclar-border/70 pb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-black text-xs font-black text-mesclar-gold">
            4
          </span>
          <div>
            <h3 className="text-base font-bold text-mesclar-black">Ficha Técnica e Detalhes Editoriais</h3>
            <p className="text-xs text-mesclar-muted">Informações complementares e índice (opcional)</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              <Hash className="h-3.5 w-3.5 text-mesclar-gold-dark" />
              ISBN
            </label>
            <input
              name="isbn"
              placeholder="Ex: 978-989-..."
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              <Calendar className="h-3.5 w-3.5 text-mesclar-gold-dark" />
              Ano de Edição
            </label>
            <input
              name="year"
              type="number"
              min={1990}
              max={new Date().getFullYear() + 1}
              defaultValue={new Date().getFullYear()}
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              <Building2 className="h-3.5 w-3.5 text-mesclar-gold-dark" />
              Editora / Chancela
            </label>
            <input
              name="publisher"
              placeholder="Ex: Mesclar Edições / Autor Independente"
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Sumário / Tabela de Conteúdos
            </label>
            <textarea
              name="summary"
              rows={3}
              placeholder="Ex: Capítulo 1: Introdução à Cadeia Logística; Capítulo 2: Estratégias de Compras..."
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-mesclar-muted">
              Palavras-chave (separadas por vírgula)
            </label>
            <input
              name="keywords"
              placeholder="Ex: procurement, armazém, frotas, supply chain, angola"
              className="mt-1.5 w-full rounded-xl border border-mesclar-border px-4 py-2.5 text-sm font-medium transition focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-mesclar-border">
        <Link href="/profissional/livros">
          <Button type="button" variant="outline" size="lg">
            Cancelar
          </Button>
        </Link>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          leftIcon={Send}
          disabled={loading}
          className="w-full sm:w-auto px-8"
        >
          {loading ? "A enviar livro para moderação..." : "Submeter Livro para Aprovação"}
        </Button>
      </div>
    </form>
  );
}

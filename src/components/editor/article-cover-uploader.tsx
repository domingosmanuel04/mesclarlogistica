"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  ImageIcon,
  X,
  CheckCircle2,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleCoverUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  onFileSelectDirect?: (file: File | null) => void;
  previewUrl?: string;
  onClear?: () => void;
  sampleCovers?: { url: string; label: string }[];
  label?: string;
  title?: string;
  recommendationText?: string;
  kind?: string;
}

export function ArticleCoverUploader({
  value = "",
  onChange,
  onFileSelectDirect,
  previewUrl,
  onClear,
  sampleCovers = [],
  label,
  title = "Clique aqui para carregar a imagem de capa",
  recommendationText = "Formatos aceites: JPG, PNG, WEBP (Recomendado 1200×675px, máx. 8MB)",
  kind = "articles",
}: ArticleCoverUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = previewUrl || value;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um ficheiro de imagem válido (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("A imagem não pode ultrapassar 8MB.");
      return;
    }

    setError(null);

    if (onFileSelectDirect) {
      onFileSelectDirect(file);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao fazer upload da imagem.");
      }

      if (onChange) {
        onChange(data.url);
      }
      setManualUrlInput(data.url);
    } catch (err: any) {
      setError(err.message || "Falha no envio da imagem de capa.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      {label !== undefined ? (
        label ? (
          <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted dark:text-gray-300">
            {label}
          </label>
        ) : null
      ) : (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-mesclar-muted dark:text-gray-300">
            Imagem de Capa do Artigo <span className="text-rose-500">*</span>
          </label>

          {onChange && (
            <button
              type="button"
              onClick={() => setShowManualUrl(!showManualUrl)}
              className="text-[11px] font-medium text-mesclar-gold-dark dark:text-mesclar-gold hover:underline flex items-center gap-1"
            >
              <LinkIcon className="h-3 w-3" />
              {showManualUrl ? "Ocultar URL manual" : "Inserir por link / sugestões"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* ÁREA DE UPLOAD E PRÉ-VISUALIZAÇÃO */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {displayImage ? (
        <div className="relative rounded-3xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0A192F] p-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Thumbnail preview */}
          <div className="relative aspect-[16/9] w-full sm:w-52 shrink-0 overflow-hidden rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] shadow-sm bg-black">
            <Image
              src={displayImage}
              alt="Pré-visualização do banner"
              fill
              className="object-cover"
              unoptimized={displayImage.startsWith("/api/") || displayImage.startsWith("blob:")}
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Imagem carregada com sucesso</span>
            </div>
            <p className="text-[11px] text-mesclar-muted dark:text-slate-400 truncate max-w-sm">
              {displayImage}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                leftIcon={uploading ? RefreshCw : Upload}
              >
                {uploading ? "A carregar..." : "Substituir Imagem"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (onClear) onClear();
                  if (onChange) onChange("");
                  if (onFileSelectDirect) onFileSelectDirect(null);
                  setManualUrlInput("");
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold px-2 py-1"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`group border-2 border-dashed rounded-3xl p-8 md:p-10 text-center cursor-pointer transition-all bg-white dark:bg-[#0A192F] ${
            uploading
              ? "border-mesclar-gold/50 bg-mesclar-cream/20 dark:bg-[#0E223F] cursor-wait"
              : "border-gray-200 dark:border-[#1e3a5f] hover:border-mesclar-gold/80 hover:bg-mesclar-cream/10 dark:hover:bg-[#0E223F]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <RefreshCw className="h-8 w-8 text-mesclar-gold-dark animate-spin mb-2" />
              <p className="text-xs font-bold text-mesclar-black dark:text-white">A processar upload da imagem...</p>
              <p className="text-[11px] text-mesclar-muted dark:text-slate-400 mt-0.5">A guardar no servidor</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F3E7] dark:bg-[#0E223F] text-[#9E802A] dark:text-mesclar-gold mb-3 shadow-xs transition-transform group-hover:scale-105">
                <Upload className="h-6 w-6 stroke-[2.2]" />
              </span>
              <p className="text-sm sm:text-base font-extrabold text-mesclar-black dark:text-white">
                {title}
              </p>
              <p className="text-xs text-mesclar-muted dark:text-gray-400 mt-1.5 font-medium">
                {recommendationText}
              </p>
              <Button
                type="button"
                variant="gold"
                size="sm"
                className="mt-4 shadow-sm font-bold text-xs px-5 py-2.5"
                leftIcon={Upload}
              >
                Escolher Ficheiro
              </Button>
            </div>
          )}
        </div>
      )}

      {/* PAINEL OPCIONAL: URL MANUAL OU SUGESTÕES */}
      {showManualUrl && onChange && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E223F] border border-mesclar-border/80 dark:border-[#1e3a5f] space-y-3 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-mesclar-black dark:text-white mb-1">
              Ou introduza o URL directo da imagem
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://... ou /services/..."
                value={manualUrlInput}
                onChange={(e) => setManualUrlInput(e.target.value)}
                className="flex-1 rounded-xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] px-3 py-2 text-xs font-mono text-slate-700 dark:text-gray-200 focus:border-mesclar-gold focus:outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (manualUrlInput.trim() && onChange) {
                    onChange(manualUrlInput.trim());
                  }
                }}
              >
                Aplicar URL
              </Button>
            </div>
          </div>

          {sampleCovers.length > 0 && (
            <div>
              <span className="text-[11px] text-mesclar-muted dark:text-gray-400 block mb-1.5">
                Ou selecione uma capa padrão da Mesclar:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleCovers.map((sc) => (
                  <button
                    key={sc.url}
                    type="button"
                    onClick={() => {
                      if (onChange) onChange(sc.url);
                      setManualUrlInput(sc.url);
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                      value === sc.url
                        ? "border-mesclar-gold bg-mesclar-gold/15 font-semibold text-mesclar-black dark:text-white"
                        : "border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] text-mesclar-muted hover:border-mesclar-gold/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

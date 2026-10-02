"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Scissors,
  Copy,
  Clipboard,
  Undo2,
  Redo2,
  SpellCheck,
  Link2,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Eraser,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  HelpCircle,
  Upload,
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RichHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichHtmlEditor({
  value,
  onChange,
  placeholder = "Escreva o conteúdo do artigo aqui...",
  minHeight = 360,
}: RichHtmlEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Link Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);

  // Image Upload Modal States
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync value from props into visual editable element if not in source mode
  useEffect(() => {
    if (!isSourceMode && visualRef.current) {
      if (visualRef.current.innerHTML !== value) {
        isUpdatingFromProps.current = true;
        visualRef.current.innerHTML = value || "";
        isUpdatingFromProps.current = false;
      }
    }
  }, [value, isSourceMode]);

  const handleVisualInput = useCallback(() => {
    if (isUpdatingFromProps.current) return;
    if (visualRef.current) {
      onChange(visualRef.current.innerHTML);
    }
  }, [onChange]);

  function exec(command: string, val: string | undefined = undefined) {
    if (isSourceMode) return;
    visualRef.current?.focus();
    document.execCommand(command, false, val);
    handleVisualInput();
  }

  // 1. LINK HANDLING: Captura o texto ou palavra selecionada
  function handleOpenLinkModal() {
    if (isSourceMode) return;
    const sel = window.getSelection();
    let selectedStr = "";

    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      selectedStr = sel.toString();
    } else {
      savedRangeRef.current = null;
    }

    setLinkText(selectedStr);
    setLinkUrl("");
    setLinkOpenNewTab(true);
    setIsLinkModalOpen(true);
  }

  function handleApplyLink() {
    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://") && !finalUrl.startsWith("/") && !finalUrl.startsWith("#") && !finalUrl.startsWith("mailto:")) {
      finalUrl = `https://${finalUrl}`;
    }

    const displayText = linkText.trim() || finalUrl;
    const targetAttr = linkOpenNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
    const anchorHtml = `<a href="${finalUrl}"${targetAttr} style="color: #b45309; text-decoration: underline; font-weight: 600;">${displayText}</a>`;

    // Restaura a seleção para substituir a palavra exata
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
      exec("insertHTML", anchorHtml);
    } else {
      visualRef.current?.focus();
      exec("insertHTML", anchorHtml);
    }

    setIsLinkModalOpen(false);
  }

  // 2. IMAGE HANDLING: Permite fazer upload direto de arquivo de imagem
  function handleOpenImageModal() {
    if (isSourceMode) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }

    setImageTab("upload");
    setImageFile(null);
    setImagePreviewUrl("");
    setImageAlt("");
    setImageCaption("");
    setImageError(null);
    setIsImageModalOpen(true);
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Por favor, selecione um ficheiro de imagem válido (JPG, PNG, WEBP).");
      return;
    }

    setImageError(null);
    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "articles");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar a imagem.");
      }

      setImagePreviewUrl(data.url);
      if (!imageAlt) {
        setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err: any) {
      setImageError(err.message || "Falha no envio da imagem.");
    } finally {
      setImageUploading(false);
    }
  }

  function handleInsertImage() {
    if (!imagePreviewUrl.trim()) return;

    const alt = imageAlt.trim() || "Imagem do artigo";
    const captionHtml = imageCaption.trim()
      ? `<figcaption style="font-size: 0.8rem; color: #6b7280; margin-top: 6px; font-style: italic; text-align: center;">${imageCaption.trim()}</figcaption>`
      : "";

    const figureHtml = `<figure style="margin: 24px 0; text-align: center;"><img src="${imagePreviewUrl.trim()}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); display: inline-block;" />${captionHtml}</figure><p><br></p>`;

    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
      exec("insertHTML", figureHtml);
    } else {
      visualRef.current?.focus();
      exec("insertHTML", figureHtml);
    }

    setIsImageModalOpen(false);
  }

  function handleTable() {
    if (isSourceMode) return;
    const rows = prompt("Número de linhas:", "3");
    const cols = prompt("Número de colunas:", "3");
    const r = parseInt(rows || "3", 10);
    const c = parseInt(cols || "3", 10);
    if (r > 0 && c > 0) {
      let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e5e7eb;"><thead><tr style="background-color: #f9fafb;">`;
      for (let j = 0; j < c; j++) {
        tableHtml += `<th style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: 600;">Cabeçalho ${j + 1}</th>`;
      }
      tableHtml += `</tr></thead><tbody>`;
      for (let i = 0; i < r - 1; i++) {
        tableHtml += `<tr>`;
        for (let j = 0; j < c; j++) {
          tableHtml += `<td style="border: 1px solid #e5e7eb; padding: 8px 12px;">Célula ${i + 1}-${j + 1}</td>`;
        }
        tableHtml += `</tr>`;
      }
      tableHtml += `</tbody></table><p><br></p>`;
      exec("insertHTML", tableHtml);
    }
  }

  function handleFormatChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val || isSourceMode) return;
    exec("formatBlock", val);
    e.target.value = "";
  }

  function handleStyleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val || isSourceMode) return;
    if (val === "lead") {
      exec("insertHTML", `<p class="lead-text" style="font-size: 1.25rem; line-height: 1.75; color: #374151; font-weight: 400; margin-bottom: 1.5rem;">${window.getSelection()?.toString() || "Texto introdutório de destaque..."}</p>`);
    } else if (val === "alert-gold") {
      exec("insertHTML", `<div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 16px; margin: 16px 0; border-radius: 8px;"><strong style="color: #854d0e;">Nota importante:</strong><p style="color: #713f12; margin-top: 4px;">${window.getSelection()?.toString() || "Conteúdo do destaque..."}</p></div>`);
    } else if (val === "box") {
      exec("insertHTML", `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;"><h4 style="font-weight: 600; margin-bottom: 8px;">Destaque Operacional</h4><p>${window.getSelection()?.toString() || "Informação estratégica sobre cadeia logística..."}</p></div>`);
    }
    e.target.value = "";
  }


  return (
    <div
      className={cn(
        "surface-card rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] overflow-hidden transition-all bg-white dark:bg-[#0A192F]",
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none flex flex-col" : ""
      )}
    >
      {/* CKEditor Classic Toolbar */}
      <div className="border-b border-slate-200 dark:border-[#1e3a5f] bg-slate-100/90 dark:bg-[#0E223F] px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {/* Clipboard / Histórico */}
          <ToolbarButton
            title="Cortar"
            disabled={isSourceMode}
            onClick={() => exec("cut")}
            icon={Scissors}
          />
          <ToolbarButton
            title="Copiar"
            disabled={isSourceMode}
            onClick={() => exec("copy")}
            icon={Copy}
          />
          <ToolbarButton
            title="Colar"
            disabled={isSourceMode}
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.readText().then((text) => exec("insertText", text));
              }
            }}
            icon={Clipboard}
          />

          <Divider />

          <ToolbarButton
            title="Desfazer"
            disabled={isSourceMode}
            onClick={() => exec("undo")}
            icon={Undo2}
          />
          <ToolbarButton
            title="Refazer"
            disabled={isSourceMode}
            onClick={() => exec("redo")}
            icon={Redo2}
          />

          <Divider />

          {/* Formatação Básica */}
          <ToolbarButton
            title="Negrito (Ctrl+B)"
            disabled={isSourceMode}
            onClick={() => exec("bold")}
            icon={Bold}
          />
          <ToolbarButton
            title="Itálico (Ctrl+I)"
            disabled={isSourceMode}
            onClick={() => exec("italic")}
            icon={Italic}
          />
          <ToolbarButton
            title="Sublinhado (Ctrl+U)"
            disabled={isSourceMode}
            onClick={() => exec("underline")}
            icon={Underline}
          />
          <ToolbarButton
            title="Rasurado"
            disabled={isSourceMode}
            onClick={() => exec("strikeThrough")}
            icon={Strikethrough}
          />
          <ToolbarButton
            title="Subscrito"
            disabled={isSourceMode}
            onClick={() => exec("subscript")}
            icon={Subscript}
          />
          <ToolbarButton
            title="Sobrescrito"
            disabled={isSourceMode}
            onClick={() => exec("superscript")}
            icon={Superscript}
          />
          <ToolbarButton
            title="Limpar Formatação"
            disabled={isSourceMode}
            onClick={() => exec("removeFormat")}
            icon={Eraser}
          />

          <Divider />

          {/* Links: Abre Modal com palavra selecionada pré-preenchida */}
          <ToolbarButton
            title="Inserir Ligação na palavra selecionada"
            disabled={isSourceMode}
            onClick={handleOpenLinkModal}
            icon={Link2}
          />
          <ToolbarButton
            title="Remover Ligação"
            disabled={isSourceMode}
            onClick={() => exec("unlink")}
            icon={Unlink}
          />

          <Divider />

          {/* Imagem com Upload Directo */}
          <ToolbarButton
            title="Inserir Imagem (Fazer Upload)"
            disabled={isSourceMode}
            onClick={handleOpenImageModal}
            icon={ImageIcon}
          />
          <ToolbarButton
            title="Inserir Tabela"
            disabled={isSourceMode}
            onClick={handleTable}
            icon={TableIcon}
          />
          <ToolbarButton
            title="Linha Horizontal"
            disabled={isSourceMode}
            onClick={() => exec("insertHorizontalRule")}
            icon={Minus}
          />

          <Divider />

          {/* Listas e Alinhamentos */}
          <ToolbarButton
            title="Lista com Marcadores"
            disabled={isSourceMode}
            onClick={() => exec("insertUnorderedList")}
            icon={List}
          />
          <ToolbarButton
            title="Lista Numerada"
            disabled={isSourceMode}
            onClick={() => exec("insertOrderedList")}
            icon={ListOrdered}
          />
          <ToolbarButton
            title="Aumentar Avanço"
            disabled={isSourceMode}
            onClick={() => exec("indent")}
            icon={Indent}
          />
          <ToolbarButton
            title="Diminuir Avanço"
            disabled={isSourceMode}
            onClick={() => exec("outdent")}
            icon={Outdent}
          />
          <ToolbarButton
            title="Citação em Bloco"
            disabled={isSourceMode}
            onClick={() => exec("formatBlock", "blockquote")}
            icon={Quote}
          />

          <Divider />

          <ToolbarButton
            title="Alinhar à Esquerda"
            disabled={isSourceMode}
            onClick={() => exec("justifyLeft")}
            icon={AlignLeft}
          />
          <ToolbarButton
            title="Centrar"
            disabled={isSourceMode}
            onClick={() => exec("justifyCenter")}
            icon={AlignCenter}
          />
          <ToolbarButton
            title="Alinhar à Direita"
            disabled={isSourceMode}
            onClick={() => exec("justifyRight")}
            icon={AlignRight}
          />
          <ToolbarButton
            title="Justificar"
            disabled={isSourceMode}
            onClick={() => exec("justifyFull")}
            icon={AlignJustify}
          />

          <Divider />

          {/* Estilo Dropdown */}
          <select
            disabled={isSourceMode}
            onChange={handleStyleChange}
            defaultValue=""
            className="h-7 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-mesclar-gold focus:ring-1 focus:ring-mesclar-gold/30 disabled:opacity-50"
          >
            <option value="" disabled>
              Estilo
            </option>
            <option value="lead">Texto Introdutório (Lead)</option>
            <option value="alert-gold">Caixa Dourada / Alerta</option>
            <option value="box">Caixa Informativa</option>
          </select>

          {/* Formatar Dropdown */}
          <select
            disabled={isSourceMode}
            onChange={handleFormatChange}
            defaultValue=""
            className="h-7 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-mesclar-gold focus:ring-1 focus:ring-mesclar-gold/30 disabled:opacity-50"
          >
            <option value="" disabled>
              Formata...
            </option>
            <option value="p">Normal (Parágrafo)</option>
            <option value="h1">Título 1 (H1)</option>
            <option value="h2">Título 2 (H2)</option>
            <option value="h3">Título 3 (H3)</option>
            <option value="h4">Título 4 (H4)</option>
            <option value="pre">Código / Formatado</option>
          </select>

          <Divider />

          <ToolbarButton
            title={isFullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro (Maximizar)"}
            onClick={() => setIsFullscreen(!isFullscreen)}
            icon={isFullscreen ? Minimize2 : Maximize2}
          />

          <ToolbarButton
            title="Ajuda"
            onClick={() => setShowHelp(!showHelp)}
            icon={HelpCircle}
          />
        </div>
      </div>

      {showHelp && (
        <div className="border-b border-amber-200 bg-amber-50/90 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <span>
            <strong>Dica:</strong> Para colocar uma ligação, selecione a palavra ou frase e clique no ícone de corrente. Para inserir imagens, clique no ícone de imagem para carregar ficheiros directamente do seu computador.
          </span>
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="text-amber-800 hover:text-black font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className={cn("relative p-4", isFullscreen ? "flex-1 overflow-auto" : "")}>
        {isSourceMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight: `${minHeight}px` }}
            placeholder="<p>Escreva o código HTML aqui...</p>"
            className="w-full font-mono text-xs leading-relaxed bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-mesclar-gold/50 resize-y"
          />
        ) : (
          <div
            className="relative rounded-xl border border-dashed border-slate-300 bg-white p-6 shadow-inner transition focus-within:border-mesclar-gold/60 focus-within:ring-2 focus-within:ring-mesclar-gold/15"
            style={{ minHeight: `${minHeight}px` }}
          >
            <div
              ref={visualRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleVisualInput}
              onBlur={handleVisualInput}
              data-placeholder={placeholder}
              className="prose prose-slate max-w-none focus:outline-none min-h-[300px] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: INSERIR LINK NA PALAVRA SELECIONADA              */}
      {/* ======================================================== */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-mesclar-border animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-mesclar-black flex items-center gap-2">
                <Link2 className="h-4 w-4 text-mesclar-gold-dark" />
                Inserir Ligação / Link
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyLink();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  Texto da Palavra Selecionada
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Ex: Logística Reversa"
                  className="w-full rounded-xl border border-mesclar-border bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-mesclar-gold focus:outline-none"
                />
                <p className="text-[10px] text-mesclar-muted mt-1">
                  O link será aplicado exatamente neste texto selecionado.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-mesclar-black mb-1">
                  URL de Destino <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com ou /artigos/..."
                  className="w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-mesclar-gold focus:outline-none focus:ring-2 focus:ring-mesclar-gold/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linkNewTabCheck"
                  checked={linkOpenNewTab}
                  onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-mesclar-gold-dark focus:ring-mesclar-gold"
                />
                <label htmlFor="linkNewTabCheck" className="text-xs text-gray-700 cursor-pointer">
                  Abrir ligação numa nova aba (recomendado)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLinkModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={!linkUrl.trim()}
                >
                  Aplicar Ligação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: UPLOAD DE IMAGEM NO LAYOUT (HTML)                */}
      {/* ======================================================== */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-mesclar-border animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-mesclar-black flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-mesclar-gold-dark" />
                Inserir Imagem no Artigo
              </h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Alternador de Modo: Upload vs URL */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition",
                  imageTab === "upload"
                    ? "bg-white text-mesclar-black shadow-sm"
                    : "text-gray-500 hover:text-black"
                )}
              >
                Carregar do Computador (Upload)
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition",
                  imageTab === "url"
                    ? "bg-white text-mesclar-black shadow-sm"
                    : "text-gray-500 hover:text-black"
                )}
              >
                Inserir por URL
              </button>
            </div>

            {imageError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-3">
                {imageError}
              </p>
            )}

            <div className="space-y-4">
              {imageTab === "upload" ? (
                <div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {imagePreviewUrl ? (
                    <div className="rounded-2xl border border-mesclar-border p-3 bg-slate-50 flex items-center gap-4">
                      <div className="relative h-24 w-28 shrink-0 rounded-xl overflow-hidden bg-black border border-slate-200">
                        <Image
                          src={imagePreviewUrl}
                          alt="Pré-visualização"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Imagem carregada com sucesso
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {imagePreviewUrl}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 text-[11px] h-7"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          Trocar Ficheiro
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !imageUploading && imageInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition",
                        imageUploading
                          ? "border-mesclar-gold/50 bg-mesclar-cream/20 cursor-wait"
                          : "border-slate-300 hover:border-mesclar-gold hover:bg-slate-50"
                      )}
                    >
                      {imageUploading ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <RefreshCw className="h-6 w-6 text-mesclar-gold animate-spin mb-1.5" />
                          <p className="text-xs font-bold text-mesclar-black">A fazer upload da imagem...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="h-8 w-8 text-mesclar-gold-dark mb-2" />
                          <p className="text-xs font-bold text-mesclar-black">
                            Clique para escolher a imagem do computador
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            PNG, JPG ou WEBP (máx. 8MB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={imagePreviewUrl}
                    onChange={(e) => setImagePreviewUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full rounded-xl border border-mesclar-border px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Alt Text e Legenda */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Texto Alternativo (Alt)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Descrição da imagem para acessibilidade"
                    className="w-full rounded-xl border border-mesclar-border px-3 py-1.5 text-xs text-slate-800 focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-mesclar-black mb-1">
                    Legenda da Imagem (Opcional)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Ex: Figura 1 - Fluxo de armazenagem"
                    className="w-full rounded-xl border border-mesclar-border px-3 py-1.5 text-xs text-slate-800 focus:border-mesclar-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImageModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  disabled={!imagePreviewUrl.trim() || imageUploading}
                  onClick={handleInsertImage}
                >
                  Inserir no Artigo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  title,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded hover:bg-slate-200/80 dark:hover:bg-[#1e3a5f] active:bg-slate-300 text-slate-700 dark:text-slate-200 transition disabled:opacity-40 disabled:hover:bg-transparent"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-[#1e3a5f]" />;
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Moon,
  Sun,
  BookOpen,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebReaderProps {
  token: string;
  bookTitle: string;
  authorName?: string;
  orderNumber?: string;
}

type Theme = "light" | "sepia" | "dark";

export function WebReader({
  token,
  bookTitle,
  authorName,
  orderNumber,
}: WebReaderProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => undefined);
      setIsFullscreen(false);
    }
  }

  const themeClasses: Record<Theme, { bg: string; text: string; header: string; toolbar: string }> = {
    light: {
      bg: "bg-slate-100",
      text: "text-slate-900",
      header: "bg-white/95 border-slate-200 text-slate-800",
      toolbar: "bg-white/90 border-slate-200 text-slate-700 shadow-lg",
    },
    sepia: {
      bg: "bg-[#f5efe6]",
      text: "text-[#433422]",
      header: "bg-[#ebdcc9]/95 border-[#d6be9c] text-[#433422]",
      toolbar: "bg-[#ebdcc9]/90 border-[#d6be9c] text-[#433422] shadow-lg",
    },
    dark: {
      bg: "bg-[#0f1115]",
      text: "text-slate-200",
      header: "bg-[#181b20]/95 border-slate-800 text-slate-200",
      toolbar: "bg-[#181b20]/90 border-slate-800 text-slate-200 shadow-xl",
    },
  };

  const currentTheme = themeClasses[theme];
  const pdfSrc = `/api/download/${token}?inline=true#toolbar=0&navpanes=0&view=FitH`;

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col ${currentTheme.bg} transition-colors duration-300`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`flex h-16 items-center justify-between border-b px-4 backdrop-blur-md transition-colors ${currentTheme.header}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/conta/ebooks">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={ArrowLeft}
              className="text-inherit hover:bg-black/5"
            >
              Biblioteca
            </Button>
          </Link>
          <div className="h-5 w-px bg-current/20 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="truncate text-sm sm:text-base font-bold leading-tight">
              {bookTitle}
            </h1>
            <p className="text-[11px] opacity-75 truncate">
              {authorName ? `Por ${authorName}` : "Mesclar Logística"}
              {orderNumber && ` · Pedido #${orderNumber}`}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme toggles */}
          <div className="flex items-center rounded-lg border border-current/20 p-0.5 bg-black/5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              title="Modo Claro"
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                theme === "light"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("sepia")}
              title="Modo Sépia"
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                theme === "sepia"
                  ? "bg-[#ebdcc9] text-[#433422] shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              Sépia
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              title="Modo Noturno"
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                theme === "dark"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
            className="hidden sm:inline-flex text-inherit hover:bg-black/5"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {/* Download Original */}
          <a href={`/api/download/${token}`}>
            <Button
              variant="gold"
              size="sm"
              leftIcon={Download}
              className="text-xs"
            >
              Descarregar PDF
            </Button>
          </a>
        </div>
      </header>

      {/* Main Reading Frame */}
      <main className="relative flex-1 overflow-hidden p-2 sm:p-4 flex items-center justify-center">
        <div
          className="h-full w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden bg-white ring-1 ring-black/10 transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          <iframe
            src={pdfSrc}
            title={bookTitle}
            className="h-full w-full border-none"
            allowFullScreen
          />
        </div>

        {/* Floating Zoom & Controls Bar */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md transition-all ${currentTheme.toolbar}`}
        >
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            title="Reduzir zoom"
            className="p-1 hover:text-mesclar-gold transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold w-12 text-center select-none">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            title="Aumentar zoom"
            className="p-1 hover:text-mesclar-gold transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {zoom !== 100 && (
            <button
              type="button"
              onClick={() => setZoom(100)}
              title="Redefinir zoom"
              className="p-1 opacity-70 hover:opacity-100 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="h-3 w-px bg-current/20 mx-1" />
          <span className="text-[11px] font-medium opacity-80 inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-mesclar-gold-dark" />
            Leitor Oficial Mesclar
          </span>
        </div>
      </main>
    </div>
  );
}

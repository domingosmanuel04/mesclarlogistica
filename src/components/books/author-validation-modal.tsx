"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import QRCode from "qrcode";
import type { MockAuthor } from "@/types";
import { Button } from "@/components/ui/button";

interface AuthorValidationModalProps {
  author: MockAuthor;
  code: string;
  verificationUrl: string;
  isOwner?: boolean;
}

export function AuthorValidationModal({
  author,
  code,
  verificationUrl,
  isOwner = false,
}: AuthorValidationModalProps) {
  const [isValidated, setIsValidated] = useState<boolean>(Boolean(author.isValidated));
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [valError, setValError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/validar/${code}`
      : verificationUrl;

  useEffect(() => {
    if ((isOpen || isValidated) && !qrDataUrl) {
      QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: "#0B0B0B",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [isOpen, isValidated, verifyUrl, qrDataUrl]);

  function handleCopy() {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleConfirmValidation() {
    setValidating(true);
    setValError("");
    try {
      const res = await fetch(`/api/authors/${author.slug}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setValError(data.error || "Não foi possível validar o perfil.");
        setValidating(false);
        return;
      }
      setIsValidated(true);
      setValidating(false);
      setConfirmOpen(false);
      // Abre imediatamente o modal com o QR Code ativo
      setIsOpen(true);
    } catch {
      setValError("Erro de comunicação com o servidor.");
      setValidating(false);
    }
  }

  // Se ainda NÃO está validado:
  // - Para outros utilizadores (não donos): não mostra nada.
  // - Para o dono do perfil: mostra o botão "Validar".
  if (!isValidated) {
    if (!isOwner) {
      return null;
    }

    return (
      <>
        {/* Botão Validar visível EXCLUSIVAMENTE para o dono do perfil */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="group inline-flex items-center gap-2 rounded-2xl border border-mesclar-gold/60 bg-gradient-to-br from-mesclar-gold/25 via-mesclar-gold/15 to-white px-4 py-2.5 text-sm font-bold text-mesclar-black shadow-[0_6px_20px_-14px_rgba(201,162,39,0.7)] transition-all hover:-translate-y-0.5 hover:border-mesclar-gold hover:bg-mesclar-gold/30 hover:shadow-[0_10px_26px_-14px_rgba(201,162,39,0.9)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-black text-mesclar-gold shadow-md">
            <ShieldCheck className="h-4.5 w-4.5 text-mesclar-gold" strokeWidth={2.4} />
          </span>
          Validar Currículo
        </button>

        {/* Modal de Confirmação de Validação pelo Dono */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-mesclar-gold/40 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-lg">
                  <FileCheck2 className="h-6 w-6 text-mesclar-black" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                    Ação do Titular
                  </span>
                  <h3 className="text-lg font-black text-mesclar-black tracking-tight">
                    Validar o seu Currículo
                  </h3>
                </div>
              </div>

              {valError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {valError}
                </div>
              )}

              <div className="mt-4 space-y-3.5 text-sm text-mesclar-gray">
                <p className="leading-relaxed">
                  Ao validar o seu perfil profissional na <strong>Mesclar Logística</strong>,
                  você confirma a veracidade das suas informações curriculares.
                </p>

                <div className="rounded-2xl border border-mesclar-border/80 bg-mesclar-cream/30 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-mesclar-muted">Profissional:</span>
                    <strong className="text-mesclar-black">{author.name}</strong>
                  </div>
                  {author.specialty && (
                    <div className="flex justify-between">
                      <span className="text-mesclar-muted">Especialidade:</span>
                      <strong className="text-mesclar-gold-dark">{author.specialty}</strong>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-mesclar-border/60 pt-2">
                    <span className="text-mesclar-muted">Após validação:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      QR Code público ativado
                    </span>
                  </div>
                </div>

                <p className="text-xs text-mesclar-muted leading-relaxed">
                  Uma vez validado, o botão mudará para o <strong>ícone do QR Code</strong> e
                  ficará visível para qualquer visitante escanear e consultar a sua autenticidade.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <Button
                  variant="gold"
                  className="w-full"
                  disabled={validating}
                  onClick={() => void handleConfirmValidation()}
                  leftIcon={validating ? Loader2 : ShieldCheck}
                >
                  {validating ? "A validar..." : "Confirmar e Validar Perfil"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={validating}
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Se JÁ ESTÁ validado:
  // Mostra o botão com o ÍCONE DO QR CODE para todos (dono e outros visitantes)
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 rounded-2xl border border-mesclar-gold/50 bg-gradient-to-br from-mesclar-gold/20 via-mesclar-gold/10 to-white px-4 py-2.5 text-sm font-bold text-mesclar-black shadow-[0_6px_20px_-14px_rgba(201,162,39,0.7)] transition-all hover:-translate-y-0.5 hover:border-mesclar-gold hover:bg-mesclar-gold/25 hover:shadow-[0_10px_26px_-14px_rgba(201,162,39,0.9)]"
        title="Escanear ou visualizar QR Code de validação"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-mesclar-gold to-mesclar-gold-dark text-mesclar-black shadow-md">
          <QrCode className="h-4.5 w-4.5 text-mesclar-black" strokeWidth={2.4} />
        </span>
        QR Code
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      </button>

      {/* Modal do QR Code & Download (aberto para todos após validação) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-mesclar-gold/40 bg-white p-6 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-mesclar-muted hover:bg-mesclar-cream hover:text-mesclar-black transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mesclar-black to-mesclar-gray text-mesclar-gold shadow-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Perfil Validado
                </span>
                <h3 className="text-lg font-black text-mesclar-black tracking-tight">
                  QR Code de Autenticidade
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* QR Code Container */}
              <div className="relative mx-auto flex flex-col items-center justify-center rounded-2xl border border-mesclar-gold/30 bg-gradient-to-b from-mesclar-cream/30 via-white to-mesclar-cream/20 p-5 shadow-inner">
                {qrDataUrl ? (
                  <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-mesclar-border bg-white p-2 shadow-md">
                    <img
                      src={qrDataUrl}
                      alt={`QR Code de Validação para ${author.name}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-mesclar-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-mesclar-gold" />
                  </div>
                )}

                <p className="mt-3 text-center text-xs font-semibold text-mesclar-black">
                  Código de Autenticidade:
                </p>
                <p className="font-mono text-sm font-black text-mesclar-gold-dark">
                  {code}
                </p>

                <p className="mt-1 text-center text-[11px] text-mesclar-muted max-w-xs">
                  Escaneie este QR Code com o telemóvel para verificar em tempo real o perfil deste profissional no sistema.
                </p>
              </div>

              {/* Author Preview Details */}
              <div className="rounded-xl border border-mesclar-border/70 bg-white p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-mesclar-muted">Profissional:</span>
                  <span className="font-bold text-mesclar-black">{author.name}</span>
                </div>
                {author.specialty && (
                  <div className="flex justify-between">
                    <span className="text-mesclar-muted">Especialidade:</span>
                    <span className="font-semibold text-mesclar-gold-dark">{author.specialty}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-mesclar-muted">Status:</span>
                  <span className="font-bold text-emerald-700">Verificado e Validado</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <a
                  href={`/api/authors/${author.slug}/pdf`}
                  download
                  onClick={() => {
                    setDownloading(true);
                    setTimeout(() => setDownloading(false), 3000);
                  }}
                  className="block w-full"
                >
                  <Button
                    variant="gold"
                    className="w-full text-xs font-bold"
                    leftIcon={Download}
                    disabled={downloading}
                  >
                    {downloading ? "A transferir PDF..." : "Baixar Perfil Validado (PDF)"}
                  </Button>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={copied ? Check : Copy}
                    onClick={handleCopy}
                  >
                    {copied ? "Link copiado!" : "Copiar Link"}
                  </Button>

                  <Link href={`/validar/${code}`} target="_blank" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      rightIcon={ExternalLink}
                    >
                      Testar QR Code
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

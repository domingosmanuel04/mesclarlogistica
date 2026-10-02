/**
 * useMediaDevices — hook utilitário com compatibilidade cross-browser
 * para acesso ao microfone e câmara.
 *
 * Suporta: Chrome, Firefox, Safari, Edge, Opera, Mobile (iOS/Android)
 *
 * Problemas resolvidos:
 * - HTTP vs HTTPS: navigator.mediaDevices só existe em contexto seguro ou localhost
 * - Safari/iOS: MediaRecorder prefere audio/mp4; fallback para audio/webm
 * - Firefox: SecurityError em vez de NotAllowedError
 * - Browsers antigos: fallback via navigator.getUserMedia (prefixado)
 */

"use client";

export type MediaErrorType =
  | "not_supported"   // Navegador não suporta WebRTC/getUserMedia
  | "not_allowed"     // Utilizador negou permissão ou site em HTTP sem HTTPS
  | "not_found"       // Nenhum microfone/câmara encontrado
  | "in_use"          // Dispositivo em uso por outra aplicação
  | "unknown";        // Outro erro desconhecido

export interface MediaAccessError {
  type: MediaErrorType;
  title: string;
  message: string;
  instruction: string;
}

/**
 * Retorna o tipo de erro de forma cross-browser a partir de um DOMException.
 */
export function classifyMediaError(err: unknown): MediaAccessError {
  const error = err as DOMException & { name?: string; message?: string };
  const name = error?.name ?? "";
  const message = (error?.message ?? "").toLowerCase();

  // Contexto não-seguro (HTTP) — browser rejeita mesmo antes de pedir permissão
  if (
    name === "SecurityError" ||
    message.includes("insecure") ||
    message.includes("only secure") ||
    message.includes("https") ||
    message.includes("not allowed in non-secure")
  ) {
    return {
      type: "not_allowed",
      title: "Contexto Não Seguro",
      message:
        "O acesso ao microfone e câmara requer uma ligação segura (HTTPS) ou localhost.",
      instruction:
        "Aceda ao site via HTTPS ou utilize localhost para desenvolvimento.",
    };
  }

  // Permissão negada pelo utilizador
  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    name === "PermissionDenied" ||
    message.includes("permission denied") ||
    message.includes("not allowed")
  ) {
    return {
      type: "not_allowed",
      title: "Acesso ao Microfone",
      message:
        "Permissão negada pelo navegador. Para permitir o acesso, clique no ícone de cadeado ou câmara na barra de endereço e permita o acesso.",
      instruction:
        "Após permitir, recarregue a página e tente novamente.",
    };
  }

  // Dispositivo não encontrado
  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    name === "OverconstrainedError" ||
    message.includes("not found") ||
    message.includes("no device")
  ) {
    return {
      type: "not_found",
      title: "Dispositivo Não Encontrado",
      message:
        "Nenhum microfone ou câmara foi detectado no seu dispositivo.",
      instruction:
        "Verifique se o dispositivo está ligado e não está em uso por outra aplicação.",
    };
  }

  // Dispositivo em uso
  if (
    name === "NotReadableError" ||
    name === "TrackStartError" ||
    name === "AbortError" ||
    message.includes("already in use") ||
    message.includes("could not start")
  ) {
    return {
      type: "in_use",
      title: "Dispositivo Ocupado",
      message:
        "O microfone ou câmara está a ser usado por outra aplicação.",
      instruction:
        "Feche outras aplicações que possam estar a usar o microfone/câmara e tente novamente.",
    };
  }

  // Navegador sem suporte
  if (
    name === "TypeError" ||
    message.includes("not implemented") ||
    message.includes("not supported")
  ) {
    return {
      type: "not_supported",
      title: "Navegador Não Suportado",
      message:
        "O seu navegador não suporta acesso ao microfone e câmara.",
      instruction:
        "Utilize o Chrome, Firefox, Safari ou Edge numa versão actualizada.",
    };
  }

  return {
    type: "unknown",
    title: "Erro de Acesso",
    message: "Não foi possível aceder ao microfone ou câmara.",
    instruction: "Verifique as permissões do navegador e tente novamente.",
  };
}

/**
 * Verifica se o browser suporta getUserMedia de forma cross-browser.
 * Retorna a função getUserMedia normalizada, ou null se não suportado.
 */
export function getGetUserMedia(): ((constraints: MediaStreamConstraints) => Promise<MediaStream>) | null {
  if (typeof navigator === "undefined") return null;

  // Moderno (Chrome 47+, Firefox 36+, Safari 11+, Edge 12+)
  if (navigator.mediaDevices?.getUserMedia) {
    return (constraints) => navigator.mediaDevices.getUserMedia(constraints);
  }

  // Legado — prefixos antigos (Chrome < 47, Opera, Firefox antigo)
  const nav = navigator as Navigator & {
    webkitGetUserMedia?: (c: MediaStreamConstraints, s: (s: MediaStream) => void, e: (e: DOMException) => void) => void;
    mozGetUserMedia?: (c: MediaStreamConstraints, s: (s: MediaStream) => void, e: (e: DOMException) => void) => void;
    msGetUserMedia?: (c: MediaStreamConstraints, s: (s: MediaStream) => void, e: (e: DOMException) => void) => void;
  };

  const legacyFn =
    nav.webkitGetUserMedia?.bind(nav) ||
    nav.mozGetUserMedia?.bind(nav) ||
    nav.msGetUserMedia?.bind(nav);

  if (legacyFn) {
    return (constraints) =>
      new Promise<MediaStream>((resolve, reject) =>
        legacyFn(constraints, resolve, reject)
      );
  }

  return null;
}

/**
 * Solicita acesso ao microfone (e opcionalmente câmara) com fallback cross-browser.
 * Lança MediaAccessError se falhar.
 */
export async function requestMediaAccess(constraints: MediaStreamConstraints): Promise<MediaStream> {
  const gum = getGetUserMedia();

  if (!gum) {
    throw {
      type: "not_supported",
      title: "Navegador Não Suportado",
      message: "O seu navegador não suporta acesso ao microfone e câmara.",
      instruction: "Utilize o Chrome, Firefox, Safari ou Edge actualizado.",
    } as MediaAccessError;
  }

  try {
    return await gum(constraints);
  } catch (err) {
    throw classifyMediaError(err);
  }
}

/**
 * Detecta o melhor formato de gravação de áudio suportado pelo browser.
 * Safari/iOS preferem audio/mp4; Chrome/Firefox preferem audio/webm.
 */
export function getBestAudioMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";

  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return "audio/webm"; // fallback
}

/**
 * Detecta a extensão de ficheiro correspondente ao MIME type de áudio.
 */
export function getAudioExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

/**
 * Verifica se o contexto é seguro (HTTPS ou localhost).
 * navigator.mediaDevices é undefined em HTTP fora de localhost.
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext === true ||
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1"
  );
}

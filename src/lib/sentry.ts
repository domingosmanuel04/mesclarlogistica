/**
 * Sentry opcional — activo só com NEXT_PUBLIC_SENTRY_DSN.
 * Em produção: npm i @sentry/nextjs e configurar.
 */
export function captureError(error: unknown, context?: string) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV === "development") {
      console.error("[error]", context, error);
    }
    return;
  }
  // Placeholder: integrar @sentry/nextjs.captureException(error)
  console.error("[sentry:stub]", context, error);
}

export async function reportClientError(error: unknown) {
  try {
    await fetch("/api/health", { method: "GET" }); // keepalive ping
  } catch {
    /* ignore */
  }
  captureError(error, "client");
}

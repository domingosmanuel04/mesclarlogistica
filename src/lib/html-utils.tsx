import React from "react";

/**
 * Descodifica entidades HTML (&lt;, &gt;, &quot;, &amp;, etc.)
 */
export function unescapeHtml(html?: string | null): string {
  if (!html) return "";
  let decoded = html;
  // Descodificar até 2 passos caso tenha sido codificado duplamente
  for (let i = 0; i < 2; i++) {
    if (!/&(?:lt|gt|amp|quot|#39|#x27|nbsp);/i.test(decoded)) break;
    decoded = decoded
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&amp;/gi, "&");
  }
  return decoded;
}

/**
 * Remove todas as tags HTML de uma string, retornando texto limpo.
 * Descodifica primeiro as entidades HTML (&lt;p&gt; -> <p>) para garantir que tags codificadas sejam eliminadas.
 * Ideal para excertos de cartões, meta-descriptions e pré-visualizações.
 */
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  const decoded = unescapeHtml(html);
  return decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface SafeHtmlProps {
  html?: string | null;
  className?: string;
  as?: React.ElementType;
}

/**
 * Componente seguro para renderização de conteúdo rico em HTML (editor WYSIWYG)
 * Evita vazamento de código cru na interface descodificando entidades e renderizando tags de forma limpa.
 */
export function SafeHtml({ html, className = "", as: Component = "div" }: SafeHtmlProps) {
  if (!html) return null;

  const decoded = unescapeHtml(html);
  const containsTags = /<[a-z][\s\S]*>/i.test(decoded);

  if (!containsTags) {
    return <Component className={className}>{decoded}</Component>;
  }

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: decoded }}
    />
  );
}

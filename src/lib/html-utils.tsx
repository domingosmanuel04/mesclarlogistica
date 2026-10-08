import React from "react";

/**
 * Remove todas as tags HTML de uma string, retornando texto limpo
 * Ideal para excertos de cartões, meta-descriptions e pré-visualizações.
 */
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim();
}

interface SafeHtmlProps {
  html?: string | null;
  className?: string;
  as?: React.ElementType;
}

/**
 * Componente seguro para renderização de conteúdo rico em HTML (editor WYSIWYG)
 * Evita vazamento de código cru na interface.
 */
export function SafeHtml({ html, className = "", as: Component = "div" }: SafeHtmlProps) {
  if (!html) return null;

  // Se a string não contiver NENHUMA tag HTML, encapsulamos em parágrafo ou texto formatado
  const containsTags = /<[a-z][\s\S]*>/i.test(html);

  if (!containsTags) {
    return <Component className={className}>{html}</Component>;
  }

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

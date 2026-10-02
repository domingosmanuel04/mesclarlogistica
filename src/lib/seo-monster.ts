import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "Mesclar Logística | Procurement",
  description:
    "Plataforma digital e infraestrutura industrial B2C especializada em conteúdos, livros, eBooks, artigos técnicos e consultoria de Logística, Procurement e Supply Chain em Angola.",
  url: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://mesclarlogistica.com",
  ogImage: "/banner-og.jpg",
  author: "Liceatlantico",
  email: "suporte@mesclarlogistica.com",
  phone: "+244 921 522 885",
  locale: "pt_AO",
  themeColor: "#0A192F",
};

export interface GenerateSeoOptions {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  type?: "website" | "article" | "profile" | "book";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  tags?: string[];
}

export function constructMetadata({
  title,
  description = SITE_CONFIG.description,
  canonical,
  ogImage = SITE_CONFIG.ogImage,
  type = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  authorName,
  tags,
}: GenerateSeoOptions): Metadata {
  const fullCanonical = canonical
    ? `${SITE_CONFIG.url}${canonical}`
    : SITE_CONFIG.url;

  return {
    title: {
      default: `${title} | ${SITE_CONFIG.name}`,
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: fullCanonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: fullCanonical,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: type as any,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authorName && { authors: [authorName] }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@mesclarlogistica",
    },
  };
}

/**
 * Generate Schema.org JSON-LD Objects
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mesclar Logística",
    legalName: "Liceatlantico",
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon.png`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: "AO",
      addressLocality: "Luanda",
    },
    sameAs: [
      "https://wa.me/244921522885",
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mesclar Logística",
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/livros?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBookSchema(book: {
  title: string;
  authorName: string;
  description: string;
  slug: string;
  coverUrl?: string;
  priceEbook?: number;
  isbn?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: {
      "@type": "Person",
      name: book.authorName,
    },
    description: book.description,
    url: `${SITE_CONFIG.url}/livros/${book.slug}`,
    ...(book.coverUrl && { image: book.coverUrl }),
    ...(book.isbn && { isbn: book.isbn }),
    offers: {
      "@type": "Offer",
      price: book.priceEbook ?? 0,
      priceCurrency: "AOA",
      availability: "https://schema.org/InStock",
      url: `${SITE_CONFIG.url}/livros/${book.slug}`,
    },
  };
}

export function generateArticleSchema(article: {
  title: string;
  excerpt?: string;
  content?: string;
  slug: string;
  authorName: string;
  publishedAt?: string;
  coverUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.title,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: generateOrganizationSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/artigos/${article.slug}`,
    },
    ...(article.coverUrl && { image: article.coverUrl }),
    ...(article.publishedAt && { datePublished: article.publishedAt }),
  };
}

import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBookSchema,
  generateArticleSchema,
} from "@/lib/seo-monster";

export function JsonLdScript({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function GlobalJsonLd() {
  const org = generateOrganizationSchema();
  const website = generateWebSiteSchema();

  return (
    <>
      <JsonLdScript data={org} />
      <JsonLdScript data={website} />
    </>
  );
}

export function BookJsonLd({ book }: { book: any }) {
  if (!book) return null;
  const schema = generateBookSchema(book);
  return <JsonLdScript data={schema} />;
}

export function ArticleJsonLd({ article }: { article: any }) {
  if (!article) return null;
  const schema = generateArticleSchema(article);
  return <JsonLdScript data={schema} />;
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getBookBySlug, getBooksByAuthor, listAuthors } from "@/lib/catalog";
import { formatPrice, productTypeLabel } from "@/lib/utils";
import { BookDetailActions } from "@/components/books/book-detail-actions";
import { BookGrid } from "@/components/books/book-grid";
import { BookReviews } from "@/components/books/book-reviews";
import { SafeHtml } from "@/lib/html-utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Livro não encontrado" };
  return {
    title: book.title,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      type: "article",
      images: [{ url: book.coverUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description: book.description,
      images: [book.coverUrl],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const related = (await getBooksByAuthor(book.authorId))
    .filter((b) => b.id !== book.id)
    .slice(0, 4);
  const authorProfile = (await listAuthors()).find((a) => a.id === book.authorId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
        <div className="relative mx-auto aspect-[5/7] w-full max-w-xs overflow-hidden rounded-xl shadow-lg lg:mx-0">
          <Image src={book.coverUrl} alt={book.title} fill className="object-cover" priority />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-mesclar-gold-dark">
            {book.categoryName}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{book.title}</h1>
          <p className="mt-2 text-mesclar-muted">
            por{" "}
            {authorProfile ? (
              <Link href={`/autores/${authorProfile.slug}`} className="text-mesclar-gold-dark hover:underline">
                {book.authorName}
              </Link>
            ) : (
              book.authorName
            )}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-mesclar-gold text-mesclar-gold" />
            <span className="font-semibold">{book.ratingAvg.toFixed(1)}</span>
            <span className="text-mesclar-muted">({book.ratingCount} avaliações)</span>
            <span className="text-mesclar-muted">· {productTypeLabel(book.productType)}</span>
          </div>
          <SafeHtml html={book.description} className="mt-6 leading-relaxed text-mesclar-gray prose max-w-none" />
          {book.summary && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-mesclar-cream/50 p-4 text-sm text-mesclar-muted">
              {book.summary}
            </pre>
          )}
          <div className="mt-6 space-y-1">
            {(book.productType === "EBOOK" || book.productType === "BOTH") && (
              <p className="text-xl font-bold">
                eBook: {book.priceEbook === 0 ? "Gratuito" : formatPrice(book.priceEbook)}
              </p>
            )}
            {(book.productType === "PHYSICAL" || book.productType === "BOTH") && book.pricePhysical != null && (
              <p className="text-xl font-bold">Físico: {formatPrice(book.pricePhysical)}</p>
            )}
          </div>
          <div className="mt-8">
            <BookDetailActions book={book} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Do mesmo autor</h2>
          <BookGrid books={related} columns={3} />
        </section>
      )}

      <BookReviews bookId={book.id} />
    </div>
  );
}

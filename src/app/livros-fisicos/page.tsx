import { getPublishedBooks } from "@/lib/catalog";
import { BookGrid } from "@/components/books/book-grid";
import { PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Livros Físicos" };

export default async function PhysicalBooksPage() {
  const books = (await getPublishedBooks({ physicalOnly: true })).filter(
    (b) => b.productType === "PHYSICAL" || b.productType === "BOTH"
  );

  return (
    <>
      <PageHero
        eyebrow="Mesclar"
        title="Livros Físicos"
        description="Entrega ou levantamento em pontos de recolha após validação do pagamento."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <BookGrid books={books} columns={3} />
      </div>
    </>
  );
}

import type { MockBook } from "@/types";
import { BookCard } from "./book-card";

interface BookGridProps {
  books: MockBook[];
  columns?: 2 | 3;
  downloadOnly?: boolean;
}

export function BookGrid({ books, columns = 3, downloadOnly }: BookGridProps) {
  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  if (books.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-mesclar-muted">Nenhum livro encontrado nesta categoria.</p>
      </div>
    );
  }

  return (
    <div className={`grid items-stretch gap-8 lg:gap-10 ${gridClass}`}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} downloadOnly={downloadOnly} />
      ))}
    </div>
  );
}

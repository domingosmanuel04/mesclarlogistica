import Link from "next/link";
import { listCategories, getPublishedBooks } from "@/lib/catalog";

export const metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const [categories, books] = await Promise.all([listCategories(), getPublishedBooks()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold">Categorias</h1>
      <p className="mt-2 text-mesclar-muted">
        Marketplace exclusivo para conteúdos da cadeia logística.
      </p>
      <div className="mt-12 space-y-10">
        {categories.map((cat) => {
          const count = books.filter((b) => b.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="rounded-xl border border-mesclar-border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{cat.name}</h2>
                <Link
                  href={`/ebooks?categoria=${cat.slug}`}
                  className="text-sm font-semibold text-mesclar-gold-dark"
                >
                  Ver {count} livro(s) →
                </Link>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {cat.subcategories.map((sub) => (
                  <li
                    key={sub.id}
                    className="rounded-full bg-[#f5f3eb] px-3 py-1 text-xs font-medium text-mesclar-gray"
                  >
                    {sub.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

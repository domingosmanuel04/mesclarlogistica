import { Suspense } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { SearchPageClient } from "@/components/search/search-page-client";

export const metadata = { title: "Pesquisar" };

export default function SearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Plataforma"
        title="Pesquisar"
        description="Pesquisa por título, autor, categoria, palavras-chave e descrição."
      />
      <Suspense fallback={<p className="py-20 text-center text-mesclar-muted">A carregar...</p>}>
        <SearchPageClient />
      </Suspense>
    </>
  );
}

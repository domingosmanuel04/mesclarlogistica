import { Suspense } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { EbooksLibrary } from "@/components/ebooks/ebooks-library";

export const metadata = {
  title: "eBooks — Plataforma Mesclar",
};

export default function EbooksPage() {
  return (
    <>
      <PageHero
        eyebrow="Plataforma Mesclar"
        title="eBooks"
        description="Conhecimento especializado para profissionais da cadeia logística."
      />
      <Suspense
        fallback={
          <p className="py-20 text-center text-mesclar-muted">A carregar acervo...</p>
        }
      >
        <EbooksLibrary />
      </Suspense>
    </>
  );
}

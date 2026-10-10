import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/page-hero";
import { prisma } from "@/lib/prisma";
import { GraduationCap, ArrowRight, ExternalLink } from "lucide-react";
import { stripHtml } from "@/lib/html-utils";

export const metadata: Metadata = {
  title: "Formação",
  description: "Formações e capacitações em logística e procurement — Mesclar.",
};

export const dynamic = "force-dynamic";

export default async function FormacaoPage() {
  let trainings: any[] = [];
  try {
    trainings = await prisma.training.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Error loading trainings:", err);
    trainings = [];
  }

  return (
    <div>
      <PageHero
        eyebrow="Capacitação e Cursos"
        title="Formação"
        description="Explore as formações, cursos e workshops disponíveis no sector logístico. Clique em qualquer formação para consultar os detalhes ou realizar a inscrição."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {trainings.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-mesclar-border bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-gold-dark">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-mesclar-black">
              Ainda não há formações publicadas
            </h3>
            <p className="mt-1 text-sm text-mesclar-muted max-w-md mx-auto">
              Novas formações e capacitações serão adicionadas em breve. Fique atento às novidades.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {trainings.map((item) => (
              <li key={item.id} className="flex">
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-mesclar-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-mesclar-gold/50 hover:shadow-[0_20px_45px_-15px_rgba(201,162,39,0.35)]"
                >
                  {/* Banner completo sem cortes com ambient blur */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-mesclar-black">
                    {/* Fundo suave para preenchimento harmónico de banners de qualquer proporção */}
                    <Image
                      src={item.bannerUrl}
                      alt=""
                      fill
                      aria-hidden="true"
                      className="object-cover opacity-30 blur-md scale-110"
                      unoptimized={item.bannerUrl.startsWith("/api/")}
                    />

                    {/* Imagem completa do banner - 100% visível */}
                    <Image
                      src={item.bannerUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.02]"
                      unoptimized={item.bannerUrl.startsWith("/api/")}
                    />

                    {/* Badge flutuante no topo do banner */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-mesclar-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mesclar-gold-light backdrop-blur-md shadow-md">
                        <GraduationCap className="h-3.5 w-3.5 text-mesclar-gold" />
                        Formação
                      </span>
                    </div>
                  </div>

                  {/* Corpo do Card */}
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <h2 className="text-lg font-bold text-mesclar-black transition-colors duration-200 group-hover:text-mesclar-gold-dark line-clamp-2">
                        {item.title}
                      </h2>

                      {item.description ? (
                        <p className="mt-2.5 text-xs text-mesclar-muted leading-relaxed line-clamp-3">
                          {stripHtml(item.description)}
                        </p>
                      ) : (
                        <p className="mt-2.5 text-xs text-mesclar-muted/70 italic">
                          Consulte os detalhes e condições da formação no link oficial.
                        </p>
                      )}
                    </div>

                    {/* Rodapé do Card com CTA */}
                    <div className="mt-6 pt-4 border-t border-mesclar-border/70 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-mesclar-gold-dark transition-all duration-200 group-hover:translate-x-1">
                        Saber mais e Inscrição
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mesclar-cream text-mesclar-black transition-colors duration-200 group-hover:bg-mesclar-gold group-hover:text-mesclar-black shadow-sm">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Search,
  BookOpen,
  Globe2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishBookButton } from "@/components/auth/publish-book-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesclar-black text-white">
      {/* Background grid pattern & ambient radial glow */}
      <div className="absolute inset-0 grid-pattern opacity-[0.04]" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 10% 100%, rgba(201,162,39,0.18), transparent 55%), radial-gradient(circle at 85% 15%, rgba(201,162,39,0.12), transparent 45%)",
        }}
        aria-hidden
      />

      {/* Background Logistics Image (Mapa Global de Rotas e Conexões Logísticas) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image
          src="/hero-global-routes-map.jpg"
          alt="Rotas Globais de Logística e Cadeia de Abastecimento"
          fill
          priority
          unoptimized
          className="object-cover object-center opacity-90 sm:opacity-95 transition-opacity"
        />
        {/* Gradients rendering strong text contrast while preserving the bright global map graphics */}
        <div className="absolute inset-0 bg-gradient-to-r from-mesclar-black/95 via-mesclar-black/75 to-mesclar-black/30 sm:via-mesclar-black/60 lg:via-mesclar-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-mesclar-black via-transparent to-mesclar-black/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="max-w-2xl">
          <p className="animate-fade-in-up text-[11px] font-bold uppercase tracking-[0.32em] text-mesclar-gold-light">
            Plataforma digital da cadeia logística
          </p>
          <h1 className="animate-fade-in-up mt-5 text-[2rem] font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Conhecimentos que movimentam as práticas sustentáveis da{" "}
            <span className="text-gradient-gold">cadeia logística</span>.
          </h1>
          <p className="animate-fade-in-up-delay mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Encontre e compartilhe livros, eBooks e conteúdos especializados em Logística,
            Procurement, Compras, Importação, Armazéns e Supply Chain.
          </p>

          <form
            action="/pesquisa"
            method="get"
            className="animate-fade-in-up-delay mt-10 flex max-w-lg flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                name="q"
                type="search"
                placeholder="Pesquisar por título, autor ou tema..."
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-md transition focus:border-mesclar-gold/50 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-mesclar-gold/25"
              />
            </div>
            <Button type="submit" variant="gold" size="md" className="shrink-0 sm:px-6 font-bold" leftIcon={Search}>
              Pesquisar
            </Button>
          </form>

          <div className="animate-fade-in-up-delay mt-8 flex flex-wrap gap-3">
            <Link href="/ebooks">
              <Button variant="gold" size="lg" rightIcon={ArrowRight} leftIcon={BookOpen} className="font-bold">
                Explorar eBooks
              </Button>
            </Link>
            <PublishBookButton
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white hover:text-mesclar-black font-semibold"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-mesclar-gold" />
              <span>Profissionais Verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-mesclar-gold" />
              <span>Rotas e Alfândegas em Angola</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-mesclar-gold" />
              <span>Formações Executivas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-mesclar-gold/80 to-transparent" />
    </section>
  );
}

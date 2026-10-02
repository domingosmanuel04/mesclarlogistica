"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardFeaturedCardProps {
  badge?: string;
  title?: string;
  author?: string;
  coverUrl?: string;
  rating?: number;
  stats?: { label: string; value: string | number }[];
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function DashboardFeaturedCard({
  badge = "Destaque do Mês",
  title = "Gestão de Cadeia de Abastecimento",
  author = "Mesclar Editorial",
  coverUrl = "/covers/supply-chain.jpg",
  rating = 4.9,
  stats = [
    { label: "Páginas", value: "320" },
    { label: "Avaliações", value: "643" },
    { label: "Leitores", value: "1.2k" },
  ],
  description = "Guia prático e executivo sobre procurement estratégico, gestão de armazéns e transportes no contexto empresarial angolano.",
  actionText = "Ver Publicação",
  actionHref = "/ebooks",
}: DashboardFeaturedCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-mesclar-black via-[#141b2d] to-mesclar-black p-6 text-white border border-mesclar-gold/30 shadow-2xl flex flex-col items-center text-center">
      {/* Glow dourado decorativo */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-mesclar-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-mesclar-gold/15 blur-3xl" />

      {/* Badge Superior */}
      <span className="relative z-10 inline-flex items-center rounded-full border border-mesclar-gold/30 bg-mesclar-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-mesclar-gold-light mb-5">
        {badge}
      </span>

      {/* Capa do Livro em Destaque com Sombra Elegante */}
      <div className="relative z-10 mx-auto aspect-[3/4] w-36 sm:w-40 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group mb-4">
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={coverUrl.startsWith("/api/")}
        />
      </div>

      {/* Título e Autor */}
      <div className="relative z-10 w-full mb-3">
        <h3 className="text-base font-bold text-white line-clamp-1 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-mesclar-muted mt-0.5">{author}</p>
      </div>

      {/* Avaliação em Estrelas */}
      <div className="relative z-10 flex items-center justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
        <span className="ml-1 text-xs font-bold text-white">{rating}</span>
      </div>

      {/* Métricas em Colunas (Páginas, Avaliações, Leitores) */}
      <div className="relative z-10 grid grid-cols-3 gap-2 w-full py-3 my-1 border-y border-white/10 text-center">
        {stats.map((st, i) => (
          <div key={i}>
            <p className="text-sm font-extrabold text-white">{st.value}</p>
            <p className="text-[10px] font-medium text-mesclar-muted">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Descrição Sinopse */}
      <p className="relative z-10 text-[11px] leading-relaxed text-white/70 line-clamp-3 mt-3 mb-5 px-1">
        {description}
      </p>

      {/* Botão de Ação Primário Estilo Dourado Mesclar */}
      <Link href={actionHref} className="relative z-10 w-full mt-auto">
        <Button
          variant="gold"
          size="md"
          className="w-full font-bold shadow-lg shadow-mesclar-gold/20"
          rightIcon={ArrowRight}
        >
          {actionText}
        </Button>
      </Link>
    </div>
  );
}

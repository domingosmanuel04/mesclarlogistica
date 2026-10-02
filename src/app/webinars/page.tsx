import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import {
  Video,
  ExternalLink,
  Calendar,
  User,
  PlusCircle,
  Share2,
} from "lucide-react";
import { getWebinarsWithInitialSeed } from "@/lib/webinars-seed";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Webinars e Lives Transmissões Online | Academia Mesclar Logística",
  description:
    "Aceda a webinars, palestras online e masterclasses técnicas ministradas por profissionais especializados em Logística, Compras e Supply Chain.",
};

export default async function WebinarsPage() {
  const webinars = await getWebinarsWithInitialSeed();

  return (
    <div className="min-h-screen bg-gradient-to-b from-mesclar-cream/40 via-white to-mesclar-cream/20">
      <PageHero
        eyebrow="Academia & Conhecimento"
        title="Webinars e Lives Transmissões Online"
        description="Participe de sessões online, debates práticos e conferências ministradas por especialistas e profissionais certificados da cadeia logística."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Barra superior de acções */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-mesclar-border/70 pb-6">
          <div>
            <span className="inline-flex items-center rounded-full border border-mesclar-gold/30 bg-mesclar-cream px-3 py-1 text-xs font-semibold text-mesclar-gold-dark">
              Sessões e Palestras Online
            </span>
            <h2 className="mt-2 text-2xl font-black text-mesclar-black tracking-tight sm:text-3xl">
              Webinars em Destaque
            </h2>
            <p className="mt-1 text-xs text-mesclar-muted">
              {webinars.length} {webinars.length === 1 ? "webinar disponível" : "webinars disponíveis"} para visualização e inscrição imediata.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/profissional/webinars">
              <Button variant="gold" size="md" leftIcon={PlusCircle} className="font-bold shadow-md">
                Publicar Meu Webinar
              </Button>
            </Link>
          </div>
        </div>

        {/* Grid de Webinars */}
        {webinars.length === 0 ? (
          <div className="surface-card p-16 text-center rounded-3xl border border-mesclar-border shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mesclar-cream text-mesclar-gold-dark shadow-sm">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-mesclar-black">Nenhum webinar agendado no momento</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-mesclar-muted leading-relaxed">
              Novas conferências e masterclasses serão anunciadas em breve. Se é um profissional da área, partilhe o seu conhecimento connosco!
            </p>
            <div className="mt-6">
              <Link href="/profissional/webinars">
                <Button variant="gold" leftIcon={PlusCircle}>
                  Criar o Primeiro Webinar
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {webinars.map((item) => {
              const formattedDate = item.eventDate
                ? new Date(item.eventDate).toLocaleDateString("pt-AO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              const isUpcoming = item.eventDate ? new Date(item.eventDate) > new Date() : false;

              return (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-mesclar-border/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mesclar-gold/50 hover:shadow-xl"
                >
                  {/* Banner do Webinar */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-mesclar-cream">
                    <Image
                      src={item.bannerUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized={item.bannerUrl.startsWith("/api/")}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mesclar-black/80 via-mesclar-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-mesclar-black/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
                        <span className={`h-2 w-2 rounded-full ${isUpcoming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                        {isUpcoming ? "Próxima Sessão" : "Disponível Online"}
                      </span>
                    </div>

                    {/* Formatted Date if available */}
                    {formattedDate && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-white/95">
                        <Calendar className="h-3.5 w-3.5 text-mesclar-gold-light shrink-0" />
                        <span className="truncate">{formattedDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Corpo do Cartão */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Palestrante / Instrutor */}
                    {(item.speaker || item.seller?.user.name) && (
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-mesclar-gold-dark">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {item.speaker || item.seller?.user.name}
                        </span>
                      </div>
                    )}

                    {/* Título do Webinar */}
                    <h3 className="text-lg font-bold text-mesclar-black leading-snug tracking-tight group-hover:text-mesclar-gold-dark transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Descrição */}
                    <p className="mt-3 flex-1 text-xs text-mesclar-muted leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Ações: Aceder ao Webinar e Partilhar */}
                    <div className="mt-6 flex items-center gap-2 border-t border-mesclar-border/60 pt-4">
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="gold"
                          size="sm"
                          rightIcon={ExternalLink}
                          className="w-full font-bold shadow-sm"
                        >
                          Aceder ao Webinar
                        </Button>
                      </a>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Veja este webinar na Mesclar Logística: ${item.title} - ${item.linkUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-mesclar-border bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-sm"
                        title="Partilhar no WhatsApp"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

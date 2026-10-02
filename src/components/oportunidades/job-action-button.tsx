"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, FileImage, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { LinkedInIcon } from "@/components/icons/linkedin-icon";
import type { JobLinkType } from "@prisma/client";

interface JobActionButtonProps {
  job: {
    id: string;
    title: string;
    company: string;
    linkType: JobLinkType | string;
    linkUrl: string;
    bannerUrl?: string | null;
  };
}

export function JobActionButton({ job }: JobActionButtonProps) {
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  const linkType = job.linkType || "WHATSAPP";
  const linkUrl = job.linkUrl?.trim() || "";

  // 1. LINKEDIN
  if (linkType === "LINKEDIN") {
    const href = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button variant="gold" size="sm" leftIcon={LinkedInIcon} className="font-bold">
          Candidatar-se no LinkedIn
        </Button>
      </a>
    );
  }

  // 2. SITE DA EMPRESA
  if (linkType === "WEBSITE") {
    const href = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button variant="gold" size="sm" leftIcon={Globe} className="font-bold">
          Candidatar-se no Site
        </Button>
      </a>
    );
  }

  // 3. BANNER / CARTAZ
  if (linkType === "BANNER") {
    const bannerSrc = job.bannerUrl || linkUrl || "/covers/supply-chain.jpg";
    return (
      <>
        <Button
          variant="gold"
          size="sm"
          leftIcon={FileImage}
          className="font-bold"
          onClick={() => setBannerModalOpen(true)}
        >
          Ver Cartaz da Vaga
        </Button>

        {bannerModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setBannerModalOpen(false)}
          >
            <div
              className="relative max-h-[90vh] max-w-2xl w-full overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do modal */}
              <div className="flex items-center justify-between border-b border-mesclar-border px-6 py-4 bg-mesclar-surface">
                <div>
                  <h3 className="font-bold text-mesclar-black">{job.title}</h3>
                  <p className="text-xs text-mesclar-muted">{job.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="rounded-full p-2 text-mesclar-muted hover:bg-black/5 hover:text-mesclar-black transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Imagem do Cartaz */}
              <div className="relative aspect-[4/3] w-full bg-mesclar-black overflow-auto max-h-[65vh]">
                <Image
                  src={bannerSrc}
                  alt={`Cartaz da vaga ${job.title}`}
                  fill
                  className="object-contain"
                  unoptimized={bannerSrc.startsWith("/api/")}
                />
              </div>

              {/* Rodapé com botão de abrir em nova aba */}
              <div className="flex items-center justify-between border-t border-mesclar-border px-6 py-3.5 bg-white">
                <span className="text-xs text-mesclar-muted">Cartaz oficial da oportunidade</span>
                <a href={bannerSrc} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" rightIcon={ExternalLink}>
                    Abrir em tela cheia
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 4. WHATSAPP (PADRÃO)
  let waHref = "";
  if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
    waHref = linkUrl;
  } else {
    // Normalizar telefone ou usar número padrão
    const cleanPhone = linkUrl.replace(/\D/g, "") || "244921522885";
    const textMsg = encodeURIComponent(
      `Olá, tenho interesse em candidatar-me à vaga de ${job.title} anunciada na Mesclar.`
    );
    waHref = `https://wa.me/${cleanPhone}?text=${textMsg}`;
  }

  return (
    <a href={waHref} target="_blank" rel="noopener noreferrer">
      <Button variant="gold" size="sm" leftIcon={WhatsAppIcon} className="font-bold">
        Candidatar-se
      </Button>
    </a>
  );
}

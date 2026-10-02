"use client";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

const WHATSAPP_NUMBER = "244921522885";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Gostaria de saber mais sobre a Mesclar Logística | Procurement."
);

export function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-mesclar-black text-mesclar-gold shadow-[0_8px_28px_-4px_rgba(201,162,39,0.45)] ring-1 ring-mesclar-gold/50 transition-transform duration-200 hover:scale-110 hover:bg-mesclar-gold hover:text-mesclar-black hover:shadow-[0_12px_32px_-4px_rgba(201,162,39,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mesclar-gold sm:bottom-8 sm:right-8"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-mesclar-gold/30 [animation-duration:2.5s]" />
      <WhatsAppIcon className="relative h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-mesclar-black px-3 py-1.5 text-xs font-medium text-mesclar-gold-light opacity-0 shadow-lg ring-1 ring-mesclar-gold/30 transition-opacity group-hover:opacity-100 sm:block">
        Fale connosco
      </span>
    </a>
  );
}

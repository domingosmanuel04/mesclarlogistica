import Link from "next/link";
import { Logo } from "./logo";
import { Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { PublishBookButton } from "@/components/auth/publish-book-button";

const platform = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/ebooks", label: "eBooks" },
  { href: "/livros-fisicos", label: "Livros físicos" },
  { href: "/formacao", label: "Formação" },
  { href: "/servicos", label: "Serviços" },
  { href: "/autores", label: "Profissionais do sector" },
];

const company = [
  { href: "/contactos", label: "Contactos" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
];

const professionals = [
  { href: "/profissional", label: "Área profissional" },
  { href: "/profissional/adicionar-livro", label: "Publicar livro" },
];

export function Footer() {
  return (
    <footer className="relative mt-8 bg-mesclar-black text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mesclar-gold to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              Conhecimento especializado para transformar a cadeia logística.
            </p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-mesclar-gold-light/90">
              Mesclar Logística | Procurement
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ebooks">
                <Button variant="gold" size="sm" leftIcon={BookOpen}>
                  Explorar eBooks
                </Button>
              </Link>
              <PublishBookButton
                size="sm"
                variant="outline"
                className="border-white/25 text-white hover:bg-white hover:text-mesclar-black"
              />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-mesclar-gold">
                Plataforma
              </h3>
              <ul className="mt-5 space-y-3">
                {platform.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/65 transition hover:text-mesclar-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-mesclar-gold">
                Empresa
              </h3>
              <ul className="mt-5 space-y-3">
                {company.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/65 transition hover:text-mesclar-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-mesclar-gold">
                Profissionais e contacto
              </h3>
              <ul className="mt-5 space-y-3">
                {professionals.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/65 transition hover:text-mesclar-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-3 text-sm text-white/65">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-mesclar-gold" />
                  suporte@mesclarlogistica.com
                </li>
                <li>
                  <a
                    href="https://wa.me/244921522885"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 transition hover:text-mesclar-gold-light"
                  >
                    <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                    +244 921 522 885
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Mesclar Logística | Procurement</p>
          <a
            href="https://liceatlantico.ao"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white/80"
          >
            Propriedade de Licenciados do Atlantico
          </a>
        </div>
      </div>
    </footer>
  );
}

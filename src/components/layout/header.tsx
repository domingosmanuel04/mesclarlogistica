"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  LogIn,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  BookMarked,
  FileText,
  Building2,
  Briefcase,
  Calculator,
  GraduationCap,
  Video,
  Info,
  Wrench,
} from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { PublishBookButton } from "@/components/auth/publish-book-button";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { useI18n } from "@/contexts/i18n-context";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href === "/academia" && pathname.startsWith("/formacao"));

  return (
    <Link
      href={href}
      className={cn(
        "relative px-1 py-2 text-[13px] font-medium transition-colors",
        active ? "text-white font-semibold" : "text-white/80 hover:text-white"
      )}
    >
      {label}
      {active && (
        <span className="absolute -bottom-0.5 left-0 right-0 mx-auto h-0.5 w-full max-w-[24px] rounded-full bg-mesclar-gold" />
      )}
    </Link>
  );
}

function ConhecimentoDropdown() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active =
    pathname === "/conhecimento" ||
    pathname === "/ebooks" ||
    pathname === "/livros-fisicos" ||
    pathname.startsWith("/artigos");

  const items = [
    {
      href: "/ebooks",
      label: "E-books Técnicos",
      desc: "Download digital imediato",
      icon: BookOpen,
    },
    {
      href: "/artigos",
      label: "Artigos Especializados",
      desc: "Publicações e análises técnicas",
      icon: FileText,
    },
    {
      href: "/livros-fisicos",
      label: "Livros Físicos",
      desc: "Entrega ou levantamento em Luanda",
      icon: BookMarked,
    },
  ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center gap-1 px-1 py-2 text-[13px] font-medium transition-colors",
          active || open ? "text-white font-semibold" : "text-white/80 hover:text-white"
        )}
      >
        Conhecimento
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform text-white/70",
            open && "rotate-180 text-mesclar-gold"
          )}
        />
        {active && (
          <span className="absolute -bottom-0.5 left-0 right-0 mx-auto h-0.5 w-full max-w-[24px] rounded-full bg-mesclar-gold" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 min-w-[260px] pt-2 animate-in fade-in duration-150"
        >
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#121212]/95 py-2 shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-2.5 transition hover:bg-white/10",
                    isActive && "bg-white/5 border-l-2 border-mesclar-gold"
                  )}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-mesclar-gold drop-shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/60">{item.desc}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EntidadesDropdown() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active =
    pathname.startsWith("/sobre") ||
    pathname.startsWith("/servicos") ||
    pathname.startsWith("/oportunidades") ||
    pathname.startsWith("/ferramentas");

  const items = [
    {
      href: "/sobre",
      label: "Sobre a Mesclar",
      desc: "Conheça a história, visão e ecossistema da plataforma",
      icon: Info,
    },
    {
      href: "/servicos",
      label: "Serviços & Consultoria",
      desc: "Soluções corporativas, procurement e logística",
      icon: Wrench,
    },
    {
      href: "/oportunidades",
      label: "Oportunidades",
      desc: "Vagas de emprego, RFQ e cotações",
      icon: Briefcase,
    },
    {
      href: "/ferramentas",
      label: "Ferramentas",
      desc: "Calculadoras, modelos e recursos técnicos",
      icon: Calculator,
    },
  ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center gap-1 px-1 py-2 text-[13px] font-medium transition-colors",
          active || open ? "text-white font-semibold" : "text-white/80 hover:text-white"
        )}
      >
        Entidade
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform text-white/70",
            open && "rotate-180 text-mesclar-gold"
          )}
        />
        {active && (
          <span className="absolute -bottom-0.5 left-0 right-0 mx-auto h-0.5 w-full max-w-[24px] rounded-full bg-mesclar-gold" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 min-w-[280px] pt-2 animate-in fade-in duration-150"
        >
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#121212]/95 py-2 shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-2.5 transition hover:bg-white/10",
                    isActive && "bg-white/5 border-l-2 border-mesclar-gold"
                  )}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-mesclar-gold drop-shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/60">{item.desc}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AcademiaDropdown() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active =
    pathname === "/academia" ||
    pathname.startsWith("/formacao") ||
    pathname.startsWith("/webinars");

  const items = [
    {
      href: "/academia",
      label: "Cursos e Formações",
      desc: "Capacitações práticas e certificações profissionais",
      icon: GraduationCap,
    },
    {
      href: "/webinars",
      label: "Webinars e Lives",
      desc: "Transmissões online e palestras ao vivo",
      icon: Video,
    },
  ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center gap-1 px-1 py-2 text-[13px] font-medium transition-colors",
          active || open ? "text-white font-semibold" : "text-white/80 hover:text-white"
        )}
      >
        Academia
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform text-white/70",
            open && "rotate-180 text-mesclar-gold"
          )}
        />
        {active && (
          <span className="absolute -bottom-0.5 left-0 right-0 mx-auto h-0.5 w-full max-w-[24px] rounded-full bg-mesclar-gold" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 min-w-[280px] pt-2 animate-in fade-in duration-150"
        >
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#121212]/95 py-2 shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-2.5 transition hover:bg-white/10",
                    isActive && "bg-white/5 border-l-2 border-mesclar-gold"
                  )}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-mesclar-gold drop-shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/60">{item.desc}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [academiaOpen, setAcademiaOpen] = useState(false);
  const [empresasOpen, setEmpresasOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setBooksOpen(false);
    setAcademiaOpen(false);
    setEmpresasOpen(false);
  }, [pathname]);

  const accountHref = user?.role === "ADMIN" ? "/admin" : "/profissional";

  const bookLinks = [
    { href: "/ebooks", label: "E-books Técnicos" },
    { href: "/artigos", label: "Artigos Especializados" },
    { href: "/livros-fisicos", label: "Livros Físicos" },
  ];

  const academiaLinks = [
    { href: "/academia", label: "Cursos e Formações" },
    { href: "/webinars", label: "Webinars e Lives" },
  ];

  const companyLinks = [
    { href: "/sobre", label: "Sobre a Mesclar" },
    { href: "/servicos", label: "Serviços & Consultoria" },
    { href: "/oportunidades", label: "Oportunidades" },
    { href: "/ferramentas", label: "Ferramentas" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-mesclar-black/95 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-8">
        {/* Logo in light/dark-mode variant with white text and gold accent */}
        <Logo variant="light" />

        {/* Desktop Navigation Links - Grandes Áreas da Plataforma */}
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Principal">
          <NavLink href="/" label={t("home")} />
          <EntidadesDropdown />
          <ConhecimentoDropdown />
          <NavLink href="/profissionais" label="Profissionais" />
          <AcademiaDropdown />
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && <NotificationsBell dark />}

          {isAuthenticated ? (
            <>
              <Link href={accountHref}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-white hover:bg-white/10 hover:text-white"
                >
                  {user?.photoUrl ? (
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1.5 ring-mesclar-gold/70 shadow-sm bg-mesclar-black">
                      <Image
                        src={user.photoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={user.photoUrl.startsWith("/api/")}
                      />
                    </div>
                  ) : (
                    <LayoutDashboard className="h-4 w-4 text-mesclar-gold" />
                  )}
                  <span>{user?.name?.split(" ")[0] ?? "Conta"}</span>
                </Button>
              </Link>

              <Link href="/profissional/perfil-profissional">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={FileText}
                  className="font-bold"
                >
                  Criar Currículo
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={LogOut}
                onClick={logout}
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/entrar">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={LogIn}
                  className="text-white hover:bg-white/10 hover:text-white font-medium"
                >
                  Entrar
                </Button>
              </Link>

              <Link href="/profissional/perfil-profissional">
                <Button variant="gold" size="sm" leftIcon={FileText} className="font-bold">
                  Criar Currículo
                </Button>
              </Link>

              <PublishBookButton />
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-white/10 bg-[#0E0E0E] px-4 py-5 md:hidden animate-in fade-in">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Início
            </Link>

            <div className="rounded-xl">
              <button
                type="button"
                onClick={() => setEmpresasOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
              >
                <span>Entidade</span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform text-white/60", empresasOpen && "rotate-180 text-mesclar-gold")}
                />
              </button>
              {empresasOpen && (
                <div className="mb-1 ml-3 space-y-0.5 border-l border-white/20 pl-3">
                  {companyLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl">
              <button
                type="button"
                onClick={() => setBooksOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
              >
                <span>Conhecimento</span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform text-white/60", booksOpen && "rotate-180 text-mesclar-gold")}
                />
              </button>
              {booksOpen && (
                <div className="mb-1 ml-3 space-y-0.5 border-l border-white/20 pl-3">
                  {bookLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/profissionais"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Profissionais
            </Link>

            <div className="rounded-xl">
              <button
                type="button"
                onClick={() => setAcademiaOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
              >
                <span>Academia</span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform text-white/60", academiaOpen && "rotate-180 text-mesclar-gold")}
                />
              </button>
              {academiaOpen && (
                <div className="mb-1 ml-3 space-y-0.5 border-l border-white/20 pl-3">
                  {academiaLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <hr className="my-3 border-white/10" />

            <div className="mt-2 grid gap-2">
              {isAuthenticated ? (
                <>
                  <Link href={accountHref} onClick={() => setOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-2.5 border-white/20 bg-white/10 text-white hover:bg-white/20"
                      size="sm"
                    >
                      {user?.photoUrl ? (
                        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1.5 ring-mesclar-gold/70 shadow-sm bg-mesclar-black">
                          <Image
                            src={user.photoUrl}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized={user.photoUrl.startsWith("/api/")}
                          />
                        </div>
                      ) : (
                        <LayoutDashboard className="h-4 w-4 text-mesclar-gold" />
                      )}
                      Minha conta ({user?.name?.split(" ")[0]})
                    </Button>
                  </Link>

                  <Link href="/profissional/perfil-profissional" onClick={() => setOpen(false)}>
                    <Button
                      variant="gold"
                      className="w-full font-bold"
                      size="sm"
                      leftIcon={FileText}
                    >
                      Criar Currículo
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    size="sm"
                    leftIcon={LogOut}
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/entrar" onClick={() => setOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 font-medium"
                      size="sm"
                      leftIcon={LogIn}
                    >
                      Entrar
                    </Button>
                  </Link>

                  <Link href="/profissional/perfil-profissional" onClick={() => setOpen(false)}>
                    <Button variant="gold" className="w-full font-bold" size="sm" leftIcon={FileText}>
                      Criar Currículo
                    </Button>
                  </Link>

                  <PublishBookButton fullWidth />
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

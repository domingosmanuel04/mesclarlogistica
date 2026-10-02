"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Download,
  BookMarked,
  User,
  KeyRound,
  LogOut,
  PlusCircle,
  ClipboardList,
  FileCheck,
  TrendingUp,
  Wallet,
  Users,
  Store,
  Library,
  Clock,
  CreditCard,
  Tags,
  MapPin,
  Settings,
  Home,
  GraduationCap,
  PenTool,
  FileText,
  Briefcase,
  Building2,
  Search,
  Menu,
  X,
  ChevronDown,
  Shield,
  HelpCircle,
  Video,
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: React.ReactNode;
  roleLabel?: string;
  rightSidebar?: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  children,
  roleLabel,
  rightSidebar,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (pathname.startsWith("/admin")) {
        router.push(`/admin/livros?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(`/profissional/livros?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  }

  const userGreeting = user?.name ? `Olá, ${user.name}` : "Olá";
  const roleDisplay =
    roleLabel && roleLabel !== "Profissional"
      ? roleLabel
      : user?.role === "ADMIN"
      ? "Administrador"
      : userGreeting;

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-sans antialiased transition-colors duration-200",
        isDark ? "dark bg-[#060c18] text-white" : "bg-[#F0F2F6] text-mesclar-black"
      )}
    >
      {/* Container Geral Estilo SaaS Moderno com Bordas e Fundo Suave */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* ======================================================== */}
        {/* BARRA LATERAL ESQUERDA (DESKTOP)                         */}
        {/* ======================================================== */}
        <aside className="hidden lg:flex lg:w-64 flex-col justify-between shrink-0 bg-white dark:bg-[#0A192F] border-r border-[#E2E6EE] dark:border-[#1e3a5f] select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Logótipo Mesclar Oficial */}
            <div className="px-6 py-6 border-b border-[#F0F2F6] dark:border-[#1e3a5f]">
              <Logo variant={isDark ? "light" : "dark"} />
            </div>

            {/* Lista Principal de Menus */}
            <nav className="p-4 space-y-1.5 flex-1">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted/80 dark:text-gray-300">
                Menu Principal
              </p>

              {nav.map((item) => {
                const Icon = item.icon ?? LayoutDashboard;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200",
                      active
                        ? "bg-mesclar-black dark:bg-[#0E223F] text-mesclar-gold dark:text-mesclar-gold-light border border-transparent dark:border-mesclar-gold/30 shadow-sm"
                        : "text-gray-600 dark:text-white hover:text-mesclar-black dark:hover:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#0E223F]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-105 drop-shadow-xs",
                        active ? "text-mesclar-gold dark:text-mesclar-gold-light" : "text-gray-400 dark:text-gray-300 group-hover:text-mesclar-black dark:group-hover:text-white"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Secção Inferior (Configurações, Suporte, Tema, Sair) */}
            <div className="p-4 border-t border-[#F0F2F6] dark:border-[#1e3a5f] space-y-1 bg-[#FAFAFC] dark:bg-[#071324] transition-colors">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted/80 dark:text-gray-400">
                Sistema
              </p>

              {/* Botão de Alternar Modo Claro / Escuro */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-mesclar-black dark:hover:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#151c2c] transition-all"
                title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              >
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Sun className="h-4 w-4 text-mesclar-gold" />
                  ) : (
                    <Moon className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
                </div>
                <span
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                    isDark ? "bg-mesclar-gold" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      isDark ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </span>
              </button>

              <Link
                href={user?.role === "ADMIN" ? "/admin/configuracoes" : "/profissional/perfil"}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-mesclar-black dark:hover:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#151c2c] transition-all",
                  pathname.includes("configuracoes") || pathname === "/profissional/perfil"
                    ? "bg-mesclar-black dark:bg-[#192236] text-mesclar-gold dark:text-mesclar-gold-light"
                    : ""
                )}
              >
                <Settings className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <span>Configurações</span>
              </Link>

              <Link
                href="/"
                className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-mesclar-black dark:hover:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#151c2c] transition-all"
              >
                <Home className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <span>Ir à Plataforma</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-all text-left"
              >
                <LogOut className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* BARRA LATERAL MÓVEL (DRAWER RESPONSIVO)                  */}
        {/* ======================================================== */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0A192F] h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto transition-colors">
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F6] dark:border-[#1e3a5f]">
                  <Logo variant={isDark ? "light" : "dark"} />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="p-4 space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-muted dark:text-gray-300">
                    Navegação
                  </p>
                  {nav.map((item) => {
                    const Icon = item.icon ?? LayoutDashboard;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                          active
                            ? "bg-mesclar-black dark:bg-[#0E223F] text-mesclar-gold dark:text-mesclar-gold-light border border-transparent dark:border-mesclar-gold/30 shadow-sm"
                            : "text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#0E223F] hover:text-mesclar-black dark:hover:text-white"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-mesclar-gold dark:text-mesclar-gold-light" : "text-gray-400 dark:text-gray-300")} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-[#F0F2F6] dark:border-[#1e3a5f] space-y-2 bg-[#FAFAFC] dark:bg-[#071324]">
                {/* Botão de Alternar Modo no Drawer Mobile */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-white hover:text-mesclar-black dark:hover:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#0E223F] transition-all"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Sun className="h-4 w-4 text-mesclar-gold" />
                    ) : (
                      <Moon className="h-4 w-4 text-gray-400" />
                    )}
                    <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
                  </div>
                  <span
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                      isDark ? "bg-mesclar-gold" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                        isDark ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </span>
                </button>

                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#0E223F]"
                >
                  <Home className="h-4 w-4 text-gray-400" />
                  <span>Ir à Plataforma</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Terminar Sessão</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ÁREA CENTRAL E CABEÇALHO SUPERIOR                        */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* BARRA SUPERIOR (TOPBAR) */}
          <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0A192F]/95 backdrop-blur-md border-b border-[#E2E6EE] dark:border-[#1e3a5f] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm transition-colors">
            {/* Lado Esquerdo: Mobile Trigger & Barra de Pesquisa */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:text-mesclar-black dark:hover:text-white transition"
                aria-label="Abrir Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <form onSubmit={handleSearch} className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar livros, artigos, formações ou pedidos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F1F3F7] dark:bg-[#0A192F] hover:bg-[#E9ECF2] dark:hover:bg-[#0E223F] focus:bg-white dark:focus:bg-[#0A192F] text-xs font-medium rounded-2xl border border-transparent dark:border-[#1e3a5f] focus:border-mesclar-gold/50 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-400 text-gray-900 dark:text-white"
                />
              </form>
            </div>

            {/* Lado Direito: Ações Rápidas, Notificações, Tema e Perfil de Utilizador */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Botão de Tema Light / Dark Mode no Topbar */}
              <button
                type="button"
                onClick={toggleTheme}
                className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-[#1e3a5f] bg-gray-100 dark:bg-[#0A192F] hover:bg-gray-200/80 dark:hover:bg-[#0E223F] text-gray-600 dark:text-mesclar-gold transition-all shadow-xs"
                aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
                title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-mesclar-gold transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-gray-600 transition-transform hover:-rotate-12" />
                )}
              </button>

              <NotificationsBell />

              <Link href="/" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" leftIcon={Home} className="text-xs text-gray-600 dark:text-white hover:text-mesclar-black dark:hover:text-white">
                  Ir ao site
                </Button>
              </Link>

              {/* Perfil do Utilizador com Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-2xl hover:bg-[#F3F5F9] dark:hover:bg-[#0E223F] border border-transparent hover:border-gray-200 dark:hover:border-[#1e3a5f] transition-all text-left"
                  >
                    {user.photoUrl ? (
                      <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-mesclar-gold/50 bg-mesclar-black shadow-sm">
                        <Image
                          src={user.photoUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                          unoptimized={user.photoUrl.startsWith("/api/")}
                        />
                      </div>
                    ) : (
                      <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-mesclar-black text-xs font-bold text-mesclar-gold shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="hidden md:block min-w-0 text-left">
                      <p className="truncate text-xs font-bold text-mesclar-black dark:text-white leading-tight">
                        {user.name}
                      </p>
                      <p className="truncate text-[10px] text-mesclar-gold-dark dark:text-mesclar-gold font-semibold">
                        {user.registrationNumber ? `${user.registrationNumber}` : roleDisplay}
                      </p>
                    </div>

                    <ChevronDown className="hidden md:block h-3.5 w-3.5 text-gray-400" />
                  </button>

                  {/* Menu Suspenso */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0A192F] p-2 shadow-2xl border border-[#E2E6EE] dark:border-[#1e3a5f] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-[#1e3a5f]">
                        <p className="text-xs font-bold text-mesclar-black dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-300 truncate">{user.email}</p>
                        {user.registrationNumber && (
                          <div className="mt-1.5 flex items-center justify-between rounded-lg bg-slate-100 dark:bg-[#0E223F] px-2 py-1 border border-slate-200 dark:border-[#1e3a5f]">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-300">ID Registo:</span>
                            <span className="text-xs font-mono font-bold text-mesclar-black dark:text-mesclar-gold">{user.registrationNumber}</span>
                          </div>
                        )}
                        {user.role === "ADMIN" && (
                          <span className="inline-block mt-1.5 rounded-md bg-mesclar-cream dark:bg-[#0E223F] px-2 py-0.5 text-[9px] font-bold text-mesclar-gold-dark dark:text-mesclar-gold-light uppercase tracking-wider">
                            Administrador
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          href={user.role === "ADMIN" ? "/admin/configuracoes" : "/profissional/perfil"}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 dark:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#0E223F] transition"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span>Meu Perfil</span>
                        </Link>
                        <Link
                          href="/"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 dark:text-white hover:bg-[#F3F5F9] dark:hover:bg-[#0E223F] transition"
                        >
                          <Home className="h-4 w-4 text-gray-400" />
                          <span>Página Inicial</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-gray-100 dark:border-[#1e3a5f]">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                        >
                          <LogOut className="h-4 w-4 text-red-500" />
                          <span>Terminar Sessão</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* CABEÇALHO DO CONTEÚDO (BREADCRUMB / TÍTULO DA PÁGINA) */}
          <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mesclar-gold-dark dark:text-mesclar-gold">
                  {roleDisplay}
                </p>
                <h1 className="mt-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-mesclar-black dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-xs sm:text-sm text-mesclar-muted dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL (COM SUPORTE A SIDEBAR LATERAL DIREITA DE DESTAQUE) */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className={cn("grid gap-6", rightSidebar ? "lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
              <div className={cn("space-y-6 min-w-0", rightSidebar ? "lg:col-span-2 xl:col-span-3" : "w-full")}>
                {children}
              </div>

              {/* Coluna Direita Escura de Destaque (Estilo Reference Image) */}
              {rightSidebar && (
                <aside className="lg:col-span-1 shrink-0 space-y-6">
                  {rightSidebar}
                </aside>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="surface-card rounded-3xl p-5 border border-[#E2E6EE] dark:border-[#1e3a5f] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 bg-white dark:bg-[#0A192F]">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mesclar-cream dark:bg-[#0E223F] text-mesclar-gold-dark dark:text-mesclar-gold-light shadow-inner">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold tracking-tight text-mesclar-black dark:text-white truncate">{value}</p>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 truncate">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-mesclar-muted dark:text-gray-300 truncate">{hint}</p>}
      </div>
    </div>
  );
}

export function PanelCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card rounded-3xl overflow-hidden border border-[#E2E6EE] dark:border-[#1e3a5f] shadow-sm bg-white dark:bg-[#0A192F] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#F0F2F6] dark:border-[#1e3a5f] px-6 py-4.5 bg-white dark:bg-[#0A192F] transition-colors">
        <div>
          <h2 className="text-base font-bold text-mesclar-black dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-mesclar-muted dark:text-gray-300 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export const customerNav: NavItem[] = [
  { href: "/profissional", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conta/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/conta/pedidos", label: "Meus pedidos", icon: Package },
  { href: "/conta/ebooks", label: "Meus eBooks", icon: BookOpen },
  { href: "/conta/downloads", label: "Downloads", icon: Download },
  { href: "/conta/livros", label: "Livros comprados", icon: BookMarked },
  { href: "/conta/dados", label: "Dados pessoais", icon: User },
  { href: "/conta/senha", label: "Alterar palavra-passe", icon: KeyRound },
];

export const professionalNav: NavItem[] = [
  { href: "/profissional", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profissional/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/profissional/adicionar-livro", label: "Publicar livro", icon: PlusCircle },
  { href: "/profissional/livros", label: "Meus livros", icon: Library },
  { href: "/profissional/artigos/novo", label: "Criar artigo", icon: PenTool },
  { href: "/profissional/artigos", label: "Meus artigos", icon: FileText },
  { href: "/profissional/formacoes", label: "Formações", icon: GraduationCap },
  { href: "/profissional/webinars", label: "Webinars", icon: Video },
  { href: "/profissional/vagas", label: "Vagas de emprego", icon: Briefcase },
  { href: "/profissional/perfil-profissional", label: "Perfil profissional", icon: User },
  { href: "/profissional/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/profissional/vendas", label: "Vendas", icon: TrendingUp },
  { href: "/profissional/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/conta/ebooks", label: "Meus eBooks", icon: BookOpen },
  { href: "/profissional/perfil", label: "Editar perfil", icon: Settings },
];

export const sellerNav = professionalNav;

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/admin/profissionais", label: "Profissionais", icon: Store },
  { href: "/admin/livros", label: "Livros", icon: Library },
  { href: "/admin/livros-pendentes", label: "Livros pendentes", icon: Clock },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/formacoes", label: "Formações", icon: GraduationCap },
  { href: "/admin/vagas", label: "Vagas", icon: Briefcase },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/perfil", label: "Editar perfil", icon: User },
];

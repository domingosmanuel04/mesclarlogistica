"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-mesclar-black text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Imagem de fundo sobre logística */}
        <Image
          src="/hero-global-routes-map.jpg"
          alt="Logística Mesclar"
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />
        {/* Overlays elegantes com degradê e identidade visual */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-mesclar-black via-mesclar-black/80 to-mesclar-black/60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-mesclar-black/90 via-mesclar-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-mesclar-gold/25 via-transparent to-transparent opacity-60 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.05]" aria-hidden />
        <div
          className="pointer-events-none absolute -right-16 top-20 h-64 w-64 rounded-full bg-mesclar-gold/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mesclar-gold-light">
            Mesclar Logística
          </p>
          <h2 className="mt-6 max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl text-white drop-shadow-sm">
            Conhecimentos que movimentam as práticas sustentáveis da{" "}
            <span className="text-gradient-gold">cadeia logística</span>.
          </h2>
          <ul className="mt-10 space-y-4 text-sm text-white/85">
            {[
              "Aceda a eBooks e livros especializados",
              "Publique conteúdos após aprovação",
              "Acompanhe pedidos e downloads",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mesclar-gold/25 text-mesclar-gold-light">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium text-white/90">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-sm font-medium text-white/70">
          <BookOpen className="h-4 w-4 text-mesclar-gold" />
          <a
            href="https://liceatlantico.ao"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white/90"
          >
            Propriedade de Licenciados do Atlantico
          </a>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-6">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-mesclar-muted">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 text-center text-sm text-mesclar-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  icon: Icon,
  required,
  placeholder,
  numericOnly,
}: {
  label: string;
  name: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  placeholder?: string;
  numericOnly?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (numericOnly || type === "tel") {
      const allowedKeys = [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "Home", "End", " "
      ];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if (!/^[0-9+]$/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <label className="block text-sm font-medium text-mesclar-black dark:text-white space-y-1.5">
      <span>{label}</span>
      <div className="flex items-center rounded-2xl border border-mesclar-border dark:border-[#1e3a5f] bg-white dark:bg-[#071324] shadow-xs overflow-hidden focus-within:border-mesclar-gold focus-within:ring-2 focus-within:ring-mesclar-gold/20 transition-all">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border-r border-mesclar-border/70 dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#0E223F]/60 text-mesclar-gold dark:text-mesclar-gold">
          <Icon className="h-4 w-4" />
        </div>
        <input
          name={name}
          type={isPassword && show ? "text" : type}
          required={required}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent px-3.5 py-2.5 text-xs text-mesclar-black dark:text-white placeholder:text-mesclar-muted focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-mesclar-muted hover:text-mesclar-black dark:hover:text-white transition cursor-pointer"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ocultar" : "Mostrar"}
          >
            {show ? <EyeOff className="h-4 w-4 text-rose-500" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
      const regId = params.get("id");
      setInfo(
        regId
          ? `Conta criada com sucesso! O seu ID de Registo é ${regId}. Entre com o seu ID e palavra-passe.`
          : "Conta criada com sucesso. Entre com o seu ID de registo e palavra-passe."
      );
    }
    const msg = params.get("msg");
    if (msg) setInfo(msg);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await login(fd.get("email") as string, fd.get("password") as string);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Erro ao entrar.");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      router.push(redirect);
      router.refresh();
      return;
    }
    const me = await fetch("/api/account").then((r) => r.json()).catch(() => null);
    if (me?.role === "ADMIN") router.push("/admin");
    else router.push("/profissional");
    router.refresh();
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Aceda à sua conta Mesclar Logística | Procurement."
      footer={
        <>
          Não tem conta?{" "}
          <Link href="/criar-conta" className="font-semibold text-mesclar-gold-dark hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {info && (
          <p className="rounded-xl border border-mesclar-gold/30 bg-mesclar-cream/60 px-4 py-3 text-sm text-mesclar-gray">
            {info}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Field
          label="ID de Registo"
          name="email"
          type="text"
          icon={IdCard}
          required
          placeholder="MESC.XX0100"
        />
        <Field label="Palavra-passe" name="password" type="password" icon={Lock} required />
        <div className="flex justify-end">
          <Link href="/esqueci-senha" className="text-sm text-mesclar-gold-dark hover:underline">
            Esqueci minha palavra-passe
          </Link>
        </div>
        <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading} leftIcon={LogIn}>
          {loading ? "A entrar..." : "Entrar"}
        </Button>
        <p className="text-center text-[11px] text-mesclar-muted">
          Demo Admin: MESC.AD0100 (ou admin@mesclar.ao) / admin123 · Profissional: MESC.ME0101 / vendedor123
        </p>
      </form>
    </AuthShell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registeredModal, setRegisteredModal] = useState<{ id: string; email: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function copyId() {
    if (registeredModal?.id) {
      navigator.clipboard.writeText(registeredModal.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!acceptedTerms) {
      setError("Deve marcar a caixa de seleção para aceitar os Termos e a Política de Privacidade.");
      setLoading(false);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }
    if (password !== fd.get("confirmPassword")) {
      setError("As palavras-passe não coincidem.");
      setLoading(false);
      return;
    }
    const userEmail = (fd.get("email") as string).trim();
    const userName = (fd.get("name") as string).trim();
    const res = await register({
      name: userName,
      email: userEmail,
      phone: (fd.get("phone") as string) || undefined,
      whatsapp: (fd.get("whatsapp") as string) || undefined,
      password,
      role: "SELLER",
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Erro ao registar.");
      return;
    }
    if (res.registrationNumber) {
      setRegisteredModal({
        id: res.registrationNumber,
        email: userEmail,
        name: userName,
      });
    } else {
      router.push("/profissional");
      router.refresh();
    }
  }

  return (
    <>
      {/* ======================================================== */}
      {/* MODAL DE CONCLUSÃO DE REGISTO COM O ID E AVISO DE EMAIL   */}
      {/* ======================================================== */}
      {registeredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#0A192F] p-6 sm:p-8 shadow-2xl border border-mesclar-gold/30 animate-in zoom-in-95 duration-200 text-center">
            {/* Barra decorativa dourada no topo */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-mesclar-gold via-mesclar-gold-light to-mesclar-gold" />

            <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-mesclar-gold/20 text-mesclar-gold-dark shadow-inner">
              <IdCard className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-xl font-extrabold text-mesclar-black dark:text-white sm:text-2xl">
              Conta Criada com Sucesso!
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
              Parabéns, <strong>{registeredModal.name}</strong>! O seu perfil de profissional foi ativado na plataforma.
            </p>

            {/* Cartão de Destaque do ID */}
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-[#0E223F] p-4 border border-slate-200/90 dark:border-[#1e3a5f] text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                O Seu ID de Registo Para Login
              </span>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black tracking-wider text-mesclar-black dark:text-white bg-white dark:bg-[#0A192F] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#1e3a5f] shadow-xs">
                  {registeredModal.id}
                </span>
                <button
                  type="button"
                  onClick={copyId}
                  title="Copiar ID de Registo"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 dark:border-[#1e3a5f] bg-white dark:bg-[#0A192F] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1e3a5f] transition cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              {copied && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  ID copiado para a área de transferência!
                </p>
              )}
            </div>

            {/* Aviso de Email Enviado */}
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 p-3 text-left">
              <Mail className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-900 dark:text-blue-200 leading-snug">
                O seu ID de registo e os detalhes de acesso foram também enviados para o seu e-mail: <strong className="font-semibold">{registeredModal.email}</strong>.
              </p>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Atenção:</strong> Utilize sempre este ID para iniciar sessão na sua conta Mesclar.
            </p>

            {/* Botões de Ação */}
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                variant="gold"
                size="lg"
                className="w-full font-bold shadow-lg shadow-mesclar-gold/25"
                onClick={() => {
                  router.push("/profissional");
                  router.refresh();
                }}
              >
                Aceder ao Ambiente de Trabalho
              </Button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/entrar?registered=1&id=${registeredModal.id}`);
                }}
                className="text-xs font-semibold text-mesclar-muted dark:text-slate-400 hover:text-mesclar-gold-dark dark:hover:text-mesclar-gold transition py-1"
              >
                Ir para a Página de Login
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthShell
        title="Criar conta"
        subtitle="Registe-se como profissional para publicar livros, escrever artigos e divulgar o seu perfil."
        footer={
          <>
            Já tem conta?{" "}
            <Link href="/entrar" className="font-semibold text-mesclar-gold-dark hover:underline">
              Entrar
            </Link>
          </>
        }
      >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>
        )}
        <Field label="Nome completo" name="name" type="text" icon={User} required placeholder="O seu nome" />
        <Field label="Email" name="email" type="email" icon={Mail} required placeholder="nome@empresa.ao" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone" name="phone" type="tel" icon={Phone} placeholder="+244..." />
          <Field label="WhatsApp" name="whatsapp" type="tel" icon={Phone} placeholder="+244..." />
        </div>
        <Field label="Palavra-passe" name="password" type="password" icon={Lock} required />
        <Field label="Confirmar palavra-passe" name="confirmPassword" type="password" icon={Lock} required />

        {/* Checkbox Obrigatório para Termos e Privacidade */}
        <div className="flex items-start gap-3 rounded-xl border border-mesclar-border dark:border-[#1e3a5f] bg-slate-50/50 dark:bg-[#0E223F]/50 p-3.5 shadow-xs">
          <input
            type="checkbox"
            id="acceptTermsCheck"
            required
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4.5 w-4.5 rounded border-mesclar-border text-mesclar-gold focus:ring-mesclar-gold cursor-pointer shrink-0"
          />
          <label htmlFor="acceptTermsCheck" className="text-xs leading-relaxed text-mesclar-muted dark:text-slate-300 cursor-pointer select-none">
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="font-bold text-mesclar-black dark:text-white underline hover:text-mesclar-gold-dark">
              Termos e Condições
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="font-bold text-mesclar-black dark:text-white underline hover:text-mesclar-gold-dark">
              Política de Privacidade
            </Link>{" "}
            da plataforma MESCLAR LOGÍSTICA. <span className="text-rose-500 font-bold">*</span>
          </label>
        </div>

        <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading} leftIcon={UserPlus}>
          {loading ? "A criar..." : "Criar conta"}
        </Button>
      </form>
    </AuthShell>
    </>
  );
}

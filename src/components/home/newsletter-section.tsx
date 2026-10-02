"use client";

import { useState } from "react";
import { Bell, BookOpen, Gift, Mail, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const perks = [
  { icon: BookOpen, text: "Lançamentos de eBooks logísticos" },
  { icon: Gift, text: "Acesso antecipado a conteúdos gratuitos" },
  { icon: Bell, text: "Alertas de autores e categorias novas" },
];

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Introduza um email válido.");
      return;
    }
    setStatus("success");
    setMessage("Obrigado! Em breve receberá novidades da Mesclar.");
    setEmail("");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-mesclar-gold/20 bg-mesclar-black text-white shadow-[0_24px_80px_-24px_rgba(201,162,39,0.35)]">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.06]" aria-hidden />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mesclar-gold/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-mesclar-gold/10 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mesclar-gold/30 bg-mesclar-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-mesclar-gold-light">
              <Mail className="h-3.5 w-3.5" />
              Newsletter Mesclar
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">
              Fique à frente da{" "}
              <span className="text-gradient-gold">cadeia logística</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
              Receba no seu email lançamentos, guias práticos e oportunidades de download
              gratuito — só conteúdo relevante para logística, procurement e supply chain.
            </p>

            <ul className="mt-8 space-y-4">
              {perks.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-mesclar-gold-light ring-1 ring-white/10">
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="pt-1.5 text-sm text-white/80">{item.text}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 flex items-center gap-2 text-xs text-white/45">
              <Shield className="h-3.5 w-3.5 shrink-0 text-mesclar-gold/80" />
              Sem spam. Cancele quando quiser. Respeitamos a sua privacidade.
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:p-8">
              {status === "success" ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 className="h-14 w-14 text-mesclar-gold-light" strokeWidth={1.5} />
                  <p className="mt-4 text-lg font-semibold">Subscrição registada</p>
                  <p className="mt-2 text-sm text-white/65">{message}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-6 border-white/20 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => setStatus("idle")}
                  >
                    Subscrever outro email
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mesclar-gold/20 text-mesclar-gold-light">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div className="text-left">
                      <p className="font-semibold">Receber novidades</p>
                      <p className="text-xs text-white/50">1 email por semana, no máximo</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block text-left text-sm font-medium text-white/80">
                      Email profissional
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        placeholder="nome@empresa.ao"
                        className={cn(
                          "mt-2 w-full rounded-xl border bg-black/30 px-4 py-3.5 text-sm text-white placeholder:text-white/35 transition focus:outline-none focus:ring-2",
                          status === "error"
                            ? "border-red-400/60 focus:ring-red-400/25"
                            : "border-white/15 focus:border-mesclar-gold/50 focus:ring-mesclar-gold/20"
                        )}
                        autoComplete="email"
                      />
                    </label>

                    {status === "error" && (
                      <p className="text-left text-xs text-red-300" role="alert">
                        {message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full"
                      leftIcon={Mail}
                    >
                      Subscrever gratuitamente
                    </Button>
                  </form>

                  <p className="mt-4 text-center text-[11px] leading-relaxed text-white/40">
                    Ao subscrever, concorda em receber comunicações da Mesclar Logística.
                    Consulte a nossa{" "}
                    <a href="/privacidade" className="underline hover:text-mesclar-gold-light">
                      política de privacidade
                    </a>
                    .
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

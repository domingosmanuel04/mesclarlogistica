"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    setMsg(json.message || json.error || "Pedido enviado.");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Esqueci minha palavra-passe</h1>
      <p className="mt-2 text-sm text-mesclar-muted">
        Enviamos um link de recuperação para o seu email (em desenvolvimento o link também
        aparece nos logs do servidor).
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        {msg && (
          <p className="rounded-xl border border-mesclar-gold/30 bg-mesclar-cream/50 px-4 py-3 text-sm">
            {msg}
          </p>
        )}
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-mesclar-border px-3 py-2"
          />
        </label>
        <Button type="submit" variant="gold" className="w-full" leftIcon={Mail} disabled={loading}>
          {loading ? "A enviar..." : "Enviar link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-mesclar-muted">
        <Link href="/entrar" className="font-semibold text-mesclar-gold-dark hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}

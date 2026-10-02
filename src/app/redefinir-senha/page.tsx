"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMsg("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(json.error || "Erro ao redefinir.");
      return;
    }
    setMsg("Palavra-passe actualizada. A redirecionar...");
    setTimeout(() => router.push("/entrar"), 1500);
  }

  if (!token) {
    return (
      <p className="text-sm text-mesclar-muted">
        Link inválido.{" "}
        <Link href="/esqueci-senha" className="underline">
          Pedir novo link
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      {msg && (
        <p className="rounded-xl border border-mesclar-gold/30 bg-mesclar-cream/50 px-4 py-3 text-sm">
          {msg}
        </p>
      )}
      <label className="block text-sm font-medium">
        Nova palavra-passe
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>
      <label className="block text-sm font-medium">
        Confirmar
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>
      <Button type="submit" variant="gold" className="w-full" leftIcon={Lock} disabled={loading}>
        {loading ? "A guardar..." : "Redefinir palavra-passe"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Redefinir palavra-passe</h1>
      <p className="mt-2 text-sm text-mesclar-muted">Escolha uma nova palavra-passe segura.</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-mesclar-muted">A carregar...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}

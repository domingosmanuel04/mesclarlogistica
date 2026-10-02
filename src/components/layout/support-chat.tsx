"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";

export function SupportChat() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    subject: "",
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Erro ao enviar.");
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-[89] flex h-12 w-12 items-center justify-center rounded-full bg-mesclar-black text-mesclar-gold shadow-lg transition hover:scale-105 sm:bottom-8 sm:left-8"
        aria-label={t("support")}
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed bottom-24 left-4 z-[95] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-mesclar-border bg-white shadow-2xl sm:bottom-28 sm:left-8">
          <div className="flex items-center justify-between bg-mesclar-black px-4 py-3 text-white">
            <p className="text-sm font-bold">{t("support")} Mesclar</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {done ? (
              <p className="text-sm text-mesclar-muted">
                Mensagem enviada. Responderemos por email em breve.
              </p>
            ) : (
              <form onSubmit={(e) => void submit(e)} className="space-y-2">
                {error && <p className="text-xs text-red-600">{error}</p>}
                <input
                  required
                  placeholder="Nome"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  required
                  placeholder="Assunto"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Mensagem"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <Button type="submit" variant="gold" className="w-full" size="sm" leftIcon={Send} disabled={loading}>
                  {loading ? "..." : t("send")}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

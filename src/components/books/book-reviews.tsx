"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
};

export function BookReviews({ bookId }: { bookId: string }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    void fetch(`/api/books/${bookId}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    load();
  }, [bookId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      setMsg("Entre na conta para avaliar.");
      return;
    }
    const res = await fetch(`/api/books/${bookId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json.error || "Não foi possível guardar a avaliação.");
      return;
    }
    setMsg("Avaliação publicada.");
    setComment("");
    load();
  }

  return (
    <section className="mt-16 border-t border-mesclar-border pt-12">
      <h2 className="text-2xl font-bold">Avaliações</h2>
      {msg && <p className="mt-2 text-sm text-mesclar-gold-dark">{msg}</p>}

      {isAuthenticated && (
        <form onSubmit={(e) => void submit(e)} className="mt-6 max-w-lg space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-0.5"
                aria-label={`${n} estrelas`}
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    n <= rating ? "fill-mesclar-gold text-mesclar-gold" : "text-mesclar-border"
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
            placeholder="Comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" variant="gold" size="sm">
            Publicar avaliação
          </Button>
        </form>
      )}

      <ul className="mt-8 space-y-4">
        {reviews.length === 0 && (
          <li className="text-sm text-mesclar-muted">Ainda sem avaliações.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl border border-mesclar-border/70 p-4">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{r.user.name}</p>
              <span className="text-xs text-mesclar-muted">
                {new Date(r.createdAt).toLocaleDateString("pt-AO")}
              </span>
            </div>
            <div className="mt-1 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "h-3.5 w-3.5",
                    n <= r.rating
                      ? "fill-mesclar-gold text-mesclar-gold"
                      : "text-mesclar-border"
                  )}
                />
              ))}
            </div>
            {r.comment && <p className="mt-2 text-sm text-mesclar-muted">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

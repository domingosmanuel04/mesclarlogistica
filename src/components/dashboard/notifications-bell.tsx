"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationsBell({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  function load() {
    void fetch("/api/library")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => undefined);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function markAll() {
    await fetch("/api/library", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  async function markOne(id: string) {
    await fetch("/api/library", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          dark
            ? "border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            : "border border-mesclar-border bg-white text-mesclar-gray hover:bg-mesclar-cream/50"
        )}
        aria-label="Notificações"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mesclar-gold px-1 text-[10px] font-bold text-mesclar-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-mesclar-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-bold">Notificações</p>
              {unread > 0 && (
                <button type="button" className="text-xs text-mesclar-gold-dark" onClick={() => void markAll()}>
                  Marcar lidas
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-mesclar-muted">Sem notificações</li>
              )}
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link || "#"}
                    onClick={() => {
                      void markOne(n.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "block border-b border-mesclar-border/50 px-4 py-3 hover:bg-mesclar-cream/40",
                      !n.read && "bg-mesclar-cream/30"
                    )}
                  >
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-mesclar-muted">{n.message}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

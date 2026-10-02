"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        // In development, unregister service workers and clear caches to prevent hydration mismatches
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            void reg.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              void caches.delete(key);
            }
          });
        }
        return;
      }

      // In production, register service worker
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.info("[PWA] Service worker registered, scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}

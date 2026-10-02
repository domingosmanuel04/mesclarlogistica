"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dict, t, type DictKey, type Locale } from "@/lib/i18n";

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE = "mesclar-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE) as Locale | null;
      if (saved === "pt" || saved === "en") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE, l);
      document.documentElement.lang = l === "en" ? "en" : "pt";
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: DictKey) => t(locale, key),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t: tr } = useI18n();
  return (
    <label className={className}>
      <span className="sr-only">{tr("language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded-full border border-mesclar-border bg-white px-2 py-1 text-xs font-semibold text-mesclar-gray"
        aria-label={tr("language")}
      >
        <option value="pt">PT</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}

void dict;

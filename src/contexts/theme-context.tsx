"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "mesclar_dashboard_theme";
const PANEL_PREFIXES = ["/profissional", "/vendedor", "/admin", "/conta"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isPanelRoute = PANEL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
      }
    } catch {
      // Storage unavailable
    }
    setMounted(true);
  }, []);

  // O modo dark é estritamente aplicado apenas nas rotas do painel.
  // Na landing page e páginas públicas, o modo dark NUNCA é aplicado.
  useEffect(() => {
    if (!mounted) return;
    if (isPanelRoute && theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mounted, isPanelRoute, theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Storage unavailable
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // isDark só é ativo se estiver montado, dentro de uma rota do painel e com o tema dark ativo
  const isDark = mounted && isPanelRoute && theme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

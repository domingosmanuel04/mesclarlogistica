"use client";

import { CartProvider } from "@/contexts/cart-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { AuthProvider } from "@/contexts/auth-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <CheckoutProvider>{children}</CheckoutProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

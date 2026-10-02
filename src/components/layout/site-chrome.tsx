"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartFloat } from "@/components/layout/cart-float";

const AUTH_ROUTES = ["/entrar", "/criar-conta", "/esqueci-senha", "/redefinir-senha"];
const PANEL_PREFIXES = ["/conta", "/profissional", "/vendedor", "/admin"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isPanelPage = PANEL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isAuthPage || isPanelPage) {
    return <div className="min-h-full">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartFloat />
      <WhatsAppFloat />
    </>
  );
}

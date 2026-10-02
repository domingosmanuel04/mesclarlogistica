import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { GlobalJsonLd } from "@/components/seo/json-ld";
import { ChatWidget } from "@/components/chat/chat-widget";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3020";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Mesclar Logística | Procurement",
    template: "%s | Mesclar Logística",
  },
  description:
    "Plataforma digital e infraestrutura industrial B2C especializada em livros, eBooks, artigos técnicos e consultoria de Logística, Procurement e Supply Chain.",
  keywords: [
    "logística",
    "procurement",
    "ebooks",
    "supply chain",
    "Angola",
    "Liceatlantico",
    "compras industriais",
    "frotas",
    "armazém",
  ],
  authors: [{ name: "Liceatlantico" }],
  publisher: "Liceatlantico",
  openGraph: {
    type: "website",
    locale: "pt_AO",
    siteName: "Mesclar Logística | Procurement",
    title: "Mesclar Logística | Procurement",
    description:
      "Plataforma digital e marketplace especializado em conteúdos de logística, procurement e supply chain em Angola.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesclar Logística | Procurement",
    description:
      "eBooks e livros físicos para profissionais da cadeia logística.",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mesclar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${inter.variable} ${display.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="mesh-bg flex min-h-full flex-col text-foreground" suppressHydrationWarning>
        <Providers>
          <GlobalJsonLd />
          <PwaRegister />
          <SiteChrome>{children}</SiteChrome>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}

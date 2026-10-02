import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo-monster";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin*",
          "/profissional*",
          "/conta*",
          "/api*",
          "/checkout*",
          "/carrinho*",
          "/_next*",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin*", "/conta*", "/api*"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin*", "/conta*", "/api*"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin*", "/conta*", "/api*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

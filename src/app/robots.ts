import type { MetadataRoute } from "next";

const siteUrl = "https://memehunt.tech";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/sign-in"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

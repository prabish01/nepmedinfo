import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og must stay crawlable so social networks can fetch share images.
        allow: ["/", "/api/og"],
        disallow: ["/admin", "/api/", "/search", "/ne/search", "/*?q="],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

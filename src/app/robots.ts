import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://projeto-anime-list-3zwq324su.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/register", "/profile"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

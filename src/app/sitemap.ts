import type { MetadataRoute } from "next";
import { agents } from "@/data/agents";
import { learningBlogs } from "@/data/learning";
import { countries, industries, longTailSeoPages } from "@/data/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const staticRoutes = [
    "",
    "/ai-agents",
    "/free-audit",
    "/videos",
    "/blogs",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/unsubscribe"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7
    })),
    ...agents.map((agent) => ({
      url: `${baseUrl}/ai-agents/${agent.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...industries.map((industry) => ({
      url: `${baseUrl}/industries/${industry}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75
    })),
    ...countries.map((country) => ({
      url: `${baseUrl}/countries/ai-agents-for-${country}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75
    })),
    ...longTailSeoPages.map((page) => ({
      url: `${baseUrl}/solutions/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.78
    })),
    ...learningBlogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.76
    }))
  ];
}

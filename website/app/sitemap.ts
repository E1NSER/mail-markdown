import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://mail-markdown.vercel.app", changeFrequency: "monthly", priority: 1 },
    { url: "https://mail-markdown.vercel.app/datenschutz", changeFrequency: "yearly", priority: 0.2 },
    { url: "https://mail-markdown.vercel.app/impressum", changeFrequency: "yearly", priority: 0.2 },
  ];
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { locales, localePath } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap(locale => ["", "/privacy", "/legal-notice"].map(path => ({
    url: `${SITE_URL}${localePath(locale, path)}`,
    changeFrequency: path ? "yearly" as const : "monthly" as const,
    priority: path ? 0.2 : 1,
    alternates: { languages: {
      en: `${SITE_URL}${localePath("en", path)}`,
      de: `${SITE_URL}${localePath("de", path)}`,
      "x-default": `${SITE_URL}${localePath("en", path)}`,
    } },
  })));
}

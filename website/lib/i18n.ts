export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "de";
}

export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

export const siteTitles = {
  en: "Mail Markdown — Markdown for Apple Mail",
  de: "Mail Markdown — Markdown-Erweiterung für Apple Mail",
} satisfies Record<Locale, string>;

export const siteDescriptions = {
  en: "Paste Markdown from AI chats directly into Apple Mail. The free companion keeps your existing draft’s font, size and color with ⌘V.",
  de: "Markdown aus KI-Chats direkt in Apple Mail einfügen. Die kostenlose Erweiterung übernimmt mit ⌘V Schrift, Größe und Farbe deines bestehenden Mail-Entwurfs.",
} satisfies Record<Locale, string>;

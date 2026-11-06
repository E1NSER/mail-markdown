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
  de: "Mail Markdown — Markdown für Apple Mail",
} satisfies Record<Locale, string>;

// Call the product a companion app (Begleit-App), never an extension: it runs as a
// separate menu-bar app and does not appear in Mail’s Extensions settings.
export const siteDescriptions = {
  en: "Paste Markdown from AI chats directly into Apple Mail. The free companion app keeps your existing draft’s font, size and color with ⌘V.",
  de: "Markdown aus KI-Chats direkt in Apple Mail einfügen. Die kostenlose Begleit-App übernimmt mit ⌘V Schrift, Größe und Farbe deines bestehenden Mail-Entwurfs.",
} satisfies Record<Locale, string>;

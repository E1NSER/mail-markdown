import type { Metadata } from "next";
import { localePath, siteDescriptions, siteTitles, type Locale } from "./i18n";

type PageKind = "home" | "privacy" | "legal-notice";
const labels = {
  en: { privacy: "Privacy", "legal-notice": "Legal notice" },
  de: { privacy: "Datenschutz", "legal-notice": "Impressum" },
};

export function localizedMetadata(locale: Locale, page: PageKind): Metadata {
  const suffix = page === "home" ? "" : `/${page}`;
  const title = page === "home" ? siteTitles[locale] : `${labels[locale][page]} · Mail Markdown`;
  const description = page === "home" ? siteDescriptions[locale]
    : page === "privacy"
      ? locale === "en" ? "Privacy on the Mail Markdown website, in the browser playground and in the local macOS app." : "Datenschutz bei der Mail-Markdown-Website, im Browser-Playground und in der lokal arbeitenden macOS-App."
      : locale === "en" ? "Publisher and contact information for the Mail Markdown website by E1NSER." : "Herausgeber und Kontakt der Mail-Markdown-Website von E1NSER.";
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: localePath(locale, suffix),
      languages: {
        en: localePath("en", suffix),
        de: localePath("de", suffix),
        "x-default": localePath("en", suffix),
      },
    },
    openGraph: {
      title,
      description,
      url: localePath(locale, suffix),
      locale: locale === "en" ? "en_US" : "de_AT",
      alternateLocale: locale === "en" ? "de_AT" : "en_US",
      type: "website",
    },
  };
}

"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n";

export default function NotFound() {
  const locale = useLocale();
  return (
    <main className="legal-page">
      <h1>{locale === "en" ? "Page not found" : "Seite nicht gefunden"}</h1>
      <p>{locale === "en" ? "This page is unavailable." : "Diese Seite ist nicht verfügbar."}</p>
      <Link href={localePath(locale)}>{locale === "en" ? "Back to home" : "Zur Startseite"}</Link>
    </main>
  );
}

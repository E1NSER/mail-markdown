import { notFound } from "next/navigation";
import { LegalNoticePage } from "@/components/legal-pages";
import { isLocale } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(locale, "legal-notice");
}

export default async function LegalNotice({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalNoticePage locale={locale} />;
}

import { notFound } from "next/navigation";
import { PrivacyPage } from "@/components/legal-pages";
import { isLocale } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/localized-metadata";
import { validMeasurementId } from "@/lib/analytics";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(locale, "privacy");
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PrivacyPage locale={locale} analyticsConfigured={Boolean(validMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID))} />;
}

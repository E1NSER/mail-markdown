import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { isLocale } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/localized-metadata";
import { getRepositoryStars } from "@/lib/github-repository";
import { getLatestRelease } from "@/lib/github-release";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(locale, "home");
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [release, stars] = await Promise.all([getLatestRelease(), getRepositoryStars()]);
  return <LandingPage locale={locale} release={release} stars={stars} />;
}

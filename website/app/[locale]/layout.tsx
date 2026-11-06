import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { ConsentProvider } from "@/components/consent-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { isLocale, locales, siteDescriptions, siteTitles } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "../globals.css";
import "../brand.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteTitles[locale], template: "%s · Mail Markdown" },
    description: siteDescriptions[locale],
    applicationName: "Mail Markdown",
    authors: [{ name: "E1NSER.", url: "https://einser.at" }],
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${manrope.variable} ${mono.variable}`}>
      <body>
        <LocaleProvider locale={locale} key={locale}>
          <ConsentProvider measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}>
            {children}
          </ConsentProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

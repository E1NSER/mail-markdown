import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import { ConsentProvider } from "@/components/consent-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "./brand.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mail Markdown — Markdown-Erweiterung für Apple Mail",
    template: "%s · Mail Markdown",
  },
  description:
    "Markdown aus KI-Chats direkt in Apple Mail einfügen. Die kostenlose Erweiterung übernimmt mit ⌘V Schrift, Größe und Farbe deines bestehenden Mail-Entwurfs.",
  applicationName: "Mail Markdown",
  authors: [{ name: "E1NSER.", url: "https://einser.at" }],
  openGraph: {
    title: "Dein KI-Text. In Apple Mail.",
    description: "Die Markdown-Erweiterung für Apple Mail. KI-Text mit ⌘V im Stil deines bestehenden Entwurfs einfügen. Kostenlos und Open Source.",
    locale: "de_AT",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${mono.variable}`}
    >
      <body>
        <ConsentProvider measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}>
          {children}
        </ConsentProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://mail-markdown.vercel.app"),
  title: {
    default: "Mail Markdown — Markdown rein. Dein Stil bleibt.",
    template: "%s · Mail Markdown",
  },
  description:
    "Die kostenlose Mac-App für Markdown in Apple Mail. Mit ⌘V einfügen und Schrift, Größe und Farbe deines Entwurfs beibehalten. Lokal und Open Source.",
  applicationName: "Mail Markdown",
  authors: [{ name: "E1NSER.", url: "https://einser.at" }],
  openGraph: {
    title: "Markdown rein. Dein Stil bleibt.",
    description: "Markdown für Apple Mail. Kostenlos, lokal und Open Source.",
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
    <html lang="de" className={`${manrope.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

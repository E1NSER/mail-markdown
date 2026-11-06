"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import styles from "./site-nav.module.css";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DownloadButton } from "./download-button";
import { GitHubButton } from "./github-button";

export function SiteNav({
  downloadAvailable,
  stars,
}: {
  downloadAvailable: boolean;
  stars: number | null;
}) {
  const locale = useLocale();
  const de = locale === "de";
  const alternate = de ? "en" : "de";
  const pathname = usePathname();
  const pagePath = pathname.replace(/^\/(?:en|de)(?=\/|$)/, "");
  const languageHref = localePath(alternate, pagePath);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const themeLabel = dark ? (de ? "Helle Darstellung" : "Light appearance") : (de ? "Dunkle Darstellung" : "Dark appearance");
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const explicit = document.documentElement.dataset.theme;
      setDark(explicit ? explicit === "dark" : query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
  }

  return (
    <header className="site-header">
      <a className="brand" href={localePath(locale)} aria-label={de ? "Mail Markdown – Startseite" : "Mail Markdown – home"}>
        <Image src="/app-icon.svg" alt="" width={38} height={38} priority />
        <span>
          Mail Markdown<span className="brand-dot">.</span>
        </span>
      </a>
      <nav className="desktop-nav" aria-label={de ? "Hauptnavigation" : "Main navigation"}>
        <a href="#spielplatz">{de ? "Ausprobieren" : "Try it"}</a>
        <a href="#open-source">Open Source</a>
      </nav>
      <div className="nav-actions">
        <Link className={`${styles.languageSwitch} ${styles.desktopLanguage}`} href={languageHref} hrefLang={alternate} lang={alternate} aria-label={de ? "Switch to English" : "Auf Deutsch wechseln"}>{de ? "EN" : "DE"}</Link>
        <GitHubButton className="nav-github" stars={stars} showStars />
        <DownloadButton
          className="nav-cta"
          available={downloadAvailable}
          location="header"
          compact
        />
        <button
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={themeLabel}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-button mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? (de ? "Menü schließen" : "Close menu") : (de ? "Menü öffnen" : "Open menu")}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-menu"
          aria-label={de ? "Mobile Navigation" : "Mobile navigation"}
        >
          <a onClick={() => setOpen(false)} href="#spielplatz">
            {de ? "Ausprobieren" : "Try it"} <ArrowUpRight size={18} />
          </a>
          <a onClick={() => setOpen(false)} href="#open-source">
            Open Source <ArrowUpRight size={18} />
          </a>
          <a onClick={() => setOpen(false)} href="#starten">
            {de ? "App für macOS" : "App for macOS"} <ArrowUpRight size={18} />
          </a>
          <Link className={styles.mobileLanguage} href={languageHref} hrefLang={alternate} lang={alternate} onClick={() => setOpen(false)}>{de ? "English" : "Deutsch"}<span aria-hidden="true">{de ? "EN" : "DE"}</span></Link>
          <button className="mobile-theme-toggle" onClick={toggleTheme}>
            {themeLabel}
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      )}
    </header>
  );
}

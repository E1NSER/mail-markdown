"use client";

import Image from "next/image";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
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
      <a className="brand" href="#" aria-label="Mail Markdown – Startseite">
        <Image src="/app-icon.svg" alt="" width={38} height={38} priority />
        <span>
          Mail Markdown<span className="brand-dot">.</span>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Hauptnavigation">
        <a href="#so-gehts">So funktioniert’s</a>
        <a href="#spielplatz">Ausprobieren</a>
        <a href="#open-source">Open Source</a>
      </nav>
      <div className="nav-actions">
        <button
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={dark ? "Helle Darstellung" : "Dunkle Darstellung"}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a className="nav-cta" href="#starten">
          Kostenlos starten <ArrowUpRight size={15} />
        </a>
        <button
          className="icon-button mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-menu"
          aria-label="Mobile Navigation"
        >
          <a onClick={() => setOpen(false)} href="#so-gehts">
            So funktioniert’s <ArrowUpRight size={18} />
          </a>
          <a onClick={() => setOpen(false)} href="#spielplatz">
            Ausprobieren <ArrowUpRight size={18} />
          </a>
          <a onClick={() => setOpen(false)} href="#open-source">
            Open Source <ArrowUpRight size={18} />
          </a>
          <a onClick={() => setOpen(false)} href="#starten">
            Kostenlos starten <ArrowUpRight size={18} />
          </a>
        </nav>
      )}
    </header>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Code2,
  Command,
  GitBranch,
  Heart,
  LockKeyhole,
  Minus,
  Monitor,
  Plus,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { HeroDemo } from "@/components/hero-demo";
import { Playground } from "@/components/playground";
import { MotionProvider, Reveal } from "@/components/motion";

const repo = "https://github.com/E1NSER/mail-markdown";
export const metadata: Metadata = { alternates: { canonical: "/" } };
const faqs = [
  [
    "Ist Mail Markdown wirklich kostenlos?",
    "Ja. Die App ist kostenlos und unbegrenzt nutzbar. Es gibt kein Abo, kein Konto und kein Limit für deine Markdown-Texte. Der Quellcode steht unter der MIT-Lizenz auf GitHub.",
  ],
  [
    "Wie bekomme ich die App?",
    "Aktuell kannst du Mail Markdown aus dem öffentlichen Quellcode selbst bauen. Die Anleitung findest du auf GitHub. Ein fertig signierter und notarisierter Download wird noch vorbereitet.",
  ],
  [
    "Was bleibt von meinem Mail-Stil erhalten?",
    "Die App übernimmt Schriftart, Schriftgröße und Textfarbe aus einem benachbarten Zeichen im Entwurf. Markdown ergänzt dazu zum Beispiel Fett- und Kursivschrift, Listen und Links. Überschriften behalten die Schriftgröße; Code erscheint in einer gleich großen Monospace-Schrift.",
  ],
  [
    "Was passiert mit meinen Nachrichten?",
    "Die App verarbeitet den Text lokal auf deinem Mac. Es gibt keinen Konvertierungsserver und keine Analysefunktionen. Für die Stilübernahme benötigt sie deine Bedienungshilfen-Freigabe. Die Originalzwischenablage bleibt vorübergehend im Arbeitsspeicher wiederherstellbar.",
  ],
  [
    "Funktioniert es in jedem Entwurf?",
    "Du brauchst einen Rich-Text-Entwurf in Apple Mail und vorhandenen Text als Stilprobe. In einem ganz leeren Entwurf oder wenn die Schrift nicht gelesen werden kann, wird normal eingefügt. Die automatische Umwandlung nutzt die normale Tastenkombination ⌘V; Menü-Einfügen wird nicht abgefangen.",
  ],
  [
    "Gibt es die App im Mac App Store?",
    "Derzeit nicht. Mail Markdown ist eine eigenständige Begleit-App für Apple Mail. Der aktuelle Zugriff über Bedienungshilfen erfordert eine direkte Verteilung. Eine App-Store-Version würde einen anderen Bedienablauf benötigen.",
  ],
];

export default function Home() {
  return (
    <MotionProvider>
      <a className="skip-link" href="#inhalt">
        Zum Inhalt
      </a>
      <div className="site-shell">
        <SiteNav />
        <main id="inhalt">
          <section className="hero section-wrap">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow">
                <span className="tiny-dot" /> Markdown für Apple Mail
              </div>
              <h1>
                Deine Worte.
                <br />
                <span>Dein Stil.</span>
              </h1>
              <p className="hero-description">
                Aus Markdown wird eine richtig gute Mail. Mit einem{" "}
                <kbd>⌘V</kbd> – und genau der Schrift, Größe und Farbe deines
                Entwurfs.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#starten">
                  Kostenlos starten <ArrowUpRight size={18} />
                </a>
                <a className="button button-text" href="#spielplatz">
                  Selbst ausprobieren <ArrowDown size={17} />
                </a>
              </div>
              <div className="hero-facts">
                <span>
                  <Monitor size={14} /> macOS 13+
                </span>
                <span>
                  <Check size={14} /> Unbegrenzt kostenlos
                </span>
                <span>
                  <Code2 size={14} /> Open Source
                </span>
              </div>
            </div>
            <HeroDemo />
          </section>

          <div className="intro-strip section-wrap">
            <span>
              Weniger Klicks.
              <br /> <strong>Mehr von dem, was du sagen willst.</strong>
            </span>
            <div className="strip-markdown" aria-hidden="true">
              <span>**</span>Gute Gedanken<span>**</span>
              <ArrowRight size={24} />
              <b>Gute Gedanken</b>
            </div>
          </div>

          <section className="how-section section-wrap" id="so-gehts">
            <Reveal className="section-heading">
              <div className="eyebrow">01 / EIN HANDGRIFF GENÜGT</div>
              <h2>
                Dein Workflow.
                <br />
                <span>Ein bisschen flüssiger.</span>
              </h2>
              <p>
                Keine neue Schreib-App. Kein Fenster dazwischen.
                <br />
                Nur ein kleines Upgrade für das Mail, das du schon nutzt.
              </p>
            </Reveal>
            <div className="steps">
              <Reveal className="step" delay={0.05}>
                <div className="step-art step-art-write" aria-hidden="true">
                  <span className="writing-line">
                    Eine <b>**gute**</b> Idee
                    <span className="typing-caret" />
                  </span>
                  <span className="writing-under">
                    beginnt mit deinen Worten.
                  </span>
                </div>
                <span className="step-index">01</span>
                <h3>Schreib in Markdown.</h3>
                <p>
                  Ein Text aus deinem Editor, einer Notiz oder deinem KI-Chat.
                  Kopieren reicht.
                </p>
              </Reveal>
              <Reveal className="step" delay={0.13}>
                <div className="step-art step-art-paste" aria-hidden="true">
                  <span className="mini-key">⌘</span>
                  <span className="mini-key">V</span>
                  <span className="key-pulse" />
                </div>
                <span className="step-index">02</span>
                <h3>Füg ihn in Mail ein.</h3>
                <p>
                  Cursor in den Nachrichtentext setzen und wie gewohnt ⌘V
                  drücken.
                </p>
              </Reveal>
              <Reveal className="step" delay={0.21}>
                <div className="step-art step-art-done" aria-hidden="true">
                  <span>
                    <CheckCheck size={21} /> Eine <b>gute</b> Idee
                  </span>
                  <small>Deine Schrift. Deine Farbe. Dein Stil.</small>
                </div>
                <span className="step-index">03</span>
                <h3>Sieht nach dir aus.</h3>
                <p>
                  Fett, kursiv und strukturiert – mit Schrift, Größe und Farbe
                  deines Entwurfs.
                </p>
              </Reveal>
            </div>
          </section>

          <section className="play-section" id="spielplatz">
            <div className="section-wrap">
              <Reveal className="play-heading">
                <div>
                  <div className="eyebrow">02 / EIN KLEINER SPIELPLATZ</div>
                  <h2>
                    Probier’s mit
                    <br />
                    <span>deinen Worten.</span>
                  </h2>
                </div>
                <p>
                  Links Markdown schreiben.
                  <br />
                  Rechts die Wirkung sehen.
                  <br />
                  Und den Stil ruhig mal wechseln.
                </p>
              </Reveal>
              <Reveal>
                <Playground />
              </Reveal>
              <div className="supported-formats">
                <span>Ein Format für deine Gedanken.</span>
                <div>
                  <b>Fett</b>
                  <i>Kursiv</i>
                  <span className="format-list">≡ Listen</span>
                  <span className="format-link">Links ↗</span>
                  <span className="format-code">`Code`</span>
                  <span>❝ Zitate</span>
                </div>
              </div>
            </div>
          </section>

          <section className="quiet-section section-wrap">
            <Reveal className="quiet-heading">
              <div className="eyebrow">03 / KLEIN. UND GENAU RICHTIG.</div>
              <h2>
                Weniger App.
                <br />
                <span>Mehr Ruhe im Kopf.</span>
              </h2>
            </Reveal>
            <div className="quiet-grid">
              <Reveal className="privacy-feature">
                <div className="privacy-visual" aria-hidden="true">
                  <div className="privacy-ring ring-outer" />
                  <div className="privacy-ring ring-inner" />
                  <div className="privacy-lock">
                    <LockKeyhole size={33} strokeWidth={1.4} />
                  </div>
                  <span className="privacy-tag">
                    <span /> Bleibt auf deinem Mac.
                  </span>
                  <span className="privacy-orbit-dot" />
                </div>
                <h3>Deine Worte bleiben bei dir.</h3>
                <p>
                  Die App formatiert lokal. Kein Konto, kein Upload und kein
                  Konvertierungsserver.
                </p>
                <Link href="/datenschutz" className="inline-link">
                  Mehr zum Datenschutz <ArrowUpRight size={15} />
                </Link>
              </Reveal>
              <div className="quiet-list">
                <Reveal className="quiet-item">
                  <span className="quiet-icon">
                    <Command size={23} />
                  </span>
                  <div>
                    <h3>Vertraut ab dem ersten Einfügen.</h3>
                    <p>
                      Ein Tastenkürzel, das du schon kennst. In einer App, die
                      du schon nutzt.
                    </p>
                  </div>
                </Reveal>
                <Reveal className="quiet-item" delay={0.08}>
                  <span className="quiet-icon">
                    <Minus size={23} />
                  </span>
                  <div>
                    <h3>Unauffällig, bis du sie brauchst.</h3>
                    <p>
                      Mail Markdown lebt in der Menüleiste. Eine Vorschau und
                      deine Einstellungen sind immer einen Klick entfernt.
                    </p>
                  </div>
                </Reveal>
                <Reveal className="quiet-item" delay={0.16}>
                  <span className="quiet-icon">
                    <Heart size={23} />
                  </span>
                  <div>
                    <h3>Einfach kostenlos.</h3>
                    <p>
                      Kein Abo. Kein Zähler. Keine Freischaltung. Nur ein
                      nützliches kleines Tool.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section className="source-section" id="open-source">
            <div className="source-inner section-wrap">
              <Reveal>
                <div className="eyebrow">OFFENER CODE. GUTE ABSICHTEN.</div>
                <h2>
                  Kleine App.
                  <br />
                  <span>Offen für große Ideen.</span>
                </h2>
                <p>
                  Mail Markdown ist ein kostenloses Projekt von E1NSER. Der
                  Quellcode ist offen. Schau rein, melde einen Fehler oder bau
                  etwas Eigenes daraus.
                </p>
                <a
                  href={repo}
                  className="button button-dark"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={19} /> Auf GitHub ansehen{" "}
                  <ArrowUpRight size={17} />
                </a>
              </Reveal>
              <Reveal className="source-art" delay={0.1}>
                <div className="source-code-card">
                  <div className="source-code-top">
                    <GitBranch size={15} />
                    <span>main</span>
                    <span className="source-code-public">public</span>
                  </div>
                  <code>
                    <span className="code-comment">
                      // Eine kleine Idee für bessere Mails.
                    </span>
                    <br />
                    <br />
                    <span className="code-blue">let</span> price ={" "}
                    <span className="code-green">0</span>
                    <br />
                    <span className="code-blue">let</span> limits ={" "}
                    <span className="code-green">nil</span>
                    <br />
                    <span className="code-blue">let</span> processing ={" "}
                    <span className="code-orange">"on your Mac"</span>
                    <br />
                    <span className="code-blue">let</span> license ={" "}
                    <span className="code-orange">"MIT"</span>
                  </code>
                  <div className="source-code-bottom">
                    <span>
                      <span /> Swift + AppKit
                    </span>
                    <span>Mit Liebe aus Wien. ↗</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="faq-section section-wrap">
            <Reveal className="faq-heading">
              <div className="eyebrow">NOCH EINE KLEINE FRAGE?</div>
              <h2>Gut zu wissen.</h2>
              <p>Die Details, bevor du loslegst.</p>
            </Reveal>
            <div className="faq-list">
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <Plus size={19} />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="start-section section-wrap" id="starten">
            <Reveal className="start-inner">
              <Image
                src="/app-icon.svg"
                alt="Mail Markdown App-Icon"
                width={94}
                height={94}
              />
              <div className="eyebrow">DEIN NÄCHSTES ⌘V KANN MEHR.</div>
              <h2>
                Weniger formatieren.
                <br />
                <span>Mehr du.</span>
              </h2>
              <p>Kostenlos. Unbegrenzt. Für deinen Mac.</p>
              <a
                className="button button-primary"
                href={`${repo}#build-locally`}
                target="_blank"
                rel="noreferrer"
              >
                Aus dem Quellcode starten <ArrowUpRight size={18} />
              </a>
              <span className="start-note">
                Ein signierter und notarisierter Download wird vorbereitet.
                <br />
                Bis dahin findest du die Build-Anleitung auf GitHub.
              </span>
            </Reveal>
            <span className="start-watermark" aria-hidden="true">
              ⌘V
            </span>
          </section>
        </main>
        <footer className="site-footer section-wrap">
          <a className="footer-brand" href="#">
            Mail Markdown<span>.</span>
          </a>
          <span className="footer-credit">
            Ein kleines Tool von{" "}
            <a href="https://einser.at" target="_blank" rel="noreferrer">
              E1NSER. <ArrowUpRight size={12} />
            </a>
          </span>
          <nav aria-label="Footer">
            <a href={repo} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
          </nav>
        </footer>
        <div className="trademark-note section-wrap">
          Ein unabhängiges Projekt. Apple und Apple Mail sind Marken von Apple
          Inc.
        </div>
      </div>
    </MotionProvider>
  );
}

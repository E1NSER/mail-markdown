import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Monitor, Plus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { HeroDemo } from "@/components/hero-demo";
import { Playground } from "@/components/playground";
import { MotionProvider, Reveal } from "@/components/motion";
import { DownloadButton } from "@/components/download-button";
import { GitHubButton } from "@/components/github-button";
import { AppIconScene } from "@/components/app-icon-scene";
import { MarkdownBackdrop } from "@/components/markdown-backdrop";
import { CookieSettingsButton } from "@/components/consent-provider";
import { getRepositoryStars } from "@/lib/github-repository";
import { getLatestRelease } from "@/lib/github-release";
import { RELEASES_URL, type ReleaseState } from "@/lib/release-model";

const repo = "https://github.com/E1NSER/mail-markdown";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export const revalidate = 300;

function downloadAnswer(release: ReleaseState): string {
  if (release.status === "available")
    return "Über „Für macOS laden“ erhältst du direkt das Universal-DMG des neuesten stabilen GitHub-Releases. Öffne das DMG und ziehe Mail Markdown in den Programme-Ordner. Aktiviere anschließend die Bedienungshilfen-Freigabe für die App.";
  if (release.status === "not-published")
    return "Der erste öffentliche Mac-Release wird noch vorbereitet. Sobald er verfügbar ist, erscheint hier automatisch der direkte Download. Bis dahin kannst du Mail Markdown mit der Anleitung auf GitHub selbst bauen.";
  if (release.status === "no-download")
    return "Zum neuesten GitHub-Release ist noch kein Universal-DMG verfügbar. Du kannst den Release-Status auf GitHub prüfen oder die App aus dem Quellcode bauen.";
  return "Der Download-Status ist gerade nicht abrufbar. Prüfe die Releases auf GitHub oder nutze dort die Anleitung zum Selbstbauen.";
}

function getFaqs(release: ReleaseState) {
  return [
    [
      "Ist Mail Markdown wirklich kostenlos?",
      "Ja. Die App ist kostenlos und unbegrenzt nutzbar. Es gibt kein Abo, kein Konto und kein Limit für deine Markdown-Texte. Der Quellcode steht unter der MIT-Lizenz auf GitHub.",
    ],
    ["Wie bekomme ich die App?", downloadAnswer(release)],
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
}

export default async function Home() {
  const [release, stars] = await Promise.all([
    getLatestRelease(),
    getRepositoryStars(),
  ]);
  const downloadAvailable = release.status === "available";
  const faqs = getFaqs(release);
  return (
    <MotionProvider>
      <a className="skip-link" href="#inhalt">
        Zum Inhalt
      </a>
      <div className="site-shell">
        <SiteNav downloadAvailable={downloadAvailable} stars={stars} />
        <main id="inhalt">
          <div className="hero-band">
            <MarkdownBackdrop />
            <section className="hero section-wrap" aria-labelledby="hero-title">
              <div className="hero-copy">
                <div className="eyebrow hero-eyebrow">
                  <span className="tiny-dot" /> FÜR APPLE MAIL GEMACHT
                </div>
                <h1 id="hero-title">
                  Dein Text.
                  <br />
                  <span>Hat Format.</span>
                </h1>
                <p className="hero-description">
                  Markdown rein. Schöne Mail raus. Ein ⌘V übernimmt die
                  Formatierung – in der Schrift, Größe und Farbe deines
                  Entwurfs.
                </p>
                <div className="hero-actions">
                  <DownloadButton
                    className="button button-primary"
                    available={downloadAvailable}
                    location="hero"
                  />
                  <a className="button button-text" href="#spielplatz">
                    Probier’s aus <ArrowDown size={17} />
                  </a>
                </div>
                <div className="hero-facts">
                  <span>
                    <Monitor size={14} /> macOS 13+
                  </span>
                  <span>Kostenlos. Ohne Limit.</span>
                </div>
              </div>
              <HeroDemo />
            </section>
          </div>

          <section className="play-section" id="spielplatz">
            <div className="section-wrap">
              <Reveal className="play-heading">
                <div>
                  <div className="eyebrow">01 — MARKDOWN IN APPLE MAIL</div>
                  <h2>
                    Markdown in
                    <br />
                    <span>Mail-Format.</span>
                  </h2>
                </div>
                <div className="play-intro">
                  <p>
                    Apple Mail formatiert eingefügtes Markdown nicht automatisch.
                    Mail Markdown macht daraus formatierten Text – in Schriftart,
                    Größe und Farbe deines Entwurfs.
                  </p>
                </div>
              </Reveal>
              <Reveal>
                <Playground />
              </Reveal>
              <div className="supported-formats">
                <span>VON KLEINEN AKZENTEN BIS ZUR KLAREN STRUKTUR.</span>
                <div>
                  <b>Fett</b>
                  <i>Kursiv</i>
                  <span>≡ Listen</span>
                  <span className="format-link">Links ↗</span>
                  <span className="format-code">`Code`</span>
                  <span>❝ Zitate</span>
                </div>
              </div>
            </div>
          </section>

          <section className="source-section" id="open-source">
            <div className="source-inner section-wrap">
              <Reveal>
                <div className="eyebrow">AUS WIEN. FÜR DEINEN WORKFLOW.</div>
                <h2>
                  Gute Tools
                  <br />
                  sind zum Teilen da.
                </h2>
                <p>
                  Ein kostenloses Projekt von E1NSER. Schau in den Code, melde
                  einen Fehler oder mach deine eigene Idee daraus.
                </p>
                <div className="section-actions">
                  <DownloadButton
                    className="button button-primary"
                    available={downloadAvailable}
                    location="source"
                  />
                  <GitHubButton className="button button-outline" />
                </div>
              </Reveal>
              <AppIconScene />
            </div>
          </section>

          <section className="faq-section section-wrap">
            <Reveal className="faq-heading">
              <div className="eyebrow">02 — GUT ZU WISSEN</div>
              <h2>Die Details.</h2>
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
              <div className="eyebrow">BEREIT FÜR DEIN NÄCHSTES ⌘V?</div>
              <h2>
                Gute Worte verdienen
                <br />
                <span>gutes Format.</span>
              </h2>
              <p>Kostenlos. Unbegrenzt. Für deinen Mac.</p>
              <div className="section-actions start-actions">
                <DownloadButton
                  className="button button-primary"
                  available={downloadAvailable}
                  location="final"
                />
                <GitHubButton className="button button-outline" />
              </div>
              <span className="start-note" id="download-availability">
                {release.status === "available" ? (
                  <>
                    {release.version} · Universal-DMG · kostenlos
                    <br />
                    <a href={`${RELEASES_URL}/latest`}>
                      Release-Notes ansehen ↗
                    </a>
                  </>
                ) : release.status === "not-published" ? (
                  <>
                    Der erste öffentliche Mac-Release wird vorbereitet.
                    <br />
                    Den Quellcode findest du auf GitHub.
                  </>
                ) : release.status === "no-download" ? (
                  <>
                    Für {release.version} ist noch kein Mac-Download verfügbar.
                    <br />
                    <a href={RELEASES_URL}>
                      Release-Status auf GitHub ansehen ↗
                    </a>
                  </>
                ) : (
                  <>
                    Der Download-Status ist gerade nicht abrufbar.
                    <br />
                    <a href={RELEASES_URL}>Releases auf GitHub prüfen ↗</a>
                  </>
                )}
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
            <CookieSettingsButton className="footer-cookie-settings" />
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

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Monitor, Plus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { HeroDemo } from "@/components/hero-demo";
import { HeroAmbient } from "@/components/hero-ambient";
import { Playground } from "@/components/playground";
import { MotionProvider, Reveal } from "@/components/motion";
import { DownloadButton } from "@/components/download-button";
import { GitHubButton } from "@/components/github-button";
import { AppIconScene } from "@/components/app-icon-scene";
import { CookieSettingsButton } from "@/components/consent-provider";
import { RELEASES_URL, type ReleaseState } from "@/lib/release-model";

import { localePath, type Locale } from "@/lib/i18n";

const repo = "https://github.com/E1NSER/mail-markdown";

function downloadAnswer(release: ReleaseState, locale: Locale): string {
  if (locale === "en") {
    if (release.status === "available") return "Use ‘Download for macOS’ to get the Universal DMG from the latest stable GitHub release. Open the DMG, drag Mail Markdown into Applications, then grant Accessibility permission to the app.";
    if (release.status === "not-published") return "The first public Mac release is being prepared. A direct download will appear here when it is available. Until then, you can build Mail Markdown using the instructions on GitHub.";
    if (release.status === "no-download") return "The latest GitHub release does not have a Universal DMG yet. Check its status on GitHub or build the app from source.";
    return "The download status is unavailable right now. Check GitHub Releases or use the build instructions there.";
  }
  if (release.status === "available")
    return "Über „Für macOS laden“ erhältst du direkt das Universal-DMG des neuesten stabilen GitHub-Releases. Öffne das DMG und ziehe Mail Markdown in den Programme-Ordner. Aktiviere anschließend die Bedienungshilfen-Freigabe für die App.";
  if (release.status === "not-published")
    return "Der erste öffentliche Mac-Release wird noch vorbereitet. Sobald er verfügbar ist, erscheint hier automatisch der direkte Download. Bis dahin kannst du Mail Markdown mit der Anleitung auf GitHub selbst bauen.";
  if (release.status === "no-download")
    return "Zum neuesten GitHub-Release ist noch kein Universal-DMG verfügbar. Du kannst den Release-Status auf GitHub prüfen oder die App aus dem Quellcode bauen.";
  return "Der Download-Status ist gerade nicht abrufbar. Prüfe die Releases auf GitHub oder nutze dort die Anleitung zum Selbstbauen.";
}

function getFaqs(release: ReleaseState, locale: Locale) {
  if (locale === "en") return [
    ["How does Mail Markdown extend Apple Mail?", "Mail Markdown adds Markdown formatting to ⌘V directly in Apple Mail. You still write and send messages in your familiar Mail editor. The companion runs as a separate app in the macOS menu bar. It is installed separately and does not appear in Mail’s Extensions settings."],
    ["How do I use email text from an AI chat?", "Ask for your email as Markdown. Copy the Markdown source, including asterisks, list markers and links, then paste it with ⌘V into an existing Apple Mail draft. Mail Markdown turns it into real formatting using your draft’s font, size and color."],
    ["What happens to copied black backgrounds?", "When it recognizes Markdown, Mail Markdown rebuilds the formatting using your draft’s style. Fonts, colors and backgrounds from the source are not imported during this conversion. It does not automatically clean up text that was already pasted incorrectly. Without recognized Markdown or a readable style sample, Apple Mail’s normal paste behavior applies."],
    ["Is Mail Markdown really free?", "Yes. The app is free and unlimited. There is no subscription, account or Markdown quota. Its source code is available on GitHub under the MIT License."],
    ["How do I get the app?", downloadAnswer(release, locale)],
    ["What stays from my Mail style?", "The app samples the font, size and text color from a neighboring character in your draft. Markdown adds formatting such as bold, italic, lists and links. Headings retain the font size; code uses a monospaced font at the same size."],
    ["What happens to my messages?", "The app processes text locally on your Mac. There is no conversion server or analytics. It needs Accessibility permission to read the draft style. A temporary in-memory copy lets you restore the original clipboard."],
    ["Does it work in every draft?", "You need a Rich Text draft in Apple Mail with existing text to sample. In an empty draft, or if the font cannot be read, text is pasted normally. Automatic conversion uses the regular ⌘V shortcut; paste from menus is not intercepted."],
    ["Is the app in the Mac App Store?", "Not currently. Mail Markdown is a standalone companion app for Apple Mail. Its current Accessibility integration requires direct distribution. An App Store version would need a different workflow."],
  ];
  return [
    [
      "Wie erweitert Mail Markdown Apple Mail?",
      "Mail Markdown ergänzt das Einfügen mit ⌘V direkt in Apple Mail. Du schreibst und versendest weiterhin in deinem gewohnten Mail-Editor. Die Erweiterung läuft dafür als eigenständige App in der macOS-Menüleiste. Sie wird separat installiert und erscheint nicht in Mails Erweiterungseinstellungen.",
    ],
    [
      "Wie nutze ich E-Mail-Texte aus einem KI-Chat?",
      "Lass dir den E-Mail-Text als Markdown ausgeben. Kopiere den Markdown-Quelltext mit Sternchen, Listenzeichen und Links und füge ihn mit ⌘V in einen bestehenden Apple-Mail-Entwurf ein. Mail Markdown macht daraus echte Formatierung und übernimmt Schrift, Größe und Farbe aus deinem Entwurf.",
    ],
    [
      "Was passiert mit mitkopierten schwarzen Hintergründen?",
      "Bei der Umwandlung eines erkannten Markdown-Textes baut Mail Markdown die Formatierung aus dem Stil deines Entwurfs neu auf. Fremde Schriften, Farben und Hintergründe aus der Quelle werden dabei nicht übernommen. Bereits falsch eingefügten Text bereinigt die App nicht automatisch. Ohne erkannten Markdown oder lesbare Stilprobe bleibt das normale Einfügen von Apple Mail bestehen.",
    ],
    [
      "Ist Mail Markdown wirklich kostenlos?",
      "Ja. Die App ist kostenlos und unbegrenzt nutzbar. Es gibt kein Abo, kein Konto und kein Limit für deine Markdown-Texte. Der Quellcode steht unter der MIT-Lizenz auf GitHub.",
    ],
    ["Wie bekomme ich die App?", downloadAnswer(release, locale)],
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

export function LandingPage({ locale, release, stars }: { locale: Locale; release: ReleaseState; stars: number | null }) {
  const t = (english: string, german: string) => locale === "de" ? german : english;
  const downloadAvailable = release.status === "available";
  const faqs = getFaqs(release, locale);
  return (
    <MotionProvider>
      <a className="skip-link" href="#inhalt">
        {t("Skip to content", "Zum Inhalt")}
      </a>
      <div className="site-shell">
        <SiteNav downloadAvailable={downloadAvailable} stars={stars} />
        <main id="inhalt">
          <div className="hero-band">
            <section className="hero section-wrap" aria-labelledby="hero-title">
              <div className="hero-copy">
                <h1 id="hero-title">
                  {t("Your AI text.", "Dein KI-Text.")}
                  <br />
                  <span>In Apple Mail.</span>
                </h1>
                <p className="hero-description">
                  {t("Paste Markdown from your AI chat into Apple Mail with ⌘V. The extension uses your draft’s font, size and color.", "Füge Markdown aus deinem KI-Chat mit ⌘V in Apple Mail ein. Die Erweiterung übernimmt Schrift, Größe und Farbe deines Entwurfs.")}
                </p>
                <div className="hero-actions">
                  <DownloadButton
                    className="button button-primary"
                    available={downloadAvailable}
                    location="hero"
                  />
                  <a className="button button-text" href="#spielplatz">
                    {t("Try it out", "Probier’s aus")} <ArrowDown size={17} />
                  </a>
                </div>
                <div className="hero-facts">
                  <span>
                    <Monitor size={14} /> macOS 13+
                  </span>
                  <span>{t("Free. No limits.", "Kostenlos. Ohne Limit.")}</span>
                </div>
              </div>
              <HeroDemo />
            </section>
            <HeroAmbient />
          </div>

          <section className="play-section" id="spielplatz">
            <div className="section-wrap">
              <Reveal className="play-heading">
                <div>
                  <h2>
                    {t("AI-written email.", "KI-Mail rein.")}
                    <br />
                    <span>{t("Your style stays.", "Dein Stil bleibt.")}</span>
                  </h2>
                </div>
                <div className="play-intro">
                  <div className="play-explanation">
                    <p>
                      {t("Rich text from an AI chat often brings unwanted fonts, colors or black backgrounds. Plain Markdown appears in Apple Mail as asterisks and list markers.", "Rich Text aus dem KI-Chat bringt oft fremde Schriften, Farben oder schwarze Hintergründe mit. Reines Markdown wiederum zeigt Apple Mail als Sternchen und Listenzeichen.")}
                    </p>
                    <p>
                      {t("Mail Markdown extends your ⌘V: it formats Markdown directly in Apple Mail, using the style of your draft.", "Mail Markdown ergänzt dein ⌘V: Die Erweiterung formatiert Markdown direkt in Apple Mail – im Stil deines Entwurfs.")}
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <Playground />
              </Reveal>
              <div className="supported-formats">
                <div>
                  <b>{t("Bold", "Fett")}</b>
                  <i>{t("Italic", "Kursiv")}</i>
                  <span>≡ {t("Lists", "Listen")}</span>
                  <span className="format-link">Links ↗</span>
                  <span className="format-code">`Code`</span>
                  <span>❝ {t("Quotes", "Zitate")}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="source-section" id="open-source">
            <div className="source-inner section-wrap">
              <Reveal>
                <h2>
                  {t("Good tools", "Gute Tools")}
                  <br />
                  {t("are worth sharing.", "sind zum Teilen da.")}
                </h2>
                <p>
                  {t("A free project by E1NSER. Explore the code, report a bug or build on it with your own ideas.", "Ein kostenloses Projekt von E1NSER. Schau in den Code, melde einen Fehler oder mach deine eigene Idee daraus.")}
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
              <h2>{t("The details.", "Die Details.")}</h2>
              <p>{t("A few things to know before you start.", "Die Details, bevor du loslegst.")}</p>
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
                alt={t("Mail Markdown app icon", "Mail Markdown App-Icon")}
                width={94}
                height={94}
              />
              <h2>
                {t("Your next AI text.", "Dein nächster KI-Text.")}
                <br />
                <span>{t("In your Mail style.", "Im Stil deiner Mail.")}</span>
              </h2>
              <p>{t("Paste Markdown straight into Apple Mail with ⌘V. Free and unlimited.", "Markdown mit ⌘V direkt in Apple Mail einfügen. Kostenlos und unbegrenzt.")}</p>
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
                    {release.version} · {t("Universal DMG", "Universal-DMG")} · {t("free", "kostenlos")}
                    <br />
                    <a href={`${RELEASES_URL}/latest`}>
                      {t("Read release notes", "Release-Notes ansehen")} ↗
                    </a>
                  </>
                ) : release.status === "not-published" ? (
                  <>
                    {t("The first public Mac release is being prepared.", "Der erste öffentliche Mac-Release wird vorbereitet.")}
                    <br />
                    {t("The source code is available on GitHub.", "Den Quellcode findest du auf GitHub.")}
                  </>
                ) : release.status === "no-download" ? (
                  <>
                    {t(`A Mac download is not yet available for ${release.version}.`, `Für ${release.version} ist noch kein Mac-Download verfügbar.`)}
                    <br />
                    <a href={RELEASES_URL}>
                      {t("Check release status on GitHub", "Release-Status auf GitHub ansehen")} ↗
                    </a>
                  </>
                ) : (
                  <>
                    {t("The download status is unavailable right now.", "Der Download-Status ist gerade nicht abrufbar.")}
                    <br />
                    <a href={RELEASES_URL}>{t("Check releases on GitHub", "Releases auf GitHub prüfen")} ↗</a>
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
          <a className="footer-brand" href={localePath(locale)}>
            Mail Markdown<span>.</span>
          </a>
          <span className="footer-credit">
            {t("A small tool by", "Ein kleines Tool von")}{" "}
            <a href="https://einser.at" target="_blank" rel="noreferrer">
              E1NSER. <ArrowUpRight size={12} />
            </a>
          </span>
          <nav aria-label={t("Footer navigation", "Footer")}>
            <a href={repo} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link href={localePath(locale, "/privacy")}>{t("Privacy", "Datenschutz")}</Link>
            <Link href={localePath(locale, "/legal-notice")}>{t("Legal notice", "Impressum")}</Link>
            <CookieSettingsButton className="footer-cookie-settings" />
          </nav>
        </footer>
        <div className="trademark-note section-wrap">
          {t("An independent project. Apple and Apple Mail are trademarks of Apple Inc.", "Ein unabhängiges Projekt. Apple und Apple Mail sind Marken von Apple Inc.")}
        </div>
      </div>
    </MotionProvider>
  );
}

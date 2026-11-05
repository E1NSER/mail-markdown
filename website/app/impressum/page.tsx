import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent-provider";

export const metadata: Metadata = {
  title: "Impressum",
  alternates: { canonical: "/impressum" },
  description: "Herausgeber und Kontakt der Mail-Markdown-Website von E1NSER.",
};

export default function ImpressumPage() {
  return (
    <main className="legal-page">
      <Link href="/">← Zur Startseite</Link>
      <h1>Impressum</h1>
      <p>Angaben zum Herausgeber dieser Website und Kontakt zu E1NSER.</p>

      <section>
        <h2>Medieninhaber und Herausgeber</h2>
        <p>
          E1NSER. — Sascha Eisner
          <br />
          Arnsteingasse 26/36
          <br />
          1150 Wien, Österreich
        </p>
        <p>
          E-Mail: <a href="mailto:hallo@einser.at">hallo@einser.at</a>
          <br />
          Telefon: <a href="tel:+4369910955602">+43 699 109 55 602</a>
        </p>
      </section>

      <section>
        <h2>Unternehmensangaben</h2>
        <p>
          Inhaber: Sascha Eisner
          <br />
          Umsatzsteuer-Identifikationsnummer: ATU65427905
          <br />
          Kammerzugehörigkeit: Wirtschaftskammer Wien
        </p>
        <p>
          Gewerbliche Rechtsvorschriften sind im{" "}
          <a href="https://www.ris.bka.gv.at/">
            Rechtsinformationssystem des Bundes
          </a>{" "}
          abrufbar. Weitere Unternehmensangaben findest du im{" "}
          <a href="https://www.einser.at/impressum">
            offiziellen Impressum von E1NSER
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Über diese Website</h2>
        <p>
          Diese Website informiert über Mail Markdown, eine kostenlose
          macOS-Anwendung zum Formatieren von Markdown in Apple Mail. Quellcode,
          Versionshinweise und Support findest du im{" "}
          <a href="https://github.com/E1NSER/mail-markdown">
            öffentlichen GitHub-Repository
          </a>
          . Für den Quellcode gelten die dort veröffentlichten
          Lizenzbedingungen.
        </p>
      </section>

      <section>
        <h2>Datenschutz</h2>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten auf dieser
          Website und zur Abgrenzung von der macOS-App stehen in unserer{" "}
          <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
        <CookieSettingsButton className="legal-cookie-settings" />
      </section>

      <section>
        <h2>Schriften und Gestaltung</h2>
        <p>
          Manrope und DM Mono werden lokal mit der Website ausgeliefert. Es gelten
          die jeweiligen SIL Open Font Licenses: <a href="/licenses/Manrope-OFL.txt">Manrope</a>
          {" und "}<a href="/licenses/DM-Mono-OFL.txt">DM Mono</a>. Das App-Icon ist
          eine eigene Gestaltung des Projekts.
        </p>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/datenschutz" },
  description:
    "Datenschutz bei der Mail-Markdown-Website, im Browser-Playground und in der lokal arbeitenden macOS-App.",
};

export default function DatenschutzPage() {
  return (
    <main className="legal-page">
      <Link href="/">← Zur Startseite</Link>
      <h1>Datenschutz</h1>
      <p>
        Dein Text bleibt dein Text. Hier erklären wir getrennt, wie diese
        Website und die macOS-App Mail Markdown mit Daten umgehen.
      </p>

      <section>
        <h2>Verantwortlicher und Kontakt</h2>
        <p>
          E1NSER. — Sascha Eisner
          <br />
          Arnsteingasse 26/36, 1150 Wien, Österreich
          <br />
          <a href="mailto:hallo@einser.at">hallo@einser.at</a>
        </p>
        <p>
          Weitere Unternehmensangaben findest du im{" "}
          <Link href="/impressum">Impressum</Link>.
        </p>
      </section>

      <section>
        <h2>Website und Hosting</h2>
        <p>
          Diese Website wird bei Vercel Inc., USA, gehostet. Beim Abruf werden
          technisch notwendige Verbindungs- und Anfragedaten verarbeitet. Dazu
          können IP-Adresse, Zeitpunkt, angeforderte Adresse sowie Informationen
          über Browser und Betriebssystem gehören. Das ermöglicht die
          Auslieferung der Seiten und den Schutz des Betriebs.
        </p>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse an einer zuverlässig
          und sicher erreichbaren Website nach Art. 6 Abs. 1 lit. f DSGVO.
          Vercel verwendet eine globale Infrastruktur; eine Verarbeitung
          außerhalb des Europäischen Wirtschaftsraums, insbesondere in den USA,
          ist möglich. Informationen zu Vercels Verarbeitung und den
          beschriebenen Übermittlungsschutzmaßnahmen findest du in der{" "}
          <a href="https://vercel.com/legal/privacy-notice">
            Datenschutzerklärung von Vercel
          </a>{" "}
          und den{" "}
          <a href="https://vercel.com/legal/dpa">
            Bedingungen zur Datenverarbeitung
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Markdown-Playground</h2>
        <p>
          Der Playground formatiert deine Eingaben direkt in deinem Browser. Der
          Text wird nur im Arbeitsspeicher des geöffneten Tabs gehalten und
          weder zur Umwandlung an einen Server gesendet noch von dieser Website
          dauerhaft gespeichert. Beim Neuladen wird die Eingabe durch das
          Ausgangsbeispiel ersetzt.
        </p>
        <p>
          Wenn du ein Ergebnis kopierst, landet es durch diese Aktion in deiner
          systemweiten Zwischenablage. Für deren Inhalt und weitere Verwendung
          gelten die Einstellungen und Funktionen deines Geräts.
        </p>
      </section>

      <section>
        <h2>Keine Analyse, keine Konten</h2>
        <p>
          Wir binden auf dieser Website keine Analyse- oder Werbedienste ein.
          Der Anwendungscode setzt keine Cookies und speichert keine
          Playground-Eingaben im lokalen Browserspeicher. Du brauchst kein
          Nutzerkonto. Schriftdateien werden zusammen mit der Website
          ausgeliefert; dein Browser lädt dafür keine Schrift von einem externen
          Schriftanbieter.
        </p>
      </section>

      <section>
        <h2>Die macOS-App arbeitet lokal</h2>
        <p>
          Mail Markdown verarbeitet Markdown auf deinem Mac und übermittelt
          Entwurfs- oder Zwischenablagentexte nicht an E1NSER oder einen
          Konvertierungsdienst. Die App enthält keine Analyse- oder Werbedienste
          und benötigt kein Konto.
        </p>
        <p>
          Die App liest für den Einfügevorgang die Zwischenablage und mit deiner
          Bedienungshilfen-Freigabe den Bearbeitungskontext in Mail. Eine
          benachbarte Schriftprobe liefert den Textstil; der vollständige
          Entwurf und der Posteingang werden nicht abgerufen. Eine Sicherung der
          ursprünglichen Zwischenablage bleibt vorübergehend im Arbeitsspeicher.
          Einstellungen und technische Statusmeldungen werden lokal verwaltet.
        </p>
        <p>
          Du kannst die Formatierung pausieren, die App beenden oder die
          Bedienungshilfen-Freigabe in den macOS-Systemeinstellungen widerrufen.
          Die vollständigen, zum Quellcode gehörenden{" "}
          <a href="https://github.com/E1NSER/mail-markdown/blob/main/PRIVACY.md">
            Datenschutzhinweise der App
          </a>{" "}
          erläutern auch Zwischenablage, lokale Protokolle und externe Links.
        </p>
      </section>

      <section>
        <h2>Externe Links und Support</h2>
        <p>
          Für den Download-Status ruft unser Server öffentliche Release-Daten
          von GitHub ab. Deine Eingaben im Playground werden dabei nicht
          übertragen. Der eigentliche App-Download erfolgt direkt bei GitHub.
        </p>
        <p>
          Quellcode, Downloads und Fehlerberichte liegen bei GitHub. Erst wenn
          du einem solchen Link folgst, rufst du GitHub auf; dort gelten die{" "}
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            Datenschutzregeln von GitHub
          </a>
          . Freiwillig eingereichte öffentliche Issues und deren Inhalte sind
          öffentlich sichtbar. Für Fehlerberichte eignen sich anonymisierte
          Beispiele.
        </p>
        <p>
          Wenn du uns per E-Mail kontaktierst, verwenden wir deine Kontaktdaten
          und den Inhalt deiner Nachricht zur Bearbeitung und Beantwortung der
          Anfrage. Grundlage ist unser berechtigtes Interesse an der
          Kommunikation nach Art. 6 Abs. 1 lit. f DSGVO. Die Website enthält
          kein eigenes Kontaktformular.
        </p>
      </section>

      <section>
        <h2>Deine Rechte</h2>
        <p>
          Nach Maßgabe der gesetzlichen Voraussetzungen kannst du Auskunft,
          Berichtigung, Löschung, Einschränkung der Verarbeitung und
          Datenübertragbarkeit verlangen. Gegen eine Verarbeitung auf Grundlage
          berechtigter Interessen kannst du aus Gründen deiner besonderen
          Situation Widerspruch einlegen. Wende dich dafür an{" "}
          <a href="mailto:hallo@einser.at">hallo@einser.at</a>.
        </p>
        <p>
          Du hast außerdem das Recht, dich bei einer Datenschutzaufsichtsbehörde
          zu beschweren. In Österreich ist dies die{" "}
          <a href="https://dsb.gv.at/">Österreichische Datenschutzbehörde</a>.
        </p>
      </section>

      <p>Stand: 5. November 2026</p>
    </main>
  );
}

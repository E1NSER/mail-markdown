import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent-provider";
import { validMeasurementId } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/datenschutz" },
  description:
    "Datenschutz bei der Mail-Markdown-Website, im Browser-Playground und in der lokal arbeitenden macOS-App.",
};

export default function DatenschutzPage() {
  const analyticsConfigured = Boolean(
    validMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  );

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
        <h2>Deine Auswahl zu Statistik</h2>
        <p>
          Optionale Statistik ist standardmäßig ausgeschaltet. Sobald sie
          eingerichtet ist, kannst du sie im Einwilligungsdialog erlauben oder
          genauso einfach ablehnen. Website, Playground und App-Download
          funktionieren auch ohne Zustimmung. Über
          „Cookie-Einstellungen“ im Footer kannst du deine Auswahl jederzeit
          ändern und eine Einwilligung für die Zukunft widerrufen. Die bis zum
          Widerruf erfolgte Verarbeitung bleibt davon unberührt.
        </p>
        <CookieSettingsButton className="legal-cookie-settings" />
        <p>
          Wir merken uns ausschließlich deine Auswahl, ihre Version und den
          Zeitpunkt lokal im Browser über localStorage unter dem Schlüssel
          „mail-markdown-consent-v1“. Dafür vergeben wir keine eindeutige
          Besucherkennung. Die Auswahl gilt höchstens 180 Tage;
          bei einem späteren Besuch oder einer geänderten Einwilligungsversion
          fragen wir erneut. Du kannst den Eintrag auch über die
          Browser-Einstellungen löschen. Diese notwendige Speicherung dient der
          Umsetzung deiner Datenschutzentscheidung (§ 165 Abs. 3 TKG 2021;
          berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </section>

      <section>
        <h2>Optionale Statistik mit Google Analytics 4</h2>
        {!analyticsConfigured && (
          <p>
            Die Statistikfunktion ist vorbereitet, derzeit aber noch nicht mit
            einer Analytics-Messkennung eingerichtet. Deshalb werden aktuell
            keine Statistikdaten an Google gesendet.
          </p>
        )}
        <p>
          {analyticsConfigured
            ? "Wir laden Google Analytics 4 ausschließlich nach deiner ausdrücklichen Zustimmung zur Statistik."
            : "Wird die Funktion aktiviert, laden wir Google Analytics 4 ausschließlich nach deiner ausdrücklichen Zustimmung zur Statistik."}{" "}
          Rechtsgrundlage sind deine Einwilligung nach
          Art. 6 Abs. 1 lit. a DSGVO und § 165 Abs. 3 TKG 2021. Vor der Zustimmung
          und bei Ablehnung werden keine Google-Statistik-Tags geladen und keine
          Messsignale an Google gesendet (Consent Mode im Basismodus).
        </p>
        <p>
          Die Auswertung soll zeigen, welche Seiten besucht werden und wie oft
          der App-Download gestartet wird. Nach Zustimmung können dabei
          Cookie-Kennungen, Seitenaufrufe, Zeitpunkte sowie Browser-, Geräte- und
          grobe Standortinformationen verarbeitet werden. Seitenadressen werden
          ohne Suchparameter und URL-Fragmente übermittelt. Ein Download-Ereignis
          erfasst nur das Betätigen des Download-Links und feste Angaben zur
          Installationsdatei; es bestätigt keinen abgeschlossenen Download und
          keine Installation. Inhalte aus dem Markdown-Playground,
          Zwischenablagentexte und E-Mail-Entwürfe gehören nicht zu den
          Statistikdaten.
        </p>
        <p>
          Die Einbindung ist für Statistik vorgesehen. Die Einwilligungssignale für
          Werbespeicherung, werbebezogene Nutzerdaten und personalisierte Werbung
          bleiben abgelehnt (ad_storage, ad_user_data und ad_personalization).
          Die Einwilligung gilt ausschließlich für diese Website; die
          macOS-App enthält weiterhin keine Analytics-Funktion.
        </p>
        <p>
          Google Analytics wird von Google bereitgestellt. Bei aktivierter
          Messung erhält Google technische Verbindungsdaten. Laut Google werden
          IP-Adressen von Nutzerinnen und
          Nutzern aus der EU vor der weiteren Verarbeitung verworfen; sie werden
          dort unter anderem zur Ableitung des groben Standorts verwendet. Das
          bedeutet keine anonyme Nutzung des Dienstes. Eine weitere Verarbeitung
          durch Google-Unternehmen, auch in den USA, ist möglich. Weitere
          Informationen findest du in Googles{" "}
          <a href="https://support.google.com/analytics/answer/12017362?hl=de">
            Hinweisen zur Datenverarbeitung in Europa
          </a>{" "}
          und der{" "}
          <a href="https://policies.google.com/privacy?hl=de">
            Datenschutzerklärung
          </a>
          . Die{" "}
          <a href="https://business.safety.google/adsprocessorterms/">
            Datenverarbeitungsbedingungen
          </a>{" "}
          sind im verwendeten Analytics-Konto angenommen. Für internationale
          Übermittlungen beschreibt Google je nach anwendbaren Voraussetzungen
          Angemessenheitsbeschlüsse einschließlich des EU-US Data Privacy
          Framework und Standardvertragsklauseln. Einzelheiten zu diesen
          Mechanismen veröffentlicht Google in seinen{" "}
          <a href="https://business.safety.google/adsdatatransfers/">
            Informationen zu internationalen Datenübermittlungen
          </a>
          .
        </p>
        <p>
          Im verwendeten Analytics-Konto ist die zusätzliche Datenfreigabe für
          „Google-Produkte und -Dienste“ ausgeschaltet. Aktiviert sind Beiträge
          für Modellierung und Geschäftsanalysen, technischer Support sowie
          Geschäftsempfehlungen. Laut Google werden die Beiträge für
          branchenübergreifende Analysen und Benchmarks mit Daten anderer
          Websites und Apps aggregiert. Die Support-Freigabe ermöglicht Google
          bei technischen Problemen den Zugriff auf Analytics-Daten;
          Geschäftsempfehlungen können Kontonutzungs- und Konfigurationsdaten
          berücksichtigen. Google erläutert die Zwecke in seinen{" "}
          <a href="https://support.google.com/analytics/answer/1011397?hl=de">
            Hinweisen zu den Datenfreigabeeinstellungen
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Statistik-Cookies und Aufbewahrung</h2>
        <p>
          Bei aktivierter Statistik und erteilter Zustimmung kann Google
          Analytics auf dieser Website die Cookies mm_ga und
          mm_ga_&lt;Kennung&gt; zur Wiedererkennung eines Browsers und zur
          Zuordnung von Sitzungen verwenden. Wir begrenzen deren Laufzeit auf
          180 Tage ab dem Setzen und deaktivieren die automatische Verlängerung
          bei weiteren Besuchen. Die Cookies gelten nur für den jeweiligen
          Website-Host; Browser können kürzere Grenzen anwenden. Die Laufzeit
          dieser Statistik-Cookies ist technisch von der Gültigkeit unserer
          gespeicherten Einwilligungsauswahl getrennt. Allgemeine Hinweise nennt
          Google in seiner{" "}
          <a href="https://support.google.com/analytics/answer/11397207?hl=de">
            Dokumentation zu Analytics-Cookies
          </a>
          .
        </p>
        <p>
          Für nutzer- und ereignisbezogene Messdaten ist in Google Analytics eine
          Aufbewahrungsfrist von zwei Monaten eingestellt. Neue Aktivitäten
          verlängern die Aufbewahrungsfrist einer Nutzerkennung nicht. Diese
          Einstellung ist von der Cookie-Laufzeit zu unterscheiden und gilt
          nicht automatisch für aggregierte Berichte. Ein Widerruf stoppt
          künftige Statistikmessungen und entfernt die von dieser Website
          gesetzten mm_ga-Cookies. Bereits rechtmäßig verarbeitete Daten werden
          dadurch nicht automatisch rückwirkend gelöscht. Für ein
          Löschungsbegehren kannst du uns kontaktieren.
        </p>
      </section>

      <section>
        <h2>Keine Konten, lokale Schriften</h2>
        <p>
          Du brauchst für diese Website kein Nutzerkonto. Playground-Eingaben
          werden nicht im lokalen Browserspeicher abgelegt. Schriftdateien werden
          zusammen mit der Website ausgeliefert; dein Browser lädt dafür keine
          Schrift von einem externen Schriftanbieter.
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
          Für den Download-Status und die Sternezahl ruft unser Server
          öffentliche Release- und Repository-Daten von GitHub ab. Deine
          Eingaben im Playground werden dabei nicht übertragen. Der eigentliche
          App-Download erfolgt direkt bei GitHub.
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

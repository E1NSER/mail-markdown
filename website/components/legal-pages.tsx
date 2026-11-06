import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent-provider";
import { localePath, type Locale } from "@/lib/i18n";
import styles from "./legal-language.module.css";

function LegalHeader({ locale, path }: { locale: Locale; path: "/privacy" | "/legal-notice" }) {
  return (
    <div className={styles.header}>
      <Link className={styles.back} href={localePath(locale)}>{locale === "de" ? "← Zur Startseite" : "← Back to home"}</Link>
      <nav className={styles.language} aria-label={locale === "de" ? "Sprache" : "Language"}>
        {(["en", "de"] as const).map(language => (
          <Link
            key={language}
            className={styles.languageLink}
            href={localePath(language, path)}
            hrefLang={language}
            lang={language}
            aria-current={locale === language ? "page" : undefined}
            aria-label={language === "en" ? "English" : "Deutsch"}
          >
            {language.toUpperCase()}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PrivacyPage({ locale, analyticsConfigured }: { locale: Locale; analyticsConfigured: boolean }) {
  if (locale === "de") return <GermanPrivacyPage analyticsConfigured={analyticsConfigured} />;
  return (
    <main className="legal-page">
      <LegalHeader locale={locale} path="/privacy" />
      <h1>Privacy</h1>
      <p>Your text remains yours. Here we explain separately how this website and the Mail Markdown macOS app handle data.</p>

      <section>
        <h2>Controller and contact</h2>
        <p>E1NSER. — Sascha Eisner<br />Arnsteingasse 26/36, 1150 Vienna, Austria<br /><a href="mailto:hallo@einser.at">hallo@einser.at</a></p>
        <p>Further company information is available in the <Link href={localePath(locale, "/legal-notice")}>legal notice</Link>.</p>
      </section>

      <section>
        <h2>Website and hosting</h2>
        <p>This website is hosted by Vercel Inc., USA. Technically necessary connection and request data are processed when you visit it. These may include your IP address, the time, the requested address and information about your browser and operating system. This enables delivery of the pages and protects the service.</p>
        <p>The legal basis is our legitimate interest in a reliable and secure website under Article 6(1)(f) GDPR. Vercel uses global infrastructure; processing outside the European Economic Area, particularly in the USA, is possible. Information about Vercel’s processing and the transfer safeguards it describes is available in its <a href="https://vercel.com/legal/privacy-notice">privacy notice</a> and <a href="https://vercel.com/legal/dpa">data processing terms</a>.</p>
      </section>

      <section>
        <h2>Markdown playground</h2>
        <p>The playground formats your input directly in your browser. Text is held only in the open tab’s memory. This website neither sends it to a server for conversion nor stores it permanently. Reloading replaces your input with the initial example.</p>
        <p>If you copy a result, that action places it on your system clipboard. Your device’s settings and features govern its contents and further use.</p>
      </section>

      <section>
        <h2>Your statistics choice</h2>
        <p>Optional statistics are off by default. Once configured, you can allow them in the consent dialog or reject them just as easily. The website, playground and app download work without consent. You can change your choice and withdraw consent for the future at any time through “Cookie settings” in the footer. This does not affect processing that took place before withdrawal.</p>
        <CookieSettingsButton className="legal-cookie-settings" />
        <p>We store only your choice, its version and its timestamp locally in your browser’s localStorage, under the key “mail-markdown-consent-v1”. We do not assign a unique visitor ID for this. The choice is valid for no more than 180 days; we ask again on a later visit or when the consent version changes. You can also delete the entry through your browser’s settings. This necessary storage implements your privacy decision (Section 165(3) TKG 2021; legitimate interest under Article 6(1)(f) GDPR).</p>
      </section>

      <section>
        <h2>Optional statistics with Google Analytics 4</h2>
        {!analyticsConfigured && <p>The statistics feature is prepared but is not currently configured with an Analytics measurement ID. No statistics data are therefore currently sent to Google.</p>}
        <p>{analyticsConfigured ? "We load Google Analytics 4 only after your explicit consent to statistics." : "If the feature is activated, we will load Google Analytics 4 only after your explicit consent to statistics."} The legal bases are your consent under Article 6(1)(a) GDPR and Section 165(3) TKG 2021. Before consent and when you reject it, no Google statistics tags are loaded and no measurement signals are sent to Google (Basic Consent Mode).</p>
        <p>The analysis is intended to show which pages are visited and how often the app download is started. After consent, processing may include cookie identifiers, page views, timestamps, browser and device information, and approximate location. Page addresses are transmitted without query parameters or URL fragments. A download event records only activation of the download link and fixed details about the installer; it does not confirm a completed download or installation. Markdown playground contents, clipboard text and email drafts are not part of the statistics data.</p>
        <p>The integration is intended for statistics. The consent signals for advertising storage, advertising user data and personalized advertising remain denied (ad_storage, ad_user_data and ad_personalization). Consent applies only to this website; the macOS app continues to contain no analytics feature.</p>
        <p>Google Analytics is provided by Google. When measurement is active, Google receives technical connection data. According to Google, EU users’ IP addresses are discarded before further processing; they are used, among other things, to derive an approximate location. This does not make use of the service anonymous. Further processing by Google companies, including in the USA, is possible. More information is available in Google’s <a href="https://support.google.com/analytics/answer/12017362?hl=en">information about data processing in Europe</a> and <a href="https://policies.google.com/privacy?hl=en">privacy policy</a>. The <a href="https://business.safety.google/adsprocessorterms/">data processing terms</a> have been accepted in the Analytics account used. For international transfers, Google describes adequacy decisions, including the EU-US Data Privacy Framework, and standard contractual clauses, depending on the applicable conditions. Details about these mechanisms appear in Google’s <a href="https://business.safety.google/adsdatatransfers/">international data transfer information</a>.</p>
        <p>In the Analytics account used, additional data sharing for “Google products &amp; services” is off. Contributions for modeling and business insights, technical support and business recommendations are enabled. According to Google, contributions to cross-industry analyses and benchmarks are aggregated with data from other websites and apps. Support sharing allows Google to access Analytics data when addressing technical problems; business recommendations may take account usage and configuration data into consideration. Google explains the purposes in its <a href="https://support.google.com/analytics/answer/1011397?hl=en">data sharing settings information</a>.</p>
      </section>

      <section>
        <h2>Statistics cookies and retention</h2>
        <p>When statistics are active and you have consented, Google Analytics may use the cookies mm_ga and mm_ga_&lt;identifier&gt; on this website to recognize a browser and associate sessions. We limit their lifetime to 180 days from being set and disable automatic extension on further visits. The cookies apply only to the respective website host; browsers may apply shorter limits. The lifetime of these statistics cookies is technically separate from the validity of our stored consent choice. General information is available in Google’s <a href="https://support.google.com/analytics/answer/11397207?hl=en">Analytics cookie documentation</a>.</p>
        <p>Google Analytics is set to retain user- and event-level measurement data for two months. New activity does not extend the retention period of a user identifier. This setting is separate from the cookie lifetime and does not automatically apply to aggregated reports. Withdrawal stops future statistics measurements and removes the mm_ga cookies set by this website. It does not automatically delete data that have already been lawfully processed. You can contact us to request deletion.</p>
      </section>

      <section>
        <h2>No accounts, locally hosted fonts</h2>
        <p>You do not need an account for this website. Playground input is not placed in local browser storage. Font files are delivered with the website; your browser does not load a font from an external font provider for this purpose.</p>
      </section>

      <section>
        <h2>The macOS app works locally</h2>
        <p>Mail Markdown processes Markdown on your Mac and does not transmit draft or clipboard text to E1NSER or a conversion service. The app contains no analytics or advertising services and requires no account.</p>
        <p>For a paste operation, the app reads the clipboard and, with your Accessibility permission, the editing context in Mail. A neighboring font sample provides the text style; the full draft and inbox are not retrieved. A backup of the original clipboard remains temporarily in memory. Settings and technical status messages are managed locally.</p>
        <p>You can pause formatting, quit the app or revoke Accessibility permission in macOS System Settings. The complete <a href="https://github.com/E1NSER/mail-markdown/blob/main/PRIVACY.md">app privacy information</a> included with the source code also explains the clipboard, local logs and external links.</p>
      </section>

      <section>
        <h2>External links and support</h2>
        <p>Our server fetches public release and repository data from GitHub for the download status and star count. Your playground input is not transmitted as part of this. The app itself downloads directly from GitHub.</p>
        <p>Source code, downloads and issue reports are hosted on GitHub. You access GitHub only when you follow one of these links; GitHub’s <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">privacy rules</a> then apply. Public issues submitted voluntarily and their contents are publicly visible. Anonymized examples are suitable for issue reports.</p>
        <p>If you contact us by email, we use your contact details and the contents of your message to process and answer the request. The basis is our legitimate interest in communication under Article 6(1)(f) GDPR. This website does not have its own contact form.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>Subject to the statutory requirements, you may request access, rectification, erasure, restriction of processing and data portability. You may object to processing based on legitimate interests on grounds relating to your particular situation. Contact <a href="mailto:hallo@einser.at">hallo@einser.at</a> to do so.</p>
        <p>You also have the right to lodge a complaint with a data protection supervisory authority. In Austria, this is the <a href="https://dsb.gv.at/">Austrian Data Protection Authority</a>.</p>
      </section>
      <p>Last updated: 5 November 2026</p>
    </main>
  );
}

export function LegalNoticePage({ locale }: { locale: Locale }) {
  if (locale === "de") return <GermanLegalNoticePage />;
  return (
    <main className="legal-page">
      <LegalHeader locale={locale} path="/legal-notice" />
      <h1>Legal notice</h1>
      <p>Publisher information for this website and contact details for E1NSER.</p>
      <section>
        <h2>Media owner and publisher</h2>
        <p>E1NSER. — Sascha Eisner<br />Arnsteingasse 26/36<br />1150 Vienna, Austria</p>
        <p>Email: <a href="mailto:hallo@einser.at">hallo@einser.at</a><br />Phone: <a href="tel:+4369910955602">+43 699 109 55 602</a></p>
      </section>
      <section>
        <h2>Company information</h2>
        <p>Owner: Sascha Eisner<br />VAT identification number: ATU65427905<br />Chamber membership: Vienna Chamber of Commerce</p>
        <p>Applicable trade regulations can be found in the <a href="https://www.ris.bka.gv.at/">Austrian Legal Information System</a>. Further company information is available in the <a href="https://www.einser.at/impressum">official E1NSER legal notice</a>.</p>
      </section>
      <section>
        <h2>About this website</h2>
        <p>This website presents Mail Markdown, a free macOS application for formatting Markdown in Apple Mail. Source code, release notes and support are available in the <a href="https://github.com/E1NSER/mail-markdown">public GitHub repository</a>. The license terms published there apply to the source code.</p>
      </section>
      <section>
        <h2>Privacy</h2>
        <p>Our <Link href={localePath(locale, "/privacy")}>privacy notice</Link> explains the processing of personal data on this website and how it differs from the macOS app.</p>
        <CookieSettingsButton className="legal-cookie-settings" />
      </section>
      <section>
        <h2>Fonts and design</h2>
        <p>Manrope and DM Mono are delivered locally with the website. Their respective SIL Open Font Licenses apply: <a href="/licenses/Manrope-OFL.txt">Manrope</a> and <a href="/licenses/DM-Mono-OFL.txt">DM Mono</a>. The app icon is an original design for this project.</p>
      </section>
    </main>
  );
}

function GermanPrivacyPage({ analyticsConfigured }: { analyticsConfigured: boolean }) {

  return (
    <main className="legal-page">
      <LegalHeader locale="de" path="/privacy" />
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
          <Link href={localePath("de", "/legal-notice")}>Impressum</Link>.
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

function GermanLegalNoticePage() {
  return (
    <main className="legal-page">
      <LegalHeader locale="de" path="/legal-notice" />
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
          <Link href={localePath("de", "/privacy")}>Datenschutzerklärung</Link>.
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

# App-Store-Vorbereitung — kostenlos und unbegrenzt

**Status: prüfbare Entwürfe, keine abgeschlossene Einreichung.** Die vorhandene App verwendet prozessübergreifende Accessibility-APIs. Für eine neue Mac-App-Store-Fassung muss zuerst der alternative sandboxfähige macOS-Dienst mit geändertem Bedienablauf umgesetzt und geprüft werden. Einzelheiten: [Machbarkeitsprüfung](APP_STORE_FEASIBILITY.md).

Die Texte unten beschreiben ausschließlich diese geplante Services-Fassung. Sie dürfen erst verwendet werden, wenn der eingereichte Build die Aussagen tatsächlich erfüllt und das öffentliche Repository erreichbar ist. Für die unveränderte GitHub-Fassung gilt der separate Abschnitt am Ende.

## Festgelegte Produktdaten

| Feld | Entwurf |
|---|---|
| Plattform | macOS; Mindestversion des endgültigen Builds prüfen |
| Kategorie | Productivity / Produktivität |
| Preis | Kostenlos |
| Nutzung | Unbegrenzt; kein Zähler und keine Paywall |
| In-App-Käufe / Abonnements | Keine |
| App-Konto / Anmeldung | Nicht erforderlich |
| Oberfläche | Derzeit Deutsch; englische Metadaten sind keine englische UI-Lokalisierung |
| Geplantes Repository | https://github.com/E1NSER/mail-markdown |
| Geplanter Supportpfad | https://github.com/E1NSER/mail-markdown/issues |

Die Verfügbarkeit des Namens und die endgültigen Angaben in App Store Connect sind noch zu prüfen. Apple erlaubt 30 Zeichen für Name und Untertitel, 170 für Werbetext, 4.000 für Beschreibung und 100 Bytes für Keywords. [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information), [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)


## Deutsche Metadaten

| Feld | Text | Länge |
|---|---|---|
| Name | Mail Markdown | 13 / 30 Zeichen |
| Untertitel / Subtitle | Markdown lokal formatieren | 26 / 30 Zeichen |
| Werbetext / Promotional text | Markdown lokal formatieren: Text markieren und den macOS-Dienst starten. Ohne Konto, Abonnement oder Nutzungslimit. | 115 / 170 Zeichen |
| Keywords | `text,formatieren,richtext,listen,zitate,schreiben,produktivitaet` | 64 / 100 Bytes |

Beschreibung / Description (880 / 4.000 Zeichen):

```text
Mail Markdown macht aus Markdown formatierten Text — direkt auf deinem Mac.

Markiere Markdown im Nachrichtentext eines Rich-Text-Entwurfs und starte den macOS-Dienst „Markdown formatieren“. Der ausgewählte Text wird durch das formatierte Ergebnis ersetzt. Für den Dienst kannst du in den Systemeinstellungen ein eigenes Tastenkürzel festlegen.

Unterstützt werden Überschriften, Fett- und Kursivschrift, Listen, Links und Zitate. Eine Vorschau zeigt dir, wie Markdown in formatierten Text umgewandelt wird.

Die Verarbeitung erfolgt lokal. Du brauchst weder ein Konto noch ein Abonnement. Die Nutzung ist unbegrenzt; es gibt keine In-App-Käufe.

Die Benutzeroberfläche ist derzeit auf Deutsch. Der Quellcode ist öffentlich auf GitHub verfügbar.

Die App-Store-Version arbeitet als explizit aufgerufener macOS-Dienst. Sie ersetzt nicht automatisch den normalen Einfügen-Befehl ⌘V.
```


## English metadata

| Feld | Text | Länge |
|---|---|---|
| Name | Mail Markdown | 13 / 30 Zeichen |
| Untertitel / Subtitle | Local Markdown formatting | 25 / 30 Zeichen |
| Werbetext / Promotional text | Turn selected Markdown into formatted text with a macOS Service. Process text locally, with no account, subscription, or usage limit. | 133 / 170 Zeichen |
| Keywords | `text,formatting,richtext,lists,quotes,writing,productivity` | 58 / 100 Bytes |

Beschreibung / Description (766 / 4.000 Zeichen):

```text
Mail Markdown turns Markdown into formatted text on your Mac.

Select Markdown in the message body of a rich-text draft, then run the “Markdown formatieren” macOS Service. The formatted result replaces your selection. You can assign a separate keyboard shortcut to the Service in System Settings.

Format headings, bold and italic text, lists, links, and quotes. A preview lets you explore how Markdown becomes formatted text.

Text processing happens locally. No account or subscription is required. Usage is unlimited, with no in-app purchases.

The app interface is currently in German. Its source code is publicly available on GitHub.

The App Store edition uses an explicitly invoked macOS Service. It does not automatically replace the normal ⌘V paste command.
```


## Datenschutz: aus dem aktuellen Code belegbar

- Markdown und Rich Text werden auf dem Mac verarbeitet. Im App-Code gibt es keine Netzwerk-Client-Implementierung, Analyse-, Werbe-, Konto- oder Kaufdienste und keinen eigenen Server.
- Die aktuelle Direktvertriebsfassung liest bei einem passenden Einfügevorgang die Zwischenablage sowie Mail-Fokus, Auswahl und benachbarte Textattribute. Die geplante Services-Fassung soll stattdessen ausschließlich die vom Editor übergebene Auswahl verarbeiten; das ist noch zu verifizieren.
- Eine Original-Zwischenablage wird vorübergehend im Arbeitsspeicher gehalten und bei neuem Kopieren, Wiederherstellen oder App-Ende verworfen. Die macOS-Zwischenablage selbst kann den zuletzt eingefügten Inhalt weiterhin enthalten.
- Einstellungen wie der Formatierungsschalter und die Fensterposition werden lokal gespeichert. Der Start bei der Anmeldung wird durch macOS verwaltet.
- Betriebsdiagnosen enthalten Status, UI-Rollen und Prozess-IDs; Entwurfs- und Zwischenablagentexte werden nicht protokolliert. Die App implementiert keinen Upload dieser Diagnosen.

Vorgeschlagene App-Privacy-Antwort für den unverändert lokalen Datenfluss: **Data Not Collected / Keine Daten erfasst**, kein Tracking. Das ist eine Vorbelegung, keine bereits eingereichte Antwort. Apple unterscheidet reine Verarbeitung auf dem Gerät von einer Übermittlung an Entwickler oder Partner. Vor Einreichung den tatsächlichen Services-Build, seine Abhängigkeiten und den endgültigen Supportablauf erneut prüfen. [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)

### Datenschutzseitentext — Entwurf für die aktuelle Direktvertriebsfassung

```text
Datenschutz bei Mail Markdown

Mail Markdown verarbeitet Markdown lokal auf deinem Mac. Die App nutzt keinen eigenen Server und enthält keine Analyse- oder Werbedienste. Ein App-Konto ist nicht erforderlich.

Für das automatische Formatieren beim Einfügen greift Mail Markdown auf die Zwischenablage zu. Mit deiner Bedienungshilfen-Freigabe liest die App im Mail-Entwurf den Fokus, die Auswahl und eine benachbarte Schriftprobe. Diese Inhalte werden nicht an das Projektteam übertragen.

Die ursprüngliche Zwischenablage wird vorübergehend im Arbeitsspeicher aufbewahrt, bis du neu kopierst, sie wiederherstellst oder die App beendest. Der aktuelle Inhalt der systemweiten Zwischenablage bleibt unter Kontrolle von macOS und kann bis zum nächsten Kopieren erhalten bleiben.

Einstellungen werden lokal gespeichert. Betriebsdiagnosen können Status, UI-Rollen und Prozess-IDs enthalten; Nachrichten- und Zwischenablagentexte werden nicht protokolliert. Mail Markdown lädt keine Diagnosen hoch. Die Aufbewahrung systemeigener Protokolle verwaltet macOS.

Du kannst die Formatierung ausschalten, Mail Markdown beenden und die Bedienungshilfen-Freigabe in den Systemeinstellungen widerrufen. Das Projektteam speichert keine über die App übertragenen Textinhalte, die es auf Anfrage löschen müsste.

Support und Datenschutzanfragen: https://github.com/E1NSER/mail-markdown/issues
Freiwillig auf GitHub veröffentlichte Anfragen und Angaben sind öffentlich und unterliegen zusätzlich den Datenschutzregeln von GitHub. Für eine Fehlerbeschreibung genügen nicht vertrauliche Beispieldaten.
```

Für die Services-Fassung muss der Absatz über Bedienungshilfen und normale Einfügevorgänge durch den tatsächlich geprüften Auswahl-Datenfluss ersetzt werden. Vor Veröffentlichung Herausgeber und tatsächliche Kontaktangaben bestätigen; dieser Text enthält keine erfundenen Betreiber- oder Kontaktdaten.

Als Datenschutz-URL ist nach Veröffentlichung `https://github.com/E1NSER/mail-markdown/blob/main/PRIVACY.md` vorgesehen; die Datei liegt im Repository. Datenschutz muss außerdem aus der App leicht erreichbar sein. Eine reine Issues-URL ist nicht automatisch eine vollständige Supportseite: Apple verlangt dort erreichbare tatsächliche Kontaktinformationen, soweit anwendbar. [Datenschutzanforderungen](https://developer.apple.com/app-store/review/guidelines/#privacy), [Support-URL-Anforderungen](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)

## Notes for Review — erst nach Services-Nachweis verwenden

```text
Mail Markdown is free and unlimited. There are no in-app purchases, subscriptions, accounts, or sign-in requirements. The app interface is currently in German.

This App Store build uses a sandboxed macOS Service. It does not intercept normal Command-V, control Mail through Accessibility, or synthesize keyboard input.

To test: open a rich-text draft in Mail, enter “**Fett** und *kursiv*”, select that text, and choose the “Markdown formatieren” command from the Services menu. The selected Markdown is replaced by formatted text. A separate Service shortcut can be configured in System Settings; it is not required for review.

Text is processed locally. No demo account or external backend is needed.
```

Service-Name, tatsächlichen Menüpfad und Testverhalten vor Übernahme mit dem endgültigen Build abgleichen. Als Review-Kontakt sind bestätigte Name-, E-Mail- und Telefonnummern des Herausgebers einzutragen; hier werden keine persönlichen Daten vorausgefüllt.

## Offene Schritte vor einer Einreichung

- [ ] Produktentscheidung für den expliziten Services-Ablauf bestätigen; aktuelle automatische ⌘V-App unverändert erhalten.
- [ ] Separaten sandboxfähigen Services-Build implementieren und in Mail testen; keine AX-Steuerung oder synthetische Tastatureingabe im Store-Build.
- [ ] Schriftübernahme, Auswahlersetzung, Rückgängig, Fokuswechsel und Plain-Text-Fehlerfälle nachweisen.
- [ ] App-Store-App-Signatur, Provisioning und Installer-Signatur für den separaten Store-Build vorbereiten und prüfen. Dafür werden die passenden Store-Distributionsidentitäten benötigt, einschließlich **Mac Installer Distribution**; Developer ID Application und Apple Development ersetzen diese nicht. [Apple-Zertifikatstypen](https://developer.apple.com/help/account/certificates/certificates-overview)
- [ ] Öffentliches Repository, Supportkontakt und Datenschutzseite veröffentlichen und Links in der App ergänzen.
- [ ] Finale App-Privacy-Antworten, Privacy Manifest und Required-Reason-APIs prüfen; der aktuelle Code verwendet unter anderem `UserDefaults`.
- [ ] App-Store-Screenshots der tatsächlich eingereichten App aufnehmen; Figma-Konzepte nicht als fertige App ausgeben.
- [ ] Name, Metadaten, Kategorie, kostenlose Preisstufe, Altersfreigabe, Exportfragen und Review-Kontakt in App Store Connect vervollständigen.
- [ ] Endgültigen Store-Build prüfen, hochladen und erst danach Review anfordern. **Diese Metadaten, Screenshots und Datenschutzantworten wurden noch nicht hochgeladen.**

## Separater GitHub-Weg

Für kostenlose, unbegrenzte Nutzung mit dem bisherigen automatischen ⌘V-Verhalten kann die bestehende App direkt über das öffentliche Repository verteilt werden. Quellcode und Drittanbieterhinweise veröffentlichen; für reguläre Downloads Developer-ID-Signatur und Notarisierung gemäß [RELEASE.md](RELEASE.md) fertigstellen. Das ist eine andere Distributionsroute als eine Mac-App-Store-Einreichung und benötigt keinen Services-Umbau. Store-Metadaten mit dem expliziten Services-Ablauf nicht für diese Fassung übernehmen.

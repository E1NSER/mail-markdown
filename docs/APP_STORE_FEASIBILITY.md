# App-Store-Machbarkeit

Aktuelle Produktvorgabe: kostenlos, unbegrenzte Nutzung und öffentlich verfügbarer Quellcode auf GitHub. Diese Untersuchung verändert die funktionierende App nicht.

**Ergebnis: Die bestehende Architektur ist kein dokumentiert unterstützter Weg für eine neue Mac-App-Store-App.** Ausschlaggebend ist der Accessibility-Zugriff auf Apple Mail. Hohe Sicherheit für diese technische Einschränkung; eine App-Review-Zusage lässt sich daraus für keine alternative Architektur ableiten.

## Was die aktuelle App benötigt

`main.swift` verwendet einen aktiven `CGEvent`-Tap (`.defaultTap`), unterdrückt das normale ⌘V und sendet anschließend synthetische Tastaturereignisse mit `postToPid`. `DraftContextReader.swift` liest über `AXUIElement` prozessübergreifend Mail-Fenster, Fokus, Auswahl und benachbarte Schriftattribute. Das ist Accessibility-Client-Funktionalität zur Zusammenarbeit mit einer anderen App; es geht nicht bloß darum, die eigene Oberfläche barrierefrei anzubieten.

Die geprüften Apple-Quellen ergeben:

- **Sandbox ist Voraussetzung.** App Review 2.4.5(i): “They must be appropriately sandboxed”. [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/#hardware-compatibility)
- **Unser AX-Zugriff ist die entscheidende Grenze.** Die aktuelle Sandbox-Dokumentation nennt “Use of accessibility APIs in assistive apps” als inkompatible Funktionalität. [Protecting user data with App Sandbox](https://developer.apple.com/documentation/security/protecting-user-data-with-app-sandbox)
- **Kein dokumentierter Accessibility-Ausnahme-Schalter.** Apple DTS bestätigt die Sandbox-Einschränkung und nennt `com.apple.security.accessibility` ausdrücklich als erfundenes Entitlement. Eine Benutzerfreigabe ersetzt die Sandbox-Regeln nicht. [DTS: Determining if an entitlement is real](https://developer.apple.com/forums/thread/799000), [DTS: Sandbox Entitlements Question](https://developer.apple.com/forums/thread/789663)
- **Nicht jedes Event-Monitoring ist ausgeschlossen.** Apple DTS zeigt einen sandboxfähigen `.listenOnly`-Tap mit Input-Monitoring-Freigabe. Dieser Beleg gilt nicht für unser Unterdrücken und Ersetzen von ⌘V oder den AX-Zugriff. Apples WWDC erläutert zudem die unterschiedlichen Freigaben für passive Taps, aktive Taps und synthetische Eingabe. [DTS-Beispiel](https://developer.apple.com/forums/thread/724608), [Advances in macOS Security](https://developer.apple.com/videos/play/wwdc2019/701/)

Dokumentierte temporäre Ausnahmen betreffen bestimmte andere Ressourcen, etwa gezielte Apple Events. Sie sind kein allgemeiner Ersatz für AX-Zugriff. Ein zusätzlicher Hilfsprozess hebt die Beschränkung nicht auf: Eingebettete Kommandozeilenwerkzeuge müssen die Sandbox des Hauptprogramms übernehmen. [Temporäre Ausnahmen](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/AppSandboxTemporaryExceptionEntitlements.html), [Sandbox-Dokumentation](https://developer.apple.com/documentation/security/protecting-user-data-with-app-sandbox)

## Zwei konkrete Produktoptionen

| | A: Kostenlos über GitHub | B: Mac App Store mit macOS-Dienst |
|---|---|---|
| Bedienung | Bestehendes automatisches Formatieren mit normalem ⌘V | Markdown in Mail markieren, Dienst explizit über Menü oder eigenes Tastenkürzel auslösen |
| Stilübernahme | Bestehende AX-Schriftprobe aus dem Mail-Entwurf | Schriftattribute aus der vom Dienst übergebenen Rich-Text-Auswahl |
| Architektur | Bestehende App ohne Funktionsänderung | Eigene sandboxfähige Services-Variante ohne AX-Steuerung, aktiven Event-Tap oder synthetische Eingabe |
| Veröffentlichung | Öffentliches Repository; signierte und notarisierte Downloads gemäß `RELEASE.md` vorbereiten | Nach funktionierendem Sandbox-Prototyp vollständige App-Store-Vorbereitung und Review |
| Einschränkung | Bedienungshilfen-Freigabe bleibt erforderlich | Kein unverändertes automatisches ⌘V; Mail muss die benötigten Rich-Text-Serviceformate unterstützen |

Die Services-Architektur ist von Apple ausdrücklich mit App Sandbox beschrieben. Der anfordernde Editor liefert die Auswahl auf einer separaten Service-Zwischenablage; der Editor übernimmt das zurückgegebene Ergebnis. Das reguläre Copy/Paste-Pasteboard wird dabei normalerweise nicht verändert. [Services Overview](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/SysServices/Articles/overview.html)

Ein Service-Tastenkürzel kann den bestehenden Einfügen-Befehl nicht zuverlässig ersetzen: Bei einem Konflikt gewinnt laut Apple der vorhandene App-Befehl. [Services Properties](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/SysServices/Articles/properties.html)

## Kleiner, separater Services-Prototyp für Option B

Noch nicht implementiert; die Haupt-App bleibt unverändert.

1. Separates sandboxed macOS-App-Target mit eigener Bundle-ID und gemeinsamem Markdown-Core.
2. `NSServices`-Eintrag: Eingabe `UTType.rtf` bevorzugen, zusätzlich Plain Text akzeptieren; Ausgabe RTF. Provider über `NSApplication.servicesProvider` registrieren. [Providing a Service](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/SysServices/Articles/providing.html)
3. Rich-Text-Auswahl dekodieren, tatsächliche Schrift und verfügbare weitere Attribute übernehmen, Markdown rendern und RTF auf die übergebene Service-Zwischenablage zurückschreiben.
4. Plain Text enthält keine Schriftprobe des Mail-Entwurfs. Ohne verlässliche Schrift darf der Prototyp keine Stilübernahme behaupten oder still einen Font erfinden; diesen Fall klar melden und die Auswahl unverändert lassen.
5. In einem signierten Sandbox-Build mit Mail prüfen: RTF-Verhandlung, Schriftübernahme, Ersetzen der Auswahl, Rückgängig, Fokuswechsel und Fehlerfälle. Weder Bedienungshilfen noch Input Monitoring anfordern.

Shortcuts kann ebenfalls explizite Konvertierungsaktionen bereitstellen; es liefert keinen dokumentierten Ersatz für automatisches ⌘V samt Zugriff auf Mail-Schriftattribute. MailKit dokumentiert Compose-Lebenszyklus, Empfängerhinweise, Popover, Header und Versandprüfung, aber keinen Paste-Hook oder Editor-Body-Setter. Das ist eine Ableitung aus der dokumentierten API-Oberfläche. [Shortcuts auf dem Mac](https://support.apple.com/en-au/guide/shortcuts-mac/apd163eb9f95/mac), [MEComposeSessionHandler](https://developer.apple.com/documentation/mailkit/mecomposesessionhandler), [MEComposeSession](https://developer.apple.com/documentation/mailkit/mecomposesession)

Vor einer Änderung an der Haupt-App muss die Produktentscheidung zwischen A und B fallen. Für unverändertes automatisches Einfügen ist A der konkrete Weg; B verlangt bewusst den beschriebenen anderen Bedienablauf.

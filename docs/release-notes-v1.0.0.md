# Mail Markdown 1.0.0

Die erste öffentliche Version von Mail Markdown: Markdown in Apple Mail einfügen und den Textstil deines Entwurfs übernehmen. Kostenlos und unbegrenzt, für macOS 13 oder neuer als Universal-App für Apple Silicon und Intel.

Der Installer ist mit Developer ID signiert und von Apple notarisiert. Das DMG und die Datei `SHA256SUMS` findest du unten bei den Release-Assets. [Website und Browser-Demo](https://markdown-mail.einser.at).

- **Einfügen mit ⌘V:** Kopiere Markdown und füge ihn über die Tastatur in den Nachrichtentext ein. Schrift, Größe und Farbe stammen von einem benachbarten Zeichen im bestehenden Entwurf.
- **Formatierung für E-Mails:** Fett, kursiv, durchgestrichen, Links, Listen, Überschriften, Zitate und Code. Überschriften behalten die Schriftgröße; Code verwendet eine gleich große Festbreitenschrift.
- **Native Oberfläche:** Menüleisten-App mit Einstellungen, Live-Vorschau, Hilfe und blauem App-Icon. Die Formatierung lässt sich pausieren; Start bei der Anmeldung ist optional und anfangs ausgeschaltet.
- **Lokale Verarbeitung:** Die App benötigt kein Konto und enthält keine Analyse- oder Werbedienste. Nachrichten- und Zwischenablagentexte werden auf deinem Mac verarbeitet.
- **Zwischenablage zurückholen:** Die ursprüngliche Zwischenablage lässt sich wiederherstellen, solange du nichts Neues kopiert und die App nicht beendet hast.

So richtest du die App ein:

1. Öffne das DMG und ziehe **Mail Markdown** in **Programme**. Starte die installierte App.
2. Erlaube dieser App unter **Systemeinstellungen → Datenschutz & Sicherheit → Bedienungshilfen** den Zugriff. Die Einstellungen der App bieten dafür eine Schaltfläche.
3. Öffne in Apple Mail einen **Rich-Text-Entwurf**. Setze den Cursor neben vorhandenen Text mit dem gewünschten Stil und füge Markdown mit **⌘V** ein. Für Markdown, das bereits im Entwurf steht: markieren, **⌘C**, dann **⌘V**.

Ein paar Grenzen dieser Version:

- In einem leeren Entwurf oder ohne lesbare Schriftprobe wird normal eingefügt. Eine alleinige Änderung in Mails Formatierungsleiste liefert noch keine Schriftprobe.
- Die automatische Umwandlung gilt für **⌘V im Nachrichtentext**. Menü- und Rechtsklick-Einfügen sowie **⌘⇧V** werden nicht abgefangen. Die Erkennung ist auf englische und deutsche Mail-Bedienelemente ausgelegt.
- Tabellen werden als tabulatorgetrennte Zeilen ausgegeben, Bilder als Alternativtext. HTML bleibt wörtlicher Text. Die formatierte Fassung bleibt bis zum Wiederherstellen oder nächsten Kopieren in der systemweiten Zwischenablage.

Die Vorschau in der App nutzt einen neutralen Beispielstil; die Stilübernahme erfolgt beim Einfügen in Mail. Kompatibilität kann je nach macOS- und Mail-Version variieren.

Fragen oder Fehler? [GitHub Issues](https://github.com/E1NSER/mail-markdown/issues) · [Datenschutz der App](https://github.com/E1NSER/mail-markdown/blob/main/PRIVACY.md)

# App und DMG bauen

`build-app.sh` erstellt standardmäßig eine Universal-App für Apple Silicon und Intel. Die Bundle-ID bleibt für bestehende Berechtigungen unverändert. Eine bestehende Signatur wird anhand ihres konkreten Zertifikats übernommen und gegen ihre bisherige Signieranforderung geprüft. Ein Wechsel zu Ad-hoc erfolgt nur bei ausdrücklich gesetztem `MAIL_MARKDOWN_SIGNING_IDENTITY=-`.

```sh
# Laufende aktuelle App unverändert lassen und die neue Version daneben prüfen:
zsh scripts/build-app.sh --staging-output "$PWD/dist/release/Mail Markdown.app"

# Vorbereiteten Build samt Applications-Verknüpfung als signiertes DMG verpacken:
zsh scripts/package-dmg.sh --app "$PWD/dist/release/Mail Markdown.app"
```

Ohne `--staging-output` ist das Ziel `dist/Mail Markdown.app`. Eine laufende Ziel-App wird nicht ersetzt. Frühere Builds werden in einem eindeutigen versteckten Backup-Verzeichnis ohne `.app`-Endung erhalten. `--native` beschleunigt einen Entwicklungsbuild für die aktuelle Architektur; der Standard bleibt Universal.

Ein Apple-Development-Build ist für die lokale Prüfung vorbereitet. Er ist keine öffentlich notarisiert veröffentlichte App. Das DMG-Erstellen startet weder die App noch Finder und überträgt keine App-Dateien an Apple. Ein Developer-ID-Build verwendet beim Signieren den erforderlichen Apple-Zeitstempeldienst.

## Oberfläche separat prüfen

```sh
zsh scripts/build-ui-preview.sh
```

Der Befehl baut `dist/ui-preview/Mail Markdown UI Preview.app` mit einer eigenen Bundle-ID und expliziter Ad-hoc-Signatur. Diese Entwicklungs-App zeigt denselben Fenster-Controller mit Beispieldaten. Sie greift nicht auf Bedienungshilfen, Tastatureingaben in anderen Apps, die Zwischenablage, Anmeldeobjekte oder gespeicherte Einstellungen zu. Im Menü **Vorschau** lassen sich Hell/Dunkel und Beispielzustände auswählen. Statusangaben sind in diesem Modus Beispieldaten, kein Nachweis einer Mail-Verbindung.

Normale Release-Builds starten weiterhin die produktive Menüleisten-App. Die Vorschau ersetzt keine Installation und verändert ihre Freigaben nicht.

## App-Icon aus dem SVG erzeugen

Der gemeinsame Master ist **`Resources/AppIcon-v2.svg`**. Er enthält die korrigierte Originalgrafik der Website. Änderungen an diesem SVG vornehmen und anschließend alle Ausgaben daraus erzeugen; die alten Swift-Generatoren sind gesperrte Legacy-Einstiegspunkte.

Voraussetzungen sind macOS mit `iconutil`, **Node.js 24.x** und die installierten Website-Abhängigkeiten. `sharp` wird aus dem Website-Paket aufgelöst. Falls die Abhängigkeiten fehlen, sie mit dem vorhandenen Lockfile installieren:

```sh
node --version # 24.x
npm --prefix website ci
node scripts/generate-icon.mjs
```

Der Generator rendert transparente PNGs für alle zehn macOS-Iconset-Varianten, prüft die Größen sowie die vollständige Dekodierung und Transparenz nach einem ICNS-Roundtrip und aktualisiert `Resources/AppIcon.png` und `Resources/AppIcon.icns`. Vorhandene `AppIcon-v2.png`, `AppIcon-v2.icns` und `AppIcon.svg` werden ebenfalls synchronisiert, ebenso beide Website-Kopien `website/public/app-icon.svg` und `website/app/icon.svg`.

Alle Dateien entstehen zuerst temporär. Erst nach den Prüfungen werden vollständige Dateien atomar ersetzt; bei einem Fehler während der Übernahme werden bereits ersetzte Ausgaben zurückgesetzt. Der Vorgang baut oder startet keine App und ändert keine macOS-Berechtigungen. Der anschließende App-Build übernimmt `Resources/AppIcon.icns`; für den öffentlichen Build einen eigenen `--staging-output` verwenden und die Assets vor dem Signieren erzeugen.

## Öffentliche Veröffentlichung vorbereiten

Erforderlich sind eine gültige **Developer ID Application**-Signieridentität im Schlüsselbund und ein bereits eingerichtetes **notarytool-Schlüsselbundprofil**. Zugangsdaten werden nicht in Projektdateien gespeichert.

```sh
export MAIL_MARKDOWN_SIGNING_IDENTITY='Developer ID Application: Exakter Zertifikatsname'
export NOTARY_PROFILE='Name-des-eingerichteten-Profils'

zsh scripts/build-app.sh --staging-output "$PWD/dist/public/Mail Markdown.app"

# Dieser Befehl überträgt App und DMG ausdrücklich zur Prüfung an Apple:
zsh scripts/notarize-dmg.sh \
  --app "$PWD/dist/public/Mail Markdown.app" \
  --output "$PWD/dist/Mail-Markdown-universal-notarized.dmg"
```

Developer-ID-Builds aktivieren Hardened Runtime und einen sicheren Zeitstempel. Der Notarisierungsablauf akzeptiert ausschließlich die ausdrücklich gewählte Developer-ID-Signatur, wartet auf Apples Ergebnis, heftet Tickets an App und DMG an und prüft die Tickets anschließend. Er führt keine Registrierung, Zertifikatsausstellung oder Änderung am Apple-Konto durch.

Solange die Developer-ID-Identität oder das Schlüsselbundprofil fehlen, kann dieser öffentliche Release-Schritt nicht abgeschlossen werden. Ein erfolgreicher lokaler Build oder eine Apple-Development-Signatur ist kein Nachweis einer erfolgreichen Notarisierung.

Für jeden stabilen GitHub-Release bleibt der öffentliche Dateiname **`Mail-Markdown-universal-notarized.dmg`** gleich. Nur das eigene geprüfte Universal-DMG mit Developer-ID-Signatur und erfolgreicher Notarisierung unter diesem Namen hochladen. Die Tag-Version muss `CFBundleShortVersionString` in Quell-Plist und gebauter App entsprechen.

Zuerst mit `gh release create --draft` einen Entwurf samt fertigem DMG anlegen, den Upload auf `state: uploaded` und eine Größe größer null prüfen und Release Notes sowie Artefakt kontrollieren. Erst danach mit `gh release edit --draft=false --prerelease=false --latest` veröffentlichen. Die vollständigen Befehle mit exaktem Repository, Versionsübernahme, `--verify-tag` und Prüfungen stehen in [der Release-Anleitung](../docs/RELEASE.md#als-github-release-bereitstellen). Diese Reihenfolge verhindert einen **Latest**-Release ohne Download-Datei.

Der Website-Download zeigt auf [GitHubs festes Latest-Asset](https://github.com/E1NSER/mail-markdown/releases/latest/download/Mail-Markdown-universal-notarized.dmg). GitHub bestimmt beim Abruf den aktuellen stabilen Release; die Website muss dafür nicht neu veröffentlicht werden. Ihre Verfügbarkeits- und Versionsanzeige kann bis zu fünf Minuten verzögert sein. Ohne passenden öffentlichen Release zeigt sie einen ehrlichen Verfügbarkeitshinweis.

Apple beschreibt den Ablauf unter [Notarizing macOS software before distribution](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution) und [Customizing the notarization workflow](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow).

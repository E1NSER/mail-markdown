# App und DMG bauen

`build-app.sh` erstellt standardmäßig eine Universal-App für Apple Silicon und Intel. Die Bundle-ID bleibt für bestehende Berechtigungen unverändert. Eine bestehende Signatur wird anhand ihres konkreten Zertifikats übernommen und gegen ihre bisherige Signieranforderung geprüft. Ein Wechsel zu Ad-hoc erfolgt nur bei ausdrücklich gesetztem `MAIL_MARKDOWN_SIGNING_IDENTITY=-`.

```sh
# Laufende aktuelle App unverändert lassen und v1.0.0 daneben prüfen:
zsh scripts/build-app.sh --staging-output "$PWD/dist/release/Mail Markdown.app"

# Vorbereiteten Build samt Applications-Verknüpfung als signiertes DMG verpacken:
zsh scripts/package-dmg.sh --app "$PWD/dist/release/Mail Markdown.app"
```

Ohne `--staging-output` ist das Ziel `dist/Mail Markdown.app`. Eine laufende Ziel-App wird nicht ersetzt. Frühere Builds werden in einem eindeutigen versteckten Backup-Verzeichnis ohne `.app`-Endung erhalten. `--native` beschleunigt einen Entwicklungsbuild für die aktuelle Architektur; der Standard bleibt Universal.

Ein Apple-Development-Build ist für die lokale Prüfung vorbereitet. Er ist keine öffentlich notarisiert veröffentlichte App. Das DMG-Erstellen startet weder die App noch Finder und überträgt keine App-Dateien an Apple. Ein Developer-ID-Build verwendet beim Signieren den erforderlichen Apple-Zeitstempeldienst.

## Öffentliche Veröffentlichung vorbereiten

Erforderlich sind eine gültige **Developer ID Application**-Signieridentität im Schlüsselbund und ein bereits eingerichtetes **notarytool-Schlüsselbundprofil**. Zugangsdaten werden nicht in Projektdateien gespeichert.

```sh
export MAIL_MARKDOWN_SIGNING_IDENTITY='Developer ID Application: Exakter Zertifikatsname'
export NOTARY_PROFILE='Name-des-eingerichteten-Profils'

zsh scripts/build-app.sh --staging-output "$PWD/dist/public/Mail Markdown.app"

# Dieser Befehl überträgt App und DMG ausdrücklich zur Prüfung an Apple:
zsh scripts/notarize-dmg.sh --app "$PWD/dist/public/Mail Markdown.app"
```

Developer-ID-Builds aktivieren Hardened Runtime und einen sicheren Zeitstempel. Der Notarisierungsablauf akzeptiert ausschließlich die ausdrücklich gewählte Developer-ID-Signatur, wartet auf Apples Ergebnis, heftet Tickets an App und DMG an und prüft die Tickets anschließend. Er führt keine Registrierung, Zertifikatsausstellung oder Änderung am Apple-Konto durch.

Solange die Developer-ID-Identität oder das Schlüsselbundprofil fehlen, kann dieser öffentliche Release-Schritt nicht abgeschlossen werden. Ein erfolgreicher lokaler Build oder eine Apple-Development-Signatur ist kein Nachweis einer erfolgreichen Notarisierung.

Apple beschreibt den Ablauf unter [Notarizing macOS software before distribution](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution) und [Customizing the notarization workflow](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow).

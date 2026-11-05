# Mail Markdown veröffentlichen

Der aktuelle lokale Build ist mit **Apple Development** signiert. Er ist **nicht notarisiert** und noch kein öffentlicher Release. Ein funktionierendes DMG und eine gültige lokale Signatur ersetzen die Developer-ID-Signatur und Apples Notarisierung nicht.

Für die reguläre Verteilung außerhalb des Mac App Store ist eine **Developer ID Application**-Identität vorgesehen. Apple unterscheidet diese ausdrücklich von Entwicklungszertifikaten. Siehe [Developer-ID-Verteilung](https://developer.apple.com/developer-id/) und [Zertifikatstypen](https://developer.apple.com/help/account/certificates/certificates-overview).

## Voraussetzungen

- Xcode mit den Befehlen `swift`, `codesign`, `hdiutil`, `notarytool` und `stapler`.
- Mitgliedschaft im Apple Developer Program sowie die nötigen Kontorechte.
- Ein gültiges **Developer ID Application**-Zertifikat samt privatem Schlüssel im lokalen Schlüsselbund. Ein Apple-Development-Zertifikat genügt hierfür nicht.
- Ein eingerichtetes `notarytool`-Schlüsselbundprofil für das passende Entwicklerteam.
- Ein geprüfter Quellstand einschließlich `Package.resolved`, App-Icon und Drittanbieterhinweisen.

Die Skripte stellen keine Zertifikate aus und richten keine Apple-Konten ein. Fehlende Developer-ID-Zertifikate werden vor einem öffentlichen Release außerhalb des Projekts eingerichtet. Die Beispiele enthalten bewusst keine persönlichen Zertifikatsnamen oder Zugangsdaten.

## Lokalen Build und DMG prüfen

Alle Befehle werden im Projektordner ausgeführt. Zuerst Version und Buildnummer in `Resources/Info.plist` festlegen: `CFBundleShortVersionString` und `CFBundleVersion`. Die bestehende Bundle-ID beibehalten, damit die App ihre Identität für macOS-Berechtigungen nicht unnötig ändert.

```sh
swift test
zsh scripts/build-app.sh --universal \
  --staging-output "$PWD/dist/release/Mail Markdown.app"
zsh scripts/package-dmg.sh \
  --app "$PWD/dist/release/Mail Markdown.app"
```

Der Build erzeugt standardmäßig eine Universal-App für Apple Silicon und Intel; `--native` ist für lokale Entwicklungsbuilds verfügbar. `--staging-output` lässt die bereits verwendete App unangetastet. Eine laufende Ziel-App wird nicht ersetzt.

`package-dmg.sh` erzeugt ein signiertes DMG mit App, Applications-Verknüpfung und Installationshinweisen. Die App wird dabei nicht gestartet und nicht zur Notarisierung hochgeladen. Bei einer Apple-Development-Signatur bleibt das DMG ein lokales Testpaket. Der Dateiname enthält die App-Version.

## Notarisierungsprofil einmalig einrichten

Wenn ein passendes Profil bereits existiert, seinen Namen verwenden. Andernfalls führt die verantwortliche Person diesen interaktiven Befehl selbst aus:

```sh
xcrun notarytool store-credentials 'mail-markdown-notary'
```

`notarytool` fragt die Kontodaten interaktiv ab und speichert sie im Schlüsselbund. Für die Anmeldung mit Apple-ID wird ein anwendungsspezifisches Passwort benötigt; alternativ unterstützt das Werkzeug App-Store-Connect-API-Schlüssel. Keine Passwörter oder Schlüsseldateien im Projekt ablegen. Der Profilname ist frei wählbar und wird beim Release als `NOTARY_PROFILE` übergeben. Apple beschreibt die Varianten unter [Customizing the notarization workflow](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow).

## Öffentlichen Release erstellen

Erst ausführen, wenn Zertifikat, Schlüsselbundprofil und Quellstand vorbereitet sind. Den Platzhalter für die Signieridentität durch den exakten Namen der eigenen **Developer ID Application**-Identität ersetzen.

```sh
export MAIL_MARKDOWN_SIGNING_IDENTITY='Developer ID Application: <Name> (<TEAMID>)'
export NOTARY_PROFILE='mail-markdown-notary'

zsh scripts/build-app.sh --universal \
  --staging-output "$PWD/dist/public/Mail Markdown.app"

zsh scripts/notarize-dmg.sh \
  --app "$PWD/dist/public/Mail Markdown.app"
```

Der Developer-ID-Build aktiviert Hardened Runtime und einen sicheren Signaturzeitstempel. Der zweite Befehl **überträgt App und DMG an Apple**: Er reicht zunächst die App ein, wartet auf `Accepted`, heftet ihr Ticket an, erstellt das DMG und reicht anschließend auch das DMG ein. Zum Abschluss werden dessen Ticket und Gatekeeper-Bewertung geprüft. Ausgabe ist `dist/Mail Markdown-<Version>-notarized.dmg`.

Das Notarisierungsskript lehnt Apple-Development- und Ad-hoc-Signaturen ab. Ohne Developer-ID-Identität oder gültiges Schlüsselbundprofil kann dieser Schritt nicht abgeschlossen werden. Bei einem Fehler gilt der Release als unvollständig. Apples Rückmeldung prüfen und den betroffenen Schritt nach der Korrektur wiederholen; eine erfolgreiche lokale Signatur allein belegt keine Notarisierung. Hinweise zur Fehleranalyse: [Resolving common notarization issues](https://developer.apple.com/documentation/security/resolving-common-notarization-issues).

## Vor der Weitergabe

Das fertige DMG auf einem separaten Testsystem wie einen Download öffnen und die App in den Programme-Ordner ziehen. Ersten Start, die erforderliche Bedienungshilfen-Freigabe, Markdown-Einfügen im Mail-Entwurf und den freiwilligen Start bei der Anmeldung prüfen. Bei einem Universal-Release Apple Silicon und Intel einbeziehen. Bestehende Nutzerberechtigungen werden vom jeweiligen Mac verwaltet und sind nicht Teil des Installationspakets.

Die folgenden Dateien müssen bereits **vor dem Signieren** in `Mail Markdown.app/Contents/Resources` liegen:

- `LICENSE.txt` (MIT-Lizenz der App)
- `ThirdPartyNotices.txt`
- `LICENSES/swift-markdown-LICENSE.txt`
- `LICENSES/swift-markdown-NOTICE.txt`
- `LICENSES/swift-cmark-COPYING.txt`

Die drei Upstream-Dateien werden unverändert aus den fixierten Paketversionen übernommen. Nach einem Abhängigkeitsupdate die Kopien und Versionsangaben aktualisieren. Nach erfolgreicher Notarisierung keine Dateien im App-Bundle mehr bearbeiten; Änderungen erfordern einen neuen Build und Release-Durchlauf.

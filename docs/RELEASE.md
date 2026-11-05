# Mail Markdown veröffentlichen

Öffentliche Release-Builds benötigen eine **Developer ID Application**-Signatur und eine erfolgreich abgeschlossene Apple-Notarisierung. Ein funktionierendes DMG oder eine lokale Apple-Development- bzw. Ad-hoc-Signatur allein belegen keinen geprüften öffentlichen Release. Maßgeblich sind die Ergebnisse des jeweiligen Notarisierungs- und Validierungslaufs.

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
  --app "$PWD/dist/public/Mail Markdown.app" \
  --output "$PWD/dist/Mail-Markdown-universal-notarized.dmg"
```

Der Developer-ID-Build aktiviert Hardened Runtime und einen sicheren Signaturzeitstempel. Der zweite Befehl **überträgt App und DMG an Apple**: Er reicht zunächst die App ein, wartet auf `Accepted`, heftet ihr Ticket an, erstellt das DMG und reicht anschließend auch das DMG ein. Zum Abschluss werden dessen Ticket und Gatekeeper-Bewertung geprüft. Das öffentliche Artefakt ist `dist/Mail-Markdown-universal-notarized.dmg`.

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

## Als GitHub-Release bereitstellen

Jeder stabile Release im Repository `E1NSER/mail-markdown` enthält genau das geprüfte öffentliche DMG unter demselben Dateinamen **`Mail-Markdown-universal-notarized.dmg`**. Dieser Name ist der Download-Vertrag mit der Website. Er bezeichnet ausschließlich den eigenen Universal-Build mit Developer-ID-Signatur und erfolgreicher Notarisierung; lokale Apple-Development-Pakete dürfen nicht unter diesem Namen hochgeladen werden. Der Dateiname allein ist kein Nachweis dieser Prüfungen.

Die folgenden Befehle sind eine Anleitung für die verantwortliche Person. Sie setzen eine bereits angemeldete GitHub CLI (`gh`) mit Schreibrechten voraus und veröffentlichen beim letzten Schritt tatsächlich den Release. Zugangsdaten gehören weder in die Befehle noch in Projektdateien.

Zuerst die Version aus der Quell-Plist übernehmen und mit der fertig gebauten App vergleichen. Der zugehörige Tag ist `v<CFBundleShortVersionString>`, aktuell also `v1.1.0`. Er muss bereits im Remote-Repository auf den geprüften Quellstand zeigen; `--verify-tag` verhindert, dass GitHub beiläufig einen neuen Tag auf einem anderen Stand erstellt.

```sh
release_version="$(/usr/bin/plutil -extract CFBundleShortVersionString raw -o - Resources/Info.plist)"
release_tag="v$release_version"
release_app="$PWD/dist/public/Mail Markdown.app"
release_asset="$PWD/dist/Mail-Markdown-universal-notarized.dmg"

test -n "$release_version"
test "$release_version" = "$(/usr/bin/plutil -extract CFBundleShortVersionString raw -o - "$release_app/Contents/Info.plist")"
test -s "$release_asset"
codesign --verify --strict "$release_app"
xcrun stapler validate "$release_app"
xcrun stapler validate "$release_asset"
spctl --assess --type open --context context:primary-signature --verbose "$release_asset"
```

Nur nach erfolgreichen Prüfungen und dem Funktionstest auf den vorgesehenen Macs fortfahren. Den Release zunächst als Entwurf anlegen und das fertige DMG dabei hochladen:

```sh
gh release create "$release_tag" "$release_asset" \
  --repo E1NSER/mail-markdown \
  --verify-tag --draft \
  --title "Mail Markdown $release_version" \
  --generate-notes

gh api "repos/E1NSER/mail-markdown/releases/tags/$release_tag" \
  --jq '{tag_name, draft, prerelease, assets: [.assets[] | {name, state, size, digest, browser_download_url}]}'

test "$(gh api "repos/E1NSER/mail-markdown/releases/tags/$release_tag" \
  --jq '[.assets[] | select(.name == "Mail-Markdown-universal-notarized.dmg" and .state == "uploaded" and .size > 0)] | length')" = 1
```

Die Ausgabe muss den erwarteten Tag, `draft: true`, `prerelease: false` und das vollständig hochgeladene, nicht leere DMG zeigen. Versionsangaben, Release Notes und Artefakt im Entwurf prüfen. Ein fehlendes oder nur teilweise hochgeladenes Asset zuerst korrigieren. Erst danach den geprüften Entwurf veröffentlichen und ausdrücklich als **Latest** setzen:

```sh
gh release edit "$release_tag" \
  --repo E1NSER/mail-markdown \
  --verify-tag --draft=false --prerelease=false --latest

gh api repos/E1NSER/mail-markdown/releases/latest \
  --jq '{tag_name, draft, prerelease, assets: [.assets[] | {name, state, size, browser_download_url}]}'
```

Die letzte Ausgabe muss denselben Tag und das vereinbarte Asset bestätigen. Entwurf und Upload vor der Veröffentlichung verhindern, dass **Latest** vorübergehend auf einen Release ohne Installationsdatei zeigt. Das öffentliche Asset anschließend herunterladen und den Download prüfen.

Die Website verlinkt direkt auf [die Installationsdatei des neuesten stabilen Releases](https://github.com/E1NSER/mail-markdown/releases/latest/download/Mail-Markdown-universal-notarized.dmg). GitHub löst diesen festen Link beim Abruf anhand von **Latest** auf; ein Website-Deployment ist für einen neuen App-Release nicht nötig. Verfügbarkeits- und Versionshinweise auf der Website werden bis zu fünf Minuten zwischengespeichert. Solange kein passender öffentlicher Release existiert, zeigt die Website dies an. Den festen Asset-Namen bei künftigen stabilen Releases beibehalten.

Referenzen: [GitHub-Links auf Latest-Assets](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases), [Release als Entwurf erstellen](https://cli.github.com/manual/gh_release_create) und [Entwurf veröffentlichen](https://cli.github.com/manual/gh_release_edit).

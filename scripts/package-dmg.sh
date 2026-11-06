#!/bin/zsh
set -euo pipefail
project_dir="${0:A:h:h}"
source "$project_dir/scripts/lib-signing.zsh"
app="$project_dir/dist/Mail Markdown.app"
output=""
while (( $# )); do
  case "$1" in
    --app) (( $# >= 2 )) || mm_fail "--app benötigt einen Pfad."; app="${2:a}"; shift 2 ;;
    --output) (( $# >= 2 )) || mm_fail "--output benötigt einen Pfad."; output="${2:a}"; shift 2 ;;
    --help|-h)
      print -r -- "Aufruf: $0 [--app '/Pfad/Mail Markdown.app'] [--output '/Pfad/Mail Markdown.dmg']"
      print -r -- "Verpackt und signiert eine vorbereitete App, ohne sie zu starten oder zu notarieren."
      exit 0
      ;;
    *) mm_fail "Unbekannte Option: $1" ;;
  esac
done
[[ -d "$app/Contents" ]] || mm_fail "Keine App am angegebenen Pfad gefunden."
codesign --verify --strict "$app"
version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$app/Contents/Info.plist")"
bundle_identifier="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app/Contents/Info.plist")"
[[ "$bundle_identifier" == "at.einser.mail-markdown.prototype" ]] || mm_fail "Unerwartete Bundle-ID; App wird nicht verpackt."
[[ -n "$output" ]] || output="$project_dir/dist/Mail Markdown-$version.dmg"
[[ "$output" == *.dmg ]] || mm_fail "Der Ausgabepfad muss auf .dmg enden."
[[ ! -L "$output" ]] || mm_fail "Der Ausgabepfad darf keine symbolische Verknüpfung sein."
[[ "$output" != "$app/"* ]] || mm_fail "Das DMG muss außerhalb des App-Bundles gespeichert werden."
binary_architectures="$(lipo -archs "$app/Contents/MacOS/MailMarkdown")"
architecture_label="Architekturen: $binary_architectures."
architecture_label_en="Architectures: $binary_architectures."
if [[ " $binary_architectures " == *" arm64 "* && " $binary_architectures " == *" x86_64 "* ]]; then
  architecture_label="Universal-Build für Apple Silicon und Intel."
  architecture_label_en="Universal build for Apple Silicon and Intel."
elif [[ "$binary_architectures" == "arm64" ]]; then
  architecture_label="Build für Apple Silicon."
  architecture_label_en="Build for Apple Silicon."
elif [[ "$binary_architectures" == "x86_64" ]]; then
  architecture_label="Build für Intel-Macs."
  architecture_label_en="Build for Intel Macs."
fi
if [[ -n "${MAIL_MARKDOWN_SIGNING_IDENTITY:-}" ]]; then
  signing_identity="$(mm_resolve_identity "$MAIL_MARKDOWN_SIGNING_IDENTITY")"
else
  signing_identity="$(mm_identity_from_app "$app")"
fi
signing_name="$(mm_identity_name "$signing_identity")"
signing_options=(--timestamp=none)
signature_label="Lokal mit Apple Development signiert; nicht für eine allgemeine Veröffentlichung notarisiert."
signature_label_en="Signed locally with Apple Development; not notarized for public distribution."
if [[ "$signing_name" == "Developer ID Application:"* ]]; then
  signing_options=(--timestamp)
  signature_label="Mit Developer ID signiert. Vor öffentlicher Weitergabe muss der Notarisierungsablauf erfolgreich abgeschlossen werden."
  signature_label_en="Signed with Developer ID. Public distribution also requires successful Apple notarization."
elif [[ "$signing_identity" == "-" ]]; then
  signature_label="Ad-hoc-Build. Für allgemeine Weitergabe nicht als vertrauenswürdige Veröffentlichung signiert oder notarisiert."
  signature_label_en="Ad-hoc development build. Not signed or notarized as a trusted public release."
fi
output_parent="${output:h}"
mkdir -p "$output_parent"
package_dir="$(mktemp -d "$output_parent/.dmg-XXXXXX")"
trap 'rm -rf -- "$package_dir"' EXIT
payload="$package_dir/payload"
mkdir -p "$payload"
ditto "$app" "$payload/Mail Markdown.app"
ln -s /Applications "$payload/Applications"
cat > "$payload/Read Me.txt" <<INSTALL
MAIL MARKDOWN $version

ENGLISH
INSTALLATION
1. Quit any older running copy of Mail Markdown through its menu.
2. Drag Mail Markdown.app into Applications, then open it from there.
3. Allow Accessibility access in System Settings when needed.
4. Open a Rich Text draft in Apple Mail and paste Markdown with ⌘V.

English is the default interface language. Choose Deutsch under
General → System → Language to use the app in German.
Mail Markdown is a separate macOS menu-bar app, installed independently
of Mail's Extensions settings. Text is processed locally; messages are
never sent automatically.

REQUIREMENTS
macOS 13 or later. $architecture_label_en

SIGNING AND DISTRIBUTION
$signature_label_en

UNINSTALL
Quit the app and remove it from Applications. Remove its Accessibility
permission in System Settings if it is no longer needed.

DEUTSCH
INSTALLATION
1. Mail Markdown.app auf den Ordner Applications ziehen.
   Eine bereits laufende ältere Version zuvor über ihr Menü beenden.
2. Mail Markdown aus dem Programme-Ordner öffnen.
3. In der App die benötigte Freigabe für Bedienungshilfen erteilen.
4. In Apple Mail einen Rich-Text-Entwurf öffnen und Markdown mit ⌘V einfügen.

Englisch ist die Standardsprache. Unter General → System → Language
kannst du Deutsch wählen; die App merkt sich deine Auswahl.

Mail Markdown ist eine eigenständige macOS-App mit Menüleistensymbol.
Sie wird nicht im Erweiterungen-Bereich von Apple Mail installiert.
Die Verarbeitung erfolgt lokal. E-Mails werden nicht automatisch versendet.

VORAUSSETZUNGEN
macOS 13 oder neuer. $architecture_label

SIGNATUR UND WEITERGABE
$signature_label
Für eine reguläre Veröffentlichung außerhalb des Mac App Store sind eine
Developer-ID-Signatur und die erfolgreiche Apple-Notarisierung vorgesehen.
Eine Apple-Development-Signatur ersetzt diese Veröffentlichungsschritte nicht.

ENTFERNEN
Mail Markdown beenden und aus dem Programme-Ordner löschen. Eine eingerichtete
Bedienungshilfen-Freigabe anschließend in den Systemeinstellungen entfernen.
INSTALL
image="$package_dir/Mail Markdown.dmg"
hdiutil create -srcfolder "$payload" -volname "Mail Markdown" -format UDZO -fs HFS+ "$image"
codesign --force --sign "$signing_identity" "${signing_options[@]}" --identifier "$bundle_identifier.diskimage" "$image"
codesign --verify --strict "$image"
hdiutil verify "$image"
mv -f "$image" "$output"
print -r -- "$output"

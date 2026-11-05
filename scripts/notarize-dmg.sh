#!/bin/zsh
# Running this script intentionally submits the specified release to Apple.
set -euo pipefail
project_dir="${0:A:h:h}"
source "$project_dir/scripts/lib-signing.zsh"
app=""
output=""
while (( $# )); do
  case "$1" in
    --app) (( $# >= 2 )) || mm_fail "--app benötigt einen Pfad."; app="${2:a}"; shift 2 ;;
    --output) (( $# >= 2 )) || mm_fail "--output benötigt einen Pfad."; output="${2:a}"; shift 2 ;;
    --help|-h)
      print -r -- "Aufruf: MAIL_MARKDOWN_SIGNING_IDENTITY='Developer ID Application: …' NOTARY_PROFILE='Profil' $0 --app '/Release/Mail Markdown.app' [--output '/Release/Mail Markdown.dmg']"
      print -r -- "Überträgt App und DMG zur Apple-Notarisierung; nur für einen ausdrücklich vorbereiteten Release-Build verwenden."
      exit 0
      ;;
    *) mm_fail "Unbekannte Option: $1" ;;
  esac
done
[[ -n "$app" && -d "$app/Contents" ]] || mm_fail "--app muss auf einen vorbereiteten Release-Build zeigen."
[[ -n "${MAIL_MARKDOWN_SIGNING_IDENTITY:-}" ]] || mm_fail "MAIL_MARKDOWN_SIGNING_IDENTITY muss ausdrücklich eine Developer-ID-Application-Identität angeben."
[[ -n "${NOTARY_PROFILE:-}" ]] || mm_fail "NOTARY_PROFILE muss ein bereits eingerichtetes notarytool-Schlüsselbundprofil benennen."
signing_identity="$(mm_resolve_identity "$MAIL_MARKDOWN_SIGNING_IDENTITY")"
signing_name="$(mm_identity_name "$signing_identity")"
[[ "$signing_name" == "Developer ID Application:"* ]] || mm_fail "Öffentliche Releases benötigen Developer ID Application; Apple Development und Ad-hoc werden hier nicht akzeptiert."
[[ "$(mm_identity_from_app "$app")" == "$signing_identity" ]] || mm_fail "Die App muss zuerst mit der ausdrücklich gewählten Developer-ID-Identität gebaut werden."
codesign --verify --strict "$app"
signature_info="$(codesign --display --verbose=4 "$app" 2>&1)"
[[ "$signature_info" == *"runtime"* && "$signature_info" == *"Timestamp="* ]] || mm_fail "Release-App benötigt Hardened Runtime und einen sicheren Signatur-Zeitstempel. Mit Developer-ID-Identität erneut bauen."
version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$app/Contents/Info.plist")"
[[ -n "$output" ]] || output="$project_dir/dist/Mail Markdown-$version-notarized.dmg"
[[ "$output" == *.dmg && ! -L "$output" && "$output" != "$app/"* ]] \
  || mm_fail "Der Ausgabepfad muss außerhalb des App-Bundles liegen, auf .dmg enden und darf keine symbolische Verknüpfung sein."
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/mail-markdown-notary-XXXXXX")"
trap 'rm -rf -- "$work_dir"' EXIT

submit_and_require_accepted() {
  local submitted_file="$1" result_file="$2" submission_status submission_id
  xcrun notarytool submit "$submitted_file" --keychain-profile "$NOTARY_PROFILE" --wait --no-progress --output-format json > "$result_file"
  submission_status="$(plutil -extract status raw -o - "$result_file")"
  submission_id="$(plutil -extract id raw -o - "$result_file")"
  [[ "$submission_status" == "Accepted" ]] || mm_fail "Apple hat die Einreichung nicht akzeptiert. Ergebnis: $submission_status. Einreichungs-ID: $submission_id. Details mit notarytool log abrufen."
}

# Staple the app before putting it on the final image, so both artifacts can be
# checked offline after a successful release.
ditto -c -k --keepParent "$app" "$work_dir/Mail Markdown.zip"
submit_and_require_accepted "$work_dir/Mail Markdown.zip" "$work_dir/app-result.json"
xcrun stapler staple "$app"
xcrun stapler validate "$app"
"$project_dir/scripts/package-dmg.sh" --app "$app" --output "$output"
submit_and_require_accepted "$output" "$work_dir/dmg-result.json"
xcrun stapler staple "$output"
xcrun stapler validate "$output"
spctl --assess --type open --context context:primary-signature --verbose "$output"
print -r -- "Notarisierung abgeschlossen: $output"

#!/bin/zsh
set -euo pipefail
project_dir="${0:A:h:h}"
source "$project_dir/scripts/lib-signing.zsh"

destination="$project_dir/dist/Mail Markdown.app"
universal=true
while (( $# )); do
  case "$1" in
    --staging-output)
      (( $# >= 2 )) || mm_fail "--staging-output benötigt einen App-Pfad."
      destination="${2:a}"
      shift 2
      ;;
    --universal) universal=true; shift ;;
    --native) universal=false; shift ;;
    --help|-h)
      print -r -- "Aufruf: $0 [--staging-output '/Pfad/Mail Markdown.app'] [--universal|--native]"
      print -r -- "Standard: Universal-App (Apple Silicon + Intel) unter dist/Mail Markdown.app."
      print -r -- "Eine laufende Ziel-App wird niemals ersetzt. --staging-output lässt die aktuelle App unverändert."
      exit 0
      ;;
    *) mm_fail "Unbekannte Option: $1" ;;
  esac
done
[[ "$destination" == *.app ]] || mm_fail "Der Zielpfad muss auf .app enden."
[[ ! -L "$destination" ]] || mm_fail "Der Zielpfad darf keine symbolische Verknüpfung sein."

destination_is_running() {
  local running_pid executable_path running_pids
  running_pids="$(pgrep -x MailMarkdown || true)"
  for running_pid in ${(f)running_pids}; do
    executable_path="$(ps -p "$running_pid" -o comm= 2>/dev/null || true)"
    [[ "$executable_path" == "$destination/Contents/MacOS/MailMarkdown" ]] && return 0
  done
  return 1
}
if destination_is_running; then
  mm_fail "Die Ziel-App läuft. Zum Prüfen ohne Unterbrechung --staging-output '/anderer/Pfad/Mail Markdown.app' verwenden."
fi

# Prefer the previously trusted app over a fresh staging location.
reference_app=""
for candidate in "$project_dir/dist/Mail Markdown.app" "$destination" "/Applications/Mail Markdown.app"; do
  if [[ -d "$candidate" ]]; then reference_app="$candidate"; break; fi
done
preserved_requirement=""
if [[ -n "${MAIL_MARKDOWN_SIGNING_IDENTITY:-}" ]]; then
  signing_identity="$(mm_resolve_identity "$MAIL_MARKDOWN_SIGNING_IDENTITY")"
else
  if [[ -n "$reference_app" ]]; then
    signing_identity="$(mm_identity_from_app "$reference_app")"
    preserved_requirement="$(codesign --display -r- "$reference_app" 2>&1 | sed -n 's/^#\{0,1\} *designated => //p')"
    [[ -n "$preserved_requirement" ]] || mm_fail "Die Signieranforderung der vorhandenen App konnte nicht gelesen werden."
  else
    signing_identity="$(mm_single_development_identity)"
  fi
fi
signing_name="$(mm_identity_name "$signing_identity")"
signing_options=(--timestamp=none)
if [[ "$signing_name" == "Developer ID Application:"* ]]; then
  signing_options=(--options runtime --timestamp)
elif [[ "$signing_identity" == "-" ]]; then
  print -u2 -r -- "Ad-hoc-Signatur ausdrücklich angefordert; bestehende Bedienungshilfen-Freigaben können dadurch ungültig werden."
fi

cd "$project_dir"
export MACOSX_DEPLOYMENT_TARGET=13.0
build_options=(-c release)
if [[ "$universal" == true ]]; then build_options+=(--arch arm64 --arch x86_64); fi
swift build "${build_options[@]}"
binary_dir="$(swift build "${build_options[@]}" --show-bin-path)"
if [[ "$universal" == true ]]; then
  binary_architectures="$(lipo -archs "$binary_dir/MailMarkdown")"
  [[ " $binary_architectures " == *" arm64 "* && " $binary_architectures " == *" x86_64 "* ]] \
    || mm_fail "Der Build enthält nicht beide erwarteten Architekturen: $binary_architectures"
fi
minimum_versions="$(xcrun vtool -show-build "$binary_dir/MailMarkdown" | awk '/^[[:space:]]*minos / { print $2 }')"
[[ -n "$minimum_versions" ]] || mm_fail "Die Mindestversion des Mach-O-Builds konnte nicht geprüft werden."
for minimum_version in ${(f)minimum_versions}; do
  [[ "$minimum_version" == "13.0" ]] \
    || mm_fail "Mach-O-Build erfordert unerwartet macOS $minimum_version statt 13.0."
done

destination_parent="${destination:h}"
mkdir -p "$destination_parent"
staging_dir="$(mktemp -d "$destination_parent/.build-XXXXXX")"
bundle="$staging_dir/Mail Markdown.app"
mkdir -p "$bundle/Contents/MacOS" "$bundle/Contents/Resources"
cp "$binary_dir/MailMarkdown" "$bundle/Contents/MacOS/MailMarkdown"
cp "$project_dir/Resources/Info.plist" "$bundle/Contents/Info.plist"
cp "$project_dir/LICENSE" "$bundle/Contents/Resources/LICENSE.txt"
if [[ -f "$project_dir/Resources/AppIcon.icns" ]]; then
  cp "$project_dir/Resources/AppIcon.icns" "$bundle/Contents/Resources/AppIcon.icns"
  /usr/libexec/PlistBuddy -c 'Add :CFBundleIconFile string AppIcon' "$bundle/Contents/Info.plist"
fi
if [[ -f "$project_dir/Resources/ThirdPartyNotices.txt" ]]; then
  cp "$project_dir/Resources/ThirdPartyNotices.txt" "$bundle/Contents/Resources/ThirdPartyNotices.txt"
fi
if [[ -d "$project_dir/Resources/LICENSES" ]]; then
  ditto "$project_dir/Resources/LICENSES" "$bundle/Contents/Resources/LICENSES"
fi
plutil -lint "$bundle/Contents/Info.plist"
codesign --force --sign "$signing_identity" "${signing_options[@]}" "$bundle"
codesign --verify --strict "$bundle"
if [[ -n "$preserved_requirement" ]]; then
  codesign --verify --strict --test-requirement "=$preserved_requirement" "$bundle"
fi
if destination_is_running; then
  mm_fail "Die Ziel-App wurde inzwischen gestartet. Der geprüfte Build liegt unter: $bundle"
fi

# Hidden unique backups do not expose a second launchable .app identity.
backup=""
if [[ -d "$destination" ]]; then
  backup_dir="$(mktemp -d "$destination_parent/.backup-XXXXXX")"
  backup="$backup_dir/Mail Markdown.previous"
  mv "$destination" "$backup"
fi
if ! mv "$bundle" "$destination"; then
  if [[ -n "$backup" && ! -e "$destination" ]]; then mv "$backup" "$destination"; fi
  mm_fail "App konnte nicht ersetzt werden. Der geprüfte Build liegt unter: $bundle"
fi
rmdir "$staging_dir"
print -r -- "$destination"

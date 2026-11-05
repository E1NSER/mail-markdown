# Shared by the packaging scripts. Sourcing this file performs no operations.
mm_fail() { print -u2 -r -- "Mail Markdown: $*"; exit 1; }

mm_identity_records() {
  local identity_line
  security find-identity -v -p codesigning | while IFS= read -r identity_line; do
    if [[ "$identity_line" =~ '^[[:space:]]*[0-9]+\)[[:space:]]+([[:xdigit:]]{40})[[:space:]]+"(.*)"$' ]]; then
      print -r -- "${match[1]:u}"$'\t'"${match[2]}"
    fi
  done
}

mm_resolve_identity() {
  local requested="$1" identity_hash identity_name
  local -a candidates=()
  [[ "$requested" == "-" ]] && { print -r -- '-'; return 0; }
  while IFS=$'\t' read -r identity_hash identity_name; do
    if [[ "$identity_hash" == "${requested:u}" || "$identity_name" == "$requested" ]]; then
      candidates+=("$identity_hash")
    fi
  done < <(mm_identity_records)
  candidates=("${(@u)candidates}")
  (( ${#candidates} == 1 )) || mm_fail "Signieridentität nicht eindeutig verfügbar. MAIL_MARKDOWN_SIGNING_IDENTITY auf den exakten Namen oder SHA-1-Fingerabdruck setzen."
  print -r -- "${candidates[1]}"
}

mm_identity_name() {
  local requested="$1" identity_hash identity_name
  [[ "$requested" == "-" ]] && { print -r -- 'Ad-hoc'; return 0; }
  while IFS=$'\t' read -r identity_hash identity_name; do
    if [[ "$identity_hash" == "${requested:u}" ]]; then print -r -- "$identity_name"; return 0; fi
  done < <(mm_identity_records)
  mm_fail "Die ausgewählte Signieridentität ist nicht mehr verfügbar."
}

mm_single_development_identity() {
  local identity_hash identity_name
  local -a candidates=()
  while IFS=$'\t' read -r identity_hash identity_name; do
    [[ "$identity_name" == "Apple Development:"* ]] && candidates+=("$identity_hash")
  done < <(mm_identity_records)
  candidates=("${(@u)candidates}")
  (( ${#candidates} == 1 )) || mm_fail "Keine einzelne Apple-Development-Identität gefunden. MAIL_MARKDOWN_SIGNING_IDENTITY ausdrücklich setzen; es erfolgt kein automatischer Wechsel zu Ad-hoc."
  print -r -- "${candidates[1]}"
}

mm_identity_from_app() {
  local existing_app="$1" app_signing_info app_authority certificate_dir fingerprint resolved_identity
  app_signing_info="$(codesign --display --verbose=4 "$existing_app" 2>&1)" \
    || mm_fail "Vorhandene App hat keine lesbare Signatur. Signieridentität ausdrücklich angeben."
  app_authority="$(print -r -- "$app_signing_info" | sed -n 's/^Authority=//p' | head -n 1)"
  [[ "$app_authority" == "Apple Development:"* || "$app_authority" == "Developer ID Application:"* ]] \
    || mm_fail "Vorhandene Signatur lässt sich nicht automatisch übernehmen. MAIL_MARKDOWN_SIGNING_IDENTITY ausdrücklich setzen."
  certificate_dir="$(mktemp -d "${TMPDIR:-/tmp}/mail-markdown-cert-XXXXXX")"
  if ! codesign --display --extract-certificates="$certificate_dir/cert-" "$existing_app" >/dev/null 2>&1; then
    rm -rf -- "$certificate_dir"
    mm_fail "Signierzertifikat der vorhandenen App konnte nicht ausgelesen werden."
  fi
  fingerprint="$(openssl x509 -inform DER -in "$certificate_dir/cert-0" -noout -fingerprint -sha1 | sed 's/.*=//; s/://g; s/[[:space:]]//g')"
  rm -rf -- "$certificate_dir"
  resolved_identity="$(mm_resolve_identity "$fingerprint")"
  [[ "$(mm_identity_name "$resolved_identity")" == "$app_authority" ]] \
    || mm_fail "Zertifikat und Signieridentität der vorhandenen App stimmen nicht überein."
  print -r -- "$resolved_identity"
}

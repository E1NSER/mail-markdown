#!/bin/zsh
# Build a separate, UI-only development app; never replace the working app.
set -euo pipefail
project_dir="${0:A:h:h}"
preview_app="$project_dir/dist/ui-preview/Mail Markdown UI Preview.app"
MAIL_MARKDOWN_SIGNING_IDENTITY=- zsh "$project_dir/scripts/build-app.sh" --native --staging-output "$preview_app"
/usr/libexec/PlistBuddy -c 'Set :CFBundleIdentifier at.einser.mail-markdown.ui-preview' "$preview_app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Set :CFBundleDisplayName Mail Markdown UI Preview' "$preview_app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :MailMarkdownUIPreview bool true' "$preview_app/Contents/Info.plist"
codesign --force --sign - --timestamp=none "$preview_app"
codesign --verify --strict "$preview_app"
print -r -- "$preview_app"

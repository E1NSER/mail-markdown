# Mail Markdown

[Website](https://markdown-mail.einser.at) · [Download for macOS](https://github.com/E1NSER/mail-markdown/releases/latest/download/Mail-Markdown-universal-notarized.dmg) · [Releases](https://github.com/E1NSER/mail-markdown/releases) · [Build from source](#build-locally) · [Contributing](CONTRIBUTING.md)

**Free, unlimited Markdown formatting for Apple Mail.** Paste with **⌘V** and keep the font, size and color of your existing draft.

Mail Markdown is an independent native macOS companion app by [E1NSER.](https://einser.at). It runs in the menu bar and includes settings, a live Markdown preview and help. There are no subscriptions, formatting quotas, accounts, analytics or remote servers.

## Current status

Public releases provide a **Developer-ID-signed and Apple-notarized Universal DMG** for Apple Silicon and Intel. Download the latest stable version from [GitHub Releases](https://github.com/E1NSER/mail-markdown/releases/latest), open the DMG and drag Mail Markdown into Applications. Each release includes installation notes and a SHA-256 checksum file.

The fixed [latest installer link](https://github.com/E1NSER/mail-markdown/releases/latest/download/Mail-Markdown-universal-notarized.dmg) always follows the current stable release. Local Apple Development and ad-hoc builds remain development builds; they do not establish notarization.

The current architecture targets direct distribution. It uses Accessibility to read the draft's text style and a keyboard event tap to handle paste. It is installed separately and does not appear in Mail's Extensions settings. See [Mac App Store feasibility](docs/APP_STORE_FEASIBILITY.md) for the sandbox constraints and a possible separate Services implementation.

Design explorations are proposals; they do not represent a shipped UI update.

## Requirements

- macOS **13 or later** and Apple Mail.
- Accessibility permission for the exact copy of Mail Markdown you run.
- To build: Xcode with **Swift 6.2 or later**. The pinned `swift-markdown` 0.9.0 dependency requires this toolchain even though the app targets macOS 13.

The packaging script builds a Universal app for Apple Silicon and Intel by default. `--native` builds only for your current architecture.

## Build locally

From the repository root:

```sh
swift test

# Explicit ad-hoc signing for a local development build:
MAIL_MARKDOWN_SIGNING_IDENTITY=- zsh scripts/build-app.sh \
  --native --staging-output "$PWD/dist/dev/Mail Markdown.app"
```

Quit any other running copy before opening `dist/dev/Mail Markdown.app`. Keep one copy at a stable location, such as `/Applications`, before granting Accessibility permission.

Ad-hoc signing is an explicit local-development option. For a stable signed build, set `MAIL_MARKDOWN_SIGNING_IDENTITY` to the exact name or fingerprint of your own available signing identity. Otherwise, the script attempts to preserve an existing app's identity or requires one unambiguous Apple Development identity. It never silently falls back to ad-hoc signing. Changing the signature can invalidate an existing Accessibility approval.

For Universal builds, packaging and public distribution, see the [build scripts guide](scripts/README.md) and [release guide](docs/RELEASE.md). The notarization command uploads a build to Apple; ordinary test builds do not upload app or message data. Never commit signing certificates, private keys or notarization credentials.

## Set up and use

1. Open Mail Markdown. In **System Settings → Privacy & Security → Accessibility**, enable the app. The German UI also provides **Bedienungshilfen öffnen …** to open this setting.
2. In Apple Mail, open a **Rich Text** draft. Put the cursor beside existing text with the font, size and color you want to keep.
3. Copy some Markdown and paste with **⌘V**. For example, `**bold** and *italic*` becomes formatted text in the draft's style.

To convert Markdown already in a draft, select it, press **⌘C**, then **⌘V**.

Closing the settings window leaves the menu-bar app running. Reopen it through **Einstellungen …** or by opening the app again. Launch at login is optional and off by default. The app's preview uses a neutral example style; it does not read an open Mail draft.

## Formatting and limits

- Supports bold, italic, strikethrough, links, lists, headings, quotes and code. Tables become tab-separated rows.
- Body text inherits the sampled draft style. Headings keep its font size and become bold; code uses a monospaced font at the same size.
- The style sample comes from a neighboring character. An empty draft, unreadable style data or a very large paste uses Mail's normal paste behavior. A toolbar formatting change without a corresponding styled character cannot be sampled yet.
- Automatic conversion handles **⌘V** in Mail's message body. Subject, recipient and search fields remain ordinary input fields. Menu/context-menu paste and **⌘⇧V** are not intercepted.
- Mail's Accessibility structure can vary by macOS version and UI language. Compose-window detection currently recognizes English and German Send controls; other localizations may need adjustments. The macOS 13 deployment target is not a claim of integration testing on every supported OS version.
- Converted text remains on the general clipboard. The app temporarily holds an in-memory snapshot of the original, which you can restore until you copy something new.
- Images become alternative text; raw HTML stays literal text. Link destinations are limited to `https`, `http` and `mailto`.

If an update leaves Accessibility permission apparently enabled but the app reports it is missing, remove the old entry with **−**, add the current app with **+**, then reopen it. macOS may still have an approval associated with the previous signature.

## Privacy

Message and clipboard contents are processed on your Mac, without telemetry or a backend. Clipboard recovery temporarily retains the original in memory; conversion replaces the general clipboard until you restore it or copy something new. The app does not write message or clipboard contents to files or upload them. Operational logs contain status, Accessibility roles and process IDs, not message text. See [PRIVACY.md](PRIVACY.md).

The separate [website](https://markdown-mail.einser.at) offers optional, consent-gated statistics; its [privacy notice](https://markdown-mail.einser.at/datenschutz) describes that processing. Website analytics are not part of the native app.

## Development and verification

```sh
swift test
```

The test suite covers Markdown rendering, draft-style inheritance, safe link handling and RTF export/import. The app uses RTF for rich-text paste; AppKit's HTML export changed colors during testing.

Test the complete Mail flow with **real keyboard input** in a disposable, unsent draft. Setting Mail's contents through scripting does not exercise the keyboard event tap. The physical **⌘C → ⌘V** flow, including bold and italic formatting, was confirmed on a development Mac; renderer tests alone do not prove end-to-end compatibility with every macOS/Mail version.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, testing and pull-request guidance.

## License and credits

Mail Markdown is released under the [MIT License](LICENSE). Copyright © 2026 Sascha Eisner (E1NSER).

The parser uses [swift-markdown](https://github.com/swiftlang/swift-markdown) and [swift-cmark](https://github.com/swiftlang/swift-cmark), pinned in `Package.resolved`. Their licenses and notices remain separate and are included in [Resources/ThirdPartyNotices.txt](Resources/ThirdPartyNotices.txt) and the packaged app.

Created by [E1NSER.](https://einser.at).

# Privacy

Mail Markdown processes Markdown locally on your Mac. The app has no account,
analytics, advertising SDK, remote conversion service or automatic updater. It
does not send draft text or clipboard contents to E1NSER or another service.

## What the app accesses

- **Keyboard events:** an active macOS event tap recognizes the ordinary ⌘V
  shortcut while Apple Mail is in front. Other keys are passed through; the app
  does not record a typing history.
- **Clipboard:** when handling that shortcut, the app reads clipboard text. For
  recognized Markdown it replaces the clipboard with formatted RTF and plain
  text, then asks Mail to paste. The converted content stays on the system
  clipboard until replaced or restored.
- **Mail's editing context:** Accessibility APIs identify the focused compose
  window and selection. A single adjacent character is sampled for its font,
  color and paragraph attributes. The app does not retrieve the complete draft
  body or read the inbox.
- **Local preferences:** the formatting-enabled preference and window position
  and size are stored locally through `UserDefaults` and AppKit. Optional
  launch at login is managed by macOS and is off by default.

To support “Original-Zwischenablage wiederherstellen”, the app temporarily holds
the original clipboard representations in memory. It discards this snapshot
when it detects new clipboard contents, after restoration, or when the app
quits. It does not write clipboard history or drafts to its own files.

Operational status, Accessibility roles and process IDs may appear in the local
macOS unified log. Draft text, clipboard text, links and font samples are not
included in these messages. macOS controls log retention.

## Your controls

Pause conversion from the menu bar or quit the app. Revoke its permission under
System Settings → Privacy & Security → Accessibility at any time. macOS grants
broad Accessibility permission; the source code shows how this app limits its
use to the Mail paste workflow.

Markdown images become alternative text; they are not downloaded. HTML is
treated as literal text. Web and mail links become links in the resulting draft;
following them is handled by the receiving application.

## External services

Opening the repository, reporting an issue or downloading a release uses GitHub
and is subject to [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
Sending an email remains an Apple Mail action using your configured provider.
The app does not send email itself.

For questions, use [GitHub Issues](https://github.com/E1NSER/mail-markdown/issues).
Please use anonymized examples and keep private email and clipboard contents
out of public reports.

This statement describes the source in this repository. Third-party forks may
change its behavior.

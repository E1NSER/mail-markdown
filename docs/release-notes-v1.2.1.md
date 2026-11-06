**Release candidate — public installer pending Apple notarization.**

Mail Markdown 1.2.1 makes quotes visibly indented and lines up multi-line list items.

- **Quotes are indented on every line.** Each quote level starts 1.8 em in, including the first line, so a one-line quote such as `> Thanks for the feedback!` no longer looks like ordinary text. Previously only wrapped lines moved in.
- **Quotes inside lists** are indented past the item text. Lists inside quotes place their marker at the quote's indent.
- **Multi-line list items** align follow-up lines and further paragraphs with the item text instead of the bullet.
- **Text after a list** no longer takes on the list's indent for its wrapped lines.
- The website's live preview now follows the app's output more closely: quotes without a bar, code at text size, tab-separated tables, ☑/☐ task markers and every heading at text size.

**Installer:** Universal app for Apple Silicon and Intel, macOS 13 or later. The public `Mail-Markdown-universal-notarized.dmg` and `SHA256SUMS` will be published after successful Apple notarization.

**Install or update:** Quit older running copies. Open the DMG, drag Mail Markdown into Applications, then open it from there. If macOS requests it, allow the installed copy under **System Settings → Privacy & Security → Accessibility**.

Paste Markdown with **⌘V in the body of an Apple Mail Rich Text draft**. Font, size and text color come from neighboring text in the draft. An empty draft or an unreadable style sample uses normal paste. Menu/right-click paste and ⌘⇧V are not intercepted. The app preview uses a neutral sample style.

Free, unlimited and open source under the MIT License. Text is processed locally; the app has no analytics.

---

**Deutsch:** Zitate werden jetzt auf jeder Zeile eingerückt, auch auf der ersten. Ein einzeiliges Zitat wie `> Danke für das Feedback!` sieht damit nicht mehr wie normaler Text aus. Zitate in Listen rücken über den Text des Listenpunkts hinaus ein. Folgezeilen und weitere Absätze eines Listenpunkts stehen bündig mit dessen Text statt unter dem Aufzählungszeichen. Text nach einer Liste übernimmt deren Einzug nicht mehr. Die Live-Vorschau auf der Website entspricht nun genauer dem Ergebnis der App.

[Report an issue](https://github.com/E1NSER/mail-markdown/issues) · [App privacy](https://github.com/E1NSER/mail-markdown/blob/main/PRIVACY.md)

**Release candidate. Combined Apple Mail validation and Apple notarization are pending.**

Mail Markdown 1.2.1 indents every line of a quote and pastes editable lists into Apple Mail.

- **Quotes are indented on every line.** Each quote level starts 1.8 em in, including the first line, so a one-line quote such as `> Thanks for the feedback!` no longer looks like ordinary text. Previously only wrapped lines moved in.
- **Quotes inside lists** align their lines within the same native list item. Quotes after an introduction follow that item's text column. Mail controls the list marker and text column.
- **Native ordered and unordered lists** retain their structure, nesting and ordered starting numbers. The plain-text fallback keeps readable bullets and numbers.
- **Multi-line list items** align follow-up lines and further paragraphs with the item text. A continuation paragraph after a nested sublist currently becomes a separate item in the parent list during RTF conversion.
- **Task items** include ☑ or ☐ at the start of the text within the native list item. The list still supplies its own bullet or number.
- **Text after a list** keeps its body paragraph style, including on wrapped lines.
- The website's live preview follows the app's formatting more closely. Quotes appear without a bar, code and headings keep the text size, tables use tab-separated rows and tasks display ☑ or ☐.

In the standalone development build, Apple Mail continued both ordered and unordered lists after a physical **⌘V → Return**. The combined build still needs an Apple Mail check of list continuation and quotes, including quotes and lists nested within one another.

**Installer:** Universal app for Apple Silicon and Intel, macOS 13 or later. The public `Mail-Markdown-universal-notarized.dmg` and `SHA256SUMS` will be published after successful Apple notarization.

**Install or update:** Quit older running copies. Open the DMG, drag Mail Markdown into Applications, then open it from there. If macOS requests it, allow the installed copy under **System Settings → Privacy & Security → Accessibility**.

Paste Markdown with **⌘V in the body of an Apple Mail Rich Text draft**. Font, size and text color come from neighboring text in the draft. An empty draft or an unreadable style sample uses normal paste. Menu/right-click paste and ⌘⇧V are not intercepted. The app preview uses a neutral sample style.

Free, unlimited and open source under the MIT License. Text is processed locally; the app has no analytics.

---

**Deutsch.** Eigenständige Zitate werden auf jeder Zeile eingerückt, auch auf der ersten. Zitate in Listen bleiben innerhalb ihres Listenpunkts und ihre Zeilen stehen bündig. Apple Mail steuert dabei die Textspalte und das Listenzeichen. Aufzählungen und nummerierte Listen bleiben als Listen bearbeitbar. Folgt auf eine Unterliste ein weiterer Absatz desselben Listenpunkts, erscheint er in der aktuellen RTF-Ausgabe als eigener Punkt in der übergeordneten Liste. Bei Aufgaben stehen ☑ oder ☐ am Anfang des Textes, zusätzlich zum Aufzählungszeichen oder zur Nummer. Text nach einer Liste behält seinen Absatzeinzug.

Im separaten Testbuild setzte Apple Mail nach **⌘V → Return** beide Listentypen fort. Der gemeinsame Test mit den Änderungen für Zitate steht noch aus.

[Report an issue](https://github.com/E1NSER/mail-markdown/issues) · [App privacy](https://github.com/E1NSER/mail-markdown/blob/main/PRIVACY.md)

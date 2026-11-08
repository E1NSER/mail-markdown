import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { previewComponents, previewRemarkPlugins } from "../lib/mail-preview.ts";

// Expected results follow Sources/MailMarkdownCore/MarkdownRenderer.swift and its tests.
function preview(markdown: string): string {
  return renderToStaticMarkup(
    createElement(Markdown, { remarkPlugins: previewRemarkPlugins, components: previewComponents }, markdown),
  );
}

test("task items show the app's ☑/☐ markers instead of form controls", () => {
  const html = preview("- [x] Fertig\n- [ ] Offen");
  assert.doesNotMatch(html, /<input/);
  assert.match(html, /<span class="task-marker">☑<\/span> Fertig/);
  assert.match(html, /<span class="task-marker">☐<\/span> Offen/);
});

test("a thematic break becomes the app's line of box-drawing characters", () => {
  const html = preview("Oben\n\n---\n\nUnten");
  assert.doesNotMatch(html, /<hr/);
  assert.match(html, /<p role="separator">────────<\/p>/);
});

test("single newlines stay line breaks, as soft breaks do in the app", () => {
  assert.match(preview("Zeile eins\nZeile zwei"), /Zeile eins<br\/>\nZeile zwei/);
  assert.match(preview("> Zitat\n> zwei"), /<blockquote>\n<p>Zitat<br\/>\nzwei<\/p>\n<\/blockquote>/);
});

test("raw HTML stays literal text and images become alternative text", () => {
  const html = preview("<b>Hallo</b> ![Beschreibung](https://example.org/pixel.png)");
  assert.match(html, /&lt;b&gt;Hallo&lt;\/b&gt;/);
  assert.match(html, /<span>Beschreibung<\/span>/);
  assert.doesNotMatch(html, /<img|<b>/);
});

test("links open separately without passing on the referrer", () => {
  assert.match(preview("[Web](https://example.org)"), /<a href="https:\/\/example.org" target="_blank" rel="noreferrer">Web<\/a>/);
});

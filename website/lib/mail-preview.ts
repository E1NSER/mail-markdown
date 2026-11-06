import { createElement } from "react";
import type { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// The playground mirrors the native renderer (Sources/MailMarkdownCore/MarkdownRenderer.swift)
// where HTML allows it; the matching layout rules live in `.rendered-markdown` in globals.css.
// - remark-breaks: the app also turns every single newline into a line break.
// - Raw HTML stays literal text: react-markdown escapes it without rehype-raw.
export const previewRemarkPlugins = [remarkGfm, remarkBreaks];

export const previewComponents: Components = {
  a: ({ href, children }) => createElement("a", { href, target: "_blank", rel: "noreferrer" }, children),
  // Images become their alternative text; nothing remote is loaded.
  img: ({ alt }) => createElement("span", null, alt),
  // Task items use the app's ☑/☐ glyphs in place of the list marker, not form controls.
  input: ({ checked }) => createElement("span", { className: "task-marker" }, checked ? "☑" : "☐"),
  // The app writes a thematic break as a short line of box-drawing characters.
  hr: () => createElement("p", { role: "separator" }, "────────"),
};

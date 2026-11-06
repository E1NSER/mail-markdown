"use client";

import { useState } from "react";
import { useLocale } from "./locale-provider";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ArrowRight, Check, ChevronDown, RotateCcw } from "lucide-react";

const germanExamples = [
  {
    name: "Projektupdate",
    text: "Hallo Alex,\n\n**Ein kurzes Update** zu unserem Projekt.\n\n- Das Design ist *abgestimmt*.\n- Die nächsten Schritte stehen.\n- Der Kaffee ist auch schon fertig.\n\n> Weniger formatieren. Mehr sagen.\n\nLiebe Grüße\nSam",
  },
  {
    name: "Einladung",
    text: "# Eine kleine Einladung\n\nHallo zusammen,\n\nam **Freitag um 18 Uhr** stoßen wir auf den Launch an.\n\n1. Vorbeikommen\n2. Lieblingsgetränk mitbringen\n3. Den Abend genießen\n\nDen Treffpunkt findet ihr [hier](https://example.org).\n\n*Wir freuen uns auf euch!*",
  },
  {
    name: "Feedback",
    text: "Hallo Sam,\n\n**Danke für deinen Entwurf!**\n\nDas gefällt mir besonders:\n- Die *klare Typografie*\n- Die ruhigen Farben\n- Der Fokus aufs Wesentliche\n\n~~Noch ein Meeting?~~ Ein kurzes Feedback reicht.\n\n> Genau so fühlt sich gute Zusammenarbeit an.\n\nLiebe Grüße\nAlex",
  },
];
const englishExamples = [
  {
    name: "Project update",
    text: "Hi Alex,\n\n**A quick update** on our project.\n\n- The design is *approved*.\n- The next steps are clear.\n- The coffee is ready, too.\n\n> Less formatting. More to say.\n\nBest,\nSam",
  },
  {
    name: "Invitation",
    text: "# A little invitation\n\nHi everyone,\n\nlet’s celebrate the launch on **Friday at 6 pm**.\n\n1. Drop by\n2. Bring your favorite drink\n3. Enjoy the evening\n\nYou can find the meeting point [here](https://example.org).\n\n*We look forward to seeing you!*",
  },
  {
    name: "Feedback",
    text: "Hi Sam,\n\n**Thanks for your draft!**\n\nHere’s what I particularly like:\n- The *clear typography*\n- The calm colors\n- The focus on what matters\n\n~~Another meeting?~~ A quick note will do.\n\n> This is what good collaboration feels like.\n\nBest,\nAlex",
  },
];
const examplesByLocale = { en: englishExamples, de: germanExamples };
const fonts = [
  { name: "Helvetica", family: "Helvetica, Arial, sans-serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Times", family: '"Times New Roman", serif' },
];
const colors = [
  { en: "Graphite", de: "Graphit", value: "#26313e" },
  { en: "Mail blue", de: "Mail-Blau", value: "#0065cf" },
  { en: "Terracotta", de: "Terrakotta", value: "#994331" },
];

export function Playground() {
  const locale = useLocale();
  const de = locale === "de";
  const examples = examplesByLocale[locale];
  const [text, setText] = useState(examples[0].text);
  const [active, setActive] = useState<number | null>(0);
  const [font, setFont] = useState(1);
  const [color, setColor] = useState(colors[0].value);
  const reduced = useReducedMotion();

  return (
    <div className="playground">
      <div className="playground-tools">
        <div
          className="example-tabs"
          role="group"
          aria-label={de ? "Markdown-Beispiel auswählen" : "Choose a Markdown example"}
        >
          {examples.map((example, index) => (
            <button
              key={example.name}
              aria-pressed={active === index}
              className={active === index ? "active" : ""}
              onClick={() => {
                setActive(index);
                setText(example.text);
              }}
            >
              {example.name}
            </button>
          ))}
        </div>
        <button
          className="reset-demo"
          onClick={() => {
            setText(examples[0].text);
            setActive(0);
            setFont(1);
            setColor(colors[0].value);
          }}
        >
          <RotateCcw size={14} /> {de ? "Zurücksetzen" : "Reset"}
        </button>
      </div>
      <div className="playground-panels">
        <div className="editor-panel">
          <div className="panel-label">
            <span>
              <span className="panel-number">01</span> {de ? "Markdown aus der KI" : "Markdown from AI"}
            </span>
            <span className="editable-badge">
              {de ? "Hier schreiben" : "Write here"}
              <svg
                className="editor-hint-arrow"
                width="70"
                height="36"
                viewBox="0 0 70 36"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M58 3C73 4 64 16 43 17C29 18 18 23 12 31M12 21V31L22 28"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <label className="sr-only" htmlFor="markdown-input">
            {de ? "Markdown aus der KI ausprobieren" : "Try Markdown from AI"}
          </label>
          <textarea
            id="markdown-input"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setActive(null);
            }}
            maxLength={6000}
            spellCheck={false}
            aria-describedby="demo-privacy"
          />
          <div className="editor-footer">
            <span>{de ? "**fett**   *kursiv*   - Liste" : "**bold**   *italic*   - List"}</span>
            <span>{text.length} / 6000</span>
          </div>
        </div>
        <div className="conversion-divider" aria-hidden="true">
          <ArrowRight size={18} />
        </div>
        <div className="result-panel">
          <div className="panel-label">
            <span>
              <span className="panel-number">02</span> {de ? "Dein Apple-Mail-Stil" : "Your Apple Mail style"}
            </span>
            <span className="live-badge">
              <span /> Live
            </span>
          </div>
          <div className="style-controls">
            <label className="font-select">
              <span className="sr-only">{de ? "Schriftart der Vorschau" : "Preview font"}</span>
              <select
                value={font}
                onChange={(event) => setFont(Number(event.target.value))}
              >
                {fonts.map((item, index) => (
                  <option key={item.name} value={index}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} aria-hidden="true" />
            </label>
            <span className="style-controls-divider" />
            <div
              className="color-controls"
              role="group"
              aria-label={de ? "Textfarbe der Vorschau" : "Preview text color"}
            >
              {colors.map((item) => (
                <button
                  key={item.value}
                  className="color-option"
                  aria-label={item[locale]}
                  aria-pressed={color === item.value}
                  onClick={() => setColor(item.value)}
                >
                  <span style={{ background: item.value }}>
                    {color === item.value && <Check size={11} />}
                  </span>
                </button>
              ))}
            </div>
            <span className="style-size">16</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active ?? "custom"}
              initial={{ opacity: 0, y: reduced ? 0 : 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              className="rendered-markdown"
              style={{ fontFamily: fonts[font].family, color }}
            >
              <Markdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: (props) => (
                    <a href={props.href} target="_blank" rel="noreferrer">
                      {props.children}
                    </a>
                  ),
                  img: (props) => <span>{props.alt}</span>,
                }}
              >
                {text || (de ? "Dein formatierter Text erscheint hier." : "Your formatted text appears here.")}
              </Markdown>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="playground-caption" id="demo-privacy">
        <span>
          <span className="privacy-dot" /> {de ? "Diese Browser-Demo verarbeitet deinen Text nur auf deinem Gerät." : "This browser demo processes your text only on your device."}
        </span>
        <span>
          {de ? "Die installierte Erweiterung übernimmt den Stil deines Apple-Mail-Entwurfs." : "The installed extension uses the style of your Apple Mail draft."}
        </span>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Send } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const rawMarkdown =
  "**Hey Alex,**\n\ngute Nachrichten.\nDas Design ist *fertig*.\n\n- Ein klarer Plan.\n- Ein schönes Ergebnis.\n- Und ein bisschen weniger Arbeit.\n\nLiebe Grüße\nSam";

const demoFonts = {
  Georgia: 'Georgia, "Times New Roman", serif',
  Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
} as const;
type DemoFont = keyof typeof demoFonts;
const fontNames = Object.keys(demoFonts) as DemoFont[];

export function HeroDemo() {
  const [formatted, setFormatted] = useState(false);
  const [font, setFont] = useState<DemoFont>("Georgia");
  const reduced = useReducedMotion();
  const autoRun = useRef<number | undefined>(undefined);

  useEffect(() => {
    autoRun.current = window.setTimeout(() => setFormatted(true), 1800);
    return () => window.clearTimeout(autoRun.current);
  }, []);

  function cancelAutoFormat() {
    window.clearTimeout(autoRun.current);
    autoRun.current = undefined;
  }

  function toggleDemo() {
    cancelAutoFormat();
    setFormatted((value) => !value);
  }

  function selectFont(nextFont: DemoFont) {
    cancelAutoFormat();
    setFont(nextFont);
  }

  return (
    <div
      className="hero-scene"
      role="group"
      aria-label="Interaktive Demo: Markdown in Apple Mail formatieren"
    >
      <div className="scene-topline">
        <span>01</span>
        <span>MARKDOWN → MAIL</span>
      </div>
      <div className="scene-glyph" aria-hidden="true">
        **
      </div>
      <div
        className="hero-window"
        style={{ "--demo-font": demoFonts[font] } as CSSProperties}
      >
        <div className="window-titlebar">
          <div className="traffic-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>Eine kleine Nachricht</span>
          <span className="window-title-icon" aria-hidden="true">
            <Send size={15} />
          </span>
        </div>
        <div className="mail-fields">
          <div>
            <span>An:</span>
            <span className="recipient">
              Alex <ChevronDown size={10} aria-hidden="true" />
            </span>
          </div>
          <div>
            <span>Betreff:</span>
            <b>Gute Nachrichten ✨</b>
          </div>
        </div>
        <div className="mail-formatbar">
          <div
            className="demo-fonts"
            role="group"
            aria-label="Schrift der formatierten Beispielnachricht"
          >
            {fontNames.map((name) => (
              <button
                key={name}
                type="button"
                className="demo-font"
                aria-pressed={font === name}
                aria-controls="hero-mail-preview"
                onClick={() => selectFont(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <i aria-hidden="true" />
          <span aria-hidden="true">16</span>
          <i aria-hidden="true" />
          <strong aria-hidden="true">B</strong>
          <em aria-hidden="true">I</em>
          <u aria-hidden="true">U</u>
          <span className="formatbar-color" aria-hidden="true" />
        </div>
        <div className="hero-mail-content" id="hero-mail-preview">
          <AnimatePresence mode="wait" initial={false}>
            {formatted ? (
              <motion.div
                key="formatted"
                initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: reduced ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.26 }}
                className="mail-formatted"
                style={{ fontFamily: "var(--demo-font)" }}
              >
                <p>
                  <strong>Hey Alex,</strong>
                </p>
                <p>
                  gute Nachrichten.
                  <br />
                  Das Design ist <em>fertig</em>.
                </p>
                <ul>
                  <li>Ein klarer Plan.</li>
                  <li>Ein schönes Ergebnis.</li>
                  <li>Und ein bisschen weniger Arbeit.</li>
                </ul>
                <p>
                  Liebe Grüße
                  <br />
                  Sam
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="markdown"
                initial={{ opacity: reduced ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -4 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
                className="mail-raw"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {rawMarkdown}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="window-footer">
          <span
            className={formatted ? "demo-status complete" : "demo-status"}
            role="status"
          >
            <span aria-hidden="true" />
            {formatted
              ? "Dein Stil. Jetzt mit Format."
              : "Markdown wartet auf sein ⌘V."}
          </span>
        </div>
      </div>
      <div className="paste-control">
        <button
          type="button"
          className={`paste-key ${formatted ? "is-pressed" : ""}`}
          onClick={toggleDemo}
          aria-label="Formatierung der Mail-Demo umschalten"
          aria-pressed={formatted}
          aria-controls="hero-mail-preview"
        >
          <span aria-hidden="true">⌘</span>
          <span aria-hidden="true">V</span>
        </button>
        <div>
          <span className="paste-control-label">Einfügen. Auf deine Art.</span>
          <span className="paste-control-hint">
            Klicken &amp; Format wechseln
          </span>
        </div>
      </div>
      <div className="scene-caption">
        Browser-Demo. Ohne Verbindung zu deiner Mail-App.
      </div>
    </div>
  );
}

"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight, Check, ChevronDown, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function HeroDemo() {
  const [formatted, setFormatted] = useState(false);
  const reduced = useReducedMotion();
  const scene = useRef<HTMLDivElement>(null);
  const autoRun = useRef<number | undefined>(undefined);
  const { scrollYProgress } = useScroll({
    target: scene,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -45]);
  useEffect(() => {
    autoRun.current = window.setTimeout(() => setFormatted(true), 1800);
    return () => window.clearTimeout(autoRun.current);
  }, []);
  function toggleDemo() {
    window.clearTimeout(autoRun.current);
    setFormatted((value) => !value);
  }

  return (
    <div
      className="hero-scene"
      ref={scene}
      aria-label="Animierte Beispieldarstellung eines Mail-Entwurfs"
    >
      <div className="mail-stage" aria-hidden="true">
        <svg viewBox="0 0 600 500" fill="none" preserveAspectRatio="none">
          <path d="M24 78 300 285 576 78M24 462 224 290M576 462 376 290" />
        </svg>
      </div>
      <motion.div
        className="source-note"
        initial={{ opacity: 0, x: -20, rotate: -9 }}
        animate={{ opacity: 1, x: 0, rotate: -7 }}
        transition={{ delay: 0.45, duration: 0.8 }}
        style={{ y: reduced ? 0 : y }}
        aria-hidden="true"
      >
        <div className="source-note-label">
          <span /> Dein Markdown
        </div>
        <code>
          **Hey Alex,**
          <br />
          <br />
          gute Nachrichten.
          <br />
          Das Design ist *fertig*.
        </code>
        <ArrowUpRight size={22} className="source-note-arrow" />
      </motion.div>
      <motion.div
        className="hero-window"
        initial={{ opacity: 0, y: reduced ? 0 : 38, rotate: reduced ? 0 : 3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="window-titlebar">
          <div className="traffic-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>Eine kleine Nachricht</span>
          <span className="window-title-icon">
            <Send size={15} />
          </span>
        </div>
        <div className="mail-fields">
          <div>
            <span>An:</span>
            <span className="recipient">
              Alex <ChevronDown size={10} />
            </span>
          </div>
          <div>
            <span>Betreff:</span>
            <b>Gute Nachrichten ✨</b>
          </div>
        </div>
        <div className="mail-formatbar" aria-hidden="true">
          <span>Georgia</span>
          <ChevronDown size={12} />
          <i />
          <span>16</span>
          <i />
          <strong>B</strong>
          <em>I</em>
          <u>U</u>
          <span className="formatbar-color" />
        </div>
        <div className="hero-mail-content">
          <AnimatePresence mode="wait" initial={false}>
            {formatted ? (
              <motion.div
                key="formatted"
                initial={{
                  opacity: 0,
                  filter: reduced ? "none" : "blur(5px)",
                  y: reduced ? 0 : 5,
                }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.4 }}
                className="mail-formatted"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: reduced ? 0 : -4 }}
                transition={{ duration: 0.22 }}
                className="mail-raw"
              >
                {
                  "**Hey Alex,**\n\ngute Nachrichten.\nDas Design ist *fertig*.\n\n- Ein klarer Plan.\n- Ein schönes Ergebnis.\n- Und ein bisschen weniger Arbeit.\n\nLiebe Grüße\nSam"
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="window-footer">
          <span className={formatted ? "demo-status complete" : "demo-status"}>
            <span />
            {formatted
              ? "Dein Stil. Jetzt mit Format."
              : "Markdown wartet auf sein ⌘V."}
          </span>
        </div>
      </motion.div>
      <motion.div
        className="paste-control"
        style={{ x: "-50%" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
      >
        <button
          className={`paste-key ${formatted ? "is-pressed" : ""}`}
          onClick={toggleDemo}
          aria-label={
            formatted ? "Einfüge-Demo zurücksetzen" : "Einfüge-Demo abspielen"
          }
        >
          <span>⌘</span>
          <span>V</span>
        </button>
        <div>
          <span className="paste-control-label">Ein vertrauter Handgriff.</span>
          <span className="paste-control-hint">Klick auf die Taste.</span>
        </div>
        <span className="paste-check" aria-hidden="true">
          {formatted ? <Check size={18} /> : <ArrowUpRight size={18} />}
        </span>
      </motion.div>
      <div className="scene-caption">
        Eine Demo. Keine Verbindung zu deinem Mail.
      </div>
    </div>
  );
}

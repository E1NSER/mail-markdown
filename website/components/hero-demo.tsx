"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { ChevronDown, RotateCcw, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import styles from "./hero-demo.module.css";

const rawMarkdown =
  "**Hey Alex,**\n\ngute Nachrichten.\nDas Design ist *fertig*.\n\n- Ein klarer Plan.\n- Ein schönes Ergebnis.\n- Und ein bisschen weniger Arbeit.\n\nLiebe Grüße\nSam";

const demoFonts = {
  Georgia: 'Georgia, "Times New Roman", serif',
  Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
} as const;
type DemoFont = keyof typeof demoFonts;
const fontNames = Object.keys(demoFonts) as DemoFont[];
const ease = [0.22, 1, 0.36, 1] as const;
type DemoState = {
  formatted: boolean;
  animated: boolean;
  phase: "raw" | "press" | "convert" | "reveal" | "done";
};

export function HeroDemo() {
  const [demo, setDemo] = useState<DemoState>({ formatted: false, animated: false, phase: "raw" });
  const [font, setFont] = useState<DemoFont>("Georgia");
  const [reduced, setReduced] = useState<boolean | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.35 });
  const autoConsumed = useRef(false);
  const targetFormatted = useRef(false);
  const timers = useRef(new Set<number>());
  const generation = useRef(0);
  const finePointer = useRef(false);
  const focused = useRef(false);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 160, damping: 25, mass: 0.7 });
  const rotateY = useSpring(tiltY, { stiffness: 160, damping: 25, mass: 0.7 });

  const cancelSequence = useCallback(() => {
    generation.current += 1;
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const current = generation.current;
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      if (generation.current === current) callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  const resetDepth = useCallback((immediate = false) => {
    tiltX.set(0);
    tiltY.set(0);
    if (immediate) {
      rotateX.jump(0);
      rotateY.jump(0);
    }
  }, [rotateX, rotateY, tiltX, tiltY]);

  const play = useCallback((replay = false) => {
    cancelSequence();
    autoConsumed.current = true;
    targetFormatted.current = true;
    resetDepth(true);
    if (reduced !== false) {
      setDemo({ formatted: true, animated: false, phase: "done" });
      return;
    }
    const press = () => {
      setDemo({ formatted: false, animated: true, phase: "press" });
      schedule(() => setDemo({ formatted: false, animated: true, phase: "convert" }), 130);
      schedule(() => setDemo({ formatted: true, animated: true, phase: "reveal" }), 250);
      schedule(() => setDemo({ formatted: true, animated: true, phase: "done" }), 940);
    };
    if (replay) {
      setDemo({ formatted: false, animated: false, phase: "raw" });
      schedule(press, 300);
    } else {
      press();
    }
  }, [cancelSequence, reduced, resetDepth, schedule]);

  useEffect(() => {
    if (!inView || reduced !== false || autoConsumed.current) return;
    const timer = window.setTimeout(() => {
      if (!autoConsumed.current) play();
    }, 1_200);
    return () => window.clearTimeout(timer);
  }, [inView, play, reduced]);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      finePointer.current = query.matches;
      if (!query.matches) resetDepth(true);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [resetDepth]);

  useEffect(() => {
    // Motion 14.9.1's hook snapshots this preference, so subscribe explicitly
    // to stop an active demonstration when the system setting changes.
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (query.matches) {
        autoConsumed.current = true;
        cancelSequence();
        resetDepth(true);
        setDemo({ formatted: targetFormatted.current, animated: false, phase: targetFormatted.current ? "done" : "raw" });
      }
      setReduced(query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [cancelSequence, resetDepth]);

  useEffect(() => cancelSequence, [cancelSequence]);

  function toggleDemo() {
    if (!targetFormatted.current) {
      play();
      return;
    }
    autoConsumed.current = true;
    targetFormatted.current = false;
    cancelSequence();
    setDemo({ formatted: false, animated: false, phase: "raw" });
  }

  function selectFont(nextFont: DemoFont) {
    autoConsumed.current = true;
    targetFormatted.current = true;
    cancelSequence();
    setFont(nextFont);
    setDemo({ formatted: true, animated: false, phase: "done" });
  }

  function moveDepth(event: PointerEvent<HTMLDivElement>) {
    if (reduced !== false || !finePointer.current || focused.current || event.pointerType !== "mouse") return;
    if ((event.target as Element).closest("button, a, input, select")) {
      resetDepth(true);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    tiltX.set(y * -1.4);
    tiltY.set(x * 1.8);
  }

  const animated = demo.animated && reduced === false;
  const rawVisible = !demo.formatted && demo.phase !== "convert";
  const lineMotion = (index: number) => ({
    initial: false as const,
    animate: { opacity: demo.formatted ? 1 : 0, y: demo.formatted || !animated ? 0 : 6 },
    transition: { duration: animated ? 0.32 : 0, delay: animated && demo.formatted ? index * 0.045 : 0, ease },
  });
  const complete = demo.phase === "done";

  return (
    <div
      ref={stage}
      className={`hero-scene ${styles.scene}`}
      role="group"
      aria-label="Browser-Demo: KI-Markdown in Apple Mail einfügen"
    >
      <div className="scene-topline">
        <span>01</span>
        <span>KI-MARKDOWN → APPLE MAIL</span>
      </div>
      <motion.div
        className={`hero-window ${styles.window}`}
        initial={false}
        style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformPerspective: 1_100 }}
        onPointerMove={moveDepth}
        onPointerLeave={() => resetDepth()}
        onPointerDownCapture={() => resetDepth(true)}
        onFocusCapture={() => { focused.current = true; resetDepth(true); }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false;
        }}
      >
        <div className="window-titlebar">
          <div className="traffic-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>Apple Mail · Neuer Entwurf</span>
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
            aria-label="Schrift des Apple-Mail-Entwurfs in der Demo"
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
          <div className={styles.previewLayers}>
              <div className={`mail-formatted ${styles.message}`} style={{ fontFamily: demoFonts[font] }} aria-hidden={!demo.formatted}>
                <motion.p {...lineMotion(0)}>
                  <strong>Hey Alex,</strong>
                </motion.p>
                <p>
                  <motion.span className={styles.line} {...lineMotion(1)}>gute Nachrichten.</motion.span>
                  <motion.span className={styles.line} {...lineMotion(2)}>Das Design ist <em>fertig</em>.</motion.span>
                </p>
                <ul>
                  <motion.li {...lineMotion(3)}>Ein klarer Plan.</motion.li>
                  <motion.li {...lineMotion(4)}>Ein schönes Ergebnis.</motion.li>
                  <motion.li {...lineMotion(5)}>Und ein bisschen weniger Arbeit.</motion.li>
                </ul>
                <p>
                  <motion.span className={styles.line} {...lineMotion(6)}>Liebe Grüße</motion.span>
                  <motion.span className={styles.line} {...lineMotion(7)}>Sam</motion.span>
                </p>
              </div>
              <motion.div
                initial={false}
                animate={{ opacity: rawVisible ? 1 : 0, y: animated && !rawVisible ? -3 : 0 }}
                transition={{ duration: animated ? 0.12 : 0, ease }}
                className={`mail-raw ${styles.message}`}
                style={{ fontFamily: "var(--font-mono), monospace" }}
                aria-hidden={demo.formatted}
              >
                {rawMarkdown}
              </motion.div>
          </div>
        </div>
        <div className="window-footer">
          <span
            className={complete ? "demo-status complete" : "demo-status"}
            role="status"
          >
            <i className={styles.statusSymbol} aria-hidden="true">
              <span className={styles.statusDot} style={{ opacity: complete ? 0 : 1 }} />
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <motion.path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: complete ? 1 : 0, opacity: complete ? 1 : 0 }} transition={{ duration: animated ? 0.24 : 0, ease }} />
              </svg>
            </i>
            {complete ? "Im Stil deines Mail-Entwurfs." : demo.phase === "raw" ? "Markdown aus deinem KI-Chat." : "Mail-Stil wird übernommen."}
          </span>
        </div>
      </motion.div>
      <div className="paste-control">
        <motion.button
          type="button"
          className={`paste-key ${styles.key}`}
          initial={false}
          animate={{ y: animated && demo.phase === "press" ? 3 : 0 }}
          transition={{ duration: animated ? (demo.phase === "press" ? 0.08 : 0.18) : 0, ease }}
          onClick={toggleDemo}
          aria-label="Einfügen von KI-Markdown in der Apple-Mail-Demo umschalten"
          aria-pressed={targetFormatted.current}
          aria-controls="hero-mail-preview"
        >
          <span aria-hidden="true">⌘</span>
          <span aria-hidden="true">V</span>
        </motion.button>
        <div>
          <span className="paste-control-label">Einfügen in Apple Mail.</span>
          <button type="button" className={`paste-control-hint ${styles.replay}`} onClick={() => play(true)} aria-controls="hero-mail-preview"><RotateCcw size={12} aria-hidden="true" /> Demo wiederholen</button>
        </div>
      </div>
      <div className="scene-caption">
        Browser-Demo des Einfügens. Keine Verbindung zu Apple Mail.
      </div>
    </div>
  );
}

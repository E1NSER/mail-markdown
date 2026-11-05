"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { Check, Copy, MessageSquare, RotateCcw, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import styles from "./hero-demo.module.css";

const demoFonts = {
  Georgia: 'Georgia, "Times New Roman", serif',
  Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
} as const;
const demoColors = {
  "Mail-Blau": "#0759ae",
  Graphit: "#26384c",
} as const;
type DemoFont = keyof typeof demoFonts;
type DemoColor = keyof typeof demoColors;
type Goal = "ready" | "copied" | "done";
type DemoState = {
  phase: "ready" | "select" | "copied" | "paste" | "reveal" | "done";
  copied: boolean;
  formatted: boolean;
  animated: boolean;
};
const ease = [0.22, 1, 0.36, 1] as const;

export function HeroDemo() {
  const [demo, setDemo] = useState<DemoState>({ phase: "ready", copied: false, formatted: false, animated: false });
  const [font, setFont] = useState<DemoFont>("Georgia");
  const [color, setColor] = useState<DemoColor>("Mail-Blau");
  const [reduced, setReduced] = useState<boolean | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.35 });
  const autoConsumed = useRef(false);
  const goal = useRef<Goal>("done");
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

  const settle = useCallback((target: Goal) => {
    setDemo({ phase: target, copied: target !== "ready", formatted: target === "done", animated: false });
  }, []);

  const begin = useCallback((target: Goal) => {
    cancelSequence();
    autoConsumed.current = true;
    goal.current = target;
    resetDepth(true);
  }, [cancelSequence, resetDepth]);

  const play = useCallback(() => {
    begin("done");
    if (reduced !== false) {
      settle("done");
      return;
    }
    setDemo({ phase: "ready", copied: false, formatted: false, animated: true });
    schedule(() => setDemo({ phase: "select", copied: false, formatted: false, animated: true }), 450);
    schedule(() => setDemo({ phase: "copied", copied: true, formatted: false, animated: true }), 1_150);
    schedule(() => setDemo({ phase: "paste", copied: true, formatted: false, animated: true }), 1_850);
    schedule(() => setDemo({ phase: "reveal", copied: true, formatted: true, animated: true }), 2_010);
    schedule(() => setDemo({ phase: "done", copied: true, formatted: true, animated: true }), 2_950);
  }, [begin, reduced, schedule, settle]);

  function copyInDemo() {
    begin("copied");
    if (reduced !== false) {
      settle("copied");
      return;
    }
    setDemo({ phase: "select", copied: false, formatted: false, animated: true });
    schedule(() => setDemo({ phase: "copied", copied: true, formatted: false, animated: true }), 550);
  }

  function pasteInDemo() {
    if (!demo.copied) {
      play();
      return;
    }
    begin("done");
    if (reduced !== false) {
      settle("done");
      return;
    }
    setDemo({ phase: "paste", copied: true, formatted: false, animated: true });
    schedule(() => setDemo({ phase: "reveal", copied: true, formatted: true, animated: true }), 160);
    schedule(() => setDemo({ phase: "done", copied: true, formatted: true, animated: true }), 1_000);
  }

  function changeStyle(nextFont?: DemoFont, nextColor?: DemoColor) {
    cancelSequence();
    autoConsumed.current = true;
    resetDepth(true);
    if (nextFont) setFont(nextFont);
    if (nextColor) setColor(nextColor);
    settle(goal.current);
  }

  useEffect(() => {
    if (!inView || reduced !== false || autoConsumed.current) return;
    const timer = window.setTimeout(() => {
      if (!autoConsumed.current) play();
    }, 750);
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
    // Subscribe directly: Motion 14.9.1's hook only snapshots the preference.
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (query.matches) {
        autoConsumed.current = true;
        cancelSequence();
        resetDepth(true);
        settle(goal.current);
      }
      setReduced(query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [cancelSequence, resetDepth, settle]);

  useEffect(() => cancelSequence, [cancelSequence]);

  function moveDepth(event: PointerEvent<HTMLDivElement>) {
    if (reduced !== false || !finePointer.current || focused.current || event.pointerType !== "mouse") return;
    if ((event.target as Element).closest("button, a, input, select")) {
      resetDepth(true);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    tiltX.set(y * -1);
    tiltY.set(x * 1.2);
  }

  const animated = demo.animated && reduced === false;
  const selected = demo.phase === "select" || demo.phase === "copied" || demo.phase === "paste";
  const complete = demo.phase === "done";
  const lineMotion = (index: number) => ({
    initial: false as const,
    animate: { opacity: demo.formatted ? 1 : 0, y: demo.formatted || !animated ? 0 : 5 },
    transition: { duration: animated ? 0.36 : 0, delay: animated && demo.formatted ? index * 0.09 : 0, ease },
  });

  return (
    <div ref={stage} className={`hero-scene ${styles.scene}`} data-phase={demo.phase} role="group" aria-label="Browser-Demo: Markdown aus dem KI-Chat in Apple Mail einfügen">
      <div className={styles.composition}>
        <motion.div className={styles.chatWindow} initial={false} animate={{ y: demo.formatted && animated ? -6 : 0 }} transition={{ duration: animated ? 0.7 : 0, ease }}>
          <div className={styles.chatHeader}>
            <span><MessageSquare size={15} aria-hidden="true" /> KI-Chat</span>
            <button type="button" className={styles.copyButton} onClick={copyInDemo} aria-label="Markdown in der Demo kopieren" aria-controls="hero-mail-preview">
              {demo.copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {demo.copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
          <div className={styles.chatBody}>
            <p className={styles.prompt}>Ein Projektupdate als Markdown, bitte.</p>
            <pre className={styles.code} data-selected={selected}>
              <code>
                <span>Das Design ist <span className={styles.markdownToken}>**</span>fertig<span className={styles.markdownToken}>**</span>.</span>{"\n"}
                <span><span className={styles.markdownToken}>-</span> Feedback sammeln</span>{"\n"}
                <span><span className={styles.markdownToken}>-</span> Montag starten</span>
              </code>
            </pre>
          </div>
        </motion.div>

        <div className={styles.handoff}>
          <svg className={styles.flowArrow} width="34" height="60" viewBox="0 0 34 60" fill="none" aria-hidden="true"><path d="M5 3C27 3 29 16 20 29C13 39 14 45 22 53M12 51L23 54L25 43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <motion.button
            type="button"
            className={styles.pasteKey}
            initial={false}
            animate={{ y: animated && demo.phase === "paste" ? 3 : 0 }}
            transition={{ duration: animated ? 0.12 : 0, ease }}
            onClick={pasteInDemo}
            aria-label="KI-Text in der Apple-Mail-Demo einfügen"
            aria-controls="hero-mail-preview"
          ><span aria-hidden="true">⌘V</span></motion.button>
          <span>Einfügen.<br />Stil behalten.</span>
        </div>

        <motion.div
          className={styles.mailWindow}
          initial={false}
          style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformPerspective: 1_100 }}
          onPointerMove={moveDepth}
          onPointerLeave={() => resetDepth()}
          onPointerDownCapture={() => resetDepth(true)}
          onFocusCapture={() => { focused.current = true; resetDepth(true); }}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}
        >
          <div className={styles.mailHeader}>
            <span className={styles.trafficLights} aria-hidden="true"><i /><i /><i /></span>
            <span>Apple Mail</span>
            <Send size={14} aria-hidden="true" />
          </div>
          <div className={styles.mailFields}><span>An: <b>Alex</b></span><span>Betreff: <b>Projektupdate</b></span></div>
          <div className={styles.formatBar}>
            <div className={styles.fonts} role="group" aria-label="Vorhandene Schrift im Apple-Mail-Entwurf">
              {(Object.keys(demoFonts) as DemoFont[]).map(name => (
                <button key={name} type="button" aria-pressed={font === name} aria-controls="hero-mail-preview" onClick={() => changeStyle(name)}>{name}</button>
              ))}
            </div>
            <span className={styles.fontSize} aria-label="Schriftgröße 16 Pixel">16</span>
            <div className={styles.colors} role="group" aria-label="Vorhandene Textfarbe im Apple-Mail-Entwurf">
              {(Object.keys(demoColors) as DemoColor[]).map(name => (
                <button key={name} type="button" className={styles.colorButton} aria-label={name} aria-pressed={color === name} aria-controls="hero-mail-preview" onClick={() => changeStyle(undefined, name)}>
                  <span style={{ backgroundColor: demoColors[name] }}>{color === name ? <Check size={12} aria-hidden="true" /> : null}</span>
                </button>
              ))}
            </div>
          </div>
          <div id="hero-mail-preview" className={styles.mailBody} style={{ fontFamily: demoFonts[font], color: demoColors[color] }}>
            <p>Hallo Alex,</p>
            <div className={styles.insertSlot}>
              <div className={styles.insertHint} aria-hidden={demo.formatted} style={{ opacity: demo.formatted ? 0 : 1 }}><i aria-hidden="true" /><span>Hier wird eingefügt</span></div>
              <div className={styles.inserted} aria-hidden={!demo.formatted}>
                <motion.p {...lineMotion(0)}>Das Design ist <strong>fertig</strong>.</motion.p>
                <ul>
                  <motion.li {...lineMotion(1)}>Feedback sammeln</motion.li>
                  <motion.li {...lineMotion(2)}>Montag starten</motion.li>
                </ul>
              </div>
            </div>
            <p>Liebe Grüße<br />Sam</p>
          </div>
          <div className={styles.mailFooter}>
            <span role="status" className={styles.status}>
              {complete ? <Check size={13} aria-hidden="true" /> : <span className={styles.statusDot} aria-hidden="true" />}
              {complete ? "Mail-Stil übernommen" : demo.phase === "paste" || demo.phase === "reveal" ? "Wird eingefügt …" : demo.phase === "copied" ? "Markdown kopiert" : "Dein bestehender Entwurf"}
            </span>
            <span className={styles.styleValue}>{font} · 16 · {color}</span>
          </div>
        </motion.div>
      </div>
      <div className={styles.sceneFooter}>
        <button type="button" className={styles.replay} onClick={play}><RotateCcw size={13} aria-hidden="true" /> Ablauf wiederholen</button>
        <span>Browser-Demo ohne Zugriff auf Mail oder Zwischenablage.</span>
      </div>
    </div>
  );
}

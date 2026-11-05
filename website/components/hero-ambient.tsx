"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./hero-ambient.module.css";

export function HeroAmbient() {
  const layer = useRef<HTMLDivElement>(null);
  const frontPlane = useRef<HTMLDivElement>(null);
  const backPlane = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0, scroll: 0 });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const hero = layer.current?.parentElement;
    if (!hero) return;
    if (!window.IntersectionObserver) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => setInView(entries.some(entry => entry.isIntersecting)),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const running = reduced === false && !paused && inView && tabVisible;

  useEffect(() => {
    const hero = layer.current?.parentElement;
    const front = frontPlane.current;
    const back = backPlane.current;
    if (!running || !hero || !front || !back) return;

    const pointerPreference = window.matchMedia("(hover: hover) and (pointer: fine)");
    const target = { x: 0, y: 0, scroll: position.current.scroll };
    let bounds = hero.getBoundingClientRect();
    let geometryDirty = true;
    let frame = 0;
    let previousTime = 0;

    const render = (time: number) => {
      frame = 0;
      if (geometryDirty) {
        bounds = hero.getBoundingClientRect();
        target.scroll = Math.max(0, Math.min(1, -bounds.top / (bounds.height * 0.85)));
        geometryDirty = false;
      }
      // Time-based easing keeps trackpad scrolling and high-refresh displays
      // equally gentle, without putting pointer positions in React state.
      const delta = previousTime ? Math.min(64, time - previousTime) : 16;
      const easing = 1 - Math.exp(-delta / 160);
      previousTime = time;
      const current = position.current;
      current.x += (target.x - current.x) * easing;
      current.y += (target.y - current.y) * easing;
      current.scroll += (target.scroll - current.scroll) * easing;
      front.style.transform = `translate3d(${(current.x * 34).toFixed(2)}px, ${(current.y * 22 - current.scroll * 84).toFixed(2)}px, 0)`;
      back.style.transform = `translate3d(${(-current.x * 24).toFixed(2)}px, ${(-current.y * 16 + current.scroll * 54).toFixed(2)}px, 0)`;
      if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) + Math.abs(target.scroll - current.scroll) > 0.001) {
        frame = window.requestAnimationFrame(render);
      }
    };
    const requestFrame = () => {
      if (!frame) {
        previousTime = 0;
        frame = window.requestAnimationFrame(render);
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerPreference.matches || event.pointerType !== "mouse") return;
      target.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      requestFrame();
    };
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      requestFrame();
    };
    const onGeometryChange = () => {
      geometryDirty = true;
      requestFrame();
    };
    const onPointerPreferenceChange = () => {
      if (!pointerPreference.matches) onPointerLeave();
    };

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onGeometryChange, { passive: true });
    window.addEventListener("resize", onGeometryChange, { passive: true });
    pointerPreference.addEventListener("change", onPointerPreferenceChange);
    requestFrame();
    return () => {
      window.cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onGeometryChange);
      window.removeEventListener("resize", onGeometryChange);
      pointerPreference.removeEventListener("change", onPointerPreferenceChange);
    };
  }, [running]);

  const label = reduced === null
    ? "Hintergrundanimation"
    : reduced ? "Bewegung reduziert"
    : paused ? "Animation fortsetzen" : "Animation pausieren";

  return (
    <>
      <div ref={layer} id="hero-ambient" className={styles.layer} data-running={running} aria-hidden="true">
        <div ref={frontPlane} className={styles.plane}>
          <div className={`${styles.field} ${styles.first}`} />
        </div>
        <div ref={backPlane} className={styles.plane}>
          <div className={`${styles.field} ${styles.second}`} />
        </div>
      </div>
      <div className={`section-wrap ${styles.controls}`}>
        <button
          type="button"
          className={styles.toggle}
          aria-label={reduced ? "Hintergrundanimation durch Systemeinstellung deaktiviert" : label}
          aria-controls="hero-ambient"
          disabled={reduced !== false}
          onClick={() => setPaused(value => !value)}
        >
          {paused && !reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
          <span>{label}</span>
        </button>
      </div>
    </>
  );
}

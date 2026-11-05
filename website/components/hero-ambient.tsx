"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./hero-ambient.module.css";

export function HeroAmbient() {
  const layer = useRef<HTMLDivElement>(null);
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
  const label = reduced === null
    ? "Hintergrundanimation"
    : reduced ? "Bewegung reduziert"
    : paused ? "Animation fortsetzen" : "Animation pausieren";

  return (
    <>
      <div ref={layer} id="hero-ambient" className={styles.layer} data-running={running} aria-hidden="true">
        <div className={`${styles.field} ${styles.first}`} />
        <div className={`${styles.field} ${styles.second}`} />
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

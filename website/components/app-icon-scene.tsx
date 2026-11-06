"use client";

import Image from "next/image";
import {
  motion,
  useAnimationControls,
  useInView,
} from "motion/react";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./app-icon-scene.module.css";
import { useLocale } from "./locale-provider";

const ease = [0.22, 1, 0.36, 1] as const;
const incomingRest = { x: "0%", y: "0%", rotate: -4, scale: 1, opacity: 1 };
const outgoingRest = { x: "0%", y: "0%", rotate: 2, scale: 1, opacity: 1 };

export function AppIconScene() {
  const de = useLocale() === "de";
  const stage = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const playback = useRef(0);
  const inView = useInView(stage, { once: true, amount: 0.55 });
  const [reduced, setReduced] = useState<boolean | null>(null);
  const icon = useAnimationControls();
  const incoming = useAnimationControls();
  const outgoing = useAnimationControls();

  const stop = useCallback(() => {
    // Invalidate async continuations before stopping their controls.
    playback.current += 1;
    icon.stop();
    incoming.stop();
    outgoing.stop();
  }, [icon, incoming, outgoing]);

  const showStatic = useCallback(() => {
    stop();
    icon.set({ y: 0, scale: 1 });
    incoming.set({ ...incomingRest, rotate: 0 });
    outgoing.set({ ...outgoingRest, rotate: 0 });
  }, [icon, incoming, outgoing, stop]);

  const play = useCallback(() => {
    if (reduced !== false) {
      showStatic();
      return;
    }
    stop();
    const current = playback.current;

    async function sequence() {
      incoming.set(incomingRest);
      icon.set({ y: 0, scale: 1 });
      // The server renders the complete composition. Gently clear the previous
      // result before playback instead of hiding the illustration on load.
      await outgoing.start({
        opacity: 0,
        transition: { type: "tween", duration: 0.14, ease },
      });
      if (playback.current !== current) return;

      outgoing.set({ x: "-44%", y: "-18%", rotate: -1, scale: 0.92, opacity: 0 });
      await Promise.all([
        incoming.start({
          x: ["0%", "0%", "55%", "72%"],
          y: ["0%", "0%", "32%", "64%"],
          rotate: [-4, -4, -1, 0],
          scale: [1, 1, 0.96, 0.9],
          opacity: [1, 1, 1, 0],
          transition: {
            type: "tween", duration: 1.25, times: [0, 0.18, 0.72, 1], ease,
          },
        }),
        icon.start({
          y: [0, -3, 0],
          scale: [1, 1.012, 1],
          transition: {
            type: "tween", duration: 1.2, delay: 0.52, times: [0, 0.35, 1], ease,
          },
        }),
        outgoing.start({
          opacity: [0, 1, 1],
          x: ["-44%", "-8%", "0%"],
          y: ["-18%", "-3%", "0%"],
          rotate: [-1, 1.8, 2],
          scale: [0.92, 1, 1],
          transition: {
            type: "tween", duration: 1, delay: 0.72, times: [0, 0.78, 1], ease,
          },
        }),
      ]);
      if (playback.current !== current) return;
      icon.set({ y: 0, scale: 1 });
    }

    void sequence().catch(() => {
      if (playback.current === current) showStatic();
    });
  }, [icon, incoming, outgoing, reduced, showStatic, stop]);

  useEffect(() => {
    // The installed Motion hook snapshots this preference at mount. Subscribe
    // directly so changing it mid-sequence also cancels the actual controls.
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      if (preference.matches) showStatic();
      setReduced(preference.matches);
    };
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, [showStatic]);

  useEffect(() => {
    if (inView && !hasPlayed.current && reduced !== null) {
      hasPlayed.current = true;
      play();
    }
  }, [inView, play, reduced]);

  useEffect(() => stop, [stop]);

  function replay() {
    // Manual interaction consumes the automatic viewport play, even before view.
    hasPlayed.current = true;
    play();
  }

  return (
    <figure className={styles.scene}>
      <div ref={stage} className={styles.stage} aria-hidden="true">
        <div className={styles.light} />
        <div className={styles.ground} />
        <motion.div
          className={`${styles.paper} ${styles.incoming}`}
          animate={incoming}
          initial={false}
        >
          <span className={styles.paperLabel}>MARKDOWN</span>
          <code>**Hey Alex,**</code>
          <code>{de ? "*Fertig.*" : "*Ready.*"}</code>
          <span className={styles.paperLine} />
        </motion.div>
        <div className={styles.iconAnchor}>
          <motion.div className={styles.iconBody} animate={icon} initial={false}>
            <Image
              src="/app-icon.svg"
              alt=""
              width={352}
              height={352}
              sizes="(max-width: 600px) 64vw, 312px"
              draggable={false}
              unoptimized
            />
          </motion.div>
        </div>
        <motion.div
          className={`${styles.paper} ${styles.outgoing}`}
          animate={outgoing}
          initial={false}
        >
          <span className={styles.paperLabel}>MAIL</span>
          <strong>Hey Alex,</strong>
          <em>{de ? "Fertig." : "Ready."}</em>
          <span className={styles.paperLine} />
        </motion.div>
      </div>
      <figcaption className={styles.caption}>
        {de ? "Markdown rein." : "Markdown in."} <span>{de ? "Mail mit Format." : "Formatted mail out."}</span>
      </figcaption>
      <button type="button" className={styles.replay} onClick={replay}>
        <RotateCcw size={14} aria-hidden="true" />
        {de ? "Animation erneut abspielen" : "Replay animation"}
      </button>
    </figure>
  );
}

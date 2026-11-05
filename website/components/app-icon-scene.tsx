"use client";

import Image from "next/image";
import {
  motion,
  useAnimationControls,
  useInView,
  useReducedMotion,
} from "motion/react";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import styles from "./app-icon-scene.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

export function AppIconScene() {
  const stage = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const inView = useInView(stage, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const icon = useAnimationControls();
  const incoming = useAnimationControls();
  const outgoing = useAnimationControls();
  const glow = useAnimationControls();

  const stop = useCallback(() => {
    icon.stop();
    incoming.stop();
    outgoing.stop();
    glow.stop();
  }, [glow, icon, incoming, outgoing]);

  const play = useCallback(() => {
    stop();

    if (reduced) {
      icon.set({ rotate: 0, y: 0, scale: 1 });
      incoming.set({ opacity: 0 });
      outgoing.set({ opacity: 1, x: 0, y: 0, rotate: 6, scale: 1 });
      glow.set({ opacity: 0.24, scale: 1 });
      return;
    }

    void incoming.start({
      x: [-34, 0, 70, 92],
      y: [14, -4, -2, 16],
      rotate: [-13, -9, -3, 0],
      scale: [0.92, 1, 0.9, 0.7],
      opacity: [0, 1, 1, 0],
      transition: { duration: 1.25, times: [0, 0.22, 0.7, 1], ease },
    });
    void icon.start({
      rotate: [0, -5, 3, 0],
      y: [0, -8, -3, 0],
      scale: [1, 1.04, 1.01, 1],
      transition: { duration: 2.4, times: [0, 0.3, 0.72, 1], ease },
    });
    void outgoing.start({
      opacity: [0, 0, 1, 1],
      x: [-60, -35, 0, 0],
      y: [40, 20, -4, 0],
      rotate: [-6, 1, 7, 6],
      scale: [0.82, 0.9, 1, 1],
      transition: { duration: 2.4, times: [0, 0.42, 0.76, 1], ease },
    });
    void glow.start({
      opacity: [0.18, 0.38, 0.28, 0.24],
      scale: [0.94, 1.07, 1.03, 1],
      transition: { duration: 2.6, times: [0, 0.35, 0.7, 1], ease },
    });
  }, [glow, icon, incoming, outgoing, reduced, stop]);

  useEffect(() => {
    if (inView && !hasPlayed.current && reduced !== null) {
      hasPlayed.current = true;
      play();
    }
  }, [inView, play, reduced]);

  useEffect(() => {
    if (reduced) play();
  }, [play, reduced]);

  useEffect(() => stop, [stop]);

  function replay() {
    // A manual replay also consumes the one automatic viewport play.
    hasPlayed.current = true;
    play();
  }

  return (
    <figure className={styles.scene}>
      <div ref={stage} className={styles.stage} aria-hidden="true">
        <motion.div className={styles.glow} animate={glow} initial={false} />
        <div className={styles.ground} />
        <motion.div
          className={`${styles.paper} ${styles.incoming}`}
          animate={incoming}
          initial={false}
        >
          <span className={styles.paperLabel}>MARKDOWN</span>
          <code>**Hey Alex,**</code>
          <code>*Fertig.*</code>
          <span className={styles.paperLine} />
        </motion.div>
        <div className={styles.iconAnchor}>
          <motion.div animate={icon} initial={false}>
            <motion.div
              className={styles.iconHover}
              whileHover={reduced ? undefined : { rotate: -3, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.4, ease }}
            >
              <Image
                src="/app-icon.svg"
                alt=""
                width={352}
                height={352}
                sizes="(max-width: 600px) 64vw, 320px"
                draggable={false}
                unoptimized
              />
            </motion.div>
          </motion.div>
        </div>
        <motion.div
          className={`${styles.paper} ${styles.outgoing}`}
          animate={outgoing}
          initial={false}
        >
          <span className={styles.paperLabel}>MAIL</span>
          <strong>Hey Alex,</strong>
          <em>Fertig.</em>
          <span className={styles.paperLine} />
        </motion.div>
      </div>
      <figcaption className={styles.caption}>
        Markdown rein. <span>Mail fertig.</span>
      </figcaption>
      <button type="button" className={styles.replay} onClick={replay}>
        <RotateCcw size={14} aria-hidden="true" />
        Animation erneut abspielen
      </button>
    </figure>
  );
}

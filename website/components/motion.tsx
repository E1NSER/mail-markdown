"use client";

import {
  motion,
  MotionConfig,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      reduced ||
      !window.IntersectionObserver ||
      element.getBoundingClientRect().top < window.innerHeight
    ) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }
    // Enhance only offscreen content after hydration. Server-rendered content
    // remains visible and usable when JavaScript is unavailable.
    controls.set({ opacity: 0, y: 26 });
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void controls.start({
            opacity: 1,
            y: 0,
            transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
          });
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [controls, delay, reduced]);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

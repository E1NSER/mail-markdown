"use client";

import { useEffect, useId, useState } from "react";
import styles from "./markdown-backdrop.module.css";

export function MarkdownBackdrop({
  variant = "hero",
}: {
  variant?: "hero" | "source";
}) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const descriptionId = useId();
  const running = ready && playing;
  const action = running
    ? "Hintergrundanimation pausieren"
    : "Hintergrundanimation abspielen";

  useEffect(() => {
    // Movement begins only when its pause control is hydrated and functional.
    setReady(true);
  }, []);

  return (
    <>
      <div
        className={styles.layer}
        data-variant={variant}
        data-running={running}
        aria-hidden="true"
      >
        <div className={styles.gutter}>
          <span>01</span>
          <span>02</span>
          <span>03</span>
          <span>04</span>
          <span>05</span>
          <span>06</span>
          <span>07</span>
          <span>08</span>
        </div>
        <div className={`${styles.fragment} ${styles.heading}`}>
          <span className={styles.lineNumber}>01</span>
          <code># eine gute Idee</code>
        </div>
        <div className={`${styles.fragment} ${styles.bold}`}>
          <span className={styles.lineNumber}>03</span>
          <code>**mehr Klarheit**</code>
        </div>
        <div className={`${styles.fragment} ${styles.list}`}>
          <span className={styles.lineNumber}>07</span>
          <code>{"- schreiben\n- einfügen\n- fertig."}</code>
        </div>
        <div className={`${styles.fragment} ${styles.link}`}>
          <span className={styles.lineNumber}>12</span>
          <code>[Gedanken](notiz.md)</code>
          <span className={styles.caret} />
        </div>
        <div className={`${styles.fragment} ${styles.closing}`}>
          <code>{"</>"}</code>
        </div>
        <div className={styles.fileLabel}>
          <span className={styles.fileDot} />
          entwurf.md
        </div>
      </div>
      <button
        type="button"
        className={styles.control}
        data-variant={variant}
        disabled={!ready}
        aria-label="Hintergrundanimation"
        aria-pressed={running}
        aria-describedby={descriptionId}
        title={action}
        onClick={() => setPlaying((value) => !value)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          {running ? (
            <path d="M5 4h3v12H5zm7 0h3v12h-3z" />
          ) : (
            <path d="M6 3.5v13L16 10z" />
          )}
        </svg>
      </button>
      <span id={descriptionId} className={styles.description}>
        {running ? "Wird abgespielt. " : "Pausiert. "}
        {action}.
      </span>
    </>
  );
}

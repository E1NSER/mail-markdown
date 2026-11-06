"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { CONSENT_STORAGE_KEY, createConsentChoice, parseConsentChoice, persistConsentChoice, type ConsentChoice } from "@/lib/consent";
import { createAnalyticsController, ownAnalyticsCookieRemovals, validMeasurementId, type AnalyticsController } from "@/lib/analytics";
import styles from "./consent-provider.module.css";
import { useLocale } from "./locale-provider";
import { localePath } from "@/lib/i18n";

const consentCopy = {
  en: {
    settings: "Cookie settings", eyebrow: "YOUR CHOICE", title: "Allow usage statistics?",
    banner: "With your permission, Google Analytics helps us understand page views and clicks on the app download. Your Markdown input is never included. Statistics stay off unless you agree. You can withdraw consent at any time through Cookie settings in the footer.",
    privacy: "More about privacy", allow: "Allow statistics", necessaryOnly: "Necessary only", preferences: "Settings",
    close: "Close cookie settings", privacyTitle: "Your privacy.",
    description: "You choose whether we use optional statistics. You can change or withdraw your consent here at any time.",
    noAnalytics: "This website currently uses only necessary storage for your preferences. Optional statistics are not active.",
    necessary: "Necessary", alwaysActive: "Always active", storage: "Saves your privacy choice for up to 180 days on this device.",
    statistics: "Statistics", analytics: "Google Analytics helps us understand page views and clicks on the app download. No advertising and no contents of your Markdown input.",
    details: "Privacy details", save: "Save preferences", understood: "Got it",
    enabled: "Statistics are enabled.", disabled: "Only necessary storage is active. Statistics are disabled.",
  },
  de: {
    settings: "Cookie-Einstellungen", eyebrow: "DEINE ENTSCHEIDUNG", title: "Ein bisschen Statistik?",
    banner: "Mit deiner Erlaubnis hilft uns Google Analytics, Seitenaufrufe und Klicks auf den App-Download auszuwerten. Deine Markdown-Eingaben bleiben außen vor. Ohne Zustimmung bleibt Statistik aus. Jederzeit über die Cookie-Einstellungen im Footer widerrufbar.",
    privacy: "Mehr zum Datenschutz", allow: "Statistik erlauben", necessaryOnly: "Nur notwendige", preferences: "Einstellungen",
    close: "Cookie-Einstellungen schließen", privacyTitle: "Deine Privatsphäre.",
    description: "Du bestimmst, ob wir optionale Statistik verwenden. Du kannst deine Einwilligung hier jederzeit ändern oder widerrufen.",
    noAnalytics: "Diese Website verwendet derzeit nur notwendigen Speicher für deine Einstellungen. Optionale Statistik ist nicht aktiv.",
    necessary: "Notwendig", alwaysActive: "Immer aktiv", storage: "Speichert deine Datenschutz-Auswahl für bis zu 180 Tage auf diesem Gerät.",
    statistics: "Statistik", analytics: "Google Analytics hilft uns, Seitenaufrufe und Klicks auf den App-Download zu verstehen. Keine Werbung und keine Inhalte deiner Markdown-Eingabe.",
    details: "Details zum Datenschutz", save: "Auswahl speichern", understood: "Verstanden",
    enabled: "Statistik ist eingeschaltet.", disabled: "Nur notwendiger Speicher ist aktiv. Statistik ist ausgeschaltet.",
  },
} as const;

type ConsentContextValue = {
  openSettings: () => void;
  trackDownload: (location: string) => void;
};
const ConsentContext = createContext<ConsentContextValue | null>(null);

function browserAnalytics(id: string | null): AnalyticsController {
  if (!id) return createAnalyticsController(null, {
    command: () => {}, setDisabled: () => {}, clearCookies: () => {}, clearPending: () => {},
  });
  const browser = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  const layer = browser.dataLayer ?? (browser.dataLayer = []);
  // Preserve the Arguments shape used by Google's documented gtag queue.
  const command = function (..._args: unknown[]) { layer.push(arguments); };
  browser.gtag = command;
  return createAnalyticsController(id, {
    command,
    setDisabled: (disabled) => { Reflect.set(window, `ga-disable-${id}`, disabled); },
    clearPending: () => { layer.length = 0; },
    clearCookies: () => {
      try {
        for (const removal of ownAnalyticsCookieRemovals(document.cookie)) document.cookie = removal;
      } catch { /* The synchronous opt-out gate also works when cookies are blocked. */ }
    },
  });
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent requires ConsentProvider");
  return context;
}

export function CookieSettingsButton({ className }: { className?: string }) {
  const { openSettings } = useConsent();
  const copy = consentCopy[useLocale()];
  return <button type="button" className={className ?? styles.settingsButton} onClick={openSettings}>{copy.settings}</button>;
}

export function ConsentProvider({ children, measurementId }: { children: ReactNode; measurementId?: string }) {
  const locale = useLocale();
  const copy = consentCopy[locale];
  const privacyHref = localePath(locale, "/privacy");
  const id = validMeasurementId(measurementId);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const controllerRef = useRef<{ id: string | null; controller: AnalyticsController } | null>(null);
  const storageAvailable = useRef(true);
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draftStatistics, setDraftStatistics] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Ref initialization in an effect avoids render-time globals and repeated
    // Strict Mode setup must never re-enable a withdrawn choice.
    if (!controllerRef.current || controllerRef.current.id !== id) {
      controllerRef.current?.controller.setConsent(null, pathRef.current);
      controllerRef.current = { id, controller: browserAnalytics(id) };
    }
    let saved: ConsentChoice | null = null;
    try {
      saved = parseConsentChoice(window.localStorage.getItem(CONSENT_STORAGE_KEY));
      storageAvailable.current = true;
    } catch {
      storageAvailable.current = false;
    }
    controllerRef.current.controller.setConsent(saved, pathRef.current);
    setChoice(saved);
    setReady(true);

    const syncChoice = (next: ConsentChoice | null) => {
      controllerRef.current?.controller.setConsent(next, pathRef.current);
      setChoice(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_STORAGE_KEY || event.key === null) syncChoice(parseConsentChoice(event.newValue));
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible" || !storageAvailable.current) return;
      try { syncChoice(parseConsentChoice(window.localStorage.getItem(CONSENT_STORAGE_KEY))); } catch { /* Keep the current in-memory choice. */ }
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [id]);

  useEffect(() => {
    if (!ready || !choice) return;
    let timer: ReturnType<typeof setTimeout>;
    const checkExpiry = () => {
      const remaining = choice.expiresAt - Date.now();
      if (remaining > 0) {
        // A 180-day timeout exceeds the browser's signed 32-bit timer limit.
        timer = setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
      } else {
        controllerRef.current?.controller.setConsent(null, pathRef.current);
        setChoice(null);
        try { window.localStorage.removeItem(CONSENT_STORAGE_KEY); } catch { /* Expiry is enforced in memory too. */ }
      }
    };
    checkExpiry();
    return () => clearTimeout(timer);
  }, [choice, ready]);

  useEffect(() => {
    if (ready && choice?.statistics) controllerRef.current?.controller.trackPageView(pathname);
  }, [pathname, ready, choice]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (preferencesOpen && !dialog.open) dialog.showModal();
    if (!preferencesOpen && dialog.open) dialog.close();
  }, [preferencesOpen]);

  const saveChoice = useCallback((statistics: boolean) => {
    const next = createConsentChoice(Boolean(id) && statistics);
    // Stop dispatch synchronously; waiting for a React effect leaves a gap.
    controllerRef.current?.controller.setConsent(next, pathRef.current);
    setChoice(next);
    try {
      storageAvailable.current = persistConsentChoice(window.localStorage, next);
    } catch {
      storageAvailable.current = false;
    }
    setPreferencesOpen(false);
    setAnnouncement(next.statistics ? copy.enabled : copy.disabled);
  }, [copy, id]);

  const openSettings = useCallback(() => {
    setDraftStatistics(Boolean(id) && Boolean(choice?.statistics));
    setPreferencesOpen(true);
  }, [choice, id]);
  const closeSettings = useCallback(() => {
    // Next's root provider persists across route navigation. Close the native
    // top-layer dialog synchronously before its privacy link changes routes.
    dialogRef.current?.close();
    setPreferencesOpen(false);
  }, []);
  const trackDownload = useCallback((location: string) => {
    controllerRef.current?.controller.trackDownload(location, pathRef.current);
  }, []);

  return (
    <ConsentContext.Provider value={{ openSettings, trackDownload }}>
      {children}
      {ready && id && choice?.statistics ? (
        <Script
          id="mail-markdown-google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
          strategy="afterInteractive"
          onReady={() => { controllerRef.current?.controller.markScriptReady(); }}
        />
      ) : null}
      {ready && id && !choice ? (
        <aside className={styles.banner} aria-labelledby="cookie-banner-title">
          <div className={styles.bannerCopy}>
            <span className={styles.eyebrow}>{copy.eyebrow}</span>
            <h2 id="cookie-banner-title">{copy.title}</h2>
            <p>{copy.banner} <Link href={privacyHref}>{copy.privacy}</Link></p>
          </div>
          <div className={styles.bannerActions}>
            <button type="button" className={styles.choiceButton} onClick={() => saveChoice(true)}>{copy.allow}</button>
            <button type="button" className={styles.choiceButton} onClick={() => saveChoice(false)}>{copy.necessaryOnly}</button>
            <button type="button" className={styles.preferencesButton} onClick={openSettings}>{copy.preferences}</button>
          </div>
        </aside>
      ) : null}
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="cookie-settings-title" aria-describedby="cookie-settings-description" onCancel={() => setPreferencesOpen(false)} onClose={() => setPreferencesOpen(false)}>
        <div className={styles.dialogHeader}>
          <span className={styles.eyebrow}>{copy.eyebrow}</span>
          <button type="button" className={styles.closeButton} onClick={closeSettings} aria-label={copy.close}><X size={20} aria-hidden="true" /></button>
        </div>
        <h2 id="cookie-settings-title">{copy.privacyTitle}</h2>
        <p id="cookie-settings-description">{id ? copy.description : copy.noAnalytics}</p>
        <div className={styles.category}>
          <div className={styles.categoryTitle}><h3>{copy.necessary}</h3><span className={styles.alwaysActive}>{copy.alwaysActive}</span></div>
          <p>{copy.storage}</p>
        </div>
        {id ? (
          <label className={styles.category}>
            <span className={styles.categoryTitle}><span className={styles.categoryName}>{copy.statistics}</span><input type="checkbox" checked={draftStatistics} onChange={(event) => setDraftStatistics(event.target.checked)} /></span>
            <span className={styles.categoryDescription}>{copy.analytics} <Link href={privacyHref} onClick={closeSettings}>{copy.details}</Link></span>
          </label>
        ) : null}
        <div className={styles.dialogActions}>
          {id ? <>
            <div className={styles.equalChoices}>
              <button type="button" className={styles.choiceButton} onClick={() => saveChoice(true)}>{copy.allow}</button>
              <button type="button" className={styles.choiceButton} onClick={() => saveChoice(false)}>{copy.necessaryOnly}</button>
            </div>
            <button type="button" className={styles.saveButton} onClick={() => saveChoice(draftStatistics)}>{copy.save}</button>
          </> : <button type="button" className={styles.choiceButton} onClick={() => saveChoice(false)}>{copy.understood}</button>}
        </div>
      </dialog>
      <span className={styles.srOnly} role="status">{announcement}</span>
    </ConsentContext.Provider>
  );
}

import { CONSENT_MAX_AGE_MS, isCurrentConsent, type ConsentChoice } from "./consent.ts";
import { LATEST_DOWNLOAD_URL, RELEASE_ASSET_NAME } from "./release-model.ts";
import { SITE_URL } from "./site.ts";

export const DENIED_CONSENT = Object.freeze({
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});
const STATISTICS_CONSENT = Object.freeze({ ...DENIED_CONSENT, analytics_storage: "granted" });
export const ANALYTICS_COOKIE_PREFIX = "mm";
const PAGES: Record<string, string> = {
  "/": "Mail Markdown — Dein Text. Hat Format.",
  "/datenschutz": "Datenschutz · Mail Markdown",
  "/impressum": "Impressum · Mail Markdown",
};
const DOWNLOAD_LOCATIONS = new Set(["header", "hero", "source", "final"]);

export function validMeasurementId(value: unknown): string | null {
  return typeof value === "string" && /^G-[A-Z0-9]{6,20}$/.test(value) ? value : null;
}

export function pageContext(path: string): { page_location: string; page_referrer: string; page_title: string } | null {
  // Only these public routes can reach Analytics. Never forward search, hash,
  // document.title, referrers or dynamic/user-controlled path segments.
  const pathname = path.split(/[?#]/, 1)[0];
  return Object.hasOwn(PAGES, pathname)
    ? { page_location: `${SITE_URL}${pathname}`, page_referrer: "", page_title: PAGES[pathname] }
    : null;
}

export function ownAnalyticsCookieRemovals(cookieHeader: string): string[] {
  return cookieHeader.split(";").flatMap((cookie) => {
    const name = cookie.split("=", 1)[0].trim();
    return /^mm_ga(?:_[A-Za-z0-9]+)?$/.test(name)
      ? [`${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`]
      : [];
  });
}

type Transport = {
  command: (...args: unknown[]) => void;
  setDisabled: (disabled: boolean) => void;
  clearCookies: () => void;
  clearPending: () => void;
};

export function createAnalyticsController(measurementId: unknown, transport: Transport) {
  const id = validMeasurementId(measurementId);
  let expiresAt = 0;
  let configured = false;
  let scriptReady = false;
  let lastPage: string | null = null;

  if (id) {
    transport.setDisabled(true);
    // This is only a local queue until an explicitly accepted tag is loaded.
    transport.command("consent", "default", DENIED_CONSENT);
  }

  function setConsent(choice: ConsentChoice | null, path: string, now = Date.now()) {
    if (!id) return;
    const allowed = isCurrentConsent(choice, now) && choice.statistics;
    if (!allowed) {
      const wasEnabled = expiresAt > 0;
      expiresAt = 0;
      // Google's opt-out flag is synchronous and precedes every denial command.
      transport.setDisabled(true);
      if (wasEnabled || configured) {
        if (!scriptReady) {
          // A consent withdrawal while gtag.js is still downloading must not
          // replay previously queued config/events after a later acceptance.
          transport.clearPending();
          configured = false;
          transport.command("consent", "default", DENIED_CONSENT);
        } else {
          transport.command("consent", "update", DENIED_CONSENT);
        }
      }
      transport.clearCookies();
      lastPage = null;
      return;
    }

    const alreadyEnabled = expiresAt > now;
    expiresAt = choice.expiresAt;
    if (alreadyEnabled) return;
    transport.setDisabled(false);
    transport.command("consent", "update", STATISTICS_CONSENT);
    const context = pageContext(path) ?? pageContext("/")!;
    transport.command("set", context);
    if (!configured) {
      transport.command("js", new Date(now));
      transport.command("config", id, {
        ...context,
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_prefix: ANALYTICS_COOKIE_PREFIX,
        cookie_domain: "none",
        cookie_path: "/",
        cookie_expires: CONSENT_MAX_AGE_MS / 1_000,
        cookie_update: false,
        cookie_flags: "SameSite=Lax;Secure",
        ignore_referrer: true,
        campaign_id: "",
        campaign_name: "",
        campaign_source: "",
        campaign_medium: "",
        campaign_term: "",
        campaign_content: "",
      });
      configured = true;
    }
  }

  function enabled(now: number) {
    if (!id || !expiresAt) return false;
    if (expiresAt <= now) {
      setConsent(null, "/", now);
      return false;
    }
    return true;
  }

  function trackPageView(path: string, now = Date.now()): boolean {
    const context = pageContext(path);
    if (!enabled(now) || !context || context.page_location === lastPage) return false;
    transport.command("set", context);
    transport.command("event", "page_view", { ...context, send_to: id });
    lastPage = context.page_location;
    return true;
  }

  function trackDownload(location: string, path: string, now = Date.now()): boolean {
    const context = pageContext(path);
    if (!enabled(now) || !context || !DOWNLOAD_LOCATIONS.has(location)) return false;
    transport.command("event", "file_download", {
      ...context,
      send_to: id,
      cta_location: location,
      file_name: RELEASE_ASSET_NAME,
      file_extension: "dmg",
      link_url: LATEST_DOWNLOAD_URL,
      link_domain: "github.com",
      link_text: "Mail Markdown für macOS",
    });
    return true;
  }

  return {
    setConsent,
    trackPageView,
    trackDownload,
    markScriptReady: () => { scriptReady = true; },
  };
}

export type AnalyticsController = ReturnType<typeof createAnalyticsController>;

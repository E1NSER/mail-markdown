import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnalyticsController,
  ownAnalyticsCookieRemovals,
  pageContext,
  validMeasurementId,
} from "../lib/analytics.ts";
import { createConsentChoice, CONSENT_MAX_AGE_MS } from "../lib/consent.ts";
import { LATEST_DOWNLOAD_URL, RELEASE_ASSET_NAME } from "../lib/release-model.ts";

const NOW = 1_800_000_000_000;
const ID = "G-TEST123456";
const allDenied = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};
type Operation =
  | { type: "command"; args: unknown[] }
  | { type: "disabled"; value: boolean }
  | { type: "cookies" }
  | { type: "pending" };

// A local transport fake only. No browser, Google tag or network is involved.
function harness(...input: [unknown?]) {
  const id = input.length ? input[0] : ID;
  const trace: Operation[] = [];
  const pending: unknown[][] = [];
  const controller = createAnalyticsController(id, {
    command: (...args: unknown[]) => {
      trace.push({ type: "command", args });
      pending.push(args);
    },
    setDisabled: (value) => trace.push({ type: "disabled", value }),
    clearCookies: () => trace.push({ type: "cookies" }),
    clearPending: () => { trace.push({ type: "pending" }); pending.length = 0; },
  });
  const commands = () => trace.flatMap((operation) => operation.type === "command" ? [operation.args] : []);
  const events = () => commands().filter(([type]) => type === "event");
  return { controller, trace, pending, commands, events };
}

test("invalid or absent measurement IDs never initialize or emit analytics", () => {
  for (const id of [undefined, null, "", "UA-123456-1", "GT-ABCDEF", "G-", "G-abc123", " G-ABCDEF", "G-ABCDEF\n", "G-ABCDEF<script>"])
    assert.equal(validMeasurementId(id), null, String(id));
  for (const id of [undefined, null, "", "UA-123456-1", "G-abc123"]) {
    const h = harness(id);
    h.controller.setConsent(createConsentChoice(true, NOW), "/", NOW);
    h.controller.markScriptReady();
    assert.equal(h.controller.trackPageView("/", NOW), false);
    assert.equal(h.controller.trackDownload("hero", "/", NOW), false);
    assert.deepEqual(h.trace, []);
  }
});

test("initial consent defaults deny all four categories and no readiness state bypasses opt-in", () => {
  const h = harness();
  assert.deepEqual(h.trace, [
    { type: "disabled", value: true },
    { type: "command", args: ["consent", "default", allDenied] },
  ]);
  for (const ready of [false, true]) {
    if (ready) h.controller.markScriptReady();
    assert.equal(h.controller.trackPageView("/", NOW), false);
    assert.equal(h.controller.trackDownload("hero", "/", NOW), false);
  }
  h.controller.setConsent(createConsentChoice(false, NOW), "/", NOW);
  h.controller.setConsent(createConsentChoice(true, NOW - CONSENT_MAX_AGE_MS), "/", NOW);
  h.controller.setConsent(createConsentChoice(true, NOW + 1), "/", NOW);
  assert.equal(h.commands().some(([kind]) => kind === "config" || kind === "event"), false);
  assert.equal(h.trace.some((op) => op.type === "disabled" && !op.value), false);
});

test("valid opt-in initializes before events while all advertising consent stays denied", () => {
  const h = harness();
  h.controller.setConsent(createConsentChoice(true, NOW), "/?private=do-not-send#secret", NOW);
  assert.equal(h.controller.trackPageView("/", NOW), true);
  assert.equal(h.controller.trackDownload("hero", "/", NOW), true);
  const commands = h.commands();
  const configIndex = commands.findIndex(([kind]) => kind === "config");
  const jsIndex = commands.findIndex(([kind]) => kind === "js");
  assert.ok(jsIndex >= 0 && configIndex >= 0);
  assert.ok(jsIndex < configIndex);
  assert.ok(configIndex < commands.findIndex(([kind]) => kind === "event"));
  const consentUpdates = commands.filter(([kind]) => kind === "consent");
  assert.deepEqual(consentUpdates[1], ["consent", "update", { ...allDenied, analytics_storage: "granted" }]);
  for (const [, , value] of consentUpdates) {
    const consent = value as Record<string, unknown>;
    for (const key of ["ad_storage", "ad_user_data", "ad_personalization"])
      assert.equal(consent[key], "denied");
  }
  const config = commands[configIndex][2] as Record<string, unknown>;
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.page_location, "https://mail-markdown.vercel.app/");
  assert.equal(config.page_referrer, "");
  assert.equal(config.cookie_domain, "none");
  assert.equal(config.cookie_path, "/");
  assert.equal(config.cookie_update, false);
  assert.ok(Number(config.cookie_expires) <= CONSENT_MAX_AGE_MS / 1_000);
});

test("post-consent local queuing is allowed but pending withdrawal discards the old queue", () => {
  const h = harness();
  h.controller.setConsent(createConsentChoice(true, NOW), "/", NOW);
  assert.equal(h.controller.trackPageView("/datenschutz", NOW), true);
  assert.equal(h.controller.trackDownload("hero", "/", NOW), true);
  assert.equal(h.pending.some(([kind]) => kind === "event"), true);
  const beforeRevoke = h.trace.length;
  h.controller.setConsent(null, "/", NOW + 1);
  assert.deepEqual(h.trace.slice(beforeRevoke), [
    { type: "disabled", value: true },
    { type: "pending" },
    { type: "command", args: ["consent", "default", allDenied] },
    { type: "cookies" },
  ]);
  assert.deepEqual(h.pending, [["consent", "default", allDenied]]);
  h.controller.markScriptReady();
  assert.equal(h.controller.trackPageView("/impressum", NOW + 1), false);
  assert.equal(h.controller.trackDownload("hero", "/", NOW + 1), false);
  assert.deepEqual(h.pending, [["consent", "default", allDenied]]);
  h.controller.setConsent(createConsentChoice(true, NOW + 2), "/impressum", NOW + 2);
  assert.equal(h.pending.some(([kind]) => kind === "event"), false, "old clicks must not replay on a later grant");
});

test("loaded-tag withdrawal disables first, clears cookies and stops subsequent events", () => {
  const h = harness();
  h.controller.setConsent(createConsentChoice(true, NOW), "/", NOW);
  h.controller.markScriptReady();
  h.controller.trackPageView("/", NOW);
  const beforeRevoke = h.trace.length;
  h.controller.setConsent(createConsentChoice(false, NOW + 1), "/", NOW + 1);
  assert.deepEqual(h.trace.slice(beforeRevoke), [
    { type: "disabled", value: true },
    { type: "command", args: ["consent", "update", allDenied] },
    { type: "cookies" },
  ]);
  const eventCount = h.events().length;
  assert.equal(h.controller.trackPageView("/datenschutz", NOW + 2), false);
  assert.equal(h.controller.trackDownload("final", "/", NOW + 2), false);
  assert.equal(h.events().length, eventCount);
});

test("expiry blocks the triggering event and closes future collection", () => {
  const h = harness();
  const consent = createConsentChoice(true, NOW);
  h.controller.setConsent(consent, "/", NOW);
  h.controller.markScriptReady();
  assert.equal(h.controller.trackPageView("/", consent.expiresAt - 1), true);
  const beforeExpiry = h.trace.length;
  assert.equal(h.controller.trackDownload("hero", "/", consent.expiresAt), false);
  assert.deepEqual(h.trace[beforeExpiry], { type: "disabled", value: true });
  assert.ok(h.trace.slice(beforeExpiry).some((op) => op.type === "cookies"));
  assert.equal(h.controller.trackPageView("/impressum", consent.expiresAt + 1), false);
  assert.equal(h.events().length, 1);
});

test("only public allowlisted routes receive canonical query-free and fragment-free context", () => {
  for (const path of ["/?email=private@example.org#secret", "/datenschutz?note=EDITOR_SECRET", "/impressum#private"]) {
    const context = pageContext(path)!;
    assert.ok(context);
    assert.equal(context.page_location, `https://mail-markdown.vercel.app${path.split(/[?#]/, 1)[0]}`);
    assert.equal(context.page_referrer, "");
    assert.equal(JSON.stringify(context).includes("private"), false);
    assert.equal(JSON.stringify(context).includes("EDITOR_SECRET"), false);
  }
  for (const path of ["", "/unknown", "/editor/EDITOR_SECRET", "https://mail-markdown.vercel.app/", "https://evil.example/", "//evil.example/", "javascript:alert(1)", "__proto__", "/impressum/"])
    assert.equal(pageContext(path), null, path);
});

test("sanitized pageviews deduplicate query/hash changes and never accept editor contents", () => {
  const h = harness();
  h.controller.setConsent(createConsentChoice(true, NOW), "/", NOW);
  h.controller.markScriptReady();
  assert.equal(h.controller.trackPageView("/?email=EDITOR_SECRET#hidden", NOW), true);
  assert.equal(h.controller.trackPageView("/?other=EDITOR_SECRET#different", NOW), false);
  assert.equal(h.controller.trackPageView("/editor/EDITOR_SECRET", NOW), false);
  assert.equal(h.controller.trackPageView("https://evil.example/EDITOR_SECRET", NOW), false);
  assert.equal(h.controller.trackPageView("/datenschutz#EDITOR_SECRET", NOW), true);
  assert.equal(h.events().length, 2);
  for (const [, name, value] of h.events()) {
    const payload = value as Record<string, unknown>;
    assert.equal(name, "page_view");
    assert.equal(payload.send_to, ID);
    assert.equal(payload.page_referrer, "");
    assert.equal(JSON.stringify(payload).includes("EDITOR_SECRET"), false);
    assert.deepEqual(Object.keys(payload).sort(), ["page_location", "page_referrer", "page_title", "send_to"]);
  }
});

test("download events accept only fixed CTA locations and the own release payload", () => {
  const h = harness();
  h.controller.setConsent(createConsentChoice(true, NOW), "/", NOW);
  h.controller.markScriptReady();
  for (const location of ["header", "hero", "source", "final"])
    assert.equal(h.controller.trackDownload(location, "/?private=EDITOR_SECRET#hidden", NOW), true);
  for (const location of ["", "playground", "EDITOR_SECRET", "https://evil.example/file.dmg"])
    assert.equal(h.controller.trackDownload(location, "/", NOW), false);
  assert.equal(h.controller.trackDownload("hero", "/editor/EDITOR_SECRET", NOW), false);
  assert.equal(h.events().length, 4);
  for (const [, name, value] of h.events()) {
    const payload = value as Record<string, unknown>;
    assert.equal(name, "file_download");
    assert.equal(payload.send_to, ID);
    assert.equal(payload.file_name, RELEASE_ASSET_NAME);
    assert.equal(payload.file_extension, "dmg");
    assert.equal(payload.link_url, LATEST_DOWNLOAD_URL);
    assert.equal(payload.link_domain, "github.com");
    assert.equal(payload.link_text, "Mail Markdown für macOS");
    assert.equal(payload.page_location, "https://mail-markdown.vercel.app/");
    assert.equal(payload.page_referrer, "");
    assert.equal(JSON.stringify(payload).includes("EDITOR_SECRET"), false);
    assert.deepEqual(Object.keys(payload).sort(), ["cta_location", "file_extension", "file_name", "link_domain", "link_text", "link_url", "page_location", "page_referrer", "page_title", "send_to"]);
  }
});

test("own-cookie cleanup targets only host-only analytics cookies, preserving other storage", () => {
  const removals = ownAnalyticsCookieRemovals("consent=keep; mm_ga=synthetic-client; mm_ga_TEST123=synthetic-session; _ga=other-property; mm_ga_extra_bad=keep; essential=keep; mm_gaevil=keep");
  assert.equal(removals.length, 2);
  assert.deepEqual(removals.map((value) => value.split("=", 1)[0]), ["mm_ga", "mm_ga_TEST123"]);
  for (const value of removals) {
    assert.match(value, /=; Max-Age=0;/);
    assert.match(value, /Expires=Thu, 01 Jan 1970 00:00:00 GMT;/);
    assert.match(value, /Path=\//);
    assert.equal(value.includes("Domain="), false);
    assert.equal(value.includes("synthetic-"), false);
  }
});

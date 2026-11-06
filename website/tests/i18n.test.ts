import assert from "node:assert/strict";
import test from "node:test";
import { defaultLocale, isLocale, localePath } from "../lib/i18n.ts";
import { pageContext } from "../lib/analytics.ts";

test("English is the default and only explicit English/German locales are supported", () => {
  assert.equal(defaultLocale, "en");
  for (const locale of ["en", "de"]) assert.equal(isLocale(locale), true);
  for (const locale of ["fr", "EN", "de-AT", "", "__proto__"]) assert.equal(isLocale(locale), false);
  assert.equal(localePath("en"), "/en");
  assert.equal(localePath("de", "/"), "/de");
  assert.equal(localePath("de", "/privacy"), "/de/privacy");
});

test("analytics recognizes localized public pages without forwarding private URL data", () => {
  for (const locale of ["en", "de"] as const) {
    for (const suffix of ["", "/privacy", "/legal-notice"]) {
      const path = localePath(locale, suffix);
      const context = pageContext(`${path}?email=PRIVATE#EDITOR_TEXT`);
      assert.equal(context?.page_location, `https://markdown-mail.einser.at${path}`);
      assert.equal(context?.page_referrer, "");
      assert.ok(context?.page_title);
      assert.ok(!JSON.stringify(context).includes("PRIVATE"));
      assert.ok(!JSON.stringify(context).includes("EDITOR_TEXT"));
    }
  }
  assert.equal(pageContext("/en/editor/PRIVATE"), null);
  assert.equal(pageContext("/fr"), null);
  assert.equal(pageContext("/de/__proto__"), null);
});

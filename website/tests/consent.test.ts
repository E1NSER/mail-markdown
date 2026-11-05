import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_MAX_AGE_MS,
  CONSENT_STORAGE_KEY,
  createConsentChoice,
  isCurrentConsent,
  parseConsentChoice,
  persistConsentChoice,
} from "../lib/consent.ts";

const NOW = 1_800_000_000_000;

test("persists both explicit choices with one fixed 180-day lifetime", () => {
  assert.equal(CONSENT_MAX_AGE_MS, 180 * 24 * 60 * 60 * 1_000);
  for (const statistics of [false, true]) {
    const choice = createConsentChoice(statistics, NOW);
    const values = new Map<string, string>();
    const storage = {
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    assert.deepEqual(choice, {
      version: 1,
      statistics,
      updatedAt: NOW,
      expiresAt: NOW + CONSENT_MAX_AGE_MS,
    });
    assert.equal(persistConsentChoice(storage, choice), true);
    assert.deepEqual(parseConsentChoice(values.get(CONSENT_STORAGE_KEY) ?? null, NOW), choice);
    assert.equal(isCurrentConsent(choice, NOW), true);
  }
});

test("consent expires exactly at its deadline and never authorizes future choices", () => {
  const choice = createConsentChoice(true, NOW);
  assert.equal(isCurrentConsent(choice, NOW - 1), false);
  assert.equal(isCurrentConsent(choice, choice.expiresAt - 1), true);
  assert.equal(isCurrentConsent(choice, choice.expiresAt), false);
  assert.equal(isCurrentConsent(choice, choice.expiresAt + 1), false);
  assert.equal(parseConsentChoice(JSON.stringify(choice), choice.expiresAt), null);
});

test("missing, malformed and non-object storage values remain unconsented", () => {
  for (const raw of [null, "", " ", "not JSON", "{", "null", "true", "123", '"accepted"', "[]", "{}"])
    assert.equal(parseConsentChoice(raw, NOW), null, String(raw));
  for (const value of [null, undefined, [], true, false, 1, "granted", () => true])
    assert.equal(isCurrentConsent(value, NOW), false);
});

test("rejects changed versions, ambiguous booleans and tampered lifetimes", () => {
  const valid = createConsentChoice(true, NOW);
  const invalid = [
    { ...valid, version: 0 },
    { ...valid, version: 2 },
    { ...valid, version: "1" },
    { ...valid, version: undefined },
    { ...valid, statistics: "true" },
    { ...valid, statistics: "granted" },
    { ...valid, statistics: 1 },
    { ...valid, statistics: undefined },
    { ...valid, updatedAt: NOW + 1, expiresAt: NOW + 1 + CONSENT_MAX_AGE_MS },
    { ...valid, updatedAt: -1, expiresAt: CONSENT_MAX_AGE_MS - 1 },
    { ...valid, updatedAt: NOW + 0.5, expiresAt: NOW + 0.5 + CONSENT_MAX_AGE_MS },
    { ...valid, expiresAt: valid.expiresAt + 1 },
    { ...valid, expiresAt: valid.expiresAt - 1 },
    { ...valid, updatedAt: String(NOW) },
    { ...valid, expiresAt: String(valid.expiresAt) },
  ];
  for (const [index, value] of invalid.entries()) {
    assert.equal(isCurrentConsent(value, NOW), false, `fixture ${index}`);
    assert.equal(parseConsentChoice(JSON.stringify(value), NOW), null, `stored fixture ${index}`);
  }
});

test("non-finite and unsafe timestamps cannot establish consent", () => {
  const valid = createConsentChoice(true, NOW);
  for (const value of [NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(isCurrentConsent({ ...valid, updatedAt: value }, NOW), false);
    assert.equal(isCurrentConsent({ ...valid, expiresAt: value }, NOW), false);
  }
});

test("a quota failure during withdrawal removes an existing grant before a later reload", () => {
  const values = new Map([
    [CONSENT_STORAGE_KEY, JSON.stringify(createConsentChoice(true, NOW))],
    ["unrelated-preference", "keep"],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: () => { throw new DOMException("Synthetic full storage", "QuotaExceededError"); },
    removeItem: (key: string) => { values.delete(key); },
  };
  assert.equal(parseConsentChoice(storage.getItem(CONSENT_STORAGE_KEY), NOW)?.statistics, true);

  assert.equal(persistConsentChoice(storage, createConsentChoice(false, NOW + 1)), false);

  const choiceAfterReload = parseConsentChoice(storage.getItem(CONSENT_STORAGE_KEY), NOW + 2);
  assert.equal(choiceAfterReload, null, "a failed denial write must not preserve the previous grant");
  assert.equal(storage.getItem("unrelated-preference"), "keep");
});

test("blocked consent storage cannot throw through the withdrawal UI", () => {
  let removalAttempted = false;
  const storage = {
    setItem: () => { throw new DOMException("Synthetic blocked storage", "SecurityError"); },
    removeItem: () => {
      removalAttempted = true;
      throw new DOMException("Synthetic blocked removal", "SecurityError");
    },
  };
  assert.doesNotThrow(() => {
    assert.equal(persistConsentChoice(storage, createConsentChoice(false, NOW)), false);
  });
  assert.equal(removalAttempted, true);
});

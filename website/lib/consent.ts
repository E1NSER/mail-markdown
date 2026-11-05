export const CONSENT_STORAGE_KEY = "mail-markdown-consent-v1";
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1_000;

export type ConsentChoice = {
  version: 1;
  statistics: boolean;
  updatedAt: number;
  expiresAt: number;
};

export function createConsentChoice(
  statistics: boolean,
  now = Date.now(),
): ConsentChoice {
  return { version: 1, statistics, updatedAt: now, expiresAt: now + CONSENT_MAX_AGE_MS };
}

export function isCurrentConsent(value: unknown, now = Date.now()): value is ConsentChoice {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const choice = value as Record<string, unknown>;
  return (
    choice.version === 1 &&
    typeof choice.statistics === "boolean" &&
    typeof choice.updatedAt === "number" &&
    Number.isSafeInteger(choice.updatedAt) &&
    choice.updatedAt >= 0 &&
    choice.updatedAt <= now &&
    typeof choice.expiresAt === "number" &&
    Number.isSafeInteger(choice.expiresAt) &&
    choice.expiresAt === choice.updatedAt + CONSENT_MAX_AGE_MS &&
    choice.expiresAt > now
  );
}

export function parseConsentChoice(raw: string | null, now = Date.now()): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isCurrentConsent(value, now) ? value : null;
  } catch {
    return null;
  }
}

export function persistConsentChoice(
  storage: Pick<Storage, "setItem" | "removeItem">,
  choice: ConsentChoice,
): boolean {
  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
    return true;
  } catch {
    // Quota failures can leave an older grant readable. Removing it prevents
    // reauthorization on reload and emits a storage event to other tabs.
    try { storage.removeItem(CONSENT_STORAGE_KEY); } catch { /* The in-memory opt-out still takes effect if storage is blocked. */ }
    return false;
  }
}

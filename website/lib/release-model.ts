export const REPOSITORY_URL = "https://github.com/E1NSER/mail-markdown";
export const RELEASES_URL = `${REPOSITORY_URL}/releases`;
export const RELEASE_ASSET_NAME = "Mail-Markdown-universal-notarized.dmg";
// GitHub resolves Latest when clicked, even if the page's version label is cached.
export const LATEST_DOWNLOAD_URL = `${RELEASES_URL}/latest/download/${RELEASE_ASSET_NAME}`;
export const SOURCE_BUILD_URL = `${REPOSITORY_URL}#build-locally`;

export type ReleaseState =
  | { status: "available"; version: string; bytes: number }
  | { status: "no-download"; version: string }
  | { status: "not-published" }
  | { status: "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOwnDownloadUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      url.port === "" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "" &&
      url.pathname.startsWith("/E1NSER/mail-markdown/releases/download/") &&
      url.pathname.endsWith(`/${RELEASE_ASSET_NAME}`)
    );
  } catch {
    return false;
  }
}

export function parseLatestRelease(value: unknown): ReleaseState {
  if (
    !isRecord(value) ||
    value.draft !== false ||
    value.prerelease !== false ||
    typeof value.tag_name !== "string" ||
    !value.tag_name.trim() ||
    typeof value.published_at !== "string" ||
    !Number.isFinite(Date.parse(value.published_at)) ||
    !Array.isArray(value.assets)
  )
    return { status: "error" };

  const asset = value.assets.find(
    (item) =>
      isRecord(item) &&
      item.name === RELEASE_ASSET_NAME &&
      item.state === "uploaded" &&
      typeof item.size === "number" &&
      Number.isSafeInteger(item.size) &&
      item.size > 0 &&
      isOwnDownloadUrl(item.browser_download_url),
  );

  if (!isRecord(asset))
    return { status: "no-download", version: value.tag_name };
  return {
    status: "available",
    version: value.tag_name,
    bytes: asset.size as number,
  };
}

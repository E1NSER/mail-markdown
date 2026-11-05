import { parseLatestRelease, type ReleaseState } from "./release-model.ts";

const RELEASE_API =
  "https://api.github.com/repos/E1NSER/mail-markdown/releases/latest";

export async function getLatestRelease(
  fetcher: typeof fetch = fetch,
): Promise<ReleaseState> {
  try {
    const response = await fetcher(RELEASE_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "MailMarkdown-Website",
      },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status === 404) return { status: "not-published" };
    if (!response.ok) return { status: "error" };
    return parseLatestRelease(await response.json());
  } catch {
    return { status: "error" };
  }
}

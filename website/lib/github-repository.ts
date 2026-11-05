const REPOSITORY_API = "https://api.github.com/repos/E1NSER/mail-markdown";

// Fetch from the server page; only the resulting count is passed to navigation.
export async function getRepositoryStars(
  fetcher: typeof fetch = fetch,
): Promise<number | null> {
  try {
    const response = await fetcher(REPOSITORY_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "MailMarkdown-Website",
      },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;

    const repository: unknown = await response.json();
    if (
      typeof repository !== "object" ||
      repository === null ||
      Array.isArray(repository)
    ) {
      return null;
    }

    const stars = (repository as Record<string, unknown>).stargazers_count;
    return typeof stars === "number" &&
      Number.isSafeInteger(stars) &&
      stars >= 0
      ? stars
      : null;
  } catch {
    return null;
  }
}

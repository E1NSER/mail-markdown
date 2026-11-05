import assert from "node:assert/strict";
import test from "node:test";
import { getRepositoryStars } from "../lib/github-repository.ts";

test("preserves genuine zero and positive repository star counts", async () => {
  for (const stars of [0, 47, Number.MAX_SAFE_INTEGER]) {
    const fetcher: typeof fetch = async () =>
      Response.json({ stargazers_count: stars });
    assert.equal(await getRepositoryStars(fetcher), stars);
  }
});

test("rejects missing, malformed and unsafe counts instead of inventing zero", async () => {
  const invalid = [
    null,
    [],
    {},
    ...[-1, 1.5, Number.MAX_SAFE_INTEGER + 1, "47", null].map(
      (stargazers_count) => ({ stargazers_count }),
    ),
  ];

  for (const value of invalid) {
    const fetcher: typeof fetch = async () => Response.json(value);
    assert.equal(await getRepositoryStars(fetcher), null);
  }
});

test("public server fetch uses five-minute revalidation and a five-second timeout", async (t) => {
  const controller = new AbortController();
  const timeout = t.mock.method(
    AbortSignal,
    "timeout",
    () => controller.signal,
  );
  let requestedUrl: string | undefined;
  let requestedOptions: RequestInit | undefined;
  const fetcher: typeof fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedOptions = init;
    return Response.json({ stargazers_count: 7 });
  };

  assert.equal(await getRepositoryStars(fetcher), 7);
  assert.equal(
    requestedUrl,
    "https://api.github.com/repos/E1NSER/mail-markdown",
  );
  assert.equal(requestedOptions?.next?.revalidate, 300);
  assert.notEqual(requestedOptions?.cache, "no-store");
  assert.equal(requestedOptions?.signal, controller.signal);
  assert.deepEqual(timeout.mock.calls[0].arguments, [5_000]);
  const headers = new Headers(requestedOptions?.headers);
  assert.equal(headers.get("Accept"), "application/vnd.github+json");
  assert.equal(headers.has("Authorization"), false);
});

test("HTTP, network, timeout and malformed JSON failures remain unknown", async () => {
  for (const status of [404, 403, 429, 500]) {
    const fetcher: typeof fetch = async () =>
      new Response("unavailable", { status });
    assert.equal(await getRepositoryStars(fetcher), null, `HTTP ${status}`);
  }

  for (const failure of [
    new Error("offline test fixture"),
    new DOMException("timeout test fixture", "TimeoutError"),
  ]) {
    const fetcher: typeof fetch = async () => {
      throw failure;
    };
    assert.equal(await getRepositoryStars(fetcher), null, failure.name);
  }

  const malformed: typeof fetch = async () => new Response("not JSON");
  assert.equal(await getRepositoryStars(malformed), null);
});

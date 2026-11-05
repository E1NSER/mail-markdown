import assert from "node:assert/strict";
import test from "node:test";
import { getLatestRelease } from "../lib/github-release.ts";
import {
  LATEST_DOWNLOAD_URL,
  RELEASE_ASSET_NAME,
  REPOSITORY_URL,
  parseLatestRelease,
} from "../lib/release-model.ts";

// Synthetic API responses only. These tests never fetch or publish a release.
function asset(overrides: Record<string, unknown> = {}) {
  return {
    name: RELEASE_ASSET_NAME,
    state: "uploaded",
    size: 1_234_567,
    browser_download_url: `${REPOSITORY_URL}/releases/download/v1.2.3/${RELEASE_ASSET_NAME}`,
    ...overrides,
  };
}

function release(overrides: Record<string, unknown> = {}) {
  return {
    draft: false,
    prerelease: false,
    tag_name: "v1.2.3",
    published_at: "2026-11-01T12:00:00Z",
    assets: [asset()],
    ...overrides,
  };
}

test("recognizes the uploaded universal DMG among unrelated assets", () => {
  const result = parseLatestRelease(
    release({
      assets: [
        asset({ name: `${RELEASE_ASSET_NAME}.sha256` }),
        asset({ name: "Mail-Markdown-arm64.zip" }),
        asset(),
      ],
    }),
  );

  assert.deepEqual(result, {
    status: "available",
    version: "v1.2.3",
    bytes: 1_234_567,
  });
});

test("rejects drafts, prereleases and malformed publication metadata", () => {
  const invalid = [
    null,
    [],
    {},
    release({ draft: true }),
    release({ draft: undefined }),
    release({ prerelease: true }),
    release({ tag_name: "  " }),
    release({ tag_name: 123 }),
    release({ published_at: undefined }),
    release({ published_at: "not a publication date" }),
    release({ assets: {} }),
  ];

  for (const [index, value] of invalid.entries()) {
    assert.deepEqual(
      parseLatestRelease(value),
      { status: "error" },
      `fixture ${index}`,
    );
  }
});

test("does not advertise local DMGs, ZIPs, checksums or a release without assets", () => {
  const names = [
    "Mail Markdown-1.0.0-local.dmg",
    "Mail-Markdown-universal.dmg",
    "Mail-Markdown-universal-notarized.zip",
    `${RELEASE_ASSET_NAME}.sha256`,
  ];
  const fixtures = [
    release({ assets: [] }),
    ...names.map((name) => release({ assets: [asset({ name })] })),
  ];

  for (const value of fixtures) {
    assert.deepEqual(parseLatestRelease(value), {
      status: "no-download",
      version: "v1.2.3",
    });
  }
});

test("does not advertise incomplete uploads or invalid file sizes", () => {
  const incomplete = [
    asset({ state: "starter" }),
    asset({ state: "open" }),
    asset({ state: undefined }),
    ...[
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      "123",
      undefined,
    ].map((size) => asset({ size })),
  ];

  for (const [index, item] of incomplete.entries()) {
    assert.deepEqual(
      parseLatestRelease(release({ assets: [item] })),
      { status: "no-download", version: "v1.2.3" },
      `asset fixture ${index}`,
    );
  }
});

test("requires an HTTPS asset URL from this repository without credentials or extra URL parts", () => {
  const ownPath = `/E1NSER/mail-markdown/releases/download/v1.2.3/${RELEASE_ASSET_NAME}`;
  const invalidUrls = [
    `https://example.org${ownPath}`,
    `https://github.com/another-owner/mail-markdown/releases/download/v1.2.3/${RELEASE_ASSET_NAME}`,
    `https://github.com/E1NSER/another-repo/releases/download/v1.2.3/${RELEASE_ASSET_NAME}`,
    `http://github.com${ownPath}`,
    `https://user:password@github.com${ownPath}`,
    `https://github.com:8443${ownPath}`,
    `https://github.com${ownPath}?download=1`,
    `https://github.com${ownPath}#fragment`,
    `https://github.com/E1NSER/mail-markdown/blob/main/${RELEASE_ASSET_NAME}`,
    "not a URL",
    null,
  ];

  for (const [index, browser_download_url] of invalidUrls.entries()) {
    assert.deepEqual(
      parseLatestRelease(
        release({ assets: [asset({ browser_download_url })] }),
      ),
      { status: "no-download", version: "v1.2.3" },
      `URL fixture ${index}`,
    );
  }
});

test("version metadata can change while the download URL always resolves GitHub Latest", () => {
  for (const version of ["v1.2.3", "v2.0.0"]) {
    const result = parseLatestRelease(
      release({
        tag_name: version,
        assets: [
          asset({
            browser_download_url: `${REPOSITORY_URL}/releases/download/${version}/${RELEASE_ASSET_NAME}`,
          }),
        ],
      }),
    );
    assert.deepEqual(result, {
      status: "available",
      version,
      bytes: 1_234_567,
    });
    assert.equal(
      LATEST_DOWNLOAD_URL,
      `https://github.com/E1NSER/mail-markdown/releases/latest/download/${RELEASE_ASSET_NAME}`,
    );
  }
});

test("fetches only release metadata with five-minute revalidation and a five-second timeout", async (t) => {
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
    return Response.json(release());
  };

  assert.deepEqual(await getLatestRelease(fetcher), {
    status: "available",
    version: "v1.2.3",
    bytes: 1_234_567,
  });
  assert.equal(
    requestedUrl,
    "https://api.github.com/repos/E1NSER/mail-markdown/releases/latest",
  );
  assert.equal(requestedOptions?.next?.revalidate, 300);
  assert.notEqual(
    requestedOptions?.cache,
    "no-store",
    "positive revalidation must not conflict with no-store",
  );
  assert.equal(requestedOptions?.signal, controller.signal);
  assert.equal(timeout.mock.calls.length, 1);
  assert.deepEqual(timeout.mock.calls[0].arguments, [5_000]);
  assert.equal(
    new Headers(requestedOptions?.headers).get("Accept"),
    "application/vnd.github+json",
  );
});

test("distinguishes no published release from forbidden, rate-limited and failed API requests", async () => {
  for (const status of [404, 403, 429, 500]) {
    const fetcher: typeof fetch = async () =>
      new Response("not JSON", { status });
    const result = await getLatestRelease(fetcher);
    assert.deepEqual(
      result,
      { status: status === 404 ? "not-published" : "error" },
      `HTTP ${status}`,
    );
  }
});

test("network, timeout and abort failures remain errors rather than missing releases", async () => {
  for (const failure of [
    new Error("offline test fixture"),
    new DOMException("timeout test fixture", "TimeoutError"),
    new DOMException("abort test fixture", "AbortError"),
  ]) {
    const fetcher: typeof fetch = async () => {
      throw failure;
    };
    assert.deepEqual(
      await getLatestRelease(fetcher),
      { status: "error" },
      failure.name,
    );
  }
});

test("malformed JSON and unexpected successful response shapes fail safely", async () => {
  for (const body of [
    "invalid JSON",
    "null",
    "[]",
    '{"message":"unexpected response"}',
  ]) {
    const fetcher: typeof fetch = async () =>
      new Response(body, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    assert.deepEqual(await getLatestRelease(fetcher), { status: "error" });
  }
});

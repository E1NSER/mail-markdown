# Contributing

Focused bug reports and pull requests are welcome. Mail Markdown is a free, unlimited native companion for Apple Mail; it has no subscriptions, usage quotas, accounts or remote backend.

## Local setup

Use macOS 13 or later and Xcode with Swift 6.2 or later. Run these commands from the repository root:

```sh
swift test
MAIL_MARKDOWN_SIGNING_IDENTITY=- zsh scripts/build-app.sh \
  --native --staging-output "$PWD/dist/dev/Mail Markdown.app"
```

The explicit `-` selects ad-hoc signing for a local test build. To use your own certificate, provide its exact available name or SHA-1 fingerprint through `MAIL_MARKDOWN_SIGNING_IDENTITY` instead. Do not use a maintainer's certificate name or commit credentials.

The staging path keeps an existing app untouched. The build script refuses to replace a running destination. Quit other copies before opening your test app, and grant Accessibility permission to that copy. A signature change may require removing and re-adding its permission in System Settings.

The default build is Universal; `--native` shortens local iteration. See [scripts/README.md](scripts/README.md) for the full signing behavior and [docs/RELEASE.md](docs/RELEASE.md) for release preparation. Publication and notarization are separate from a local build.

## Testing a change

Run `swift test` for renderer or integration changes. Existing tests cover semantic Markdown, font/color inheritance, links and actual RTF round trips. Add a regression test when a fix changes behavior that the renderer tests can meaningfully verify.

For the keyboard and Accessibility integration, use real keyboard input in an **unsent test draft** containing only dummy text:

1. Set a recognizable font, size and color on existing text in a Rich Text Mail draft.
2. Paste a small Markdown example with physical **⌘V**. Also test selecting existing Markdown, **⌘C**, then **⌘V**.
3. Check style inheritance, selection replacement and Undo. Verify the app leaves subject, recipient and search fields usable.
4. Check paused formatting and an empty draft. If you changed clipboard handling, confirm recovery works and never replaces a newly copied clipboard value.
5. For window or menu changes, check launch, close/reopen, preview editing, keyboard navigation and both macOS appearances.

Scripting Mail's contents bypasses the event-tap flow. Report renderer-test results separately from checks performed in the actual Mail editor. State which macOS/Mail version and architecture you tested; do not infer Intel or older-system compatibility from one Apple Silicon run.

## Reporting issues

Include the macOS version, Mail UI language, app revision, input example, expected result and actual result. Mention whether the draft is Rich Text and whether normal paste or only automatic formatting fails.

Use synthetic examples. Do not attach private emails, clipboard contents, credentials or unredacted personal screenshots. Operational diagnostics can help explain focus or permission failures, but inspect any logs before sharing them.

## Pull requests

- Keep changes focused and explain the user-visible result and validation performed.
- Preserve normal paste when conversion cannot safely determine the destination or text style.
- Keep message processing local. Discuss changes to permissions, networking or distribution architecture before implementing them.
- Prefer native AppKit behavior and system appearance/accessibility support. Design mockups are references, not evidence of implemented UI.
- Preserve `Package.resolved`. When updating a dependency, refresh its bundled license/notice copies and version references in `Resources/ThirdPartyNotices.txt`.
- Include only original or appropriately licensed assets. Keep signing material, generated app/DMG bundles, `.build`, and private design-reference exports out of the repository.

The current Accessibility/event-tap architecture targets direct distribution. A sandboxed Mac App Store version would require separate design and engineering work; see [docs/APP_STORE_FEASIBILITY.md](docs/APP_STORE_FEASIBILITY.md).

The project uses the [MIT License](LICENSE). Third-party dependencies retain their own licenses and attribution requirements.

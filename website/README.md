# Mail Markdown website

German landing page for [Mail Markdown](https://github.com/E1NSER/mail-markdown), a free macOS companion for Apple Mail. Built with Next.js 16.4.5, React 19, TypeScript and Motion 14.9.1.

Production: [markdown-mail.einser.at](https://markdown-mail.einser.at). The [Vercel alias](https://mail-markdown.vercel.app) remains available; canonical metadata and analytics use the custom domain.

The primary action automatically offers the latest public stable Mac release when its approved DMG is available. Until then the download buttons are visibly unavailable, alongside a separate GitHub action; no button redirects an installer request to source code. The app has no subscriptions or usage quotas.

## Local development

Use Node.js 24 to match the Vercel project. From this directory:

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. No application environment variables are required. Keep local `.env` files and Vercel credentials out of Git.

Optional website statistics use `NEXT_PUBLIC_GA_MEASUREMENT_ID`; see [Analytics setup](ANALYTICS.md) for the required GA4 stream settings, consent behavior and event definitions. Leave the variable unset to keep analytics disabled.

Before submitting changes:

```sh
npm run typecheck
npm test
npm run build
```

## Demo and privacy

The editable playground renders Markdown in the browser with `react-markdown`, `remark-gfm` and `remark-breaks`. Sample, font and color controls illustrate how formatting inherits a draft's style. The browser demo does not connect to Apple Mail; the native app uses its own Swift parser and RTF output.

User-entered text stays in client state. There is no text-processing API or account system. Optional GA4 statistics load only after explicit analytics consent and a valid measurement ID is configured. Markdown, clipboard contents and editor interactions are never included in analytics events. Ordinary hosting requests and optional statistics are covered by the site's [privacy page](app/datenschutz/page.tsx).

Manrope and DM Mono use `next/font`: font files are fetched at build time and served by the deployment, without visitor requests to Google Fonts. The app icon is original project artwork. No Mobbin screenshots or assets are included.

## Motion and accessibility

CSS handles small transitions; Motion handles the product demo and section reveals. Components use `useReducedMotion`, with a reduced-motion provider and CSS preference handling.

`Reveal` keeps server-rendered content visible. After hydration, it enhances only offscreen sections with an entrance animation. Preserve this behavior so the page remains readable without JavaScript. Check keyboard access, narrow screens and reduced motion when changing interactions.

## Vercel

- Project: `e1nser-team/mail-markdown`.
- Root Directory: `website`; framework: Next.js; Node.js: 24.
- GitHub `main` is configured for automatic production deployments.
- The repository-root `.vercelignore` uploads only website sources for CLI deployments; native builds, signing preparation, dependencies, local caches and environment files stay local.

For a manual CLI deployment, run the command from the **repository root**, because Vercel applies the configured `website` Root Directory:

```sh
# From the repository root, not website/:
vercel --prod
```

## Latest release download

The homepage checks GitHub's public `/releases/latest` metadata and revalidates every five minutes, without a website deployment. A ready release must contain the uploaded, nonempty `Mail-Markdown-universal-notarized.dmg` asset with a download URL belonging to this repository. Drafts, prereleases, source ZIPs and local development builds are not offered.

The download points directly to [GitHub's Latest asset URL](https://github.com/E1NSER/mail-markdown/releases/latest/download/Mail-Markdown-universal-notarized.dmg), so GitHub selects the current release at click time. It never pins the installer link to the page's cached version label and makes no per-click REST request. Availability and version labels may update a few minutes after publication.

No release, a release missing its DMG, and a temporarily unavailable GitHub API have distinct fallback text. A failed lookup never invents an installer or falls back to an older release. See [the release guide](../docs/RELEASE.md) for building, validating and publishing the fixed asset. Metadata and filenames alone do not verify signing or notarization; those checks belong to the release process.

## Reference notes

The visual identity uses the app icon's blue (`#1375DB`) as a continuous brand stage, oversized sans-serif typography, a working native Mail specimen and an animated app-icon composition. The hero offers a font switch and an explicit formatting toggle; it plays the conversion once. Subtle Markdown syntax drifts in the background with a pause control and a static reduced-motion alternative. The editable playground remains local. GitHub star counts are read server-side with five-minute caching; missing metadata hides the count instead of inventing one.

- [Superlist on Awwwards](https://www.awwwards.com/sites/superlist): concentrated brand color, large typography and a single product composition. [Button interaction reference](https://www.awwwards.com/inspiration/superlist-notification-button).
- [Tezuka Reader in the Webflow Showcase](https://webflow.com/made-in-webflow/website/tezuka-reader), [live site](https://tezuka-xr.webflow.io/): native interface language and a large, focused product view.

These are layout and interaction references. The palette, copy, artwork and Markdown-to-Mail interaction are specific to this project; no reference assets are included.

Created by [E1NSER.](https://einser.at). Project code is covered by the repository's [MIT License](../LICENSE).

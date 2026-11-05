# Mail Markdown website

German landing page for [Mail Markdown](https://github.com/E1NSER/mail-markdown), a free macOS companion for Apple Mail. Built with Next.js 16.4.5, React 19, TypeScript and Motion 14.9.1.

Production: [mail-markdown.vercel.app](https://mail-markdown.vercel.app).

The primary action links to the source-build instructions. A public notarized app download is still being prepared; keep this distinction when changing the copy. The app has no subscriptions or usage quotas.

## Local development

Use Node.js 24 to match the Vercel project. From this directory:

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. No application environment variables are required. Keep local `.env` files and Vercel credentials out of Git.

Before submitting changes:

```sh
npm run typecheck
npm run build
```

## Demo and privacy

The editable playground renders Markdown in the browser with `react-markdown`, `remark-gfm` and `remark-breaks`. Sample, font and color controls illustrate how formatting inherits a draft's style. The browser demo does not connect to Apple Mail; the native app uses its own Swift parser and RTF output.

User-entered text stays in client state. There is no text-processing API, account system, analytics integration or application cookie. Ordinary hosting requests are covered by the site's [privacy page](app/datenschutz/page.tsx).

Manrope and DM Mono use `next/font`: font files are fetched at build time and served by the deployment, without visitor requests to Google Fonts. The app icon is original project artwork. No Mobbin screenshots or assets are included.

## Motion and accessibility

CSS handles small transitions; Motion handles the product demo and section reveals. Components use `useReducedMotion`, with a reduced-motion provider and CSS preference handling.

`Reveal` keeps server-rendered content visible. After hydration, it enhances only offscreen sections with an entrance animation. Preserve this behavior so the page remains readable without JavaScript. Check keyboard access, narrow screens and reduced motion when changing interactions.

## Vercel

- Project: `e1nser-team/mail-markdown`.
- Root Directory: `website`; framework: Next.js; Node.js: 24.
- GitHub `main` is configured for automatic production deployments.

For a manual CLI deployment, run the command from the **repository root**, because Vercel applies the configured `website` Root Directory:

```sh
# From the repository root, not website/:
vercel --prod
```

## Reference notes

The current visual direction uses pearl surfaces, ink navy, italic Georgia accents and an original envelope-shaped product stage. The split hero, Mail illustration and keyboard interaction keep it distinct from the reference.

- [Calendly hero](https://mobbin.com/sites/sections/1aecb2bd-9275-46c8-bd6a-ab20e3847941): warm framing, navy type and dark actions.
- [Calendly feature section](https://mobbin.com/sites/sections/959d4e5e-ecc6-4995-b084-ed17dc74724f): serif section typography and a large, concentrated illustration area.

These inspected Mobbin captures informed the layout. They are static references and do not establish animation or interaction behavior:

- [Sketch](https://mobbin.com/sites/sections/a8e27ceb-5766-47e1-922e-e320d5a95fa0?utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp): centered Mac-focused headline, a feature chooser and a large application window.
- [Norma](https://mobbin.com/sites/sections/e2c98980-269f-432e-a8bc-55c981de2359?utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp): short utility copy, compact primary/secondary actions and a readable desktop proof image.
- [Dabbit](https://mobbin.com/sites/sections/b04c25e2-2f79-4c91-b926-3c4d41b7b201?utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp): a compact claim beside a spacious example surface with a cursor and output value.

The editable Markdown-to-Mail demonstration and its motion are project design decisions.

Created by [E1NSER.](https://einser.at). Project code is covered by the repository's [MIT License](../LICENSE).

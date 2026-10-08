# Dog Park site

Astro + Tailwind v4 static site; a redesign of dogparkgames.com. See README.md.

- Start the dev server in background mode: `astro dev --background` (stop with `astro dev stop`).
- `npm start` runs `server.mjs`, which serves `dist/` (optional password via `SITE_PASSWORD`).
- Store and cart are demo-only; no payments yet.
- Klaviyo (`src/lib/klaviyo.ts`, public site key only): klaviyo.js loads on every page; Notify Me subscribes to the launch list (and merch list if ticked); contact form, Viewed Product, Added to Cart and Started Checkout are tracked as events. Never put a Klaviyo private key in client code.
- Launch-list pop-up: `src/components/SignupPopup.astro` (in Layout) + `src/lib/signup-popup.ts`. Opens at 45% scroll, 25s, or exit intent; skipped on pages with their own form (`SKIP_PATHS`), once per visit, never after sign-up or for email click-throughs, 14-day snooze after dismiss. Klaviyo source: "Site pop-up".
- Brand tokens live in `src/styles/global.css`; products in `src/data/products.ts`.

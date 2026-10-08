# Dog Park site

Astro + Tailwind v4 static site; a redesign of dogparkgames.com. See README.md.

- Start the dev server in background mode: `astro dev --background` (stop with `astro dev stop`).
- `npm start` runs `server.mjs`, which serves `dist/` (optional password via `SITE_PASSWORD`).
- Store and cart are demo-only; no payments yet.
- Klaviyo (`src/lib/klaviyo.ts`, public site key only): klaviyo.js loads on every page; Notify Me subscribes to the launch list (and merch list if ticked); contact form, Viewed Product, Added to Cart and Started Checkout are tracked as events. Never put a Klaviyo private key in client code.
- Brand tokens live in `src/styles/global.css`; products in `src/data/products.ts`.

# Dog Park site

Astro + Tailwind v4 static site; a redesign of dogparkgames.com. See README.md.

- Start the dev server in background mode: `astro dev --background` (stop with `astro dev stop`).
- `npm start` runs `server.mjs`, which serves `dist/` (optional password via `SITE_PASSWORD`).
- Store, cart, and forms are demo-only; no payments or submissions.
- Brand tokens live in `src/styles/global.css`; products in `src/data/products.ts`.

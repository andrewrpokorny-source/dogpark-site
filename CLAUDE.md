# Dog Park site

Astro + Tailwind v4 static site, live at https://www.dogparkgames.com (launched Oct 14, 2026). See README.md.

- Start the dev server in background mode: `astro dev --background` (stop with `astro dev stop`).
- `npm start` runs `server.mjs`, which serves `dist/` (optional password via `SITE_PASSWORD`). It 301s dogparkgames.com → www.dogparkgames.com and sends `X-Robots-Tag: noindex` on any other host (e.g. the Railway preview URL).
- Hosting: Railway service `dogpark-site` (auto-deploys `main`), custom domain www.dogparkgames.com. DNS is in Squarespace (Domains → dogparkgames.com → DNS): CNAME www points to Railway. Squarespace can't point the bare domain at Railway with a working certificate (no real ALIAS/flattening), so Squarespace Domain Forwarding sends dogparkgames.com → https://www.dogparkgames.com; keep the Google Workspace MX, Klaviyo (`send`, `mtd1/2._domainkey`, site-verification), SPF, DMARC and `google._domainkey` records.
- Store and cart are demo-only; no payments yet.
- Visitor analytics: Cloudflare Web Analytics (free, cookieless), account help@dogparkgames.com; token in `src/data/analytics.ts` (empty = off).
- Klaviyo (`src/lib/klaviyo.ts`, public site key only): klaviyo.js loads on every page; Notify Me subscribes to the launch list (and merch list if ticked); contact form, Viewed Product, Added to Cart and Started Checkout are tracked as events. Never put a Klaviyo private key in client code.
- Wholesale page `/wholesale`: stockist form sends a "Submitted Wholesale Inquiry" event (and trade-list subscribe if ticked). Set `faireUrl` in `src/data/wholesale.ts` to the Faire Direct link once approved; the page then shows "Shop wholesale on Faire" buttons.
- Sample game (`/play`): when a round ends, a "Want the real board on your table?" card asks for an email (launch list, Klaviyo source "Sample game finish", with result + turns as profile properties). `game.ts` fires `game:finish` / `game:new` on the `[data-game]` root.
- Launch-list pop-up: `src/components/SignupPopup.astro` (in Layout) + `src/lib/signup-popup.ts`. Opens at 45% scroll, 25s, or exit intent; skipped on pages with their own form (`SKIP_PATHS`), once per visit, never after sign-up or for email click-throughs, 14-day snooze after dismiss. Klaviyo source: "Site pop-up".
- Brand font is Calibri (as in the logo) for headings and body; visitors without it get Carlito (OFL, same metrics), self-hosted in `public/fonts/`. Courier Prime stays for the small typewriter labels.
- Brand tokens live in `src/styles/global.css`; products in `src/data/products.ts`.

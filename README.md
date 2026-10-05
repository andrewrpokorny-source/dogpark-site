# Dog Park: A Get Lost! Game (redesign)

A refreshed, mobile-friendly version of [dogparkgames.com](https://www.dogparkgames.com/), built with Astro and Tailwind.

All copy, rules, product details, and artwork come from the original site. The store, cart, notify-me list, and contact form are **demo only**: they look and feel real, but they don't take payment, send email, or store submissions. The cart lives in the visitor's browser.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home |
| `/how-to-play` | Full rules with section navigation |
| `/products-store` | Car magnet and long-sleeve tee |
| `/cart` | Demo cart |
| `/about` | About Brenda and the game |
| `/contact` | Contact form (demo) |
| `/notify-me` | Launch list signup (demo) |

## Develop

```sh
npm install
npm run dev        # http://localhost:4321
```

## Build & run

```sh
npm run build      # outputs static site to dist/
npm start          # serves dist/ on $PORT (default 3000)
```

## Deploy to Railway

Railway detects Node and runs `npm run build` then `npm start`, so no extra config is needed:

```sh
railway init       # create a project
railway up         # deploy this folder
railway domain     # generate a public *.up.railway.app URL
```

Set a `SITE_PASSWORD` variable on the Railway service to put the whole site behind a browser password prompt (any username works). Leave it unset to make the site public.

```sh
railway variables --set SITE_PASSWORD=your-password
```

Pages are also tagged `noindex` so the copy won't show up in search results alongside the real site.

## Where things live

- `src/pages/` — one file per page
- `src/data/products.ts` — store products, prices, colors, sizes, photos
- `src/styles/global.css` — brand palette (sampled from the board art), fonts, shared styles
- `src/assets/` — artwork and product photos from the original site (optimized at build time)

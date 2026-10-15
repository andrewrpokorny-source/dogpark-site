import type { APIRoute } from 'astro';

// Every page in src/pages, except ones that shouldn't show up in search.
const EXCLUDE = new Set(['404', 'cart', 'og-card']);

export const GET: APIRoute = ({ site }) => {
  const paths = Object.keys(import.meta.glob('./*.astro'))
    .map((f) => f.replace(/^\.\//, '').replace(/\.astro$/, ''))
    .filter((name) => !EXCLUDE.has(name))
    .map((name) => (name === 'index' ? '/' : `/${name}`))
    .sort();
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

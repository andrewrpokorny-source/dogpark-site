// Klaviyo: onsite tracking (klaviyo.js) plus list signups through Klaviyo's public client API.
// Only the public site key lives here; it is meant to be in the browser. Never add a private key.

export const KLAVIYO_SITE_KEY = 'RPbPt8';
export const KLAVIYO_LISTS = {
  launch: 'RSw5FP', // Dog Park Launch List
  merch: 'RxZ4if', // Dog Park Merch & Expansions
} as const;
const API_REVISION = '2026-07-15';

type Method = 'identify' | 'track';
type Call = [Method, ...unknown[]];

const queue: Call[] = [];
let ready = false;

const api = () => (window as unknown as { klaviyo?: Record<string, (...a: unknown[]) => unknown> }).klaviyo;

function flush() {
  const k = api();
  if (!k || typeof k.track !== 'function') return false;
  ready = true;
  while (queue.length) {
    const [method, ...args] = queue.shift()!;
    try {
      k[method](...args);
    } catch {
      /* tracking must never break the page */
    }
  }
  return true;
}

function call(method: Method, ...args: unknown[]) {
  queue.push([method, ...args]);
  if (ready) flush();
}

/** Load klaviyo.js once per page. It records page activity and recognizes people who click through from emails. */
export function loadKlaviyo() {
  if (document.getElementById('klaviyo-js')) return;
  const s = document.createElement('script');
  s.id = 'klaviyo-js';
  s.async = true;
  s.src = `https://static.klaviyo.com/onsite/js/${KLAVIYO_SITE_KEY}/klaviyo.js?company_id=${KLAVIYO_SITE_KEY}`;
  s.addEventListener('load', () => {
    // The script can take a moment to expose its API after it loads.
    let tries = 0;
    const wait = () => {
      if (!flush() && ++tries < 50) setTimeout(wait, 100);
    };
    wait();
  });
  document.head.append(s);
}

export interface Person {
  email: string;
  firstName?: string;
  lastName?: string;
}

const clean = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''));

/** Tell Klaviyo who this visitor is, so their site activity is attached to their profile. */
export function identify(p: Person, properties: Record<string, unknown> = {}) {
  call('identify', clean({ email: p.email, first_name: p.firstName, last_name: p.lastName, ...properties }));
}

/** Record an event (Viewed Product, Added to Cart, ...) for the current visitor. */
export function track(event: string, properties: Record<string, unknown> = {}) {
  call('track', event, properties);
}

/**
 * Subscribe someone to email marketing on one or more Klaviyo lists.
 * Resolves true when Klaviyo accepted every request.
 */
export async function subscribe(p: Person, lists: string[], source: string, properties: Record<string, unknown> = {}) {
  const attributes = clean({
    email: p.email,
    first_name: p.firstName,
    last_name: p.lastName,
    properties: clean(properties),
    subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
  });

  const results = await Promise.all(
    lists.map((id) =>
      fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${KLAVIYO_SITE_KEY}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/vnd.api+json',
          accept: 'application/vnd.api+json',
          revision: API_REVISION,
        },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: { custom_source: source, profile: { data: { type: 'profile', attributes } } },
            relationships: { list: { data: { type: 'list', id } } },
          },
        }),
      })
        .then((r) => r.ok)
        .catch(() => false),
    ),
  );

  identify(p, properties);
  return results.every(Boolean);
}

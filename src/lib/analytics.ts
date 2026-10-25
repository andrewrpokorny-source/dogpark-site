// Plausible goals: website actions shown on the Plausible dashboard (and Brenda's shared link).
// Each name here must also exist as a custom event goal in Plausible (Settings → Goals),
// and each prop key as a custom property (Settings → Custom properties), or it won't show.
export type Goal =
  | 'Joined mailing list'
  | 'Requested Toy Fair meeting'
  | 'Sent wholesale inquiry'
  | 'Sent contact message'
  | 'Added to cart'
  | 'Started checkout'
  | 'Finished sample game';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

/** Record a goal in Plausible. Safe when the script is blocked or analytics is off. */
export function goal(name: Goal, props: Record<string, string> = {}) {
  try {
    window.plausible?.(name, Object.keys(props).length ? { props } : undefined);
  } catch {
    /* analytics must never break the page */
  }
}

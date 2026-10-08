// Remembers, per browser, whether the launch-list pop-up should show.
// Storage can be blocked (private windows), so every access is guarded and failure means "don't nag".

const KEY = 'dp-signup';
const SNOOZE_DAYS = 14;

/** Pages that already have their own form, where the pop-up would get in the way. */
export const SKIP_PATHS = ['/notify-me', '/contact', '/toy-fair', '/cart'];

export function popupState(): 'eligible' | 'joined' | 'snoozed' {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return 'eligible';
    if (v === 'joined') return 'joined';
    const until = Number(v);
    return Number.isFinite(until) && Date.now() < until ? 'snoozed' : 'eligible';
  } catch {
    return 'snoozed';
  }
}

/** Never show the pop-up again in this browser (signed up here, on Notify Me, or arrived from our emails). */
export function markJoined() {
  try { localStorage.setItem(KEY, 'joined'); } catch {}
}

/** Hide the pop-up for a couple of weeks after "No thanks". */
export function markDismissed() {
  try {
    if (localStorage.getItem(KEY) !== 'joined') localStorage.setItem(KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
  } catch {}
}

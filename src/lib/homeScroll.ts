/**
 * Where the landing page was left, for the case page's back arrow.
 *
 * The browser's own back button already returns to the right place (SmoothScroll leaves popstate
 * to Next's restoration), but the arrow cannot simply go back in history: a visitor who stepped
 * from one case to the next would be sent to the previous case, not home. So the offset is kept
 * here instead — recorded the moment a work link is clicked, and spent once when the arrow asks
 * for it. Module state, so it lives as long as the client-side session and is empty after a hard
 * load, which is exactly when there is nowhere to return to.
 */
let saved: number | null = null;
let pending = false;

/** Record the landing page's current offset. Called as a work link is clicked. */
export function rememberHomeScroll() {
  saved = window.scrollY;
}

/** Ask the next arrival on the landing page to land at the remembered offset. False when nothing
    was remembered, so the caller can fall back to a plain link. */
export function requestHomeRestore(): boolean {
  if (saved === null) return false;
  pending = true;
  return true;
}

/** The offset to land at, once, if a restore was requested; otherwise null. */
export function takeHomeRestore(): number | null {
  if (!pending) return null;
  pending = false;
  return saved;
}

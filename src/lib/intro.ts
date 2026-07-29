/**
 * The intro's gate: one class name, and the script that decides whether to write it.
 *
 * They live together, in a plain module both the server layout and the client Preloader can read,
 * because they are two halves of one fact. A class name spelled out in a `<script>` string and
 * again in a component is exactly the kind of pair that drifts — and if it drifts, the failure is
 * silent and total: the overlay shows and never leaves, or the page is held and never released.
 */

/**
 * Put on <html> before the first paint. It does two jobs and only two: it displays the ink field
 * (the overlay is server-rendered, so it must be hidden by default and shown by this), and it clips
 * the document's scroll for the window before Lenis exists to be stopped.
 *
 * Added once, by the script below. Removed once, at the end of the lift.
 */
export const GATE = "is-loading";

/**
 * Inline and blocking, in the document body.
 *
 * It has to run before the first paint. The overlay is in the server-rendered HTML so the ink is
 * there from the very first frame, which means the decision to show or hide it has to be made in
 * that same frame — anything deferred to hydration would let a slice of the bare page through on
 * the loads that skip the intro.
 *
 * Writing to <html> therefore puts a class on the page that the server never rendered, and in the
 * App Router React DOES own <html> and will diff it. That mismatch is intended and cannot be
 * designed away: the server has no way to know what the visitor's motion preference is, and waiting
 * until it does would defeat the purpose. The root layout carries `suppressHydrationWarning` for
 * exactly this element to declare it — see app/layout.tsx.
 *
 * `prefers-reduced-motion` is the one opt-out: someone who has asked their system for less movement
 * should not be handed a curtain, so they get the page directly. Wrapped in a `try` because a page
 * that cannot be scrolled is a far worse failure than a page with no intro.
 */
export const GATE_SCRIPT = `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('${GATE}')}}catch(e){}})()`;

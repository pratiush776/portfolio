import { useCallback, useEffect, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "motion/react";

/**
 * The site's single EXIT mechanic for anything that scrolls UP and off the top: a viewport-anchored
 * top-to-bottom dissolve that mirrors the `.hero-cluster-v4` top feather, so content melts away into a
 * fixed band right below the (fixed, transparent) nav instead of sliding under and colliding with it.
 *
 * WHY a live-rect read and not a static CSS mask: a mask on a SCROLLING element is anchored to the
 * element's own box, so its band travels with the element and never sits at the nav line. Reading the
 * element's real `getBoundingClientRect().top` each scroll frame — which already includes whatever
 * parallax transform the element carries (the title's exit LAG, the thesis's exit LEAD) — lets us place
 * the feather band at the SAME viewport line no matter how fast the element is moving. That is what makes
 * the title and the thesis exit CONSISTENTLY: identical band, identical anchor; only their parallax
 * VELOCITY differs (by purpose — see HeroSection TITLE_LAG / HeroThesisBeat THESIS_LEAD).
 *
 * The band is expressed as viewport fractions and matches the `.hero-cluster-v4` mask exactly:
 *   • above CLEAR  (8% of vh)  → fully transparent (already gone, under the nav)
 *   • CLEAR→OPAQUE (8%→19%)    → the feather, sitting just under the nav
 *   • below OPAQUE (19% of vh) → fully opaque (the live content, untouched)
 */
export const NAV_DISSOLVE_CLEAR = 0.08;
export const NAV_DISSOLVE_OPAQUE = 0.19;

/**
 * Pure formula shared by both exits. `top` is the element's viewport-space top (px), `vh` the viewport
 * height (px). Returns a `mask-image` value, or "none" when the element is still fully below the band
 * (nothing to dissolve yet) so the resting content is never touched.
 */
export function navDissolveMask(top: number, vh: number): string {
  const opaque = NAV_DISSOLVE_OPAQUE * vh - top;
  if (opaque <= 0) return "none";
  const clear = Math.max(0, NAV_DISSOLVE_CLEAR * vh - top);
  return `linear-gradient(to bottom, transparent ${clear.toFixed(1)}px, #000 ${opaque.toFixed(1)}px)`;
}

/**
 * Motion-value flavour for the title (MorphName lives in motion/react). Tracks the referenced element's
 * top against viewport scroll + resize and returns a `mask-image` MotionValue to bind to both
 * `WebkitMaskImage` and `maskImage`. The thesis beat lives in GSAP land and instead calls
 * `navDissolveMask` directly from its scrub `onUpdate`, so both exits share the one formula above.
 */
export function useNavDissolveMask(ref: RefObject<HTMLElement | null>) {
  const { scrollY } = useScroll();
  const mask = useMotionValue("none");

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    mask.set(navDissolveMask(el.getBoundingClientRect().top, window.innerHeight));
  }, [ref, mask]);

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return mask;
}

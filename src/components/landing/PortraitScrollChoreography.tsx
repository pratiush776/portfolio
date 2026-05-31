"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SKILLS_PIN_FRACTION } from "./skills-config";

// Fraction of viewport height before the slot reaches viewport center at
// which the portrait starts its descent. The descent then extends through
// the pin range too (see apply()) — so the total motion window is
// `TRAVEL_WINDOW_FRACTION + SKILLS_PIN_FRACTION` of vh. Keep small for a
// fast, snappy descent that resolves quickly.
const TRAVEL_WINDOW_FRACTION = 0.1;

// The portrait's source image + mask leaves transparent space above the head,
// so the visible figure sits below the rect's geometric center. Lift the
// landing target by this fraction of the portrait's measured height so the
// visible head/shoulders land on the columns' vertical midline, not the
// rect center.
const VISIBLE_BIAS_FRACTION = 0.22;

// offsetTop chain — gives docY without including any current transforms
// (unlike getBoundingClientRect, which would shift during the pin).
function offsetToDocY(el: HTMLElement): number {
  let y = 0;
  let cur: HTMLElement | null = el;
  while (cur) {
    y += cur.offsetTop;
    cur = cur.offsetParent as HTMLElement | null;
  }
  return y;
}

// Resolves the `--v3-nav-clearance` CSS variable (a calc/clamp expression)
// to a pixel value by mounting a hidden probe element.
function getNavClearance(): number {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;height:var(--v3-nav-clearance);pointer-events:none;";
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  document.body.removeChild(probe);
  return h;
}

export function PortraitScrollChoreography() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1100px)").matches;
    if (reduced || !desktop) return;

    const portrait = document.querySelector<HTMLElement>(".hero-pratiush-photo-v3");
    const section = document.querySelector<HTMLElement>(".skills-section-v3");
    const slot = section?.querySelector<HTMLElement>(".skills-portrait-slot-v3") ?? null;
    if (!portrait || !section || !slot) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.set(portrait, {
      xPercent: -50,
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "50% 50%",
      force3D: true,
    });

    const state = {
      scrollA: 0,
      scrollB: 1,
      pinDistance: 0,
      finalY: 0,
    };

    const measure = () => {
      // Portrait — getBoundingClientRect captures the hero composition's
      // static `transform: translate(-50%, -50%)`, which offsetTop misses.
      // Subtract the current GSAP y to recover the natural visual docY.
      const portraitRect = portrait.getBoundingClientRect();
      const currentY = (gsap.getProperty(portrait, "y") as number) || 0;
      const portraitHeight = portraitRect.height;
      const portraitCenterDocY =
        portraitRect.top + window.scrollY - currentY + portraitHeight / 2;

      // Slot — offsetTop chain. The slot's ancestor chain has no static
      // transforms, and offsetTop is immune to the section's dynamic pin
      // transform, so this gives the natural docY at any scroll position.
      const slotCenterDocY = offsetToDocY(slot) + slot.offsetHeight / 2;

      const vh = window.innerHeight;
      const navClearance = getNavClearance();
      // The skills section sits below the fixed nav (via padding-top), so
      // the visual center the slot lands at during pin is the midpoint of
      // the area below the nav — not the viewport center.
      const visualCenterY = (vh + navClearance) / 2;
      const visualTargetDocY =
        slotCenterDocY - VISIBLE_BIAS_FRACTION * portraitHeight;
      const scrollB = Math.max(slotCenterDocY - visualCenterY, 1);
      const travel = Math.min(TRAVEL_WINDOW_FRACTION * vh, scrollB - 1);

      state.scrollB = scrollB;
      state.scrollA = Math.max(scrollB - travel, 0);
      state.pinDistance = SKILLS_PIN_FRACTION * vh;
      state.finalY = visualTargetDocY - portraitCenterDocY;
    };

    const apply = (scroll: number) => {
      const { scrollA, scrollB, pinDistance, finalY } = state;
      const motionEnd = scrollB + pinDistance;
      // Land partway into the pin, then DWELL at centre for the rest of it.
      // The descent used to span the whole pin, so the portrait only touched
      // centre on the last frame and then immediately scrolled back up — a
      // V-shaped bounce. Landing early + holding removes the up-bounce: it
      // arrives, rests through the reveal, then leaves with the section.
      const DESCENT_PIN_FRACTION = 0.35;
      const landScroll = scrollB + DESCENT_PIN_FRACTION * pinDistance;
      // y offset that keeps the portrait visually centred (so during the
      // dwell, y must track scroll 1:1 while the section is pinned).
      const holdConst = finalY - scrollB;
      // Cinematic scale ramp: 1.0 through the hero hold, grows to ~1.15 across
      // the descent, then holds. Independent of the px `y` translate.
      const SCALE_SETTLED = 1.15;
      let y: number;
      let scale: number;
      // Grade progress 0→1, scrubbed in lockstep with the descent (drives the
      // dusk grade + vignette via `--pg`; see globals.css). Reaches 1 on
      // landing and holds, so it reverses symmetrically with the descent.
      let pg: number;
      if (scroll <= scrollA) {
        // Hero hold — counter-translate so the portrait stays put in view.
        y = scroll;
        scale = 1;
        pg = 0;
      } else if (scroll < landScroll) {
        // Descent — linear from the hero hold down to the centred slot.
        const t = (scroll - scrollA) / (landScroll - scrollA);
        const yLand = holdConst + landScroll;
        y = scrollA + t * (yLand - scrollA);
        scale = 1 + t * (SCALE_SETTLED - 1);
        pg = t;
      } else if (scroll < motionEnd) {
        // Dwell — landed at centre; track scroll 1:1 so it stays fixed at
        // centre for the rest of the pin (no movement while the reveal plays).
        y = holdConst + scroll;
        scale = SCALE_SETTLED;
        pg = 1;
      } else {
        // Pin over — freeze y so the portrait scrolls away with the section
        // exactly once (no re-centering on refresh past the section).
        y = holdConst + motionEnd;
        scale = SCALE_SETTLED;
        pg = 1;
      }
      gsap.set(portrait, { y, scale });
      portrait.style.setProperty("--pg", String(pg));
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: () => {
          measure();
          return state.scrollB + state.pinDistance;
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.scroll()),
        onRefresh: () => apply(window.scrollY),
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
    });

    return () => {
      ctx.revert();
      gsap.set(portrait, { clearProps: "all" });
      portrait.style.removeProperty("--pg");
    };
  }, []);

  return null;
}

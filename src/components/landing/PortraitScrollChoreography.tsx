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
    gsap.set(portrait, { xPercent: -50, x: 0, y: 0, force3D: true });

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
      const yEnd = finalY + pinDistance;
      let y: number;
      if (scroll <= scrollA) {
        // Hero hold — counter-translate so the portrait is still in viewport.
        y = scroll;
      } else if (scroll < motionEnd) {
        // One continuous linear descent from the hero hold to the settled
        // slot position, spanning the entire travel window AND the pinned
        // reveal range. Linear so it tracks scroll 1:1 (~0.26× viewport
        // velocity given the visible delta over the scroll range), and so
        // the descent blends with the title + columns reveal — the whole
        // skills moment resolves on the same frame.
        const t = (scroll - scrollA) / (motionEnd - scrollA);
        y = scrollA + t * (yEnd - scrollA);
      } else {
        // Settled — portrait sits at slot docY and scrolls with the section.
        y = yEnd;
      }
      gsap.set(portrait, { y });
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 0,
        end: () => {
          measure();
          return state.scrollB + state.pinDistance;
        },
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        onUpdate: (self) => apply(self.scroll()),
        onRefresh: () => apply(window.scrollY),
      });
    });

    return () => {
      ctx.revert();
      gsap.set(portrait, { clearProps: "all" });
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SKILLS_PIN_FRACTION } from "./skills-config";

// Fraction of viewport height before the slot reaches viewport center at
// which the portrait starts its descent. The descent then extends through
// the pin range too (see apply()) — so the total motion window is
// `TRAVEL_WINDOW_FRACTION + SKILLS_PIN_FRACTION` of vh. Kept small so the
// descent begins essentially together with the bloom (the section is pulled up
// so the pin/bloom starts right as the hero text clears), not before it.
const TRAVEL_WINDOW_FRACTION = 0.06;

// The portrait's source image + mask leaves transparent space above the head,
// so the visible figure sits below the rect's geometric center. Lift the
// landing target by this fraction of the portrait's measured height so the
// visible head/shoulders land on the columns' vertical midline, not the
// rect center.
const VISIBLE_BIAS_FRACTION = 0.22;

// Hero text (greeting, wordmark, roles, CTA, locator — NOT the portrait) exits
// upward and fades over this scroll window, expressed as fractions of vh. It
// resolves well before the section pins, so by the time the dark bloom begins
// the hero identity is already gone and only the centred portrait remains.
const TEXT_FADE_START = 0.06;
const TEXT_FADE_END = 0.5;
// Extra upward drift on the exiting text (fraction of vh) layered on top of the
// natural scroll, so it lifts away a touch faster than the page — a quiet
// parallax exit rather than a flat scroll-off.
const TEXT_EXIT_LIFT = 0.07;

// Hero text that lifts up AND fades on exit. NOTE: the wordmark is faded via
// its two LAYERS (--main / --outline), not the `.hero-pratiush-stack-v3`
// wrapper. The wrapper has no z-index, so it stays transparent to stacking and
// lets the layers (z1 / z3) sandwich the portrait (z2). A transform/opacity on
// the WRAPPER would make it a stacking context and collapse both layers behind
// the portrait, breaking the sandwich. Each layer keeps its own z-index even
// with its own stacking context, so the sandwich survives when animated
// individually.
const HERO_LIFT_SELECTOR =
  ".hero-greeting-v3, .hero-pratiush-v3--main, .hero-pratiush-v3--outline, .hero-domains-v3, .hero-locator-v3";

// The "See my works" CTA fades on exit but is NOT lifted with a transform: it
// carries `transition: transform .25s` for its hover, and writing a transform
// every scroll frame would make that transition chase the scrubbed value a
// frame behind — a visible wiggle. Opacity has no transition, so fading it is
// frame-exact and smooth; it still rides up with the natural page scroll.
const HERO_CTA_SELECTOR = ".works-cta-v3";

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

    const heroLift = Array.from(
      document.querySelectorAll<HTMLElement>(HERO_LIFT_SELECTOR),
    );
    const heroCta = Array.from(
      document.querySelectorAll<HTMLElement>(HERO_CTA_SELECTOR),
    );

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
      vh: window.innerHeight,
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
      state.vh = vh;
    };

    // Hero text exit — drift up + fade over the early scroll, ahead of the pin.
    const applyText = (scroll: number) => {
      const { vh } = state;
      const t = gsap.utils.clamp(
        0,
        1,
        (scroll - TEXT_FADE_START * vh) / ((TEXT_FADE_END - TEXT_FADE_START) * vh),
      );
      const eased = t * t; // ease-in so it lingers, then leaves decisively
      if (heroLift.length) {
        gsap.set(heroLift, { opacity: 1 - eased, y: -TEXT_EXIT_LIFT * vh * eased });
      }
      // CTA: opacity only (see HERO_CTA_SELECTOR) — no transform, no wiggle.
      if (heroCta.length) gsap.set(heroCta, { opacity: 1 - eased });
    };

    const apply = (scroll: number) => {
      const { scrollA, scrollB, pinDistance, finalY } = state;
      const motionEnd = scrollB + pinDistance;
      // Land partway into the pin, then DWELL at centre for the rest of it.
      // The descent used to span the whole pin, so the portrait only touched
      // centre on the last frame and then immediately scrolled back up — a
      // V-shaped bounce. Landing early + holding removes the up-bounce: it
      // arrives, rests through the reveal, then leaves with the section.
      // Keep descending THROUGH the bloom, then DWELL for the rest of the pin.
      // The dark blooms from behind the portrait (SkillsSection tracks the
      // portrait's centre) while it is still travelling down, so the two read
      // as one immersive move rather than "land, then bloom". Lands at ~40% of
      // the pin; the bloom fills by ~50%, just after the portrait settles.
      const DESCENT_PIN_FRACTION = 0.4;
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
        onUpdate: (self) => {
          apply(self.scroll());
          applyText(self.scroll());
        },
        onRefresh: () => {
          apply(window.scrollY);
          applyText(window.scrollY);
        },
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
    });

    return () => {
      ctx.revert();
      gsap.set(portrait, { clearProps: "all" });
      portrait.style.removeProperty("--pg");
      if (heroLift.length) gsap.set(heroLift, { clearProps: "opacity,transform" });
      if (heroCta.length) gsap.set(heroCta, { clearProps: "opacity" });
    };
  }, []);

  return null;
}

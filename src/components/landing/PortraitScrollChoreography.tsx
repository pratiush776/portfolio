"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { depthRecede } from "@/lib/depth";
import { SKILLS_PIN_FRACTION } from "./skills-config";
import {
  setCloudCenter,
  setCloudClear,
  setCloudCoverage,
  setCloudFlow,
} from "./cloud-bridge";
import { setBloomCovers } from "../layout/nav-theme";

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

// Hero text (greeting, wordmark, roles, locator — NOT the portrait) exits by
// RECEDING in 3D: it lifts up, tilts its top edge back, translates away on Z
// (perspective shrinks it), blurs, and fades — like the camera flying past it.
// Window expressed as fractions of vh; per-element start is staggered (below)
// so the stack peels off top-first. Starts at 0 so the 3D recede engages from
// the very first pixel of scroll — i.e. exactly as the text begins lifting off
// with the page — rather than a beat later. The `power2.in` ease keeps that
// onset gentle so it ramps in immersively instead of snapping on.
const TEXT_FADE_START = 0;
const TEXT_FADE_END = 0.5;
// Upward drift (fraction of vh) layered on the natural scroll so the text lifts
// a touch faster than the page — feeds `maxLift` of the depth model.
const TEXT_EXIT_LIFT = 0.07;
// Per-element start offset (fraction of vh) between successive fan ranks, so the
// greeting peels off first and the locator last — you "pass" them one by one.
const TEXT_STAGGER = 0.05;

// Bold/cinematic recede magnitudes (px / deg) at full exit. Scaled per layer by
// its `depth` fan rank. Tunable by eye.
const RECEDE_MAX_Z = 500;
const RECEDE_MAX_TILT = 35;
const RECEDE_MAX_BLUR = 12;

// ── Cloud "sky" envelope (drives CloudDeck via cloud-bridge from this global
// scroll, so the clouds thicken DURING the hero recede — before the section
// pins — then part as the portrait settles and the sky opens). All tunable.
// Visible figure sits above the rect's geometric centre, so bias the parting
// origin up to seat it behind the head/torso.
const CLOUD_CENTER_BIAS = 0.42;
// Gentle base coverage at the very top of the page, so clouds already PEEK into
// the hero's lower region at rest (the canvas extends up there) — without any
// purple (the section no longer overlaps the hero). Thickens to full as you fly
// down toward the section.
const CLOUD_BASE = 0.12;
// The twilight surface (--sky) starts fading in once the rising clouds reach
// this density — so the blue sky condenses OUT of the clouds (not a surface
// sliding up). Driven off the monotonic "rising" coverage so, once in, it stays.
const SKY_FADE_AT = 0.4;
// After the pin, fade the whole fixed sky (twilight + clouds) out over this much
// scroll so RecentWorks below shows through cleanly (the sky never slides — it
// dissolves in place). Fraction of vh.
const SKY_EXIT_VH = 0.7;
// Scroll window (fraction of vh) over which the clouds thicken and the sky
// condenses in as you approach the pin. Keyed to a FIXED window ending at
// pinStart (capped by the available distance) so the thickening pace is the same
// regardless of how far the section sits below the hero — not a fraction of that
// distance, which made a close section slam to full coverage almost instantly.
const APPROACH_VH = 1.2;

// ── Skills "fly in and lock" reveal (driven here, in the single director, so it
// is frame-synced with the clouds/sky). All values are fractions of pinProgress
// (0→1 across the pin) and tunable by eye. Windows OVERLAP so it reads as a
// continuous look-left/look-right stream, slow and deliberate over the ~3vh pin.
const SKILL_REVEAL_START = 0.12; // pinProgress where the first item begins
const SKILL_REVEAL_STEP = 0.072; // gap between successive items (tighter = more overlap/weight)
const SKILL_REVEAL_DUR = 0.26; // each item's fly-in window (bigger = slower, heavier)
// (last item: START + 8*STEP + DUR = 0.956 — still settles inside the pin.)

// Every item EMANATES from the shared centre (the vanishing point) and flies
// OUT to its scattered rest — left chips, right cards and the title all behave
// the same, so nothing reads as "sliding in from the edge". The per-item start
// offset toward centre is measured (see measure() → r.fromX/fromY); here we only
// hold the depth + tilt magnitudes of the dive. No per-side rotationY (that
// asymmetry is what made left vs right look different). They share one vanishing
// point via the CSS `perspective` on .skills-inner-v3.
const SKILL_DIVE_Z = 1800; // how deep in Z each item starts (px, pre-perspective)
const SKILL_DIVE_TILT = 12; // gentle top-back tilt as it flies forward (deg)
// Once the parting front passes this, the dark twilight has filled behind the
// nav, so the off-white nav is allowed (see nav-theme bloomCovers signal).
const NAV_CLEAR_PROGRESS = 0.82;

// Easing (GSAP ease names). The hero RECEDE uses ease-in so the text lingers
// (readable) then accelerates back into depth. NOTE: the portrait descent is
// intentionally LINEAR (see apply) — easing its position fought the hero-hold's
// counter-translation and made the portrait lurch upward as the descent began.
const RECEDE_EASE = "power2.in";

// The front stroke layer fades out across this fraction of the wordmark's OWN
// recede progress (driven by the same eased tilt-back), so it dissolves while
// it tilts/translates back — reading as the stroke sinking behind the portrait
// — and is fully gone by 50% of the recede, before it would sit awkwardly in
// front of her at a steep tilt. Smaller = the stroke vanishes sooner.
const OUTLINE_FADE_FRACTION = 0.5;

// Hero elements that recede on exit, top-of-stack first (lower `order` peels
// off earlier). `depth` is the fan rank (0..1) scaling tilt + Z so the stack
// fans into the distance. All of these are DIRECT children of
// `.hero-composition-v3`, so the shared perspective reaches them. The wordmark's
// solid `--main` layer is here; its `--outline` layer is animated in LOCKSTEP
// with it (same geometry — see applyHeroExit) but fades out earlier, so the two
// never drift apart. The CTA's hover lift uses the CSS `translate` property, so
// GSAP can own `transform` here without a transition wiggle.
const WORDMARK_DEPTH = 0.85;
const WORDMARK_ORDER = 1;
const HERO_LAYER_SPECS: { selector: string; depth: number; order: number }[] = [
  { selector: ".hero-greeting-v3", depth: 1.0, order: 0 },
  { selector: ".hero-pratiush-v3--main", depth: WORDMARK_DEPTH, order: WORDMARK_ORDER },
  { selector: ".hero-domains-v3", depth: 0.62, order: 2 },
  { selector: ".hero-locator-v3", depth: 0.55, order: 2 },
  { selector: ".works-cta-v3", depth: 0.5, order: 3 },
];

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

    // Start the fixed twilight sky fully faded out on desktop so it can condense
    // out of the clouds (the CSS default of 1 is for the mobile / no-JS path).
    // Set on :root so the stage-level fixed sky-surface reads it.
    document.documentElement.style.setProperty("--sky", "0");

    // Resolve each receding layer to its element + depth/order spec.
    const heroLayers = HERO_LAYER_SPECS.map((spec) => ({
      el: document.querySelector<HTMLElement>(spec.selector),
      depth: spec.depth,
      order: spec.order,
    })).filter((l): l is { el: HTMLElement; depth: number; order: number } =>
      l.el !== null,
    );
    // The stroke layer (z3, in front of the photo) — animated in lockstep with
    // the wordmark below, but faded out early.
    const heroOutline = document.querySelector<HTMLElement>(
      ".hero-pratiush-v3--outline",
    );

    // Skills items, in reveal ORDER (alternating sides as you fly forward):
    // heading → card → trait → card … Each carries the side it flies in from.
    const skillTitle = section.querySelector<HTMLElement>("[data-skills-title]");
    const skillTraits = Array.from(
      section.querySelectorAll<HTMLElement>("[data-skills-soft]"),
    ); // [Clarity, Ownership, Cadence, Empathy]
    const skillCards = Array.from(
      section.querySelectorAll<HTMLElement>("[data-skills-tech]"),
    ); // [Interfaces, Systems, Delivery, Intelligence]
    // Reveal ORDER alternates the eye left↔right as you fly forward (title →
    // card → trait → card …) for a look-around rhythm — but every item flies in
    // the same way (out from centre). `fromX/fromY` is the centre→rest offset,
    // measured in measure().
    const reveals = (
      [
        skillTitle,
        skillCards[0],
        skillTraits[0],
        skillCards[1],
        skillTraits[1],
        skillCards[2],
        skillTraits[2],
        skillCards[3],
        skillTraits[3],
      ] as (HTMLElement | null)[]
    )
      .filter((el): el is HTMLElement => !!el)
      .map((el) => ({ el, fromX: 0, fromY: 0 }));

    gsap.registerPlugin(ScrollTrigger);

    // Parse the recede ease once (parseEase returns a reusable fn) — not per frame.
    const recedeEase = gsap.parseEase(RECEDE_EASE);
    // Item reveal: one firm decelerating lock drives the whole dive (fade, the
    // out-from-centre translate, depth and tilt all settle together) so each
    // item flies cleanly out to its rest with no inward fight.
    const revealEase = gsap.parseEase("power4.out");
    // Smoothstep for the cloud envelope easing.
    const smooth = (t: number) => t * t * (3 - 2 * t);
    // Nav-cover latch so we only push the flag on change, not every frame.
    let navCovered = true;

    // Park every item deep in space initially (so nothing flashes before the
    // first apply; they're below the fold at load anyway). The exact centre
    // offset is filled in on the first measure()/apply().
    for (const r of reveals) {
      gsap.set(r.el, {
        x: 0,
        y: 0,
        z: -SKILL_DIVE_Z,
        rotationX: SKILL_DIVE_TILT,
        opacity: 0,
        force3D: true,
      });
    }

    // The shared scatter stage the items are absolutely positioned within;
    // their centre→rest offsets are resolved against its centre in measure().
    const inner = section.querySelector<HTMLElement>(".skills-inner-v3");

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
      pinStart: 0,
      pinDistance: 0,
      finalY: 0,
      // Natural document-Y of the portrait centre (transform-free), cached in
      // measure() so apply() can derive the cloud parting origin per frame
      // WITHOUT a getBoundingClientRect read (no forced reflow on scroll).
      portraitCenterDocY: 0,
      portraitHeight: 0,
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
      state.portraitCenterDocY = portraitCenterDocY;
      state.portraitHeight = portraitHeight;

      // Each item's centre→rest offset, in the inner's own coordinate space.
      // offsetParent is `.skills-inner-v3` (the structural wrappers are
      // `display: contents`), and offsetLeft/Top/Width/Height are layout values
      // unaffected by the GSAP transform — so this is the rest position. The
      // reveal then animates from (centre) → (rest) so every item flies OUT
      // from the shared vanishing point.
      if (inner) {
        const innerCenterX = inner.clientWidth / 2;
        const innerCenterY = inner.clientHeight / 2;
        for (const r of reveals) {
          const restX = r.el.offsetLeft + r.el.offsetWidth / 2;
          const restY = r.el.offsetTop + r.el.offsetHeight / 2;
          r.fromX = innerCenterX - restX;
          r.fromY = innerCenterY - restY;
        }
      }
      // pinStart = the section's real document top = exactly where the pin
      // ScrollTrigger engages ("top top"). Keying the pin-phase (clouds, sky,
      // item reveals) to THIS — not the slot-based scrollB — keeps everything
      // frame-synced with the visual pin (no ~nav-height slip).
      state.pinStart = offsetToDocY(section);
      state.pinDistance = SKILLS_PIN_FRACTION * vh;
      state.finalY = visualTargetDocY - portraitCenterDocY;
      state.vh = vh;
    };

    // Hero exit — each element RECEDES in 3D (lift + tilt back + Z + blur +
    // fade), staggered top-first, over the early scroll ahead of the pin.
    const recedeAt = (scroll: number, depth: number, order: number) => {
      const { vh } = state;
      const span = (TEXT_FADE_END - TEXT_FADE_START) * vh; // per-element duration
      const stagger = TEXT_STAGGER * vh;
      const start = TEXT_FADE_START * vh + order * stagger;
      const p = gsap.utils.clamp(0, 1, (scroll - start) / span);
      return depthRecede(recedeEase(p), {
        depth,
        maxZ: RECEDE_MAX_Z,
        maxTilt: RECEDE_MAX_TILT,
        maxBlur: RECEDE_MAX_BLUR,
        maxLift: TEXT_EXIT_LIFT * vh,
      });
    };

    const applyHeroExit = (scroll: number) => {
      for (const layer of heroLayers) {
        const t = recedeAt(scroll, layer.depth, layer.order);
        gsap.set(layer.el, {
          y: t.y,
          z: t.z,
          rotationX: t.rotationX,
          opacity: t.opacity,
          filter: t.filter,
        });
      }

      // Stroke layer: rides in LOCKSTEP with the solid wordmark (same recede
      // geometry, so the two never drift apart). Its fade is driven by the
      // wordmark's OWN eased recede progress — not a separate window — so the
      // stroke dissolves AS it tilts/translates back, reading as it sinking
      // behind the portrait. It can never paint behind the photo in a flat
      // parent, so it's fully gone by OUTLINE_FADE_FRACTION of the recede,
      // before a steep tilt would leave it awkwardly in front of her. autoAlpha
      // ends it at visibility:hidden so it stops compositing.
      if (heroOutline) {
        const t = recedeAt(scroll, WORDMARK_DEPTH, WORDMARK_ORDER);
        // depthRecede sets opacity = 1 - easedProgress, so recover the eased
        // progress that also drives the tilt/Z, and map the fade onto it.
        const progress = 1 - t.opacity;
        const fade = gsap.utils.clamp(0, 1, progress / OUTLINE_FADE_FRACTION);
        gsap.set(heroOutline, {
          y: t.y,
          z: t.z,
          rotationX: t.rotationX,
          filter: t.filter,
          autoAlpha: 1 - fade,
        });
      }
    };

    const apply = (scroll: number) => {
      const {
        scrollA,
        scrollB,
        pinStart,
        pinDistance,
        finalY,
        portraitCenterDocY,
        portraitHeight,
        vh,
      } = state;
      const pinEnd = pinStart + pinDistance;
      // Land a FIXED distance into the pin, then DWELL at centre for the rest.
      // Decoupled from pinDistance (which is now ~2vh): a fraction-of-pin descent
      // would stretch the landing to ~0.8vh and feel sluggish. A fixed ~0.5vh
      // window keeps the descent brisk so the portrait settles early and then
      // dwells through the long one-at-a-time reveal. (Landing early + holding
      // also avoids the old V-shaped up-bounce.)
      const DESCENT_VH_FRACTION = 0.5;
      const landScroll = scrollB + Math.min(DESCENT_VH_FRACTION * vh, pinDistance);
      // y offset that keeps the portrait visually centred (so during the
      // dwell, y must track scroll 1:1 while the section is pinned).
      const holdConst = finalY - scrollB;
      // Cinematic scale ramp: 1.0 through the hero hold, grows to ~1.15 across
      // the descent, then holds. Independent of the px `y` translate.
      const SCALE_SETTLED = 1.26;
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
        // Descent — LINEAR from the hero hold down to the centred slot. The hold
        // counter-translates the portrait (y tracks scroll 1:1) to pin it in
        // view; an ease-in here would drop that counter-translation to zero
        // velocity at the descent start, letting the page scroll drag the
        // portrait UPWARD before the descent pulls it down — a visible lurch.
        // Linear keeps a constant rate across the junction; the dwell settles it.
        const t = (scroll - scrollA) / (landScroll - scrollA);
        const yLand = holdConst + landScroll;
        y = scrollA + t * (yLand - scrollA);
        // Position stays LINEAR (see above — easing it fights the hero-hold
        // counter-translation). Scale alone gets a quad ease-out so the portrait
        // visibly *settles* on landing instead of growing at a constant rate.
        const scaleT = t * (2 - t);
        scale = 1 + scaleT * (SCALE_SETTLED - 1);
        pg = t;
      } else if (scroll < pinEnd) {
        // Dwell — landed at centre; track scroll 1:1 so it stays fixed at
        // centre for the rest of the pin (no movement while the reveal plays).
        y = holdConst + scroll;
        scale = SCALE_SETTLED;
        pg = 1;
      } else {
        // Pin over — freeze y so the portrait scrolls away with the section
        // exactly once (no re-centering on refresh past the section).
        y = holdConst + pinEnd;
        scale = SCALE_SETTLED;
        pg = 1;
      }
      gsap.set(portrait, { y, scale });
      portrait.style.setProperty("--pg", String(pg));

      // ── Phase progresses, all keyed to the REAL pin (pinStart) ────────────
      // Thicken over a fixed window ending at pinStart (capped by the distance
      // actually available), so the pace is layout-independent.
      const approachSpan = Math.min(APPROACH_VH * vh, pinStart);
      const approach = gsap.utils.clamp(
        0,
        1,
        (scroll - (pinStart - approachSpan)) / Math.max(approachSpan, 1),
      );
      const pinProgress = gsap.utils.clamp(0, 1, (scroll - pinStart) / pinDistance);
      const exitP = gsap.utils.clamp(0, 1, (scroll - pinEnd) / (SKY_EXIT_VH * vh));

      // ── Clouds ────────────────────────────────────────────────────────────
      // coverage drives the deck's overall opacity; clear drives the radial
      // PARTING mask; flow drives the per-layer fly-through parallax. The deck is
      // dense cloud images with real sky gaps, so the parting is done by the MASK
      // (clear), NOT by fading coverage — coverage HOLDS at full through the pin so
      // the bank stays present while the mask tears a growing hole from the
      // portrait outward, then dissolves on exit. (Fading coverage here too would
      // read as the whole bank dimming rather than parting.)
      // Fly INTO a thickening bank on approach (peek → full), HOLD it dense across
      // the pin while the mask opens, then dissolve any remainder on exit.
      const coverage =
        scroll < pinStart
          ? CLOUD_BASE + (1 - CLOUD_BASE) * smooth(approach)
          : scroll < pinEnd
            ? 1
            : 1 - exitP;
      // Parting opens a hair INTO the pin (you fly into the bank for a beat
      // before it tears), then sweeps fully open across the rest of the pin.
      const clear =
        scroll < pinStart
          ? 0
          : smooth(gsap.utils.clamp(0, 1, (pinProgress - 0.06) / 0.94));
      const flow = gsap.utils.clamp(0, 1.2, scroll / Math.max(pinEnd, 1));

      // Parting origin = portrait centre, biased UP to seat behind the head.
      // Derived from the cached natural docY + this frame's `y` (no rect read,
      // so no forced reflow on scroll). CLOUD_CENTER_BIAS < 0.5 lifts the origin
      // above the geometric centre by that fraction of the portrait's height.
      const portraitScreenY = portraitCenterDocY + y - window.scrollY;
      setCloudCenter(
        window.innerWidth / 2,
        portraitScreenY - (0.5 - CLOUD_CENTER_BIAS) * portraitHeight,
      );
      setCloudCoverage(coverage);
      setCloudClear(clear);
      setCloudFlow(flow);

      // ── Sky (viewport-FIXED, full-screen; never slides) ───────────────────
      // Condenses out of the rising clouds (past SKY_FADE_AT), holds through the
      // pin, then DISSOLVES in place on exit so RecentWorks shows through.
      const cloudRise = CLOUD_BASE + (1 - CLOUD_BASE) * smooth(approach);
      const skyForm = smooth(
        gsap.utils.clamp(0, 1, (cloudRise - SKY_FADE_AT) / (1 - SKY_FADE_AT)),
      );
      document.documentElement.style.setProperty("--sky", String(skyForm * (1 - exitP)));

      // ── Bloom (the warm keylight behind the portrait) — EXPANDS from 0 as the
      // sky parts, instead of being a full-size glow that the cloud mask merely
      // uncovers (which read as a sudden pop). Driven by the parting `clear` so it
      // blooms outward in lockstep with the clouds opening, then holds full.
      document.documentElement.style.setProperty("--bloom", String(clear));

      // ── Ghost word — the oversized editorial backdrop letterform behind the
      // constellation. Rides the SAME envelope as the twilight surface (condenses
      // in as the sky forms, holds through the pin, dissolves on exit) so it reads
      // as part of the section emerging, never a flat always-on watermark.
      document.documentElement.style.setProperty(
        "--ghost",
        String(skyForm * (1 - exitP)),
      );

      // ── Item reveals — one at a time, each flying OUT from the shared centre
      // (the vanishing point) to its scattered rest: start at (centre, deep Z,
      // tilted), settle to (rest, z 0, flat). Pure functions of pinProgress (no
      // timeline), so they stay frame-locked to the clouds/sky, and symmetric
      // left↔right. They share one vanishing point via the CSS perspective on
      // .skills-inner-v3.
      for (let i = 0; i < reveals.length; i++) {
        const r = reveals[i];
        const start = SKILL_REVEAL_START + i * SKILL_REVEAL_STEP;
        const lp = gsap.utils.clamp(0, 1, (pinProgress - start) / SKILL_REVEAL_DUR);
        const e = revealEase(lp);
        const out = 1 - e; // 1 at centre/deep, 0 at rest
        gsap.set(r.el, {
          opacity: e,
          x: r.fromX * out,
          y: r.fromY * out,
          z: -SKILL_DIVE_Z * out,
          rotationX: SKILL_DIVE_TILT * out,
          force3D: true,
        });
      }

      const covered = clear >= NAV_CLEAR_PROGRESS;
      if (covered !== navCovered) {
        navCovered = covered;
        setBloomCovers(covered);
      }
    };

    const ctx = gsap.context(() => {
      // PIN — holds the skills section fixed for the sequence. Animation-free:
      // this trigger ONLY pins; every value is driven by the director below, so
      // there is a single source of truth (its "top top" start === state.pinStart).
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${SKILLS_PIN_FRACTION * window.innerHeight}`,
        pin: true,
        pinType: "transform",
        pinSpacing: true,
        invalidateOnRefresh: true,
      });

      // DIRECTOR — one trigger over the whole journey drives hero recede,
      // portrait, clouds, sky, and the item reveals from a single scroll value.
      // Runs a touch past the pin so the sky/clouds can dissolve on exit.
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: () => {
          measure();
          return state.pinStart + state.pinDistance + SKY_EXIT_VH * state.vh;
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          apply(self.scroll());
          applyHeroExit(self.scroll());
        },
        onRefresh: () => {
          apply(window.scrollY);
          applyHeroExit(window.scrollY);
        },
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
    });

    return () => {
      ctx.revert();
      // Clear the sky/clouds and restore the nav default so nothing lingers if
      // this choreography unmounts mid-sequence.
      setCloudCoverage(0);
      setCloudClear(0);
      setCloudFlow(0);
      setBloomCovers(true);
      document.documentElement.style.removeProperty("--sky");
      document.documentElement.style.removeProperty("--bloom");
      document.documentElement.style.removeProperty("--ghost");
      gsap.set(portrait, { clearProps: "all" });
      portrait.style.removeProperty("--pg");
      const heroEls = heroLayers.map((l) => l.el);
      if (heroEls.length) {
        gsap.set(heroEls, { clearProps: "opacity,transform,filter" });
      }
      if (heroOutline) {
        gsap.set(heroOutline, {
          clearProps: "opacity,visibility,transform,filter",
        });
      }
      if (reveals.length) {
        gsap.set(
          reveals.map((r) => r.el),
          { clearProps: "opacity,transform" },
        );
      }
    };
  }, []);

  return null;
}

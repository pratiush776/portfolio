"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { navDissolveMask } from "@/lib/navDissolve";
import { HeroThesis } from "./HeroThesis";

/**
 * The thesis as its OWN scrolling beat. It's a normal-flow section that scrolls THROUGH the viewport
 * via real document scroll (no scripted translate), cresting up through the still-pinned hero by a
 * negative margin (the same overlap trick the first project card uses — see `.thesis-beat-v4` in
 * globals.css). The only scripted thing is the per-word ink-on, a GSAP scrub timeline that writes the
 * statement on as the beat rises into view.
 *
 * Reduced motion: the GSAP setup is skipped entirely; CSS renders the statement fully inked + static.
 */

// Tuning knobs for the ink-on (scrubbed to scroll as the beat crests in). Start/end are ScrollTrigger
// positions: "beat-edge viewport-edge". The crest GEOMETRY (when it enters at all) is the
// `.thesis-beat-v4` margin-top / min-height in globals.css.
const INK_START = "top 78%"; // beat top reaches 78% down the viewport → words begin writing on
const INK_END = "top 38%"; // beat top reaches 38% down → fully inked, settled into its read
const INK_STAGGER = 0.16; // per-word offset along the (scrubbed) timeline — the wash, not a tick

// Forward parallax LEAD: the statement rides up FASTER than scroll across its travel, so the intro
// clears SOONER — ahead of the steadier PROJECTS title, which rides up at scroll speed (HeroSection
// TITLE_LAG is 0; the title can't lag without being clipped by the hero's overflow:hidden box).
//
// PURPOSE → VELOCITY: the thesis is the lighter, smaller COUNTERPOINT — a value-prop note that crests in
// beside PROJECTS, is read, then gets out of the way so NILINK has a clean stage. So it leads (over
// scroll speed), reading as the nearer/quicker plane that whisks off first, against the title's steady
// 1:1. This LEAD is the whole velocity difference between the two — more negative = snappier / leads
// more, widening the gap; less negative = the two travel closer together. Pushed hard so the depth
// split reads clearly: the thesis visibly outruns the title rather than drifting just ahead of it.
const THESIS_LEAD = "-80vh";

export function HeroThesisBeat() {
  const scope = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;

  useGSAP(
    () => {
      if (reduce) return; // CSS shows the statement fully inked; no ScrollTrigger under reduced motion

      // Trigger off the statement BLOCK's own viewport position (not the deeply-margined section), so
      // the ink timing stays stable as the crest margin is tuned — the words write on as the block
      // actually rises into view, right as the morph finishes.
      const block = scope.current?.querySelector<HTMLElement>(".hero-thesis-v4");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: block,
          start: INK_START,
          end: INK_END,
          scrub: 0.5,
        },
        defaults: { ease: "power2.out", duration: 0.6 },
      });

      // The ink wipes left→right across each word (clip-path), staggered in reading order so the line
      // washes in as one gesture rather than ticking word by word.
      tl.fromTo(
        ".hero-thesis-v4__ink",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", stagger: INK_STAGGER },
        0,
      );
      // The faint guide rides ahead of the ink, then fades to nothing as each word's wipe completes.
      tl.fromTo(
        ".hero-thesis-v4__ghost",
        { autoAlpha: 0.045 },
        { autoAlpha: 0, ease: "none", stagger: INK_STAGGER },
        0.05,
      );

      // Forward parallax LEAD on the whole block — adds upward travel across its pass so the thesis
      // moves FASTER than scroll and clears before the lingering title. Its own scroll range (the full
      // travel), separate from the ink scrub above.
      //
      // EXIT DISSOLVE — same viewport-anchored top feather the title uses (the one shared mechanic, see
      // navDissolveMask). Driven off this scrub's onUpdate so it reads the block's REAL top each frame —
      // already carrying the LEAD `y` above — and melts the statement into the band just below the nav
      // as it rises, instead of letting it slide under the fixed nav. onUpdate fires across the block's
      // whole pass; off either end the block is out of frame so the last mask state is moot.
      if (block) {
        const dissolve = () => {
          const mask = navDissolveMask(
            block.getBoundingClientRect().top,
            window.innerHeight,
          );
          block.style.webkitMaskImage = mask;
          block.style.maskImage = mask;
        };
        gsap.fromTo(
          block,
          { y: 0 },
          {
            y: THESIS_LEAD,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              onUpdate: dissolve,
              onRefresh: dissolve,
            },
          },
        );
        dissolve();
      }
    },
    { scope, dependencies: [reduce] },
  );

  return (
    <section className="thesis-beat-v4" ref={scope}>
      <HeroThesis />
    </section>
  );
}

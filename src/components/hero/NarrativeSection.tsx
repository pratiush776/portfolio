"use client";

import { useRef } from "react";
import {
  cubicBezier,
  motion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";

import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroThesis } from "@/components/hero/HeroThesis";
import {
  GLOW_DRIFT,
  GLOW_PERSONA,
  MANIFESTO_IN,
  THESIS_IN,
} from "@/components/hero/heroTimeline";
import { MorphName } from "@/components/hero/MorphName";
import { useIntro } from "@/components/intro/IntroProvider";
import { CapabilityList } from "@/components/persona/CapabilityList";
import { ScrollInk } from "@/components/persona/ScrollInk";
import { TechDNA } from "@/components/persona/TechDNA";
import { ProjectsIndex } from "@/components/works/ProjectsIndex";
import { BEAT, INTRO_EASE, SNAP_EASE, type Beat } from "@/lib/intro";
import { useNavDissolveMask } from "@/lib/navDissolve";
import { useScrubReveal } from "@/lib/reveal";

/**
 * THE PERSISTENT-TITLE TRACK — the landing's whole opening under one docked title that morphs
 * PRATIUSH → PERSONA → PROJECTS, then EXITS before the projects grid so the grid stands alone.
 *
 * The structure (keep this map + the CSS coupling comments loud):
 *   • `.narrative-track-v4` (OUTER) — `position: relative`, a plain wrapper for the stage + grid.
 *   • `.narrative-stage-v4` — the SCRUBBED STAGE, a fixed height (== PINNED_VH + 100svh) AND the sticky
 *     title's containing block. ONE `useScroll({target: stageRef, offset:["start start","end end"]})`
 *     over it is the MASTER progress that drives the morphs / DNA / glow / thesis / title-exit. Fixed
 *     height, so every beat-sheet fraction stays stable no matter how tall the grid grows. It holds:
 *     the ATMOSPHERE (sticky), the DNA rail (sticky), the CHAPTER FLOW column, and the TITLE RAIL.
 *   • `.narrative-title-rail-v4` (last child of the STAGE) — the sticky docked title. Because its
 *     containing block is the stage, it docks over the hero/persona/caps and then LIFTS + FADES out at
 *     the stage's end (titleExit*, progress-driven), fully gone by progress 1.
 *   • `<ProjectsIndex/>` — the magazine grid, in NORMAL FLOW after the stage, scrolling UP into the
 *     clean space the title has just vacated. Drives NO master progress (its own whileInView reveals).
 *
 * The name morphs PRATIUSH → PERSONA → PROJECTS and STAYS FULL SIZE the whole time (no dock scale) —
 * it travels up to its dock, sticks, morphs, HOLDS PROJECTS as the spacious section intro, then exits.
 * Every scheduled beat lives in heroTimeline.ts.
 *
 * The stage still stamps the two intro gates as data attributes:
 *   • data-backdrop  — drives the decor BLOOM (glow / aurora / smoke / grain fade up).
 *   • data-foreground — gates the copy + name entrance.
 */
const hidden = (beat: Beat) => ({ y: beat.y, opacity: 0 });
const shown = { y: 0, opacity: 1 } as const;

export function NarrativeSection() {
  const { backdropIn, foregroundIn, reduce } = useIntro();

  // The fixed-height STAGE — the MASTER progress AND (now) the sticky title's containing block. The
  // title lives INSIDE the stage, so it docks, morphs, holds, then rides out at the stage's END —
  // BEFORE the projects grid, which follows the stage in normal flow and scrolls up into clean space.
  // `["start start", "end end"]` over a stage of height (PINNED_VH + 100svh) makes progress 1 ==
  // PINNED_VH of scroll, exactly the beat-sheet's unit.
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  // TITLE EXIT — the docked title (reading PROJECTS, "Featured" eyebrow landed) HOLDS as the section's
  // spacious intro through the thesis beat, then LIFTS and FADES over the final stretch of the master
  // progress so it is fully gone by progress 1 — the instant the stage ends and the projects grid
  // scrolls up beneath it. Progress-driven, NOT a mixed-unit sticky-release: the hand-off cannot drift,
  // so PROJECTS never sits over the cards (the whole point of this rework). "Featured" finishes inking
  // by ~0.94 (FEATURED_IN), so the exit starts just after.
  const titleExitY = useTransform(scrollYProgress, [0.94, 1], ["0vh", "-16vh"], {
    ease: cubicBezier(...INTRO_EASE),
  });
  const titleExitOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

  // The thesis PARALLAX rise — the statement travels UP from below the fold toward the top over
  // THESIS_IN, at a rate different from raw scroll (a big travel across a short window = parallax feel),
  // INTRO_EASE. HeroThesis owns the fade-in; this owns the climb. It rises as the projects frame composes
  // and crests as PROJECTS lands.
  const thesisRise = useTransform(scrollYProgress, [...THESIS_IN], ["68vh", "-20vh"], {
    ease: cubicBezier(...INTRO_EASE),
  });

  // The C0 hero-copy scrub-fade assist: the lockup scrolls away NATURALLY, and this gentle fade over
  // roughly the SECOND HALF of C0 keeps anything legible from sliding across the docked title zone. One
  // block-level fade — the sub-elements ride it together. (The DOCK scale scrub is GONE — the name stays
  // full size and simply travels up and sticks.)
  const copyFade = useScrubReveal(scrollYProgress, [MANIFESTO_IN[0] * 0.4, MANIFESTO_IN[0] * 0.85], {
    y: -40,
    dir: "out",
  });

  // The name morphs in place (left-anchored), so the warm pool doesn't chase it — but it DOES move with
  // the narrative, in two eased sweeps with a flat rest between: GLOW_PERSONA eases it RIGHT (→ 7vw) to
  // sit between the manifesto (left) and the helix (right), it RESTS there through C1, then GLOW_DRIFT
  // sweeps it back LEFT (→ −5vw) as PROJECTS lands. A per-segment ease array (snap / hold / snap) drives
  // one keyframed transform. (GLOW_PERSONA[1] < GLOW_DRIFT[0], so the inputs are strictly increasing.)
  const snap = cubicBezier(...SNAP_EASE);
  const hold = (v: number) => v; // identity — the flat middle rest segment
  const glowX = useTransform(
    scrollYProgress,
    [GLOW_PERSONA[0], GLOW_PERSONA[1], GLOW_DRIFT[0], GLOW_DRIFT[1]],
    ["0vw", "7vw", "7vw", "-5vw"],
    { ease: [snap, hold, snap] },
  );

  // The docked title + thesis melt into the fixed band just below the nav as a SINGLE unit on the
  // ride-out — the viewport-anchored top feather, read live from the title's real position each frame
  // (so it stays pinned at the nav line through the dock AND the release).
  const titleRef = useRef<HTMLDivElement>(null);
  const titleMask = useNavDissolveMask(titleRef);

  // The flow content dissolves under the nav as it scrolls up. navDissolveMask reads the element's OWN
  // box top, so it must go on the individual BLOCKS (whose tops actually pass the nav line), NOT the
  // full-stage flow column (whose top sits far above the viewport for most of the scroll — its
  // element-box-relative gradient offsets would then fall outside the visible portion and mis-mask).
  const copyRef = useRef<HTMLDivElement>(null);
  const copyMask = useNavDissolveMask(copyRef);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const manifestoMask = useNavDissolveMask(manifestoRef);

  // One entrance recipe for every C0 copy element: rise + fade on the foreground gate, on the shared
  // schedule. Reduced motion settles to the final state with no transform/transition.
  const entrance = (beat: Beat) => ({
    initial: reduce ? false : hidden(beat),
    animate: reduce ? shown : foregroundIn ? shown : hidden(beat),
    transition: reduce
      ? { duration: 0 }
      : { duration: beat.duration, ease: INTRO_EASE, delay: beat.delay },
  });

  return (
    <div className="narrative-track-v4">
      {/* The page's real heading — the visible name is decorative text. */}
      <h1 className="visually-hidden">
        Pratiush — Software Engineer, Product &amp; Design
      </h1>

      {/* ── THE SCRUBBED STAGE — fixed height, drives the master progress. Atmosphere + DNA + flow. ── */}
      <div ref={stageRef} className="narrative-stage-v4">
        {/* ── ATMOSPHERE (z 0) — one sticky viewport of warm field behind the whole stage. ── */}
        <section
          className="hero-root-v3"
          data-backdrop={backdropIn ? "in" : "out"}
          data-foreground={foregroundIn ? "in" : "out"}
        >
          {/* No hero-specific base field — the page-wide SectionAurora shows through as the single
              continuous background; the hero only layers its warm atmosphere on top, feather-masked
              at the bottom so it dissolves into the scroll. */}
          <HeroAurora />
          <motion.div className="hero-glow-drift-v4" style={{ x: glowX }} aria-hidden>
            <RadialGlow />
          </motion.div>
          <div className="neon-bg-v3">
            <FluidSmoke
              // WARM amber dye (was cream #FFF4E6): the near-white cream, screened over the warm field,
              // read as a cool/greyish cloud during the persona beat (user-flagged). A warm amber keeps
              // any wisp on the terracotta/amber family so it never reads as an out-of-place block.
              color="#F6C89A"
              className="fluid-smoke-v3"
              // Tuned for natural smoke over a smooth fluid blob (unchanged from the pinned hero):
              curl={2.5}
              splatForce={500}
              densityDissipation={0.8}
              velocityDissipation={0.3}
              dyeRadius={0.002}
            />
          </div>
          <div className="hero-grain-v3" aria-hidden />
        </section>

        {/* ── DNA RAIL (z 2) — the helix counterweight in the right void, spanning the stage; its sticky
            child holds TechDNA at the same inset/width as the old .hero-persona-dna-v4. ── */}
        <div className="narrative-dna-rail-v4" aria-hidden>
          <div className="narrative-dna-rail-v4__sticky">
            <TechDNA progress={scrollYProgress} />
          </div>
        </div>

        {/* ── CHAPTER FLOW (z 3) — in-flow content that scrolls past the docked title. Each BLOCK carries
            its own nav-dissolve mask (see the copyRef/manifestoRef note above). ── */}
        <div className="narrative-flow-v4">
          {/* C0 — the full hero lockup (~1 viewport): script greeting "Hi, I'm" ABOVE the name, then
              the role line, the serif tagline, and the "Based in USA" locator at the foot — one composed
              lockup. Entrance on the foreground gate; exit is a gentle scrub-fade assist (no scripted
              cascade), plus the nav-dissolve feather on the way up. */}
          <motion.div
            ref={copyRef}
            className="narrative-copy-v4"
            style={
              reduce
                ? undefined
                : ({
                    ...copyFade,
                    WebkitMaskImage: copyMask,
                    maskImage: copyMask,
                  } as MotionStyle)
            }
          >
            <motion.p className="hero-eyebrow-v4" aria-hidden {...entrance(BEAT.eyebrow)}>
              Hi, I&apos;m
            </motion.p>

            {/* Spacer that clears the FULL-SIZE name's height (em of the name's font-size so it tracks
                --name-hero-size). The docked title lives in the title rail, not here, so this column
                just reserves the name's room in the C0 composition — the name never scales, so the
                reservation is the full name box (no 0.52 shrink to account for). */}
            <div className="narrative-name-gap-v4" aria-hidden />

            <motion.p className="hero-roles-v4" {...entrance(BEAT.roles)}>
              Software Engineer · Product &amp; Design
            </motion.p>

            <motion.p className="hero-tagline-v4" {...entrance(BEAT.tagline)}>
              <span className="hero-tagline-v4__line">Good products feel obvious.</span>
              <span className="hero-tagline-v4__line">Getting there isn&apos;t.</span>
            </motion.p>

            {/* The locator joins the copy column (its own corner treatment can't survive a scrolling
                flow cleanly) — kept quiet, a tracked-caps line at the foot of the C0 composition. */}
            <motion.span
              className="hero-meta-v4 hero-meta-v4--flow"
              aria-label="Based in USA"
              {...entrance(BEAT.meta)}
            >
              <span>Based in USA</span>
            </motion.span>
          </motion.div>

          {/* C1 — the PERSONA block: the manifesto paragraph AND the compact capability spine, held
              TOGETHER as one composed block under the docked title. It rises during the title's travel
              (dovetail), then STICKS below the docked title (--content-top) and HOLDS fully visible
              through the whole persona/capabilities beat — the manifesto never fades after it inks in
              (it is the persona statement); the two just scroll away together in C2 via the nav-dissolve
              feather. The SPAN wrapper's height bounds the sticky hold (a margin can't — only the
              containing block's edge releases a sticky). Manifesto on top (inks word-by-word), the
              compact capability spine directly below it (one line active at a time). */}
          <div className="narrative-persona-span-v4">
            <motion.div
              ref={manifestoRef}
              className="narrative-persona-v4"
              style={
                reduce
                  ? undefined
                  : ({
                      WebkitMaskImage: manifestoMask,
                      maskImage: manifestoMask,
                    } as MotionStyle)
              }
            >
              {reduce ? (
                <p className="scroll-ink-v4 scroll-ink-v4--static">
                  I live where design taste meets engineering logic. Unfamiliar
                  problems are the fun part — I sit with them, pull them apart, and
                  stay until the answer feels obvious.
                </p>
              ) : (
                <ScrollInk
                  text="I live where design taste meets engineering logic. Unfamiliar problems are the fun part — I sit with them, pull them apart, and stay until the answer feels obvious."
                  progress={scrollYProgress}
                  window={MANIFESTO_IN}
                />
              )}

              <CapabilityList progress={scrollYProgress} />
            </motion.div>
          </div>

          {/* The tail spacer completes the flow column to the stage height (see the flow arithmetic in
              globals.css .narrative-persona-span-v4 / .narrative-tail-v4). */}
          <div className="narrative-tail-v4" aria-hidden />

          {/* C2 — no flow content: the thesis parallaxes up in the sticky title layer as MORPH 2 lands. */}
        </div>

        {/* ── TITLE RAIL (z 4) — the sticky DOCKED TITLE, now a CHILD OF THE STAGE (its containing
            block), so it docks over the hero/persona/caps and then LIFTS + FADES out at the stage's
            END (titleExit*), BEFORE the projects grid. pointer-events:none except the title. The rail's
            padding-top spacer makes the title travel EXACTLY TRAVEL_VH of scroll at page speed before it
            docks (the spacer + TRAVEL_VH must move together — see globals.css). ── */}
        <div className="narrative-title-rail-v4">
          <motion.div
            ref={titleRef}
            className="narrative-title-v4"
            style={
              reduce
                ? undefined
                : ({
                    y: titleExitY,
                    opacity: titleExitOpacity,
                    WebkitMaskImage: titleMask,
                    maskImage: titleMask,
                  } as MotionStyle)
            }
          >
            {/* The name — FULL SIZE the whole time (no dock scale), left-anchored (the P never moves). It
                just travels up to its dock and sticks, then morphs. */}
            <MorphName progress={scrollYProgress} />

            {/* The thesis composes as the C2 transition statement — a layer of the sticky title that
                PARALLAXES up from below the fold. Driven by THESIS_IN (the `y` rise here + HeroThesis's
                fade), it rides out with the title. */}
            <div className="hero-thesis-layer-v4">
              <motion.div style={reduce ? undefined : { y: thesisRise }}>
                <HeroThesis progress={scrollYProgress} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── PROJECTS GRID — normal flow AFTER the stage, scrolling UP into the clean space the docked
          title has just vacated (PROJECTS lifted + faded out at the stage's end). Drives no master
          progress (its own whileInView reveals); the fixed SectionAurora (page.tsx) is the field. ── */}
      <ProjectsIndex />
    </div>
  );
}

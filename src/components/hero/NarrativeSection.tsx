"use client";

import { useRef, type CSSProperties } from "react";
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
  HERO_COPY_OUT,
  MANIFESTO_IN,
  PERSONA_GATE_IN,
  PERSONA_OUT,
  PERSONA_SPAN_VH,
  PROJECTS_PULL_VH,
  STAGE_H_VH,
  TRAVEL_VH,
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
 * The structure:
 *   • `.narrative-track-v4` (OUTER) — `position: relative`, wrapper for the stage + grid. It carries
 *     the injected GEOMETRY VARS (--stage-h / --travel / --persona-span) so heroTimeline.ts is the
 *     single source of truth for the track's dimensions — the CSS only reads the vars.
 *   • `.narrative-stage-v4` — the SCRUBBED STAGE (height: var(--stage-h)). ONE
 *     `useScroll({target: stageRef, offset:["start start","end end"]})` over it is the MASTER
 *     progress that drives the morphs / reveals / DNA / thesis. It holds the atmosphere, DNA rail,
 *     thesis rail, and chapter-flow column.
 *   • `.narrative-title-rail-v4` — spans the OUTER track (stage + projects) so PROJECTS stays docked
 *     while the grid scrolls beneath it; releases on the rail's bottom edge (CSS), no fade.
 *   • `<ProjectsIndex/>` — the magazine grid, in normal flow after the stage, scrolling up under the
 *     still-docked PROJECTS title (padding-top clears the title zone).
 *
 * Every scheduled beat lives in heroTimeline.ts. The stage stamps the two intro gates as data
 * attributes (data-backdrop → decor bloom; data-foreground → copy + name entrance).
 */
const hidden = (beat: Beat) => ({ y: beat.y, opacity: 0 });
const shown = { y: 0, opacity: 1 } as const;

/* The geometry vars, injected once from the beat sheet (heroTimeline.ts) — the CSS consumes these,
   so a chapter re-budget is a one-file change and the old TS↔CSS hand-coupling cannot drift. */
const GEOMETRY_VARS = {
  "--stage-h": `${STAGE_H_VH}svh`,
  "--travel": `${TRAVEL_VH}svh`,
  "--persona-span": `${PERSONA_SPAN_VH}svh`,
  "--projects-pull": `${PROJECTS_PULL_VH}svh`,
} as CSSProperties;

export function NarrativeSection() {
  const { backdropIn, foregroundIn, reduce } = useIntro();

  // The fixed-height STAGE — the MASTER progress and the sticky title's containing block.
  // `["start start", "end end"]` over a stage of height (PINNED_VH + 100svh) makes progress 1 ==
  // PINNED_VH of scroll, exactly the beat-sheet's unit.
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  // THE TITLE'S ONE MOVE: it docks and stays onstage through the WHOLE narrative — persona, thesis,
  // MORPH 2 — and then NEVER fades (the old TITLE_EXIT lift+fade cut the composed PROJECTS intro
  // short, user-flagged): the grid rises to a set gap below the held title, and the title rail's
  // bottom edge (CSS, .narrative-title-rail-v4) releases the sticky right there, so title + cards
  // right there, so title + cards scroll away together at page speed as one composed lockup.

  // The C0 hero-copy scrub-fade assist: the lockup scrolls away naturally; this gentle block-level
  // fade over the back stretch of the travel keeps anything legible from crossing the docked title.
  const copyFade = useScrubReveal(scrollYProgress, HERO_COPY_OUT, {
    y: -40,
    dir: "out",
  });

  // The warm pool moves with the narrative in two eased sweeps with a flat rest between:
  // GLOW_PERSONA eases it RIGHT (→ 7vw) to sit between the statement (left) and the helix (right),
  // it RESTS there through the persona + thesis chapters, then GLOW_DRIFT sweeps it back LEFT
  // (→ −5vw) as PROJECTS lands.
  const snap = cubicBezier(...SNAP_EASE);
  const hold = (v: number) => v; // identity — the flat middle rest segment
  const glowX = useTransform(
    scrollYProgress,
    [GLOW_PERSONA[0], GLOW_PERSONA[1], GLOW_DRIFT[0], GLOW_DRIFT[1]],
    ["0vw", "7vw", "7vw", "-5vw"],
    { ease: [snap, hold, snap] },
  );

  // The docked title melts into the fixed band just below the nav on the ride-out — the
  // viewport-anchored top feather, read live from the title's real position each frame.
  const titleRef = useRef<HTMLDivElement>(null);
  const titleMask = useNavDissolveMask(titleRef);

  // The C0 copy dissolves under the nav as it scrolls up. navDissolveMask reads the element's OWN
  // box top, so it goes on the individual BLOCK (whose top actually passes the nav line), not the
  // full-stage flow column.
  const copyRef = useRef<HTMLDivElement>(null);
  const copyMask = useNavDissolveMask(copyRef);

  // THE PERSONA CONTENT GATE — the OUTER opacity level (Priority-1 double gate). The whole block
  // (statement + capability spine) is opacity 0 through the hero and MORPH 1, fades in as one unit
  // once PERSONA has landed (PERSONA_GATE_IN), holds, then DISSOLVES AT REST as the thesis chapter
  // opens (PERSONA_OUT — its sticky span keeps it pinned until it's invisible, see PERSONA_SPAN_VH).
  // ScrollInk's word-level ghost floor only ever shows INSIDE this gate — no ghost text under the
  // hero. Opacity only, no movement.
  const personaGate = useTransform(
    scrollYProgress,
    [...PERSONA_GATE_IN, ...PERSONA_OUT],
    [0, 1, 1, 0],
  );

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
    <div className="narrative-track-v4" style={GEOMETRY_VARS}>
      {/* The page's real heading — the visible name is decorative text. */}
      <h1 className="visually-hidden">
        Pratiush — Software Engineer, Product &amp; Design
      </h1>

      {/* ── THE SCRUBBED STAGE — fixed height (var(--stage-h)), drives the master progress. ── */}
      <div ref={stageRef} className="narrative-stage-v4">
        {/* ── ATMOSPHERE (z 0) — an absolute wrapper with one sticky viewport of warm field behind
            the whole stage (the same wrapper+sticky pattern as the DNA rail — no flow tricks). ── */}
        <div className="narrative-atmosphere-v4">
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
                // Warm amber dye — keeps any wisp on the terracotta/amber family so it never reads
                // as an out-of-place cool cloud on the warm field.
                color="#F6C89A"
                className="fluid-smoke-v3"
                curl={2.5}
                splatForce={500}
                densityDissipation={0.8}
                velocityDissipation={0.3}
                dyeRadius={0.002}
              />
            </div>
            <div className="hero-grain-v3" aria-hidden />
          </section>
        </div>

        {/* ── DNA RAIL (z 2) — the helix counterweight right-of-centre; ONE continuous scroll-locked
            conveyor of icons rides the strands down, each domain's set spread over the helix at the
            middle of its dwell and handing off in an unbroken stream, fading fully out before the
            thesis bridge. ── */}
        <div className="narrative-dna-rail-v4" aria-hidden>
          <div className="narrative-dna-rail-v4__sticky">
            <TechDNA progress={scrollYProgress} />
          </div>
        </div>

        {/* ── THESIS RAIL (z 2) — the C2 bridge layer: a sticky viewport that CENTRES the thesis
            statement; HeroThesis rides it up from below the fold to the centre (linear, scroll-
            carried), inking in on the climb and dissolving as it arrives (persona released, DNA
            exited by then). HeroThesis owns its own rise/opacity windows. ── */}
        <div className="narrative-thesis-rail-v4">
          <div className="narrative-thesis-rail-v4__sticky">
            <HeroThesis progress={scrollYProgress} />
          </div>
        </div>

        {/* ── CHAPTER FLOW (z 3) — in-flow content that scrolls past the docked title. Each BLOCK
            carries its own nav-dissolve mask. ── */}
        <div className="narrative-flow-v4">
          {/* C0 — the full hero lockup (~1 viewport): script greeting "Hi, I'm" ABOVE the name, then
              the role line, the serif tagline, and the "Based in USA" locator at the foot. Entrance
              on the foreground gate; exit is a gentle scrub-fade assist plus the nav-dissolve
              feather on the way up. */}
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
            <span className="hero-eyebrow-wrap-v4">
              <motion.p className="hero-eyebrow-v4" aria-hidden {...entrance(BEAT.eyebrow)}>
                Hi, I&apos;m
              </motion.p>
            </span>

            {/* Spacer that clears the FULL-SIZE name's height (em of the name's font-size so it
                tracks --name-hero-size). The docked title lives in the title rail, not here — this
                column just reserves the name's room in the C0 composition. */}
            <div className="narrative-name-gap-v4" aria-hidden />

            <motion.p className="hero-roles-v4" {...entrance(BEAT.roles)}>
              Software Engineer · Product &amp; Design
            </motion.p>

            <motion.p className="hero-tagline-v4" {...entrance(BEAT.tagline)}>
              <span className="hero-tagline-v4__line">Good products feel obvious.</span>
              <span className="hero-tagline-v4__line">Getting there isn&apos;t.</span>
            </motion.p>

            <motion.span
              className="hero-meta-v4 hero-meta-v4--flow"
              aria-label="Based in USA"
              {...entrance(BEAT.meta)}
            >
              <span>Based in USA</span>
            </motion.span>
          </motion.div>

          {/* C1 — the PERSONA block: the statement AND the compact capability spine, held TOGETHER
              as one composed block under the docked title. It sticks below the title
              (--content-top), holds through the whole persona beat, then DISSOLVES AT REST
              (personaFade, PERSONA_OUT) as the thesis chapter opens — the sticky span
              (var(--persona-span), from the beat sheet) keeps it pinned until it's invisible. */}
          <div className="narrative-persona-span-v4">
            <motion.div
              className="narrative-persona-v4"
              style={reduce ? undefined : ({ opacity: personaGate } as MotionStyle)}
            >
              {reduce ? (
                <p className="scroll-ink-v4 scroll-ink-v4--static">
                  I work across design and engineering, and the overlap is where I&apos;m
                  happiest. I like problems I haven&apos;t cracked before — I sit with them
                  until they click.
                </p>
              ) : (
                <ScrollInk
                  text="I work across design and engineering, and the overlap is where I'm happiest. I like problems I haven't cracked before — I sit with them until they click."
                  progress={scrollYProgress}
                  window={MANIFESTO_IN}
                />
              )}

              <CapabilityList progress={scrollYProgress} />
            </motion.div>
          </div>

          {/* C2 (thesis) and C3 (transition) have no flow content — the thesis lives in its own
              sticky rail above, and the title rail owns the morph over the whole track. */}
        </div>
      </div>

      {/* ── TITLE RAIL (z 4) — spans the OUTER track (stage + projects) so PROJECTS stays docked
          while the grid scrolls up beneath it. Releases on the rail's bottom edge (CSS) so title +
          cards ride away together — no fade. ── */}
      <div className="narrative-title-rail-v4">
        <motion.div
          ref={titleRef}
          className="narrative-title-v4"
          style={
            reduce
              ? undefined
              : ({
                  WebkitMaskImage: titleMask,
                  maskImage: titleMask,
                } as MotionStyle)
          }
        >
          <MorphName progress={scrollYProgress} />
        </motion.div>
      </div>

      {/* ── PROJECTS GRID — normal flow after the stage. Scrolls up under the still-docked PROJECTS
          title (padding-top clears the title zone), then the title releases and everything scrolls
          away together. Drives no master progress (its own whileInView reveals). ── */}
      <ProjectsIndex />
    </div>
  );
}

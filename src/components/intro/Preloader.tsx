"use client";

import { useEffect, useRef, useState } from "react";
import { cancelFrame, frame, motion, useMotionValue } from "motion/react";

import { GATE } from "@/lib/intro";
import { DUR, EASE, useIsoLayoutEffect } from "@/lib/motion";

/**
 * THE FIRST LOAD. An ink field over the page while the fonts and the pictures arrive, then the
 * field lifts off the top of the screen and hands the hero its cue.
 *
 * ONE MARK CARRIES THE WHOLE SCREEN: the name, centred, with a bone fill rising through the
 * letterforms as the page's real weight lands. It says whose site this is and how far along the
 * load is in the same object — which is the rule the featured deck's rail already argues for, that
 * a second element for the same information is a second thing to read rather than a clearer answer.
 * So there is no bar under it and no percentage beside it; there is nothing on this screen but the
 * word and what is happening to it.
 *
 * The fill RISES, because every edge on this site rises: the deck's curtain, the footer signature,
 * the copy in the deck, and this screen's own exit. And it is a clip rather than a scale or a blur,
 * so the letterforms are rasterised once at their final size and stay crisp the whole way up.
 *
 * The progress is real — it reports what has actually landed, paced so it can never claim to be
 * finished early (see `update`, below).
 */

/* ── the clock ─────────────────────────────────────────────────────────────── */

/**
 * The floor: the word cannot finish filling before this, however fast the page actually loads.
 *
 * Not padding for its own sake. On a warm reload the real work finishes in a couple of hundred
 * milliseconds, and a curtain that appears and leaves inside that is a flicker — the visitor
 * registers that something happened without registering what. The floor is what makes the intro
 * legible rather than a flash, and it sits in the band where a determinate indicator is the right
 * answer rather than an unnecessary one.
 */
const FLOOR = 900;

/** The closing run: how long the fill takes to walk from wherever it was up to the cap line once the
    page has genuinely finished. Short — it is the end of a sentence, not a phase of its own. */
const CLOSE = 300;

/** The finished word sits whole just long enough to be read as an arrival rather than as a state
    passed through on the way out. */
const HOLD = 200;

/** The lift, in ms — the JS side of `--dur-curtain`. */
const CURTAIN = DUR.curtain * 1000;

/**
 * How far into the lift the hero is released.
 *
 * Under one, deliberately. The two gestures overlap instead of queueing: by the time the ink has
 * cleared, the page beneath it is already in motion, so the visitor never sees the join. Wait for
 * the curtain to finish and the intro reads as two events with a seam between them.
 */
const HANDOFF = 0.55;

/**
 * The ceiling. Whatever has not arrived by now is declared arrived and the curtain goes up anyway.
 * A slow connection or a dead asset must never be able to hold someone at a wall.
 */
const CEILING = 6000;

/**
 * How quickly the shown value chases the real one, as a time constant in ms.
 *
 * Smoothed rather than stepped for the same reason the page's scroll is: a fill that jumps in
 * chunks as four images land reads as a machine reporting, and one that stalls reads as broken.
 * Pursuing the target continuously means the line is always creeping, which is what makes a wait
 * feel like it is going somewhere.
 */
const PURSUIT = 130;

/* ── the surface ───────────────────────────────────────────────────────────────
   What makes a rising level read as liquid rather than as a bar is entirely its top edge. A flat
   line is a measurement; a moving surface is a substance. So the fill is drawn as a polygon whose
   top edge is a travelling wave, and everything below it is solid.

   TWO waves, summed, at frequencies that are not a whole-number ratio — which is the whole trick.
   A single sine is a cartoon wave: you see the period, and once you have seen it you are watching a
   loop. Two that never come back into phase never visibly repeat, so the surface stays alive for as
   long as the load takes without ever showing its mechanism. */

/** How many points the surface is drawn with. Enough that the curve is smooth across the word's
    width at display scale; few enough that rebuilding the string every frame stays trivial. */
const SEGMENTS = 28;

/** Peak deviation of the surface, as a percentage of the word's box height. THE knob for how much
    the liquid moves — at half this the surface was there but easy to miss at the word's scale. */
const AMPLITUDE = 6.4;

/** Cycles across the word's width, and drift in cycles per second. Opposite signs so the two travel
    against each other, which is what stops the sum reading as one shape sliding sideways.
    The speeds are slow: a surface that hurries is agitated, and this one is meant to be heavy. */
const WAVE_A = { cycles: 1.5, speed: 0.34, weight: 0.6 };
const WAVE_B = { cycles: 2.7, speed: -0.52, weight: 0.4 };

/**
 * The fraction of the climb over which the surface settles flat as it tops out.
 *
 * It does two jobs at once. Physically it is right — a container filling to the brim goes still —
 * and structurally it is necessary: a surface still rippling at the top of its travel would have
 * troughs cutting into the tops of the letters, so the word could never actually finish lit.
 */
const SETTLE = 0.18;

/**
 * The fill region: a wavy top edge, then straight down to the bottom corners.
 *
 * Coordinates are percentages of the element's own box, so this is resolution-independent and the
 * clip is the same shape at every viewport size.
 */
function surface(level: number, phase: number, amplitude: number): string {
  const points: string[] = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    const x = i / SEGMENTS;
    const wave =
      WAVE_A.weight *
        Math.sin(2 * Math.PI * WAVE_A.cycles * x + phase * WAVE_A.speed) +
      WAVE_B.weight *
        Math.sin(2 * Math.PI * WAVE_B.cycles * x + phase * WAVE_B.speed);

    // Clamped to the box: below the baseline there is no glyph to paint anyway, and a point pushed
    // past the bottom edge would cross the polygon's own base and self-intersect.
    const y = Math.min(100, Math.max(0, level + amplitude * wave));
    points.push(`${(x * 100).toFixed(2)}% ${y.toFixed(2)}%`);
  }

  points.push("100% 100%", "0% 100%");
  return `polygon(${points.join(",")})`;
}

/* ── the cap band ──────────────────────────────────────────────────────────────
   Where the letterforms actually sit inside their line box, measured from the top, as percentages.

   The fill is mapped to THIS rather than to the box, and the difference is the whole difference
   between the effect working and looking broken. "PRATIUSH" is set in caps, so nothing descends
   below the baseline, and the line box has dead space above and below the letters that a fill
   mapped to the box would waste its travel crossing.

   DERIVED, not eyeballed — an earlier pass guessed 75 / 3 and both were wrong enough to see. From
   Kumbh Sans' own metrics (unitsPerEm 2048, ascent 2020, descent 520, capHeight 1500, lineGap 0)
   at `line-height: 1`:

     content area = (2020 + 520) / 2048           = 1.24023em
     half-leading = (1 − 1.24023) / 2             = −0.12012em
     baseline     = half-leading + ascent/upm     =  0.86621em  → 86.62%
     cap top      = baseline − capHeight/upm      =  0.13379em  → 13.38%

   The guessed baseline of 75% sat 11.6% ABOVE the real one, so the bottom of every letter was left
   permanently unlit — the liquid appeared to start partway up the word rather than at the foot of
   it. The guessed cap top of 3% was 10.4% too high, so the last tenth of the climb ran on above the
   letters with the word already looking full. If the display face is ever swapped, re-run the four
   lines above with the new metrics. */
const CAP_TOP = 13.38;
const CAP_BOTTOM = 86.62;

/**
 * Where the surface starts: far enough below the baseline that its CRESTS are under it too.
 *
 * Starting the level exactly at the baseline is not the same as starting empty — the wave rides
 * either side of its level, so the crests would already be inside the letters at zero progress and
 * the word would begin fractionally lit rather than rising from nothing.
 */
const FILL_FROM = CAP_BOTTOM + AMPLITUDE;

/* ── the manifest ──────────────────────────────────────────────────────────── */

/**
 * What the intro waits on: every face the page asked for, and every image actually in the document.
 *
 * Read off the DOM rather than kept as a hand-written list of URLs. A list would have to be updated
 * every time a project's cover changed, and would silently start lying the day someone forgot —
 * whereas `document.images` is, by construction, exactly what this page is loading. On the landing
 * page it is the portrait and the three featured covers; on a case page it is that case's media.
 *
 * What it collects is URLs, and what it waits on is a fresh `Image()` per URL — NOT a listener on
 * the element it found. The elements are not stable: WorkIndex renders the flat grid on the server
 * and swaps it for the pinned deck the moment it knows the viewport is wide, which is the same tick
 * this runs on. A listener bound to an element that then unmounts never fires, and the word would
 * sit two fifths lit until the ceiling rescued it. A URL cannot be unmounted. The second request for
 * an image the page is already fetching is served from the browser's cache or coalesced into the
 * request in flight, so honesty here costs nothing.
 *
 * `currentSrc` before `src`, because that is the entry the browser actually chose out of the
 * srcset — asking for `src` would fetch a different, larger file than the one the page is waiting on.
 *
 * LAZY IMAGES ARE SKIPPED, and the two reasons compound. The first is the plain one: a lazy image is
 * by definition one the browser has decided not to fetch yet, so waiting on it inverts the whole
 * point of the attribute and holds a title sequence hostage to a picture six screens down. The
 * second is what makes it a bug rather than a nicety — a lazy image has not chosen out of its srcset
 * yet, so `currentSrc` is empty and the fallback above lands on `src`, which for next/image is the
 * LARGEST variant it generated. The intro would be fetching a 3840px re-encode of a photo that will
 * be painted at a hundred. (Everything eager on the landing page — the portrait and the three
 * featured covers — is unaffected: those are already in flight, so `currentSrc` is populated and
 * this reads the exact entry the browser picked.)
 *
 * Every job resolves on failure as well as on success. A 404 on one cover must not hold the page
 * hostage; the intro's contract is "this is what has landed", not "all of this landed".
 */
function manifest(): Promise<unknown>[] {
  const jobs: Promise<unknown>[] = [document.fonts.ready];
  const urls = new Set<string>();

  for (const image of Array.from(document.images)) {
    if (image.loading === "lazy") continue;
    const url = image.currentSrc || image.src;
    if (url) urls.add(url);
  }

  for (const url of urls) {
    jobs.push(
      new Promise<void>((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve();
        probe.onerror = () => resolve();
        probe.src = url;
        // A cached image can be complete before the handlers are ever called.
        if (probe.complete) resolve();
      }),
    );
  }

  return jobs;
}

/* ── the overlay ───────────────────────────────────────────────────────────── */

export function Preloader({
  onHold,
  onHandoff,
  onRelease,
}: {
  /** The intro is running: hold the scroll. */
  onHold: () => void;
  /** The hero's cue — fired partway through the lift. */
  onHandoff: () => void;
  /** The page is the visitor's again: scroll unlocks here. */
  onRelease: () => void;
}) {
  // Rendered on the server so the ink is in the very first paint — there is no window in which the
  // page shows through. CSS keeps it hidden unless <html> carries the gate, so the markup being
  // present costs nothing on the loads that skip the intro.
  const [gone, setGone] = useState(false);
  const [lifting, setLifting] = useState(false);

  const fill = useMotionValue(0);

  // The fill region itself, rewritten every frame by the loop below. Seeded with the surface at rest
  // at the bottom of the cap band — an unlit word — and deterministic, so the server and the
  // hydration render emit the identical polygon and there is nothing to mismatch.
  const clipPath = useMotionValue(surface(FILL_FROM, 0, AMPLITUDE));

  // The word's own element, read once to find out how much of its CSS entrance is still to run.
  const word = useRef<HTMLSpanElement>(null);

  // Written by the manifest, read by the frame loop — a ref rather than state, because this changes
  // a handful of times during the one second of the page's life that has no frames to spare.
  const real = useRef(0);
  const done = useRef(false);

  useIsoLayoutEffect(() => {
    // Not gated: the visitor prefers reduced motion, or JS never ran to add the class. Hand the
    // page over immediately and take the overlay out of the tree — nothing was ever visible, and
    // the hero must not spend a frame at opacity 0 waiting for a cue that isn't coming.
    if (!document.documentElement.classList.contains(GATE)) {
      setGone(true);
      onHandoff();
      return;
    }
    onHold();
    // Mount-only: the gate is decided before paint and never changes afterwards.
  }, []);

  useEffect(() => {
    if (!document.documentElement.classList.contains(GATE)) return;

    const jobs = manifest();
    const total = jobs.length;
    let settled = 0;

    for (const job of jobs) {
      job.then(() => {
        settled += 1;
        real.current = settled / total;
      });
    }

    const ceiling = window.setTimeout(() => {
      real.current = 1;
    }, CEILING);

    const started = performance.now();

    /**
     * How long to wait before the fill starts climbing: exactly whatever is left of the word's
     * entrance.
     *
     * The two beats have independent starts — the rise begins on the first paint, this clock begins
     * at hydration — and the gap between those is precisely the thing that varies from machine to
     * machine. Guessing a delay would be right on one laptop and wrong everywhere else. So the
     * running animation is asked directly how much of itself is left, which is exact whatever
     * hydration cost, and the word is always planted before the liquid starts to rise in it.
     *
     * Falls back to zero if the API or the animation is missing, which degrades to the two beats
     * overlapping — the old behaviour — rather than to a wait that never ends.
     */
    const entrance = word.current?.getAnimations?.()[0];
    const lead = entrance
      ? Math.max(
          0,
          Number(entrance.effect?.getTiming().duration ?? 0) -
            Number(entrance.currentTime ?? 0),
        )
      : 0;

    // Where the closing run began, once the page is genuinely finished. Null until then.
    let closing: { at: number; from: number } | null = null;

    // The travelling surface's position in its cycle. Advanced by real time, not by frames.
    let phase = 0;

    /** Paint the fill at `progress`, with the surface wherever the phase currently has it. */
    const draw = (progress: number) => {
      const level = FILL_FROM - progress * (FILL_FROM - CAP_TOP);
      // Settles flat as it tops out — see SETTLE. Without this the troughs would still be biting
      // into the tops of the letters at the end, and the word could never finish fully lit.
      const amplitude =
        AMPLITUDE * Math.min(1, Math.max(0, (1 - progress) / SETTLE));

      clipPath.set(surface(level, phase, amplitude));
    };

    /**
     * The fill runs in two stages, because the two halves of the wait are different problems.
     *
     * WHILE LOADING, the target is the LESSER of what has really landed and what the floor allows.
     * Taking the smaller of the two keeps the fill honest in both directions: it can never run ahead
     * of the page, so a full word means a loaded page — and on a warm load, where the truth is "all
     * of it, instantly", the floor supplies an even climb instead of a jump to the end. The shown
     * value pursues that target rather than snapping to it, so the four discrete moments when an
     * asset lands arrive as one continuous climb instead of four steps.
     *
     * ONCE THE TARGET REACHES 1 the pursuit is retired, because an exponential approach never
     * actually arrives: chasing the last few points takes longer than the whole rest of the climb,
     * and what that looks like on screen is a fill stalled just short of the cap line. So the finish
     * is a short linear run from wherever the fill had got to. Bounded, identical every time, and it
     * reads as the word landing rather than creeping.
     */
    const update = ({ delta }: { delta: number }) => {
      if (done.current) return;

      const now = performance.now();
      // The surface keeps moving even while the level is held at zero through the lead, so the word
      // is never a dead object waiting — the liquid is already alive in the bottom of it.
      phase += (delta / 1000) * 2 * Math.PI;

      // Clamped at zero: through the lead this term is negative, and an unclamped value would drive
      // the surface below its own box instead of simply holding it at rest.
      const target = Math.min(
        real.current,
        Math.max(0, (now - started - lead) / FLOOR),
      );

      if (target >= 1 && !closing) closing = { at: now, from: fill.get() };

      if (closing) {
        const run = Math.min(1, (now - closing.at) / CLOSE);
        const value = closing.from + (1 - closing.from) * run;
        fill.set(value);
        draw(value);

        if (run === 1) {
          done.current = true;
          window.setTimeout(() => setLifting(true), HOLD);
        }
        return;
      }

      // Frame-rate independent pursuit: the same fraction of the remaining distance per unit of
      // TIME, not per frame, so the fill climbs at one speed on a 60Hz panel and a 120Hz one.
      const shown = fill.get();
      const value = shown + (target - shown) * (1 - Math.exp(-delta / PURSUIT));
      fill.set(value);
      draw(value);
    };

    // `keepAlive` — this has to run every frame. It rides Motion's scheduler rather than its own
    // rAF for the same reason Lenis does (see SmoothScroll): the page gets ONE clock.
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      window.clearTimeout(ceiling);
    };
    // Both are `useMotionValue` handles and so are stable for the component's life — listed to keep
    // the dependency check honest, not because either can actually change.
  }, [fill, clipPath]);

  useEffect(() => {
    if (!lifting) return;

    const cue = window.setTimeout(onHandoff, CURTAIN * HANDOFF);
    const clear = window.setTimeout(() => {
      document.documentElement.classList.remove(GATE);
      onRelease();
      setGone(true);
    }, CURTAIN);

    return () => {
      window.clearTimeout(cue);
      window.clearTimeout(clear);
    };
  }, [lifting, onHandoff, onRelease]);

  if (gone) return null;

  return (
    // Decorative: the page it is covering is fully in the document and readable by assistive tech
    // the whole time, so announcing a name and a progress state over the top of it would be noise
    // rather than information — and the name is already announced by the nav, the hero and the title.
    <motion.div
      className="preloader"
      aria-hidden
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{
        clipPath: lifting ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)",
      }}
      transition={{ duration: DUR.curtain, ease: EASE }}
    >
      <div className="preloader__inner">
        {/* The entrance mask. It rides a CSS keyframe rather than a mounted animation so it starts
            with the first paint instead of waiting for hydration — otherwise the field sits empty
            for however long the JS takes to arrive, which is precisely the interval this whole
            screen exists to cover. */}
        <span className="preloader__word-clip">
          <span className="preloader__word display-section" ref={word}>
            {/* Two copies of one word, in register. The lower is the unlit state; the upper is the
                lit one, clipped to whatever has actually loaded. The letterforms are laid out once
                at final size and only ever CLIPPED — never scaled, never blurred — so the word is
                pixel-crisp at every point of the climb. Same construction as the deck's rail: a
                track with its fill drawn over it. */}
            <span className="preloader__word-base">PRATIUSH</span>
            <motion.span className="preloader__word-fill" style={{ clipPath }}>
              PRATIUSH
            </motion.span>
          </span>
        </span>
      </div>
    </motion.div>
  );
}

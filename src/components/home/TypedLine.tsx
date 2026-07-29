"use client";

import { useEffect, useRef, useState } from "react";

import { TYPE } from "@/lib/motion";

/**
 * The hero's one moving line: a stem that stays, and a tail that types itself, holds, clears and
 * gives way to the next.
 *
 * It exists to do two jobs at once. It shortens what used to be a 62-character sentence down to a
 * phrase, and it puts the only continuous motion on a page where everything else arrives and then
 * holds still. Both were the point of asking for it; neither would have been worth a loop on its
 * own.
 *
 * THREE THINGS IT HAS TO GET RIGHT, none of which are the typing itself:
 *
 * 1. It must not run behind the intro. The hero mounts under the ink field, so an unguarded loop
 *    would spend its first cycle where nobody can see it and the curtain would lift on a line
 *    caught mid-delete. `start` is the intro's cue, the same one the entrance cascade waits for.
 * 2. It must not be read aloud. A screen reader pointed at a string that changes every 60ms is
 *    useless at best; the visible text is `aria-hidden` and a static sentence carrying all three
 *    phrases sits beside it for assistive tech. That sentence is also the reduced-motion render,
 *    so the two can never drift.
 * 3. It must not move the page. The line is the second of three items in a column whose last item
 *    is pinned to the bottom, so a phrase that wrapped to two lines would shove the locator down
 *    and back on every cycle. The reserved line box in globals.css is what prevents that; keep
 *    the phrases short enough to stay on one line and it never comes up.
 */

/** The stem. Never typed, never cleared — it is what stops the line starting from nothing. */
const STEM = "I ";

/**
 * What rotates. Kept parallel in shape and rising in length, so the line grows across the cycle
 * and resets, rather than jittering between two similar widths.
 *
 * They are also the three dimensions the selected projects demonstrate. The line names the range
 * once; the work supplies the proof instead of repeating it in a skills index.
 */
const PHRASES = ["code.", "design.", "build with AI."] as const;

/** The same three as one sentence: the accessible name, and what a reduced-motion visit sees. */
const STATIC = "I code, design, and build with AI.";

/**
 * Two phases, not four. The hold at the end of a phrase and the gap after clearing it are not
 * states of their own — each is the delay on the step that LEAVES its phase, which is what keeps
 * every transition asynchronous. A "holding" phase entered synchronously from "typing" would set
 * state inside the effect that just observed it, and cascade a render on every character.
 */
type Phase = "typing" | "erasing";

export function TypedLine({
  start,
  reduced,
}: {
  /** The intro's cue. While false the line sits at its first phrase, fully typed and still. */
  start: boolean;
  /** When true nothing animates and the static sentence is rendered instead. */
  reduced: boolean;
}) {
  const [index, setIndex] = useState(0);
  // Starts FULL, not empty. The hero is server-rendered and then sits under the ink field waiting
  // for its cue, and a line that begins at zero characters would render the page's opening
  // statement as a bare "I " for the length of the intro — and would show exactly that to anyone
  // whose JS never arrives.
  const [count, setCount] = useState(PHRASES[0].length);
  const [phase, setPhase] = useState<Phase>("typing");
  // Held in a ref so the effect below can clear a pending step without listing it as a dependency
  // and re-arming itself on every character.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (reduced || !start) return;

    const phrase = PHRASES[index];
    const step = (ms: number, fn: () => void) => {
      timer.current = setTimeout(fn, ms * 1000);
    };

    if (phase === "typing") {
      if (count < phrase.length) step(TYPE.type, () => setCount((c) => c + 1));
      else step(TYPE.hold, () => setPhase("erasing"));
    } else {
      if (count > 0) step(TYPE.erase, () => setCount((c) => c - 1));
      else
        step(TYPE.gap, () => {
          setIndex((i) => (i + 1) % PHRASES.length);
          setPhase("typing");
        });
    }

    return () => clearTimeout(timer.current);
  }, [start, reduced, phase, count, index]);

  if (reduced) return <>{STATIC}</>;

  const phrase = PHRASES[index];
  const visible = STEM + phrase.slice(0, count);
  // Solid while characters are moving, blinking only once the line is at rest — which is how a
  // real caret behaves, and keeps a blinking element off the screen during the part a reader is
  // actually reading along with. Derived rather than stored: "at rest" is exactly the two points
  // where the phrase is complete or empty and the machine is waiting out a delay.
  const idle =
    !start ||
    (phase === "typing" && count === phrase.length) ||
    (phase === "erasing" && count === 0);

  return (
    <>
      <span aria-hidden>
        {visible}
        <span className="typed__caret" data-idle={idle || undefined} />
      </span>
      <span className="sr-only">{STATIC}</span>
    </>
  );
}

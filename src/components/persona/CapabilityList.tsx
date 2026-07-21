"use client";

import { memo } from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { CAP_DWELL, CAPS_IN, type Window } from "@/components/hero/heroTimeline";
import { capabilities } from "@/data/capabilities";
import { INTRO_EASE } from "@/lib/intro";

/**
 * THE CAPABILITY SPINE — a COMPACT subsection under the docked PERSONA title, sitting directly BELOW the
 * persona manifesto inside the shared sticky persona block (NarrativeSection `.narrative-persona-v4`).
 * Four capability lines, exactly ONE active at a time as the reader scrolls: the whole list is always a
 * visible spine (inactive lines dimmed to a floor), and the active line inks to full while its
 * sub-caption — its voice — rises in. The DNA helix on the right swaps its icon set to match each domain
 * (TechDNA reads the same CAP_DWELL windows).
 *
 * COMPACT (user-directed): the type is a subsection scale (not a full-screen-per-domain headline) and
 * the row gaps are tight, so all four lines + the active sub-caption + the statement above them fit as
 * ONE block under the docked title within a single viewport. The per-domain scroll dwells are short
 * too (see CAP_DWELL in heroTimeline.ts) so the whole beat feels like a subsection, not four screens.
 *
 * The list is REAL TEXT (content, not decoration): all four lines + subs are in the DOM at full opacity
 * to assistive tech; the dim/active scrub is purely visual (no aria-hidden). Reduced motion shows every
 * line + sub at full opacity in natural flow.
 */
const ease = cubicBezier(...INTRO_EASE);

const FLOOR = 0.55; // inactive lines stay warm-present — not washed to grey
const SUB_RISE = 10; // px the sub-caption lifts as it inks (small — it's a caption, not a headline)

// Active row: terracotta accent ink only — no scale reflow (reads cleaner at agency scale).
const INK_REST = "#221e2e";
const INK_ACTIVE = "#c9542e";

// The active-crossfade ramp on each side of a dwell, as a FRACTION of the dwell width. The dwells are
// LONG now (~70vh), so the fraction is small — the hand-off still reads firm (~14vh of scroll) while
// the lit line holds for the long middle of its dwell.
const RAMP_FRAC = 0.2;

/**
 * One capability row. Its line crossfades FLOOR→1→FLOOR across its dwell (a short ramp at each edge), and
 * its sub-caption rides the same active window but sharper (0→1 + a small rise; inactive at 0). The LAST
 * row stays active through its dwell end and fades out with the whole block instead. All off the ONE
 * master progress; INTRO_EASE.
 */
const Row = memo(function Row({
  line,
  sub,
  dwell,
  isLast,
  progress,
}: {
  line: string;
  sub: string;
  dwell: Window;
  isLast: boolean;
  progress: MotionValue<number>;
}) {
  const [d0, d1] = dwell;
  const ramp = (d1 - d0) * RAMP_FRAC;

  // Line: FLOOR → 1 over the opening ramp, hold at 1, then 1 → FLOOR over the closing ramp. The last
  // row omits the closing fall (stays lit through its dwell end).
  const lineOpacity = useTransform(
    progress,
    isLast ? [d0, d0 + ramp, d1] : [d0, d0 + ramp, d1 - ramp, d1],
    isLast ? [FLOOR, 1, 1] : [FLOOR, 1, 1, FLOOR],
    { ease },
  );
  // The active line's ink swings to the terracotta accent and back on the same ramps, and the row
  // stands slightly proud (transform-only scale — no reflow). The last row keeps its accent through
  // the dwell end and fades with the whole block instead.
  const lineColor = useTransform(
    progress,
    isLast ? [d0, d0 + ramp, d1] : [d0, d0 + ramp, d1 - ramp, d1],
    isLast
      ? [INK_REST, INK_ACTIVE, INK_ACTIVE]
      : [INK_REST, INK_ACTIVE, INK_ACTIVE, INK_REST],
    { ease },
  );

  // Sub-caption: sharper — 0 → 1 across a slightly quicker opening, held, then 1 → 0 at the close.
  const subOpacity = useTransform(
    progress,
    [d0, d0 + ramp, d1 - ramp, d1],
    [0, 1, 1, 0],
    { ease },
  );
  const subY = useTransform(progress, [d0, d0 + ramp], [SUB_RISE, 0], { ease });

  return (
    <li className="narrative-capability-v4">
      <motion.span
        className="narrative-capability-v4__line"
        style={{ opacity: lineOpacity, color: lineColor }}
      >
        {line}
      </motion.span>
      <motion.span
        className="narrative-capability-v4__sub"
        style={{ opacity: subOpacity, y: subY }}
      >
        {sub}
      </motion.span>
    </li>
  );
});

export function CapabilityList({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion() ?? false;

  // The spine's OWN entrance gate: the whole list stays at 0 until the statement above has fully
  // established itself (CAPS_IN sits after MANIFESTO_IN), then fades in as one block just before
  // the first dwell — so the list never competes with the reading of the statement. (The outer
  // persona gate in NarrativeSection handles the chapter-level visibility; this sequences WITHIN
  // the chapter.) Hook order is stable: `reduce` never changes within a mount.
  const listOpacity = useTransform(progress, [...CAPS_IN], [0, 1], { ease });

  // Reduced motion: no scrub — every line + sub reads at full opacity in natural flow.
  if (reduce) {
    return (
      <ul className="narrative-capabilities-v4__list">
        {capabilities.map((cap) => (
          <li key={cap.id} className="narrative-capability-v4">
            <span className="narrative-capability-v4__line">{cap.line}</span>
            <span className="narrative-capability-v4__sub">{cap.sub}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <motion.ul
      className="narrative-capabilities-v4__list"
      style={{ opacity: listOpacity }}
    >
      {capabilities.map((cap, i) => (
        <Row
          key={cap.id}
          line={cap.line}
          sub={cap.sub}
          dwell={CAP_DWELL[i]}
          isLast={i === capabilities.length - 1}
          progress={progress}
        />
      ))}
    </motion.ul>
  );
}

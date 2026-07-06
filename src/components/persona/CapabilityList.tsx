"use client";

import { memo } from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { CAP_DWELL, type Window } from "@/components/hero/heroTimeline";
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
 * the row gaps are tight, so all four lines + the active sub-caption + the manifesto above them fit as
 * ONE block under the docked title within a single viewport. The per-domain scroll dwells are short too
 * (CAP_DWELL is 45vh each) so the whole beat feels like a subsection, not four full screens.
 *
 * The list is REAL TEXT (content, not decoration): all four lines + subs are in the DOM at full opacity
 * to assistive tech; the dim/active scrub is purely visual (no aria-hidden). Reduced motion shows every
 * line + sub at full opacity in natural flow.
 */
const ease = cubicBezier(...INTRO_EASE);

const FLOOR = 0.35; // inactive lines sit here — present as a spine, demoted, never gone
const SUB_RISE = 10; // px the sub-caption lifts as it inks (small — it's a caption, not a headline)

// The active-crossfade ramp on each side of a dwell, as a FRACTION of the dwell width (short — the line
// snaps to voice then holds). CAP_DWELL windows are compact; ~0.28 of the dwell reads as a firm hand-off.
const RAMP_FRAC = 0.28;

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
      <motion.span className="narrative-capability-v4__line" style={{ opacity: lineOpacity }}>
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
    <ul className="narrative-capabilities-v4__list">
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
    </ul>
  );
}

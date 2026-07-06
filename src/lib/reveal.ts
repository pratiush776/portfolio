import {
  cubicBezier,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";

import { INTRO_EASE } from "./intro";

const ease = cubicBezier(...INTRO_EASE);

/**
 * The site's one scrub-linked reveal: fade + rise (+ optional blur) across a window of a scroll
 * progress value, on the shared INTRO_EASE. `dir: "in"` enters (opacity 0→1, y→0); `dir: "out"`
 * exits (opacity 1→0, 0→y). This replaces the near-identical `useTransform` recipes that were
 * copy-pasted across the hero copy exit and the project reveals — one move, expressed once.
 *
 * For reveals that also need an EXIT tail or extra filter grade, keep the transforms bespoke; this
 * covers the common single-window enter/exit only.
 */
export function useScrubReveal(
  progress: MotionValue<number>,
  [start, end]: readonly [number, number],
  { y = 0, blur = 0, dir = "in" }: { y?: number; blur?: number; dir?: "in" | "out" } = {},
): MotionStyle {
  const isIn = dir === "in";
  const opacity = useTransform(progress, [start, end], isIn ? [0, 1] : [1, 0], { ease });
  const yValue = useTransform(progress, [start, end], isIn ? [y, 0] : [0, y], { ease });
  const blurValue = useTransform(progress, [start, end], isIn ? [blur, 0] : [0, blur], { ease });
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  const style: MotionStyle = { opacity, y: yValue };
  if (blur !== 0) style.filter = filter;
  return style;
}

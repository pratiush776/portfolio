"use client";

import { useRef, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";

// Magnetic pull: the button drifts a fraction of the cursor's offset toward
// it while hovered, easing back to rest on leave.
const STRENGTH = 0.35;

// Exponential ease-out (fast → slow). Decisive start, gentle settle — reads as
// expo decay rather than a bouncy spring, so there is no overshoot.
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MOVE_DURATION = 0.5;
const RESET_DURATION = 0.6;

export function NavConnect() {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (reduce || !el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
    const ny = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
    animate(x, nx, { duration: MOVE_DURATION, ease: EASE });
    animate(y, ny, { duration: MOVE_DURATION, ease: EASE });
  };

  const reset = () => {
    animate(x, 0, { duration: RESET_DURATION, ease: EASE });
    animate(y, 0, { duration: RESET_DURATION, ease: EASE });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className="site-nav-v3__contact"
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      Connect
    </motion.button>
  );
}

/**
 * `frame` and `cancelFrame` exist in Motion's runtime — it re-exports them from motion-dom — but
 * are missing from the published type declarations, so they cannot be imported without this. The
 * same gap `cubicBezier` falls into, which src/lib/motion.ts works around by writing its own
 * bezier; here the runtime scheduler has no equivalent to hand-roll, so the types are declared.
 *
 * Drop this file if a later Motion release ships them.
 */
import "motion/react";

declare module "motion/react" {
  type FrameCallback = (data: { timestamp: number; delta: number }) => void;

  export const frame: {
    update: (callback: FrameCallback, keepAlive?: boolean) => void;
  };

  export function cancelFrame(callback: FrameCallback): void;
}

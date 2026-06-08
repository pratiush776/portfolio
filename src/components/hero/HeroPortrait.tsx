"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const SRC = "/images/portrait_v2.png";
const SIZES = "(max-width: 1100px) 52vw, 34vw";

/**
 * Hero portrait passing through a soft warm disc. ONE image (no second copy):
 *  - a single CSS mask unions a circle (body → clips the photo's cut-off edges to a clean
 *    curve) and a top band (head → breaks out above the disc),
 *  - the figure extends past the disc top (head) and bottom (body), so the disc reads as a
 *    band the figure passes through, not a bubble it's cropped inside.
 * The figure (front) and disc (back) are SEPARATE parallax layers that drift at different
 * rates → real depth between them. They aren't clipped to each other, so the relative
 * motion can't tear. Desktop + fine-pointer only; off under reduced-motion.
 */
export function HeroPortrait() {
  const reduceMotion = useReducedMotion();

  // Cursor normalised to -0.5..0.5 from viewport centre → springs.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 110, damping: 22, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 110, damping: 22, mass: 0.6 });

  // Figure (front) drifts more than the disc (back) → parallax depth between the two.
  const figX = useTransform(sx, [-0.5, 0.5], [-15, 15]);
  const figY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const discX = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const discY = useTransform(sy, [-0.5, 0.5], [-3, 3]);

  useEffect(() => {
    if (reduceMotion) return;
    const fine = window.matchMedia("(min-width: 1101px) and (pointer: fine)");
    if (!fine.matches) return;

    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, px, py]);

  return (
    <div className="hero-pratiush-photo-v3" aria-hidden>
      <motion.div className="hero-portrait-disc-layer" style={{ x: discX, y: discY }}>
        <div className="hero-portrait-disc" />
      </motion.div>
      <motion.div className="hero-portrait-figure-layer" style={{ x: figX, y: figY }}>
        <div className="hero-portrait-figure">
          <Image
            className="hero-portrait-img"
            src={SRC}
            alt=""
            fill
            priority
            sizes={SIZES}
          />
        </div>
      </motion.div>
    </div>
  );
}

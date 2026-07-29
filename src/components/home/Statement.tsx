"use client";

import { useRef } from "react";
import { motion } from "motion/react";

import { useGlide } from "@/lib/motion";

/**
 * The promise, and nothing more: a compact bridge from identity to proof. Its top edge crosses the
 * hero fold, so it stays rendered at rest instead of using the shared positive-y reveal — hiding
 * the line until after a visitor scrolls would erase the cue it exists to provide.
 *
 * It shares the landing's centred chapter axis with the hero and PROJECTS. The physical gap below
 * is tightened to compensate for PROJECTS arriving from a mask, so the initially empty area
 * beneath the statement does not outweigh the space above it.
 *
 * A client component only for the glide, which is a cheap thing to hand the browser for one line of
 * markup and is worth more here than anywhere: this is a single sentence floating in silence
 * between two much heavier neighbours, so it is the one chapter whose whole presence is the space
 * around it, and the only one that can show that space moving.
 */
export function Statement() {
  const section = useRef<HTMLDivElement>(null);
  const { drift } = useGlide(section);

  return (
    <motion.div
      ref={section}
      className="statement-bridge gutter measure"
      style={{ y: drift }}
    >
      <p className="statement editorial">
        I turn rough ideas into polished products.
      </p>
    </motion.div>
  );
}

"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  type MotionValue,
} from "motion/react";
import type { Project } from "@/data/projects";

type Props = {
  project: Project | null;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
};

const ENTRY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function WorksCursorPreview({ project, springX, springY }: Props) {
  return (
    <motion.div
      className="recent-works-v3__cursor-preview"
      style={{ x: springX, y: springY }}
      aria-hidden
    >
      <AnimatePresence>
        {project && (
          <motion.div
            key={project.slug}
            className="recent-works-v3__cursor-preview-frame"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              opacity: { duration: 0.28, ease: "easeOut" },
              scale: { duration: 0.42, ease: ENTRY_EASE },
            }}
          >
            <Image
              src={project.previewImage ?? project.logo}
              alt=""
              fill
              sizes="300px"
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import {
  cubicBezier,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { INTRO_EASE, SNAP_EASE } from "@/lib/intro";
import type { FeaturedWork } from "@/data/works";

/**
 * One case panel. Editorial grid: media on one side, the story of the build on the other,
 * alternating sides down the page. No index rules or label eyebrows — title, story, one
 * quiet meta line. Three motion layers, each owned by the scroll position:
 *  • the media frame opens (clip-path inset → full) as the panel traverses the viewport,
 *  • the media inside drifts slower than the page (parallax within the frame),
 *  • the copy rises once, staggered, when the panel arrives — all on the hard-landing ease.
 * Demo videos are honest-weight: preload="none", playing only while the panel is on screen.
 */
const EASE = INTRO_EASE;

const bodyStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { y: 26, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

const titleRise: Variants = {
  hidden: { y: "108%" },
  visible: { y: "0%", transition: { duration: 0.85, ease: EASE } },
};

// The stack chips ink in one after another instead of rising as one slab — the same body cascade,
// one altitude deeper. Each chip is a quick, small lift so the row reads as a typed list.
const stackStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const stackItem: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

// Poster type rises inside the opening frame: word first, then caption, on a short stagger keyed
// just behind the clip-path reveal so the panel never shows static type sitting in a blank field.
const posterStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

export function WorkPanel({ work, index }: { work: FeaturedWork; index: number }) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });

  // Frame opens early in the traverse, then holds; the inner media keeps drifting throughout.
  const clipPath = useTransform(
    scrollYProgress,
    [0.02, 0.32],
    ["inset(16% 10% 16% 10% round 28px)", "inset(0% 0% 0% 0% round 28px)"],
  );
  const mediaY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  // The lead panel crests as the continuation of the landing beat: the hero pulls it up under
  // its hold (works-v4 margin-top: -30vh), so as the reader scrolls past the landed PROJECTS
  // this first panel rises into the frame on the scrubbed hard-landing ease — the morph's gravity
  // carries straight into the work, rather than the panel popping in on its own observer. Only
  // the lead gets it (a singular beat, not a per-panel reflex); reduced motion holds it still.
  const isLead = index === 0;
  const crestY = useTransform(scrollYProgress, [0, 0.4], ["9vh", "0vh"], {
    ease: cubicBezier(...SNAP_EASE),
  });

  // Play the demo only while it's actually being looked at (also defers the download).
  // Reduced motion: never autoplay — the video gets controls instead (see below).
  const inView = useInView(panelRef, { amount: 0.25 });
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;
    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, reduce]);

  return (
    <motion.article
      ref={panelRef}
      className={index % 2 ? "work-panel-v4 work-panel-v4--flip" : "work-panel-v4"}
      style={!reduce && isLead ? { y: crestY } : undefined}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "visible"}
      viewport={{ once: true, margin: "0px 0px -18% 0px" }}
    >
      <div className="work-panel-v4__grid">
        <motion.div
          className="work-panel-v4__media"
          style={reduce ? undefined : { clipPath }}
        >
          {work.media.kind === "video" ? (
            /* The bleed layer only wraps video — poster type must hold the frame edge. */
            <motion.div
              className="work-panel-v4__media-inner"
              style={reduce ? undefined : { y: mediaY }}
            >
              <video
                ref={videoRef}
                className="work-panel-v4__video"
                src={work.media.src}
                poster={work.media.poster}
                muted
                loop
                playsInline
                preload={reduce ? "metadata" : "none"}
                controls={!!reduce}
                aria-label={`${work.title} demo`}
              />
            </motion.div>
          ) : (
            <motion.div
              className="work-panel-v4__poster"
              style={{ backgroundColor: work.media.tint }}
              variants={reduce ? undefined : posterStagger}
            >
              <motion.span
                className="work-panel-v4__poster-word"
                variants={reduce ? undefined : rise}
              >
                {work.media.word}
              </motion.span>
              <motion.span
                className="work-panel-v4__poster-caption"
                variants={reduce ? undefined : rise}
              >
                {work.media.caption}
              </motion.span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="work-panel-v4__body"
          variants={reduce ? undefined : bodyStagger}
        >
          <h3 className="work-panel-v4__title">
            <span className="work-panel-v4__title-mask">
              <motion.span
                className="work-panel-v4__title-inner"
                variants={reduce ? undefined : titleRise}
              >
                {work.title}
              </motion.span>
            </span>
          </h3>

          <motion.p className="work-panel-v4__meta" variants={reduce ? undefined : rise}>
            {work.year} · {work.role}
          </motion.p>

          <motion.p className="work-panel-v4__desc" variants={reduce ? undefined : rise}>
            {work.description}
          </motion.p>

          <motion.ul
            className="work-panel-v4__stack"
            variants={reduce ? undefined : stackStagger}
          >
            {work.stack.map((tech) => (
              <motion.li key={tech} variants={reduce ? undefined : stackItem}>
                {tech}
              </motion.li>
            ))}
          </motion.ul>

          {work.links.length > 0 && (
            <motion.div className="work-panel-v4__links" variants={reduce ? undefined : rise}>
              {work.links.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-panel-v4__link"
                >
                  <span>{label}</span>
                  <span className="work-panel-v4__link-icon" aria-hidden>
                    <ArrowUpRight />
                  </span>
                </a>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.article>
  );
}

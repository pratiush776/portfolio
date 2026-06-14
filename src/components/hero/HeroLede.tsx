"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

import { MorphName } from "@/components/hero/MorphName";
import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE, type Beat } from "@/lib/intro";

/**
 * The left-aligned hero lockup: eyebrow → name → role → statement, plus the bottom-right
 * locator. The name is <MorphName/> — real text that the pinned hero transforms into
 * PROJECTS on scroll (the landing's one big move).
 *
 * Motion layers, kept on separate nodes so they compose instead of fighting:
 *  • ENTRANCE — each copy element rises on the shared FOREGROUND gate, keyed to the master
 *    schedule (BEAT), exactly as before.
 *  • EXIT — the COPY fades + lifts away early in the pin (two thin wrappers around the
 *    copy groups share one set of motion values). The name is deliberately outside the
 *    wrappers: it must stay at full ink while gravity takes it.
 */
const hidden = (beat: Beat) => ({ y: beat.y, opacity: 0 });
const shown = { y: 0, opacity: 1 } as const;

export function HeroLede({ progress }: { progress: MotionValue<number> }) {
  const { foregroundIn, reduce } = useIntro();
  const { scrollY } = useScroll();
  const fadeDist = useRef(500);

  useEffect(() => {
    const set = () => {
      fadeDist.current = Math.max(1, window.innerHeight * 0.3);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  const opacity = useTransform(scrollY, (v) =>
    Math.max(0, 1 - v / fadeDist.current),
  );
  const y = useTransform(
    scrollY,
    (v) => -Math.min(40, (v / fadeDist.current) * 40),
  );
  const exitStyle = reduce ? undefined : { opacity, y };

  // One entrance recipe for every copy element: rise + fade on the foreground gate, on the
  // shared schedule. Reduced motion settles to the final state with no transform/transition.
  const entrance = (beat: Beat) => ({
    initial: reduce ? false : hidden(beat),
    animate: reduce ? shown : foregroundIn ? shown : hidden(beat),
    transition: reduce
      ? { duration: 0 }
      : { duration: beat.duration, ease: INTRO_EASE, delay: beat.delay },
  });

  return (
    <div className="hero-cluster-v4">
      {/* The page's real heading for a11y/SEO — the visible name is decorative text. */}
      <h1 className="visually-hidden">
        Pratiush — Software Engineer, Product &amp; Design
      </h1>

      <motion.div className="hero-exit-v4" style={exitStyle}>
        <motion.p
          className="hero-eyebrow-v4"
          aria-hidden
          {...entrance(BEAT.eyebrow)}
        >
          Hi, I&apos;m
        </motion.p>
      </motion.div>

      {/* The name — NOT inside an exit wrapper; it stays while gravity takes it. */}
      <MorphName progress={progress} />

      <motion.div className="hero-exit-v4" style={exitStyle}>
        {/* Role — the credential, set directly beneath the name so it qualifies it at a glance. */}
        <motion.p className="hero-roles-v4" {...entrance(BEAT.roles)}>
          Software Engineer · Product &amp; Design
        </motion.p>

        {/* The serif statement closes the lockup — the lingering, personal voice note. */}
        <motion.p className="hero-tagline-v4" {...entrance(BEAT.tagline)}>
          <span className="hero-tagline-v4__line">Good products feel obvious.</span>
          <span className="hero-tagline-v4__line">
            Getting there isn&apos;t.
            <span className="hero-tagline-v4__mark" aria-hidden>
              *
            </span>
          </span>
        </motion.p>
      </motion.div>

      {/* The locator is absolutely positioned, so it rides its own full-inset exit wrapper
          (a transformed wrapper becomes the containing block — this keeps its coordinates
          anchored to the cluster, not to the copy column). */}
      <motion.div className="hero-exit-abs-v4" style={exitStyle}>
        <motion.span
          className="hero-meta-v4"
          aria-label="Based in USA"
          {...entrance(BEAT.meta)}
        >
          <span>Based in USA</span>
        </motion.span>
      </motion.div>
    </div>
  );
}

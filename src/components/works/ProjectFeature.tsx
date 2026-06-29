"use client";

import { useRef } from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";

import { ArrowRight } from "@/components/icons";
import { INTRO_EASE } from "@/lib/intro";
import { useScrubReveal } from "@/lib/reveal";
import type { FeaturedWork } from "@/data/works";

const ease = cubicBezier(...INTRO_EASE);

/**
 * The lead project spread, recomposed as a calm editorial scene (NILINK): an oversized serif
 * title and short copy on the left, the photographed product still bleeding off the right, over
 * the page's own continuous warm field (the page-wide SectionAurora — no panel-specific glow).
 * It reuses the shared `.project-spread-v4` pinned track so the hero handoff (the PROJECTS title
 * lifting away) is preserved, but inside the pin nothing expands from a box: the composition is
 * full from the first frame and its parts settle in.
 *
 * Motion voice (scrub-linked to the pin, so it reads as one fluid handoff out of the hero):
 *  • TITLE / COPY ink in as whole objects via the shared `useScrubReveal` (fade + small rise, plus
 *    a shallow de-blur on the title) — never per-letter, which reads trendy/AI.
 *  • IMAGE reveals from the right in ONE window (opacity + a hair of scale-down + a short de-blur),
 *    then keeps a very slow upward parallax across the hold, and fades + re-blurs on the EXIT.
 * Reduced motion: everything is static and full-opacity.
 */

// Scrub windows over the pinned stage. Entrance is pushed LATE so the title only reads AFTER the
// hero's PROJECTS has faded out (≈p_hero 0.50 ≈ 90vh page-scroll) — no title collision. The image
// comes in earlier and fast to BRIDGE that gap. The long stretch to EXIT is NILINK's settled hold.
// Sequential entry — each beat clears before the next, and ALL of them land after the hero's PROJECTS
// has faded (≈card 0.16), so the project never reads while intro text is still on screen:
// laptop bridges in → title → brief → meta → CTA.
const IMAGE_IN = [0.12, 0.24]; // laptop bridges in first (after PROJECTS starts softening)
const TITLE_IN = [0.2, 0.34] as const;
const DESC_IN = [0.26, 0.4] as const;
const META_IN = [0.3, 0.44] as const; // year · role · stack, a beat behind the brief
const CASE_IN = [0.34, 0.48] as const;
const EXIT = [0.86, 0.97] as const; // body lifts+fades, image fades+re-blurs (page-turn, not a wipe)

export function ProjectFeature({
  work,
  index,
  onViewDetails,
}: {
  work: FeaturedWork;
  index: number;
  onViewDetails: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Title (with a shallow de-blur), then copy on a soft stagger — each as ONE object.
  const titleStyle = useScrubReveal(scrollYProgress, TITLE_IN, {
    y: 20,
    blur: 4,
  });
  const descStyle = useScrubReveal(scrollYProgress, DESC_IN, { y: 14 });
  const metaStyle = useScrubReveal(scrollYProgress, META_IN, { y: 14 });
  const caseStyle = useScrubReveal(scrollYProgress, CASE_IN, { y: 14 });
  // The body (title + copy) lifts and fades as one on the EXIT — the crossfade out.
  const bodyExitStyle = useScrubReveal(scrollYProgress, EXIT, {
    y: -40,
    dir: "out",
  });

  // The spread shows only the opening line — the calm, lead-with-the-idea register of the mockup;
  // the full write-up and stack live in the View Case overlay.
  const brief = work.description.split(/(?<=\.)\s/)[0] ?? work.description;

  // Image: reveal from the right in ONE window, then a very slow upward parallax; fades + re-blurs
  // on the EXIT. (Kept bespoke — it composes an IN window, an EXIT tail, and a colour grade.)
  const imageOpacity = useTransform(
    scrollYProgress,
    [IMAGE_IN[0], IMAGE_IN[1], EXIT[0], EXIT[1]],
    [0, 1, 1, 0],
  );
  const imageX = useTransform(scrollYProgress, IMAGE_IN, [24, 0], { ease });
  const imageScaleIn = useTransform(scrollYProgress, IMAGE_IN, [1.03, 1], {
    ease,
  });
  // Enters near-crisp (just a whisper of blur, not "through fog"), re-blurs only on the EXIT.
  const imageBlur = useTransform(
    scrollYProgress,
    [IMAGE_IN[0], IMAGE_IN[1], EXIT[0], EXIT[1]],
    [1, 0, 0, 3],
  );
  // A whisper of grade lifts the staged photo off the blended cream so it reads as a solid proof
  // object (depth), not a background. Kept tiny — the warm tone is already right.
  const imageFilter = useTransform(
    imageBlur,
    (b) => `blur(${b}px) contrast(1.03) saturate(0.97)`,
  );
  const imageParallax = useTransform(scrollYProgress, [0, 1], [0, -36]);

  const imageStyle: MotionStyle | undefined = reduce
    ? undefined
    : {
        opacity: imageOpacity,
        x: imageX,
        y: imageParallax,
        scale: imageScaleIn,
        filter: imageFilter,
      };

  return (
    <article
      ref={trackRef}
      className={
        index % 2
          ? "project-spread-v4 project-spread-v4--flip"
          : "project-spread-v4"
      }
      style={{ zIndex: index + 1 }}
    >
      <div className="project-spread-v4__pin">
        <div className="project-feature-v4">
          <motion.div
            className="project-feature-v4__body"
            style={reduce ? undefined : bodyExitStyle}
          >
            <motion.h3
              className="project-feature-v4__title"
              style={reduce ? undefined : titleStyle}
            >
              {work.title}
            </motion.h3>

            {/* One quiet line of facts — year · role · the two headline techs — so a hiring manager
                gets the gist at a glance without it reading as a résumé dump. */}
            <motion.p
              className="project-feature-v4__meta"
              style={reduce ? undefined : metaStyle}
            >
              {work.year} · {work.role} · {work.stack.slice(0, 2).join(" · ")}
            </motion.p>
            <motion.p
              className="project-feature-v4__desc"
              style={reduce ? undefined : descStyle}
            >
              {brief}
            </motion.p>

            {/* "View Case" destination is still TBD — wired to the in-page case overlay for now.
                To point it at a live URL instead, swap this <button> for an <a href> + remove
                onViewDetails. */}
            <motion.div
              className="project-feature-v4__cta"
              style={reduce ? undefined : caseStyle}
            >
              <button
                type="button"
                className="project-feature-v4__case"
                onClick={onViewDetails}
              >
                <span className="project-feature-v4__case-label">
                  View Case
                </span>
                <span className="project-feature-v4__case-arrow" aria-hidden>
                  <ArrowRight />
                </span>
              </button>
            </motion.div>
          </motion.div>

          <div className="project-feature-v4__scene">
            {work.cover && (
              <motion.img
                className="project-feature-v4__image"
                src={work.cover}
                alt={work.coverAlt ?? `${work.title} product`}
                style={imageStyle}
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

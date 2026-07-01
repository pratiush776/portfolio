"use client";

import { memo, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { ArrowRight } from "@/components/icons";
import { gsap, useGSAP, INTRO_EASE_NAME } from "@/lib/gsap";
import type { FeaturedWork } from "@/data/works";

/**
 * The lead project spread, recomposed as a calm editorial scene (NILINK): an oversized serif
 * title and short copy on the left, the photographed product still bleeding off the right, over
 * the page's own continuous warm field. It reuses the shared `.project-spread-v4` pinned track so the
 * hero handoff (the PROJECTS title lifting away) is preserved; inside the pin nothing expands from a
 * box — the composition is full from the first frame and its parts settle in.
 *
 * Motion is a single GSAP scrub timeline tied to this spread's own track (the same scroll window the
 * old motion/react `useScroll` used). The timeline's total duration is forced to 1 so its time reads
 * 1:1 as scroll progress, and every reveal uses INTRO_EASE_NAME (the site's hard-landing ease as a
 * CustomEase) so the result matches the previous Motion reveals exactly:
 * The scene arrives as ONE composition, not a per-element checklist:
 *  • IMAGE reveals from the right (opacity + a hair of scale-down + a short de-blur) as the establishing
 *    gesture, then keeps a very slow upward parallax across the hold, and fades + re-blurs on the EXIT.
 *  • The whole TEXT BLOCK settles in together as a single rise + fade — title, facts, brief and CTA on
 *    one gesture (no line-by-line beats) — with only a shallow de-blur on the title for refinement.
 * Reduced motion: the GSAP setup is skipped entirely — everything stays at its static, full default.
 */

// Scrub windows as fractions of the spread's own track progress (timeline time === progress). Two
// overlapping gestures only: the image establishes (leading slightly), then the text block settles onto
// it, so the composition assembles as one moment rather than ticking in part by part.
const IMAGE_IN = [0.06, 0.26] as const;
const BODY_IN = [0.14, 0.32] as const; // the ENTIRE left column, as one unit
const EXIT = [0.86, 0.97] as const; // body lifts+fades, image fades+re-blurs (page-turn, not a wipe)

const span = ([a, b]: readonly [number, number]) => b - a;

function ProjectFeatureBase({
  work,
  index,
  onViewDetails,
}: {
  work: FeaturedWork;
  index: number;
  onViewDetails: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduce) return; // static, full-opacity default — no ScrollTrigger under reduced motion
      const E = INTRO_EASE_NAME;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
      // Spacer: force total duration to exactly 1 so timeline time maps 1:1 onto scroll progress.
      tl.to({}, { duration: 1 }, 0);

      // Text block — the WHOLE left column rises + fades in as ONE unit (title, facts, brief, CTA all on
      // the same gesture, no per-line beats), then lifts + fades as one on EXIT. The title additionally
      // sharpens (a shallow de-blur) within that same window — its opacity rides the block's fade.
      tl.fromTo(
        ".project-feature-v4__body",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: span(BODY_IN), ease: E },
        BODY_IN[0],
      )
        .fromTo(
          ".project-feature-v4__title",
          { filter: "blur(6px)" },
          { filter: "blur(0px)", duration: span(BODY_IN), ease: E },
          BODY_IN[0],
        )
        .to(
          ".project-feature-v4__body",
          { opacity: 0, y: -40, duration: span(EXIT), ease: E },
          EXIT[0],
        );

      // Image — reveal from the right, a slow upward parallax across the whole hold, fade + re-blur on
      // EXIT. The constant contrast/saturate grade lifts the staged photo off the blended cream.
      tl.fromTo(
        ".project-feature-v4__image",
        {
          opacity: 0,
          x: 24,
          scale: 1.03,
          filter: "blur(1px) contrast(1.03) saturate(0.97)",
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px) contrast(1.03) saturate(0.97)",
          duration: span(IMAGE_IN),
          ease: E,
        },
        IMAGE_IN[0],
      )
        .fromTo(
          ".project-feature-v4__image",
          { y: 0 },
          { y: -36, duration: 1, ease: "none" },
          0,
        )
        .to(
          ".project-feature-v4__image",
          {
            opacity: 0,
            filter: "blur(3px) contrast(1.03) saturate(0.97)",
            duration: span(EXIT),
            ease: E,
          },
          EXIT[0],
        );
    },
    { scope, dependencies: [reduce] },
  );

  // The spread shows only the opening line — the calm, lead-with-the-idea register of the mockup;
  // the full write-up and stack live in the View Case overlay.
  const brief = work.description.split(/(?<=\.)\s/)[0] ?? work.description;

  return (
    <article
      ref={scope}
      className="project-spread-v4"
      style={{ zIndex: index + 1 }}
    >
      <div className="project-spread-v4__pin">
        <div className="project-feature-v4">
          <div className="project-feature-v4__body">
            <h3 className="project-feature-v4__title">{work.title}</h3>

            {/* One quiet line of facts — year · role · the two headline techs — so a hiring manager
                gets the gist at a glance without it reading as a résumé dump. */}
            <p className="project-feature-v4__meta">
              {work.year} · {work.role} · {work.stack.slice(0, 2).join(" · ")}
            </p>
            <p className="project-feature-v4__desc">{brief}</p>

            {/* "View Case" opens the full write-up, stack, links and demo video in the shared overlay. */}
            <div className="project-feature-v4__cta">
              <button
                type="button"
                className="project-feature-v4__case"
                onClick={onViewDetails}
              >
                <span className="project-feature-v4__case-label">View Case</span>
                <span className="project-feature-v4__case-arrow" aria-hidden>
                  <ArrowRight />
                </span>
              </button>
            </div>
          </div>

          <div className="project-feature-v4__scene">
            {work.cover && (
              // eslint-disable-next-line @next/next/no-img-element -- staged cover is GSAP-transformed; next/image's wrapper fights the scrub
              <img
                className="project-feature-v4__image"
                src={work.cover}
                alt={work.coverAlt ?? `${work.title} product`}
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Memoized: props are the stable lead work + a (now stable) onViewDetails callback, so the spread
// never re-renders on overlay open/close — the GSAP timeline owns all motion.
export const ProjectFeature = memo(ProjectFeatureBase);

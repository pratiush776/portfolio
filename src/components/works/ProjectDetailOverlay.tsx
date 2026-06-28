"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { INTRO_EASE } from "@/lib/intro";
import type { FeaturedWork } from "@/data/works";

/**
 * The "View details" target for the cinematic project stage — a full-screen overlay (not a
 * route) that lifts the complete case study over the stage: the full first-person write-up,
 * the stack, every link, and the media at a larger size. The stage front stays minimal; the
 * depth lives here.
 *
 * Dismiss paths: the close button, a click on the backdrop, and Escape. Body scroll is locked
 * while open and focus moves to the close control (restored implicitly when the trigger
 * re-renders). Reduced motion drops the slide and just crossfades.
 */
export function ProjectDetailOverlay({
  work,
  open,
  onClose,
}: {
  work: FeaturedWork | null;
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Keep the last opened project so the close (exit) animation still has content to render after the
  // parent clears `work`. Render-phase setState is React's documented "store previous prop" pattern.
  const [shown, setShown] = useState<FeaturedWork | null>(work);
  if (work && work !== shown) setShown(work);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Remember what had focus (the trigger) so we can hand it back when the overlay closes.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const focus = requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(focus);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const duration = reduce ? 0.001 : 0.5;

  return (
    <AnimatePresence>
      {open && shown && (
        <motion.div
          className="project-overlay-v4"
          role="dialog"
          aria-modal="true"
          aria-label={`${shown.title} — project details`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: INTRO_EASE }}
        >
          <motion.div
            className="project-overlay-v4__panel"
            onClick={(event) => event.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 44 }}
            transition={{ duration, ease: INTRO_EASE }}
          >
            <div className="project-overlay-v4__grain" aria-hidden />

            <button
              ref={closeRef}
              type="button"
              className="project-overlay-v4__close"
              onClick={onClose}
              aria-label="Close details"
            >
              <span aria-hidden>×</span>
            </button>

            <div className="project-overlay-v4__grid">
              <div className="project-overlay-v4__media">
                {shown.media.kind === "video" ? (
                  <video
                    className="project-overlay-v4__video"
                    src={shown.media.src}
                    poster={shown.media.poster}
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    aria-label={`${shown.title} demo`}
                  />
                ) : (
                  <div
                    className="project-overlay-v4__plate"
                    style={{ backgroundColor: shown.media.tint }}
                  >
                    <span className="project-overlay-v4__plate-word">
                      {shown.media.word}
                    </span>
                    <span className="project-overlay-v4__plate-caption">
                      {shown.media.caption}
                    </span>
                  </div>
                )}
              </div>

              <div className="project-overlay-v4__body">
                <p className="project-overlay-v4__meta">
                  {shown.year} · {shown.role}
                </p>
                <h2 className="project-overlay-v4__title">{shown.title}</h2>
                <p className="project-overlay-v4__desc">{shown.description}</p>

                <ul className="project-overlay-v4__stack">
                  {shown.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>

                {shown.links.length > 0 && (
                  <div className="project-overlay-v4__links">
                    {shown.links.map(({ label, href }) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-overlay-v4__link"
                      >
                        <span>{label}</span>
                        <span className="project-overlay-v4__link-icon" aria-hidden>
                          <ArrowUpRight />
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

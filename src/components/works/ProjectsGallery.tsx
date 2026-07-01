"use client";

import { useMemo, useState } from "react";

import { featured, type FeaturedWork } from "@/data/works";
import { ProjectDetailOverlay } from "./ProjectDetailOverlay";
import { ProjectFeature } from "./ProjectFeature";

/**
 * The projects section — a sequence of full-bleed editorial spreads (see ProjectFeature), each a
 * pinned stage that crossfades into the next via the overlapping `.project-spread-v4` tracks. Every
 * card uses the same NILINK composition (copy left, product still bleeding off the right). As each
 * remaining `featured` entry gets a `cover` still, bump SHOWN and it drops in with no other change.
 * One shared overlay holds the open case study.
 */
// How many of the `featured` works are recomposed for the new showcase — NILINK + Lucid Tone today;
// bump as the rest get their product stills.
const SHOWN = 2;

export function ProjectsGallery() {
  const [active, setActive] = useState<FeaturedWork | null>(null);
  const works = featured.slice(0, SHOWN);

  // One stable opener per card, built once (`works` is a slice of the module-level `featured` constant
  // and setActive is stable) — so the memoized ProjectFeature never re-renders when the overlay toggles.
  const openers = useMemo(
    () => works.map((work) => () => setActive(work)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `works` is a stable slice of a module constant
    [],
  );

  return (
    <section id="works" className="projects-gallery-v4" aria-label="Projects" tabIndex={-1}>
      {/* Real heading so the decorative morphed PROJECTS doesn't leave a hole in the outline. */}
      <h2 className="visually-hidden">Projects</h2>

      <div className="projects-gallery-v4__spreads">
        {works.map((work, index) => (
          <ProjectFeature
            key={work.title}
            work={work}
            index={index}
            onViewDetails={openers[index]}
          />
        ))}
      </div>

      <ProjectDetailOverlay
        work={active}
        open={active !== null}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

"use client";

import { useState } from "react";

import { featured, type FeaturedWork } from "@/data/works";
import { ProjectDetailOverlay } from "./ProjectDetailOverlay";
import { ProjectFeature } from "./ProjectFeature";

/**
 * The projects section. Right now it shows ONLY the lead case — NILINK — recomposed in the new
 * editorial layout (see ProjectFeature). The remaining `featured` entries are real but still live
 * in the old layout the redesign is replacing, so they're deliberately not rendered here yet; they
 * come back as each is recomposed for the new showcase. One shared overlay holds the open case study.
 */
export function ProjectsGallery() {
  const [active, setActive] = useState<FeaturedWork | null>(null);
  const lead = featured[0];

  return (
    <section id="works" className="projects-gallery-v4" aria-label="Projects">
      {/* Real heading so the decorative morphed PROJECTS doesn't leave a hole in the outline. */}
      <h2 className="visually-hidden">Projects</h2>

      <div className="projects-gallery-v4__spreads">
        <ProjectFeature
          work={lead}
          index={0}
          onViewDetails={() => setActive(lead)}
        />
      </div>

      <ProjectDetailOverlay
        work={active}
        open={active !== null}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

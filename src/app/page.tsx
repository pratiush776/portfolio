import { SectionAurora } from "@/components/decor/SectionAurora";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { HeroSection } from "@/components/hero/HeroSection";
import { ProjectsGallery } from "@/components/works/ProjectsGallery";

/**
 * The landing reads as one pitch, shown not told (no section labels anywhere):
 *   hero (the whole chain) → PROJECTS case panels (the work) → dark footer (the ask).
 * The hero's pinned stage tells the entire opening in place — the word rolls
 * PRATIUSH → PERSONA (the "what I'm made of" beat: character note + tech-DNA helix hold beside the
 * pinned word) → PROJECTS, with the Anton thesis inking in beside the landing word to compose the
 * projects frame (all beats + rest states scheduled in heroTimeline.ts, the beat sheet). At the
 * unpin the composed frame rides up as one and NILINK crests through the hero's feathered bottom.
 * TEMP (layout rework): portrait + "See my works" CTA removed for now. Re-enable by re-adding
 * <HeroPortrait/> / <WorksBadge/> inside HeroSection (they'll need re-fitting to the
 * left-aligned layout).
 */
export default function Home() {
  return (
    <main className="page-v4">
      {/* One continuous, slowly drifting warm field behind the whole page (the hero's own
          field feather-masks into it, so there is no seam between sections). */}
      <SectionAurora />
      <HeroSection />
      {/* Projects — an art-book of full-bleed editorial spreads on the continuous cream surface.
          The lead spread carries the parallax-then-iris entry out of the hero. */}
      <ProjectsGallery />
      <SiteFooter />
    </main>
  );
}

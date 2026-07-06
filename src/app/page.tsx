import { SectionAurora } from "@/components/decor/SectionAurora";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { NarrativeSection } from "@/components/hero/NarrativeSection";

/**
 * The landing reads as one pitch, shown not told (no section labels anywhere):
 *   persistent-title track (the whole opening + the projects grid) → dark footer (the ask).
 * The narrative track scrolls the hero name UP to a dock near the top and holds it as the PERSISTENT
 * section title while every chapter flows beneath it: the name rolls PRATIUSH → PERSONA (the persona
 * manifesto + the compact capability spine hold below it) → PROJECTS, then the Anton thesis parallaxes
 * up as the transitional statement, and the PROJECTS title STAYS DOCKED while the magazine grid scrolls
 * up under it (the grid lives INSIDE the track now — no blank gap). All beats + rest states are
 * scheduled in heroTimeline.ts (the beat sheet). The title releases only at the track's bottom, before
 * the footer.
 */
export default function Home() {
  return (
    <main className="page-v4">
      {/* One continuous, slowly drifting warm field behind the whole page (the narrative track's own
          atmosphere feather-masks into it, so there is no seam between sections). It is also the single
          continuous field behind the projects grid once the stage's own atmosphere has ended. */}
      <SectionAurora />
      <NarrativeSection />
      <SiteFooter />
    </main>
  );
}

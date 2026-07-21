import { SectionAurora } from "@/components/decor/SectionAurora";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { NarrativeSection } from "@/components/hero/NarrativeSection";

/**
 * The landing reads as one pitch, shown not told (no section labels anywhere):
 *   persistent-title track (the whole opening + the projects grid) → dark footer (the ask).
 * The narrative track scrolls the hero name UP to a dock near the top and holds it as the PERSISTENT
 * section title while the chapters flow beneath it: the name rolls PRATIUSH → PERSONA (the persona
 * statement + the compact capability spine hold below it, the DNA helix quietly supporting on the
 * right) → the thesis BRIDGE chapter (the statement fades in, holds, fades out) → PROJECTS, which
 * holds briefly as the section intro and then lifts away so the magazine grid scrolls up into clean
 * space. All beats + rest states are scheduled in heroTimeline.ts (the beat sheet).
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

import { SectionAurora } from "@/components/decor/SectionAurora";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { HeroSection } from "@/components/hero/HeroSection";
import { WorksSection } from "@/components/works/WorksSection";

/**
 * The landing reads as one pitch, shown not told (no section labels anywhere):
 *   hero (the name) → PROJECTS morph + case panels (the work) → dark footer (the ask).
 * The works lead straight out of the hero — the PRATIUSH→PROJECTS gravity morph IS the
 * transition. The transition thesis now inks in beside the landed PROJECTS (see HeroThesis), so
 * the pitch opens on the PRATIUSH -> PROJECTS handoff rather than on a separate intro section.
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
      <WorksSection />
      <SiteFooter />
    </main>
  );
}

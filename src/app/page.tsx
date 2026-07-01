import { SectionAurora } from "@/components/decor/SectionAurora";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { HeroSection } from "@/components/hero/HeroSection";
import { HeroThesisBeat } from "@/components/hero/HeroThesisBeat";
import { ProjectsGallery } from "@/components/works/ProjectsGallery";

/**
 * The landing reads as one pitch, shown not told (no section labels anywhere):
 *   hero (the name) → thesis beat → PROJECTS case panels (the work) → dark footer (the ask).
 * The works lead straight out of the hero — the PRATIUSH→PROJECTS gravity morph IS the
 * transition. The thesis statement then crests in as its OWN scrolling beat (HeroThesisBeat) on real
 * document scroll, forming the diagonal with the landed PROJECTS before the work panels arrive.
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
      {/* The thesis ("Turning rough ideas into polished products") as its OWN scrolling beat — it
          crests up through the still-pinned hero on real document scroll (not a scripted move inside
          the pin), forming the diagonal with the landed PROJECTS, then scrolls off into the work. */}
      <HeroThesisBeat />
      {/* Projects — an art-book of full-bleed editorial spreads on the continuous cream surface.
          The lead spread carries the parallax-then-iris entry out of the hero. */}
      <ProjectsGallery />
      <SiteFooter />
    </main>
  );
}

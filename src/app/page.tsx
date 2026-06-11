import { SectionAurora } from "@/components/decor/SectionAurora";
import { HeroSection } from "@/components/hero/HeroSection";
// TEMP (layout rework): portrait + "See my works" CTA removed for now. Re-enable by re-adding
// <HeroPortrait/> / <WorksBadge/> inside HeroSection (they'll need re-fitting to the left-aligned
// layout). Signature Statement copy now lives as the hero tagline in HeroLede.
import { FeaturedWorks } from "@/components/works/FeaturedWorks";

export default function Home() {
  return (
    <main className="page-v4 text-navy">
      {/* One continuous, slowly drifting warm field behind everything past the hero. */}
      <SectionAurora />
      <HeroSection />

      <FeaturedWorks />

      <footer className="footer-v4" aria-hidden />
    </main>
  );
}

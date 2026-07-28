import { Hero } from "@/components/home/Hero";
import { Past } from "@/components/home/Past";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Statement } from "@/components/home/Statement";
import { WorkIndex } from "@/components/works/WorkIndex";

/**
 * The landing, in five beats: who I am → the promise → the proof → where I come from → the ask.
 * The promise is deliberately only one line: it gives the projects a lens without previewing the
 * same destinations the work index is about to show. Background follows proof, where it adds
 * credibility without delaying the first shipped artifact.
 *
 * The work is the one pinned beat: on a desktop viewport the featured three hold still while the
 * deck scrolls through them (see FeaturedStack), then the page releases into the archive and the
 * footer. Everything either side of it scrolls plainly, and nothing else on the site is scrubbed.
 */
export default function Home() {
  return (
    <main id="main" className="chapters">
      <Hero />
      <Statement />
      <WorkIndex />
      <Past />
      <SiteFooter />
    </main>
  );
}

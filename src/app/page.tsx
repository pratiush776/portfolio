import { Capabilities } from "@/components/home/Capabilities";
import { Hero } from "@/components/home/Hero";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Statement } from "@/components/home/Statement";
import { WorkIndex } from "@/components/works/WorkIndex";

/**
 * The landing, in five beats: who I am → what I do → a promise → the work → the ask. "What I do"
 * is the first beat down, then the statement hands off into the work.
 *
 * The work is the one pinned beat: on a desktop viewport the featured three hold still while the
 * deck scrolls through them (see FeaturedStack), then the page releases into the archive and the
 * footer. Everything either side of it scrolls plainly, and nothing else on the site is scrubbed.
 */
export default function Home() {
  return (
    <main id="main" className="chapters">
      <Hero />
      <Capabilities />
      <Statement />
      <WorkIndex />
      <SiteFooter />
    </main>
  );
}

import { Capabilities } from "@/components/home/Capabilities";
import { Hero } from "@/components/home/Hero";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { WorkIndex } from "@/components/works/WorkIndex";

/**
 * The landing, in four beats: who → the work → what I do → the ask. The work is one
 * screen down; nothing is pinned and nothing is scroll-scrubbed.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <WorkIndex />
      <Capabilities />
      <SiteFooter />
    </main>
  );
}

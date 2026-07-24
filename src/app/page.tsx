import { Capabilities } from "@/components/home/Capabilities";
import { Hero } from "@/components/home/Hero";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Statement } from "@/components/home/Statement";
import { WorkIndex } from "@/components/works/WorkIndex";

/**
 * The landing, in five beats: who → the work → a line → what I do → the ask. The work is one
 * screen down; nothing is pinned and nothing is scroll-scrubbed.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <WorkIndex />
      <Statement />
      <Capabilities />
      <SiteFooter />
    </main>
  );
}

import type { Metadata } from "next";

import { Hero } from "@/components/home/Hero";
import { Past } from "@/components/home/Past";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Statement } from "@/components/home/Statement";
import { WorkIndex } from "@/components/works/WorkIndex";
import {
  GITHUB_URL,
  LINKEDIN_URL,
  PERSON,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Structured data, in schema.org's vocabulary, for the one page meant to be found. The Person ties
 * the name people search for to this site and to the profiles that are also him (`sameAs`); the
 * WebSite is where Google reads the site name it shows above the result.
 */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PERSON.name,
      alternateName: "PRATIUSH",
      url: SITE_URL,
      image: `${SITE_URL}/images/portrait_v2.png`,
      jobTitle: PERSON.role,
      description: SITE_DESCRIPTION,
      address: {
        "@type": "PostalAddress",
        addressRegion: "NJ",
        addressCountry: "US",
      },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Caldwell University" },
      sameAs: [GITHUB_URL, LINKEDIN_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: PERSON.name,
      alternateName: "PRATIUSH",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

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
    <>
      {/* Outside <main>: inside it, the script would be the chapters' first child and the flow
          rule (`.chapters > * + *`) would hand the hero a chapter step above it. `<` is escaped
          so nothing in the data can close the tag early — Next's recommended form for JSON-LD. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
        }}
      />
      <main id="main" className="chapters">
        <Hero />
        <Statement />
        <WorkIndex />
        <Past />
        <SiteFooter />
      </main>
    </>
  );
}

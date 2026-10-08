import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { CaseView } from "@/components/works/CaseView";
import { works, getWork } from "@/data/works";
import { PERSON } from "@/lib/site";

/**
 * A case page per case work. Server Component: it resolves the work by slug
 * (`notFound()` if the slug is bogus) and hands presentation to the client `CaseView`.
 * Prev/next wrap around the full `works` order so every page offers both directions.
 */

// Prebuild every case page at build time — all works, including the secondary RAG agent that
// shows as an archive row rather than a grid card.
export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return { title: "Project not found" };
  // Search shows the landing page alone; a case page is reached from it or by its own URL, never
  // as a result or a sitelink under it. `follow` keeps its links crawlable, and it stays open in
  // robots.txt on purpose — a blocked page can still be listed, because Google never reads the
  // noindex. No canonical: one saying "index this URL" beside a noindex is a contradiction.
  // Its own preview text when the URL is shared directly, on the root's card image. A page that
  // declares `openGraph` REPLACES the inherited block rather than merging into it — image and all —
  // so the parent's resolved images are carried across by hand, as Next documents.
  const images = (await parent).openGraph?.images ?? [];
  const title = `${work.title} — ${PERSON.name}`;
  return {
    title: work.title,
    description: work.description,
    robots: { index: false, follow: true },
    openGraph: {
      type: "article",
      siteName: PERSON.name,
      locale: "en_US",
      url: `/works/${work.slug}`,
      title,
      description: work.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: work.description,
      images,
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  // Wrap-around prev/next across all works, so the case footer always offers both directions.
  const index = works.findIndex((w) => w.slug === work.slug);
  const prev = works[(index - 1 + works.length) % works.length];
  const next = works[(index + 1) % works.length];

  return (
    <>
      <CaseView work={work} prev={prev} next={next} />
      <SiteFooter />
    </>
  );
}

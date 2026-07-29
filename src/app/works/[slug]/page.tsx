import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { CaseView } from "@/components/works/CaseView";
import { works, getWork } from "@/data/works";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return { title: "Project not found" };
  return {
    title: `${work.title} — PRATIUSH`,
    description: work.description,
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

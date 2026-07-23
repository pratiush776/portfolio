import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseView } from "@/components/works/CaseView";
import { featured, getWork } from "@/data/works";

/**
 * A case page per featured work. Server Component: it resolves the work by slug
 * (`notFound()` if the slug is bogus) and hands presentation to the client `CaseView`.
 * Prev/next wrap around the `featured` order so every page offers both directions.
 */

// Prebuild all four case pages at build time (the grid only ever links to these slugs).
export function generateStaticParams() {
  return featured.map((work) => ({ slug: work.slug }));
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
    title: `${work.title} — Pratiush Karki`,
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

  // Wrap-around prev/next in the featured order, so the case footer always offers both directions.
  const index = featured.findIndex((w) => w.slug === work.slug);
  const prev = featured[(index - 1 + featured.length) % featured.length];
  const next = featured[(index + 1) % featured.length];

  return <CaseView work={work} prev={prev} next={next} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionAurora } from "@/components/decor/SectionAurora";
import { CaseView } from "@/components/works/CaseView";
import { featured, getWork } from "@/data/works";

/**
 * A dedicated case-study page per featured work (/works/[slug]) — the calm real route the magazine
 * grid links into. Server Component: it resolves the work by slug (`notFound()` if the slug is bogus)
 * and hands the presentation + motion to the client `CaseView`. Prev/next are computed from the
 * `featured` order with wrap-around so every page has both. SiteNav / SmoothScroll / SiteFooter come
 * from the root layout; SectionAurora is `position:fixed` and rendered per-page (see page.tsx), so we
 * render one here too — otherwise the case route would sit on the bare background with no warm field.
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

  return (
    <>
      <SectionAurora />
      <CaseView work={work} prev={prev} next={next} />
    </>
  );
}

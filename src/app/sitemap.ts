import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * /sitemap.xml — the landing page only. It is the one page meant to appear in search; the case
 * pages carry `noindex` (see works/[slug]/page.tsx), and listing a noindexed URL here would be
 * reported in Search Console as an error rather than ignored.
 *
 * URLs only. No `lastModified`: the content carries no real edit dates, and an invented one
 * teaches Google to ignore the field. `priority` and `changeFrequency` are left out because
 * Google ignores both.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL }];
}

import type { MetadataRoute } from "next";

import { works } from "@/data/works";
import { SITE_URL } from "@/lib/site";

/**
 * /sitemap.xml — the landing page and every case page, read from the same `works` list that
 * prebuilds the /works/[slug] routes, so a new project is listed the moment it has a page.
 *
 * URLs only. No `lastModified`: the content carries no real edit dates, and an invented one
 * teaches Google to ignore the field. `priority` and `changeFrequency` are left out because
 * Google ignores both.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    ...works.map((work) => ({ url: `${SITE_URL}/works/${work.slug}` })),
  ];
}

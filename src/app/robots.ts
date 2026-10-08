import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** /robots.txt — everything is open to crawl, and it names the sitemap so crawlers find it
    without being told by hand. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

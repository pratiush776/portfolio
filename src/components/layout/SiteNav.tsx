import Link from "next/link";

import { MenuToggle } from "@/components/layout/MobileMenu";
import { NavScroll } from "@/components/layout/NavScroll";

/* The two landing-page fragment links intentionally stay native anchors: Next's `scroll={false}`
   leaves reduced-motion visitors with no scroll owner, while its default scroll races Lenis. */
/* eslint-disable @next/next/no-html-link-for-pages */

/**
 * The fixed bar. `mix-blend-mode: difference` (see .site-nav) inverts it against whatever
 * scrolls underneath, so it stays legible over bone, over the ink footer, and over imagery.
 * The veil under it (see NavScroll) gives that inversion one even tone to work against, so the
 * content scrolling by never competes with the bar's words. It is a sibling rather than a child
 * because the blend mode makes the bar a backdrop root: a blur inside it would only see the bar.
 *
 * The inner row runs system-wide on its own thin gutter — wider than the content's inset
 * measure — so the header opens the page rather than sitting on the content axis.
 */
export function SiteNav() {
  return (
    <>
      <NavScroll />
      <nav className="site-nav" aria-label="Primary">
        {/* Navigation, not content: kept out of search snippets so Google quotes the page. */}
        <div className="site-nav__inner" data-nosnippet="">
          <Link
            href="/"
            className="site-nav__brand"
            aria-label="PRATIUSH — home"
          >
            PRATIUSH
          </Link>

          {/* Plain anchors for the in-page destinations. Lenis intercepts them while it is mounted;
            under reduced motion it is deliberately absent, so the browser's native fragment
            navigation remains the working fallback instead of a Next link with scrolling
            disabled and nobody left to move the page. */}
          <div className="site-nav__links">
            <a href="/#work" className="site-nav__link underline-link">
              Work
            </a>
            <Link
              href="/CV.pdf"
              className="site-nav__link underline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </Link>
            <a href="/#contact" className="site-nav__link underline-link">
              Contact
            </a>
          </div>

          {/* Below 768px this is the navigation and the row of links above is hidden; above it, the
            reverse. The two swap in CSS, so this stays a server component and only the toggle
            itself ships as client JS. The panel it controls is NOT in here — see MobileMenu for
            why the bar's blend mode forces it to be a sibling. */}
          <MenuToggle />
        </div>
      </nav>
    </>
  );
}

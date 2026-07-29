import Link from "next/link";

/* The two landing-page fragment links intentionally stay native anchors: Next's `scroll={false}`
   leaves reduced-motion visitors with no scroll owner, while its default scroll races Lenis. */
/* eslint-disable @next/next/no-html-link-for-pages */

/**
 * The fixed bar. `mix-blend-mode: difference` (see .site-nav) inverts it against whatever
 * scrolls underneath, so it stays legible over bone, over the ink footer, and over imagery
 * without needing a background plate of its own.
 *
 * The inner row runs system-wide on its own thin gutter — wider than the content's inset
 * measure — so the header opens the page rather than sitting on the content axis.
 */
export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__brand" aria-label="PRATIUSH — home">
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
      </div>
    </nav>
  );
}

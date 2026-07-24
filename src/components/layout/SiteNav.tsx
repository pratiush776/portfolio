import Link from "next/link";

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
        <Link href="/" className="site-nav__brand" aria-label="Pratiush — home">
          Pratiush
        </Link>

        <div className="site-nav__links">
          <Link href="/#work" className="site-nav__link underline-link">
            Work
          </Link>
          <Link
            href="/CV.pdf"
            className="site-nav__link underline-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </Link>
          <Link href="/#contact" className="site-nav__link underline-link">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

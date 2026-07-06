import Link from "next/link";

import { NavLogo } from "./NavLogo";

export function SiteNav() {
  return (
    <nav className="site-nav-v3" aria-label="Primary">
      {/* The wordmark SVG lives here as the persistent identity anchor. On the landing it stays
          hidden while the big hero name owns the identity, then reveals as MORPH 1 begins (the word
          stops being "Pratiush"); on routes with no narrative track it's simply visible (see NavLogo). */}
      <Link href="/" className="site-nav-v3__brand" aria-label="Pratiush — home">
        <NavLogo />
      </Link>

      <div className="site-nav-v3__links">
        <Link href="/#works" className="site-nav-v3__link">
          Works
        </Link>
        <Link
          href="/CV.pdf"
          className="site-nav-v3__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
          {/* Signposts the PDF as a grabbable artifact — the recruiter's highest-intent target. */}
          <span className="site-nav-v3__ext" aria-hidden>
            ↗
          </span>
        </Link>
        {/* Plain text, same as the other links — more editorial than a SaaS-style pill. */}
        <Link href="/#contact" className="site-nav-v3__link">
          Connect
        </Link>
      </div>
    </nav>
  );
}

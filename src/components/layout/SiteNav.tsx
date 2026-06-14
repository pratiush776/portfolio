import Link from "next/link";

import { NavLogo } from "./NavLogo";

export function SiteNav() {
  return (
    <nav className="site-nav-v3" aria-label="Primary">
      {/* The wordmark SVG lives here as the persistent identity anchor. On the landing it
          stays hidden while the big hero name owns the stage, then reveals as the name
          morphs into PROJECTS (see NavLogo). */}
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
        </Link>
        <Link href="/#contact" className="site-nav-v3__contact">
          Connect
        </Link>
      </div>
    </nav>
  );
}

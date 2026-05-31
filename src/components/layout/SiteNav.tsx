import Link from "next/link";
import { NavConnect } from "./NavConnect";

export function SiteNav() {
  return (
    <nav className="site-nav-v3" aria-label="Primary">
      <Link href="/" className="site-nav-v3__logo">
        PRATIUSH
      </Link>
      <div className="site-nav-v3__links">
        <Link href="/works" className="site-nav-v3__link">
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
        <NavConnect />
      </div>
    </nav>
  );
}

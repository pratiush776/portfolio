import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav-v3" aria-label="Primary">
      {/*
        Logo slot. The visible "PRATIUSH" glyphs are NOT text here anymore — they're the
        layout-level <BrandMark/> wordmark that morphs in from the hero on scroll and parks
        over this slot. This element just (a) reserves the logo's footprint so the right-side
        links sit correctly, (b) gives <BrandMark/> a rect to measure ([data-brand-nav]), and
        (c) stays the clickable home link underneath the (pointer-events:none) wordmark.
      */}
      <Link href="/" className="site-nav-v3__brand" aria-label="Pratiush — home" data-brand-nav />
      <div className="site-nav-v3__links">
        <Link href="/#works-heading" className="site-nav-v3__link">
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
        <Link href="mailto:pratiush776@gmail.com" className="site-nav-v3__contact">
          Connect
        </Link>
      </div>
    </nav>
  );
}

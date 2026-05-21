"use client";

import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";

export function SiteNav() {
  return (
    <nav className="site-nav-v3" aria-label="Primary">
      <Link href="/" className="site-nav-v3__logo">
        PRATIUSH
      </Link>
      <div className="site-nav-v3__links">
        <Link href="#projects" className="site-nav-v3__link">
          Work
        </Link>
        <Link
          href="/CV.pdf"
          className="site-nav-v3__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
        </Link>
        <Link href="#contact" className="site-nav-v3__contact">
          Get in touch
        </Link>
      </div>
    </nav>
  );
}

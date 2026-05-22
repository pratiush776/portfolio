"use client";

import Link from "next/link";
import { useContactModal } from "@/components/contact/ContactModalProvider";

export function SiteNav() {
  const { open } = useContactModal();

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
        <button
          type="button"
          onClick={open}
          className="site-nav-v3__contact"
        >
          Connect
        </button>
      </div>
    </nav>
  );
}

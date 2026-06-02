"use client";

import { useEffect } from "react";

import { NAV_LINE_PX, resetNavTheme, setSectionAtNav } from "./nav-theme";

// The global fixed nav uses dark ink, which vanishes over the dark skills
// section. This watches a 1px detection line at the nav's vertical band and
// reports whether the dark section's box is crossing it. The actual flip to
// off-white is gated in nav-theme.ts so it only happens once the dark visually
// covers the nav (during the desktop bloom the section is at the nav line while
// still masked — see SkillsSection / nav-theme.ts).
export function NavThemeObserver() {
  useEffect(() => {
    const target = document.querySelector<HTMLElement>(".skills-section-v3");
    if (!target) return;

    let observer: IntersectionObserver | null = null;

    const build = () => {
      observer?.disconnect();
      // Isolate a 1px observation band at y = NAV_LINE_PX so the flip fires
      // only while the section actually crosses the nav, not on mere entry.
      const bottom = -(window.innerHeight - NAV_LINE_PX - 1);
      observer = new IntersectionObserver(
        ([entry]) => setSectionAtNav(entry.isIntersecting),
        { rootMargin: `${-NAV_LINE_PX}px 0px ${bottom}px 0px`, threshold: 0 },
      );
      observer.observe(target);
    };

    build();
    window.addEventListener("resize", build);

    return () => {
      window.removeEventListener("resize", build);
      observer?.disconnect();
      resetNavTheme();
    };
  }, []);

  return null;
}

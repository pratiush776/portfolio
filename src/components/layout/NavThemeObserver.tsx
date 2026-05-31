"use client";

import { useEffect } from "react";

// The global fixed nav uses dark ink, which vanishes over the dark skills
// section. This watches a 1px detection line at the nav's vertical band and
// flips `data-nav-theme="dark"` on <body> while the dark section sits behind
// the nav, so CSS can swap the nav to off-white (see globals.css).
const NAV_LINE_PX = 56;

export function NavThemeObserver() {
  useEffect(() => {
    const target = document.querySelector<HTMLElement>(".skills-section-v3");
    if (!target) return;

    let observer: IntersectionObserver | null = null;

    const setTheme = (dark: boolean) => {
      if (dark) document.body.dataset.navTheme = "dark";
      else delete document.body.dataset.navTheme;
    };

    const build = () => {
      observer?.disconnect();
      // Isolate a 1px observation band at y = NAV_LINE_PX so the flip fires
      // only while the section actually crosses the nav, not on mere entry.
      const bottom = -(window.innerHeight - NAV_LINE_PX - 1);
      observer = new IntersectionObserver(
        ([entry]) => setTheme(entry.isIntersecting),
        { rootMargin: `${-NAV_LINE_PX}px 0px ${bottom}px 0px`, threshold: 0 },
      );
      observer.observe(target);
    };

    build();
    window.addEventListener("resize", build);

    return () => {
      window.removeEventListener("resize", build);
      observer?.disconnect();
      setTheme(false);
    };
  }, []);

  return null;
}

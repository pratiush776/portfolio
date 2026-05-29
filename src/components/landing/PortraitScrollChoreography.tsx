"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PortraitScrollChoreography() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1100px)").matches;
    if (reduced || !desktop) return;

    const portrait = document.querySelector<HTMLElement>(".hero-pratiush-photo-v3");
    const section = document.querySelector<HTMLElement>(".skills-section-v3");
    if (!portrait || !section) return;

    gsap.registerPlugin(ScrollTrigger);

    // Take ownership of the portrait's horizontal centering so GSAP's composed
    // transform survives across tweens and resizes.
    gsap.set(portrait, { xPercent: -50, x: 0, y: 0, force3D: true });

    const ctx = gsap.context(() => {
      const tween = gsap.to(portrait, {
        y: 0, // resolved by the function below at refresh time
        ease: "none",
      });

      const trigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: () => {
          const portraitRect = portrait.getBoundingClientRect();
          const currentY = getCurrentTranslateY(portrait);
          const portraitTopDocY = portraitRect.top + window.scrollY - currentY;
          const portraitCenterDocY = portraitTopDocY + portraitRect.height / 2;
          const skillsCenterDocY = section.offsetTop + section.offsetHeight / 2;
          const vh = window.innerHeight;
          const scrollEnd = skillsCenterDocY - vh / 2;

          tween.vars.y = skillsCenterDocY - portraitCenterDocY;
          tween.invalidate();

          return Math.max(scrollEnd, 1);
        },
        scrub: 1,
        invalidateOnRefresh: true,
        animation: tween,
      });

      // Refresh once fonts have settled so the measured rect is final.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }

      return () => {
        trigger.kill();
      };
    });

    return () => {
      ctx.revert();
      gsap.set(portrait, { clearProps: "all" });
    };
  }, []);

  return null;
}

// Reads the current GSAP-applied y so we can subtract it out and recover the
// portrait's at-rest document y (the y it would have with translateY = 0).
function getCurrentTranslateY(el: HTMLElement): number {
  const gsTransform = (gsap.getProperty(el, "y") as number) ?? 0;
  return gsTransform;
}

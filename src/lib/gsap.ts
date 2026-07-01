"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

import { INTRO_EASE } from "@/lib/intro";

/**
 * Central GSAP registration. Importing this module anywhere guarantees ScrollTrigger, CustomEase and
 * useGSAP are registered ONCE before any scroll animation runs (per GSAP's official skill — register
 * plugins once, centrally). Guarded so it never runs during SSR (GSAP must not touch the server).
 *
 * Always import gsap / ScrollTrigger / useGSAP / INTRO_EASE_NAME from HERE, not directly from the
 * packages, so the registration (and the named ease) is guaranteed to exist.
 */

/** The site's hard-landing reveal ease, as a named GSAP CustomEase mirroring INTRO_EASE 1:1 so GSAP
 *  timelines match the Motion `cubicBezier(...INTRO_EASE)` reveals exactly. Use `ease: INTRO_EASE_NAME`. */
export const INTRO_EASE_NAME = "intro";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
  // Mirror INTRO_EASE [x1,y1,x2,y2] as a named CustomEase (re-creating on fast-refresh is harmless).
  const [x1, y1, x2, y2] = INTRO_EASE;
  CustomEase.create(INTRO_EASE_NAME, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
}

export { gsap, ScrollTrigger, CustomEase, useGSAP };

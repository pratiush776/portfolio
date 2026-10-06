"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Scroll travel (px) below which a direction change is ignored, so a trackpad's settle or a
    one-notch nudge does not flick the bar in and out. */
const SCROLL_SLOP = 6;

/**
 * The bar's scroll-driven state, and the plate it sits on.
 *
 * THE PLATE. The bar inverts against whatever is beneath it, and that only reads when the thing
 * beneath is one even tone — over type, blurred or not, the inversion lands on mid-greys and the
 * words go muddy. So the veil is a frosted plate in the surface the bar is crossing: bone over
 * the page, ink over the footer. The tone flips when the footer's top edge passes the bar's
 * centre line. The phone menu's panel paints above the plate, so its curtain covers it in the
 * same stroke as the rest of the screen.
 *
 * THE BAR. It leaves on scroll down and returns on scroll up, and always shows within its own
 * height of the top. The state is `html.is-nav-hidden`, read by the stylesheet, which also keeps
 * the bar in while the menu is open or anything in it has focus.
 *
 * Read on scroll rather than with an IntersectionObserver because the footer is replaced on
 * every route change; querying it per frame means there is no stale node to keep track of.
 */
export function NavScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const veil = ref.current;
    if (!veil) return;
    const root = document.documentElement;

    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const nav = document.querySelector<HTMLElement>(".site-nav");
      const footer = document.querySelector<HTMLElement>(".footer");
      const height = nav?.offsetHeight ?? 0;

      veil.dataset.tone =
        footer && footer.getBoundingClientRect().top <= height / 2
          ? "ink"
          : "bone";

      const y = window.scrollY;
      const delta = y - lastY;
      if (y <= height) {
        root.classList.remove("is-nav-hidden");
        lastY = y;
      } else if (Math.abs(delta) >= SCROLL_SLOP) {
        root.classList.toggle("is-nav-hidden", delta > 0);
        lastY = y;
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
      root.classList.remove("is-nav-hidden");
    };
  }, [pathname]);

  return <div ref={ref} className="site-nav-veil" aria-hidden />;
}

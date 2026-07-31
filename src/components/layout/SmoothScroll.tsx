"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useIntro } from "@/components/intro/IntroContext";
import { useMenu } from "@/components/layout/MobileMenu";

/**
 * Root smooth-scroll provider, and the page's single animation clock.
 *
 * Lenis and Motion each ship their own requestAnimationFrame loop, and left alone they run as two
 * independent passes in an order the browser doesn't guarantee. That is invisible while nothing is
 * scroll-scrubbed, but the featured deck reads `window.scrollY` every frame to place a card: when
 * the two loops fall out of step, the card is positioned from a scroll value Lenis is about to
 * change in the same frame, and the travel picks up a shimmer that no amount of easing removes.
 *
 * So Lenis' own loop is switched off (`autoRaf: false`) and driven from Motion's scheduler instead.
 * One clock, one ordering: scroll settles, then everything reading it updates.
 *
 * Under `prefers-reduced-motion` the children render with native scrolling and Lenis is skipped
 * entirely; the deck drops to its flat layout on the same signal, so nothing is left scrubbing.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { locked } = useIntro();
  const { open: menuOpen } = useMenu();
  const lenis = useRef<LenisRef>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const update = ({ timestamp }: { timestamp: number }) => {
      lenis.current?.lenis?.raf(timestamp);
    };

    // `keepAlive` — the callback has to run every frame, not once.
    frame.update(update, true);
    return () => cancelFrame(update);
  }, [prefersReducedMotion]);

  // The intro holds the page, and this is the half of that lock CSS cannot do. `overflow: clip` on
  // <html> stops the document scrolling, but Lenis keeps its own target position and would go on
  // accumulating wheel delta behind the curtain — then spend all of it at once the moment the lock
  // came off. Stopping the instance is what makes the held page actually still.
  //
  // TWO REASONS TO HOLD, ONE PLACE THAT HOLDS. The open mobile menu wants exactly the same thing
  // for exactly the same reason, and it would have exactly the same bug if it settled for the CSS
  // half. It cannot stop the instance itself — this component owns it — so it raises its flag here
  // instead. Two components calling stop() and start() on one instance would race: whichever
  // released last would win, and a menu closing during the intro would hand the page over early.
  const held = locked || menuOpen;
  useEffect(() => {
    const instance = lenis.current?.lenis;
    if (!instance) return;
    if (held) instance.stop();
    else instance.start();
  }, [held]);

  // A route change lands the new page at the old page's scroll offset, and the reason is that
  // Next's scroll-to-top and Lenis disagree about who owns the position. Next calls
  // `window.scrollTo(0, 0)`; Lenis only adopts an outside scroll while it believes itself idle —
  // `onNativeScroll` returns early whenever `isScrolling === "smooth"`. Click a card during the
  // ~150ms the wheel is still settling and Lenis never sees the reset, so it holds the landing
  // page's target and the next frame drives the case page straight back down to it.
  //
  // Resetting the instance is what makes the arrival stick. `force` because the intro stops Lenis
  // and a stopped instance refuses `scrollTo`; `immediate` because there is nothing to animate
  // across a page that has just been replaced.
  const restoringTo = useRef<string | null>(null);
  const navigated = useRef(false);

  // Back and forward are Next's to restore — it remembers those offsets, and the landing page's
  // pinned deck is a long way to make somebody scroll again. Recording the path popstate is
  // heading to (rather than a bare flag) keeps a hash-only step in history, which never changes
  // `pathname` and so never reaches the effect below, from swallowing the next real navigation.
  useEffect(() => {
    const remember = () => {
      restoringTo.current = window.location.pathname;
    };
    window.addEventListener("popstate", remember);
    return () => window.removeEventListener("popstate", remember);
  }, []);

  useEffect(() => {
    // The first pass is the initial load, where the browser's own restoration and any `/#…`
    // fragment in the URL already own the position.
    if (!navigated.current) {
      navigated.current = true;
      return;
    }

    const restoring = restoringTo.current === pathname;
    restoringTo.current = null;
    if (restoring) return;

    lenis.current?.lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  if (prefersReducedMotion) return <>{children}</>;

  return (
    // Lerp mode: each frame the scroll position eases toward the target by a fixed fraction —
    // a continuous inertial glide rather than a per-input timed animation, the feel the
    // reference scrolls with. Lower `lerp` floats heavier, higher is snappier and closer to
    // native; this is the one knob for the scroll character. Touch is left native (Lenis does
    // not sync touch by default), so phones keep their own momentum.
    <ReactLenis
      root
      ref={lenis}
      options={{
        // Lenis damps frame-rate independently with lambda = lerp × 60, so this is a settling time
        // constant of 1/6.6 ≈ 152ms. It has been 0.1 (167ms, which trailed the wheel and read as
        // floaty) and 0.13 (128ms, matched from adcker.com), and this sits between them: the extra
        // ~24ms of settle spreads each wheel tick over more frames, which is what takes the
        // hardness off the scrubbed deck without giving the page back its float. The deck's own
        // scroll length (--stack-step) is the other half of that knob and is deliberately untouched
        // — it sets the ms the copy's choreography was calibrated against.
        lerp: 0.11,
        smoothWheel: true,
        autoRaf: false,
        // In-page links glide instead of jumping. Off by default, which left the nav's `/#work`
        // and `/#contact` as the only hard cuts on a page whose whole character is the glide —
        // Lenis' handler matches the `/#…` form these use, so it is one flag away. They remain
        // plain anchors so native fragment navigation still works when reduced motion skips Lenis.
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

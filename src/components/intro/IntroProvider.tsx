"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { FONT_GATE_MS } from "@/lib/intro";

/**
 * The single clock for the landing opening. Mounted at the layout level (above <BrandMark/>,
 * which is layout-scoped) so every participant — backdrop, wordmark, hero copy, scroll cue —
 * reads the SAME two gates instead of each firing its own uncoordinated entrance.
 *
 *  • backdropIn  — flips true right after mount → CSS blooms the decor layers in (instant life).
 *  • foregroundIn — flips true once `document.fonts.ready` resolves (capped at FONT_GATE_MS) →
 *    the name + copy beats play, so display type never reveals in a fallback face then snaps.
 *
 * Reduced motion: both gates resolve immediately; consumers render final states and the CSS
 * `prefers-reduced-motion` block strips the transitions, so nothing animates or stays hidden.
 */
type IntroState = {
  backdropIn: boolean;
  foregroundIn: boolean;
  reduce: boolean;
};

const IntroContext = createContext<IntroState>({
  backdropIn: false,
  foregroundIn: false,
  reduce: false,
});

export const useIntro = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  const [backdropIn, setBackdropIn] = useState(false);
  const [foregroundIn, setForegroundIn] = useState(false);

  useEffect(() => {
    if (reduce) {
      // No bloom, no FOUT wait — settle everything at once.
      setBackdropIn(true);
      setForegroundIn(true);
      return;
    }

    // Mount → backdrop blooms (the "out" first paint is the frame the bloom grows from).
    setBackdropIn(true);

    // Foreground waits for fonts, but never longer than FONT_GATE_MS.
    let settled = false;
    const reveal = () => {
      if (settled) return;
      settled = true;
      setForegroundIn(true);
    };

    const timer = window.setTimeout(reveal, FONT_GATE_MS);
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (fonts?.ready) {
      fonts.ready.then(reveal).catch(reveal);
    } else {
      reveal();
    }

    return () => window.clearTimeout(timer);
  }, [reduce]);

  return (
    <IntroContext.Provider value={{ backdropIn, foregroundIn, reduce }}>
      {children}
    </IntroContext.Provider>
  );
}

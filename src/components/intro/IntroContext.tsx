"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { Preloader } from "@/components/intro/Preloader";

/**
 * The intro's two signals, and who listens to them.
 *
 * `ready` — the hero's cue. It fires partway through the curtain's lift, so the page is already
 *   moving by the time the ink has cleared.
 * `locked` — the page is not the visitor's yet. Lenis stops on this; the document's own scroll is
 *   clipped by CSS from before hydration, which is the half a class can do and a hook cannot.
 *
 * Two signals rather than one because they are genuinely different moments: the hero comes alive
 * mid-lift, but scroll stays held until the ink is completely gone. Releasing the wheel while a
 * curtain is still crossing the screen would let the visitor scroll the page out from under it.
 */
type Intro = { ready: boolean; locked: boolean };

/**
 * The default is the no-intro answer — ready, unlocked. Any component reading this outside the
 * provider behaves exactly as it did before the preloader existed, which is what makes the gate
 * safe to add one component at a time.
 */
const IntroContext = createContext<Intro>({ ready: true, locked: false });

export const useIntro = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  // Both start at the SSR-safe answer: nothing has arrived, and nothing is locked. `ready` is
  // corrected before the first paint by the Preloader's layout effect on the loads that skip the
  // intro, so the hero never shows a frame of itself at opacity 0. `locked` starts false so a
  // skipped intro cannot stop Lenis even for a frame.
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);

  const onHandoff = useCallback(() => setReady(true), []);
  const onRelease = useCallback(() => setLocked(false), []);
  const onHold = useCallback(() => setLocked(true), []);

  const value = useMemo(() => ({ ready, locked }), [ready, locked]);

  return (
    <IntroContext.Provider value={value}>
      <Preloader onHold={onHold} onHandoff={onHandoff} onRelease={onRelease} />
      {children}
    </IntroContext.Provider>
  );
}

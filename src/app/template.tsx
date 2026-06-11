"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

// Persists across client-side navigations (the module isn't re-evaluated), so it's `false` only
// on the very first paint of a full load and `true` for every subsequent route change.
// Mutated only in an effect (client-only) — never during render — so SSR always emits the
// first-paint passthrough state and hydration matches.
let navigated = false;

/**
 * Route-transition fade. On the FIRST paint it's a passthrough — the landing opening choreography
 * (IntroProvider) owns that reveal, and a competing whole-page fade is exactly what made the old
 * opening feel uncoordinated. On later navigations it fades the incoming route in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  // Lazy initializer runs once per mount: `false` is read identically on the server and on the
  // client's hydration render, so the initial markup matches. The effect below flips the shared
  // flag only on the client, after paint.
  const [firstPaint] = useState(() => !navigated);

  useEffect(() => {
    navigated = true;
  }, []);

  return (
    <motion.div
      initial={firstPaint ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: firstPaint ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

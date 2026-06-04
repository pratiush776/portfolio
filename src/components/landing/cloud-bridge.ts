// Module singleton bridging the scroll choreography to the CloudDeck WebGL
// renderer, mirroring the nav-theme.ts pattern. CloudDeck is mounted inside the
// skills section but must be driven from the GLOBAL scroll (PortraitScroll-
// Choreography) so the clouds can thicken during the hero recede — before the
// section's own pinned timeline is active. Rather than prop-drill a ref through
// the server-component page.tsx, CloudDeck registers its imperative handle here
// on mount and the choreography pushes scroll-derived values through these
// setters. No-ops until a deck is registered (e.g. reduced-motion / mobile,
// where CloudDeck renders null).

import type { CloudDeckHandle } from "@/components/decor/CloudDeck";

let deck: CloudDeckHandle | null = null;

export function registerCloudDeck(handle: CloudDeckHandle | null) {
  deck = handle;
}

// Overall cloud amount/opacity: 0 = no clouds (clean hero at page top), 1 =
// dense cover. Rises as the hero recedes, eases to wispy by the sequence end.
export function setCloudCoverage(coverage: number) {
  deck?.setCoverage(coverage);
}

// Radial parting front (0 → 1), expanding outward from the centre so the sky
// opens up as you fly forward and items lock.
export function setCloudClear(clear: number) {
  deck?.setProgress(clear);
}

// Continuous, monotonic scroll-driven flow (0 → 1+) that always drifts/scales
// the cloud field as you scroll — so the clouds are in motion from the very
// first scroll, independent of the parting front.
export function setCloudFlow(flow: number) {
  deck?.setFlow(flow);
}

// Parting origin in viewport CSS px (top-left) — tracks the portrait.
export function setCloudCenter(cssX: number, cssY: number) {
  deck?.setCenter(cssX, cssY);
}

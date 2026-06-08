/**
 * Warm "aurora" backdrop for the hero: two layers of soft, blurred mesh-gradient
 * blobs (see `--mesh-aurora-a/-b`) drifting slowly in opposite directions to add
 * atmospheric, edgeless depth behind the photo + wordmark. Pairs with the grain
 * overlay (`.hero-grain-v3`). Sits at the base of the stack (z-index 0).
 */
export function HeroAurora() {
  return (
    <div className="hero-aurora-v3" aria-hidden>
      <div className="hero-aurora-v3__layer hero-aurora-v3__layer--a" />
      <div className="hero-aurora-v3__layer hero-aurora-v3__layer--b" />
    </div>
  );
}

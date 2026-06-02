import { PratiushMain } from "@/components/vectors/PratiushMain";
import { PratiushOutline } from "@/components/vectors/PratiushOutline";

// NOTE: this wrapper MUST stay a plain element with no z-index / transform /
// opacity / filter of its own — i.e. it must not create a stacking context.
// The two wordmark layers (--main z1, --outline z3) sandwich the portrait
// (z2), which only works while they share the composition's stacking context.
// A motion wrapper here (transform/opacity) collapses that sandwich, so the
// wordmark's kinetic entrance lives at the LAYER level (faded individually by
// PortraitScrollChoreography), never on this wrapper.
export function HeroPratiushText() {
  return (
    <div className="hero-pratiush-stack-v3">
      <div className="hero-pratiush-v3 hero-pratiush-v3--main" aria-hidden>
        <PratiushMain aria-hidden />
      </div>
      <div className="hero-pratiush-v3 hero-pratiush-v3--outline" aria-hidden>
        <PratiushOutline aria-hidden />
      </div>
    </div>
  );
}

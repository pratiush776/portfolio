import { PratiushMain } from "@/components/vectors/PratiushMain";
import { PratiushOutline } from "@/components/vectors/PratiushOutline";

// NOTE: the two wordmark layers are rendered as DIRECT children of
// `.hero-composition-v3` (no wrapper) for two reasons:
//   1. Sandwich — --main (z1) and --outline (z3) must share the composition's
//      stacking context so the portrait (z2) sits between them. A wrapper with
//      no stacking context allowed this too, but a wrapper is unnecessary.
//   2. 3D — the composition owns the `perspective`. CSS perspective only
//      reaches DIRECT children, so a wrapper would flatten the layers' 3D
//      transforms (rotateX/translateZ would be ignored, only filter applied).
// Both layers carry identical positioning (.hero-pratiush-v3) so they overlay
// exactly and stay aligned; PortraitScrollChoreography animates them in lockstep
// (the outline only fades earlier).
export function HeroPratiushText() {
  return (
    <>
      <div className="hero-pratiush-v3 hero-pratiush-v3--main" aria-hidden>
        <PratiushMain aria-hidden />
      </div>
      <div className="hero-pratiush-v3 hero-pratiush-v3--outline" aria-hidden>
        <PratiushOutline aria-hidden />
      </div>
    </>
  );
}

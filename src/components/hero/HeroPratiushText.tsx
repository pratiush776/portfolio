import { PratiushMain } from "@/components/vectors/PratiushMain";
// TEMP (layout rework): outline stroke disabled — re-enable by uncommenting this import + its layer below.
// import { PratiushOutline } from "@/components/vectors/PratiushOutline";

export function HeroPratiushText() {
  return (
    <div className="hero-pratiush-stack-v3" aria-hidden>
      <div className="hero-pratiush-v3 hero-pratiush-v3--main">
        <PratiushMain aria-hidden />
      </div>
      {/*
        TEMP (layout rework): PRATIUSH outline stroke disabled.
        This layer rendered PratiushOutline — a stroke-only copy of the wordmark
        (stroke=currentColor, strokeWidth=6, fill=none, same 1452×265 viewBox as the filled
        PratiushMain). It was stacked ON TOP of the filled main (.hero-pratiush-v3--outline is
        z-index 3 vs --main's z-index 1 in globals.css), so the two overlapped exactly and the
        outline added a crisp border edge around the solid letterforms. With this off, only the
        filled wordmark shows. Re-enable: uncomment the import above + the layer below.
      */}
      {/* <div className="hero-pratiush-v3 hero-pratiush-v3--outline">
        <PratiushOutline aria-hidden />
      </div> */}
    </div>
  );
}

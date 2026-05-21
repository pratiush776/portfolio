import { PratiushMain } from "@/components/vectors/PratiushMain";
import { PratiushOutline } from "@/components/vectors/PratiushOutline";

export function HeroPratiushText() {
  return (
    <div className="hero-pratiush-stack-v3" aria-hidden>
      <div className="hero-pratiush-v3 hero-pratiush-v3--main">
        <PratiushMain aria-hidden />
      </div>
      <div className="hero-pratiush-v3 hero-pratiush-v3--outline">
        <PratiushOutline aria-hidden />
      </div>
    </div>
  );
}

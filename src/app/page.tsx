import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroPhoto } from "@/components/hero/HeroPhoto";
import { HeroPratiushText } from "@/components/hero/HeroPratiushText";
import { WorksBadge } from "@/components/hero/WorksBadge";
import { LocationPin } from "@/components/icons";
import { WorksMarquee } from "@/components/landing/WorksMarquee";
import { WorksCta } from "@/components/landing/WorksCta";

export default function Home() {
  return (
    <main className="text-navy bg-beige w-[100vw] overflow-x-hidden">
      <section className="hero-root-v3">
        <RadialGlow />
        <div className="canvas-v3 canvas-v3--hero">
          <div className="hero-stage-v3">
            <div className="hero-composition-v3">
              <p className="hero-greeting-v3">Hi, I&apos;M</p>
              <div className="hero-pratiush-photo-v3">
                <HeroPhoto />
              </div>
              <HeroPratiushText />
              <ul className="hero-domains-v3" aria-label="Roles">
                <li className="hero-domain-v3">Software Engineer</li>
                <li className="hero-domain-v3">UI/UX Designer</li>
                <li className="hero-domain-v3">Business Analyst</li>
              </ul>
              <WorksBadge />
              <span className="hero-locator-v3" aria-label="Based in USA">
                <LocationPin aria-hidden />
                <span>Based in USA</span>
              </span>
            </div>
          </div>
        </div>
      </section>
      <WorksMarquee />
      <WorksCta />
    </main>
  );
}

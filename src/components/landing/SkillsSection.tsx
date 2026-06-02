"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { approach, technicalSpecs } from "./skills-data";
import { SKILLS_PIN_FRACTION } from "./skills-config";
import { NAV_LINE_PX, setBloomCovers } from "../layout/nav-theme";
import { MeshGrain } from "@/components/decor/MeshGrain";
import { KineticHeading } from "@/components/type/KineticText";
import { toolIcons } from "./skills-icons";

const REVEAL_EASE = "power3.out";
const ITEM_STAGGER = 0.06;

// Pull the dark section UP under the hero by this fraction of the viewport, so
// it reaches `top: top` — and the bloom can begin — right as the hero text
// clears the top of the screen, instead of a full hero-height later. This is
// what removes the dead "portrait alone on pale" buffer: without it the bloom
// can't start until the section has scrolled all the way up to the viewport
// top. Applied as a NEGATIVE margin-bottom on the (un-pinned) hero so it never
// interferes with the section's own pin spacing. Tune to shift when the bloom
// starts: larger = earlier. Desktop + motion only (see effect guard).
const HERO_PULL_FRACTION = 0.5;

// Resolves the `--v3-nav-clearance` CSS variable (a calc/clamp expression) to a
// pixel value by mounting a hidden probe. Same approach as the portrait
// choreography, so the bloom's centre lines up with the portrait's landing.
function getNavClearance(): number {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;height:var(--v3-nav-clearance);pointer-events:none;";
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  document.body.removeChild(probe);
  return h;
}

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1100px)").matches;

    if (reduced || !desktop) {
      const elements = section.querySelectorAll<HTMLElement>("[data-skills-reveal]");
      elements.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      // No bloom on reduced-motion / non-desktop — the section just IS dark.
      section.style.removeProperty("-webkit-mask-image");
      section.style.removeProperty("mask-image");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Pull the section up under the hero so the bloom can start as the hero
    // text clears (see HERO_PULL_FRACTION). Set BEFORE any trigger measures —
    // both at setup and on every global refresh (resize/fonts) — so the pin
    // position and the portrait's landing math stay consistent.
    const hero = document.querySelector<HTMLElement>(".hero-root-v3");
    const applyHeroPull = () => {
      if (hero) {
        hero.style.marginBottom = `${-HERO_PULL_FRACTION * window.innerHeight}px`;
      }
    };
    applyHeroPull();
    ScrollTrigger.addEventListener("refreshInit", applyHeroPull);

    // Bloom. The dark section is revealed by a feathered radial mask that grows
    // from radius 0, centred ON THE PORTRAIT — its centre tracks the portrait's
    // live screen position so the dark blooms from directly behind the figure
    // as it is still descending, then fills the viewport once it settles. A
    // soft feather (not a hard clip) makes it read as a cinematic bloom rather
    // than a circle wipe. `p` is normalised bloom progress so the scrubbed tween
    // survives a resize, and the coverage radius is recomputed from the current
    // centre each frame so a full bloom always covers the viewport.
    const portrait = document.querySelector<HTMLElement>(".hero-pratiush-photo-v3");
    const bloom = { p: 0 };
    const m = { vw: 0, vh: 0, feather: 0, cyFallback: 0 };
    let navCovered = true;

    const measure = () => {
      const navClear = getNavClearance();
      m.vw = window.innerWidth;
      m.vh = window.innerHeight;
      m.feather = Math.min(m.vw, m.vh) * 0.12;
      // Portrait's landing point — used before the portrait is measurable.
      m.cyFallback = (m.vh + navClear) / 2;
    };

    // Visible figure sits a touch above the rect's geometric centre, so bias
    // the bloom origin up to seat it behind the head/torso, not the rect.
    const PORTRAIT_CENTER_BIAS = 0.42;
    const currentCy = () => {
      if (!portrait) return m.cyFallback;
      const r = portrait.getBoundingClientRect();
      if (!r.height) return m.cyFallback;
      return r.top + r.height * PORTRAIT_CENTER_BIAS;
    };
    // Coverage radius for a given centre — just past the farthest corner.
    const coverRadius = (cy: number) =>
      Math.hypot(m.vw / 2, Math.max(cy, m.vh - cy)) + m.feather + 2;

    const applyTick = () => {
      const cy = currentCy();
      const r = coverRadius(cy) * bloom.p;
      const inner = Math.max(r - m.feather, 0);
      const mask = `radial-gradient(circle ${r}px at 50% ${cy}px, #000 ${inner}px, rgba(0,0,0,0) ${r}px)`;
      section.style.setProperty("-webkit-mask-image", mask);
      section.style.setProperty("mask-image", mask);

      // Nav stays dark-ink until the bloom's leading edge reaches the nav band,
      // so the off-white nav never sits over the pale backdrop. Starts uncovered.
      const covered = r >= cy - NAV_LINE_PX;
      if (covered !== navCovered) {
        navCovered = covered;
        setBloomCovers(covered);
      }
    };

    measure();
    applyTick();

    const ctx = gsap.context(() => {
      const title = section.querySelector<HTMLElement>("[data-skills-title]");
      const leftItems = section.querySelectorAll<HTMLElement>("[data-skills-soft]");
      const rightItems = section.querySelectorAll<HTMLElement>("[data-skills-tech]");

      gsap.set([title, ...leftItems, ...rightItems], { opacity: 0, y: 32 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${SKILLS_PIN_FRACTION * window.innerHeight}`,
          pin: true,
          pinType: "transform",
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            applyTick();
          },
        },
      });

      // Beat 1 — the radial bloom, running from pin start CONCURRENTLY with the
      // portrait's descent (PortraitScrollChoreography). The dark grows from
      // behind the still-descending figure and fills the viewport by ~half the
      // pin, just after the portrait settles — one immersive move, not two.
      tl.to(
        bloom,
        { p: 1, duration: 0.5, ease: "power2.inOut", onUpdate: applyTick },
        0,
      );

      // Beat 2 — title, only after the dark has fully filled the viewport.
      tl.to(
        title,
        { opacity: 1, y: 0, duration: 0.16, ease: REVEAL_EASE },
        0.54,
      );

      // Beat 3 — columns stagger in. Left flank leads the right register, so
      // the reveal reads as the result of the bloom resolving outward.
      tl.to(
        leftItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.26,
          ease: REVEAL_EASE,
          stagger: { each: ITEM_STAGGER, from: "start" },
        },
        0.6,
      );
      tl.to(
        rightItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.26,
          ease: REVEAL_EASE,
          stagger: { each: ITEM_STAGGER, from: "start" },
        },
        0.66,
      );

      // Settle period — holds everything in place (portrait centred, bloom
      // full, all rows revealed) so the arrival reads as a deliberate moment.
      tl.to({}, { duration: 0.1 });
    }, section);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", applyHeroPull);
      ctx.revert();
      // Mask is set via inline style (not a GSAP prop), so clear it manually.
      section.style.removeProperty("-webkit-mask-image");
      section.style.removeProperty("mask-image");
      if (hero) hero.style.removeProperty("margin-bottom");
      // Restore the nav-theme default so a stale "uncovered" flag can't leave
      // the nav stuck in dark ink after this component unmounts.
      setBloomCovers(true);
    };
  }, []);

  return (
    <section ref={sectionRef} className="skills-section-v3" aria-label="What I bring">
      <MeshGrain variant="twilight" />
      <div className="skills-spotlight-v3" aria-hidden />
      <div className="skills-inner-v3">
        <div className="skills-row-v3">
          {/* Left flank — "Approach" voice block + playful trait stickers. */}
          <div className="skills-column-v3 skills-column-v3--soft" aria-label="Approach">
            <header
              className="skills-head-v3"
              data-skills-title
              data-skills-reveal
            >
              <KineticHeading className="skills-title-v3" weightTo={680}>
                What I bring.
              </KineticHeading>
              <p className="skills-approach-lead-v3">{approach.lead}</p>
            </header>
            <ul className="skills-traits-v3">
              {approach.traits.map((trait) => (
                <li
                  key={trait.title}
                  className="skills-trait-v3"
                  data-skills-soft
                  data-skills-reveal
                >
                  <span className="skills-trait-v3__title">{trait.title}</span>
                  <span className="skills-trait-v3__note">{trait.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="skills-portrait-slot-v3" aria-hidden />

          {/* Right flank — numbered "Stack" spec sticker-cards. */}
          <ol className="skills-column-v3 skills-column-v3--tech" aria-label="Stack">
            {technicalSpecs.map((item, index) => (
              <li
                key={item.key}
                className={`skills-spec-v3 skills-sticker-v3 skills-sticker-v3--s${index % 4}`}
                data-skills-tech
                data-skills-reveal
                tabIndex={0}
                aria-label={`${item.title}. ${item.note} ${item.proof} Stack: ${item.tools.join(", ")}.`}
              >
                <span className="skills-spec-v3__index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="skills-spec-v3__body">
                  <p className="skills-spec-v3__title">{item.title}</p>
                  <p className="skills-spec-v3__note">{item.note}</p>
                  <ul className="skills-spec-v3__tools" aria-hidden>
                    {item.tools.map((tool) => {
                      const Icon = toolIcons[tool];
                      return (
                        <li
                          key={tool}
                          className="skills-spec-v3__tool"
                          title={tool}
                        >
                          {Icon ? (
                            <Icon className="skills-spec-v3__tool-icon" />
                          ) : (
                            tool
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

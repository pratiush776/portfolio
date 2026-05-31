"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { approach, technicalSpecs } from "./skills-data";
import { SKILLS_PIN_FRACTION } from "./skills-config";

const REVEAL_EASE = "power3.out";
const ITEM_STAGGER = 0.06;

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
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

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
        },
      });

      // Beats are spaced across the full 80vh pin band so they resolve in
      // sequence — title, then the portrait finishes its descent into the
      // slot, then the columns stagger in, leaving a real settled-arrival
      // band at the end (no longer all collapsing onto one frame).

      // Beat 1 — title (~5–22% of pin).
      tl.to(
        title,
        { opacity: 1, y: 0, duration: 0.17, ease: REVEAL_EASE },
        0.05,
      );

      // Beat 2 — columns stagger in after the portrait has substantially
      // landed (~42–82% of pin). Left flank leads the right register slightly.
      tl.to(
        leftItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: REVEAL_EASE,
          stagger: { each: ITEM_STAGGER, from: "start" },
        },
        0.42,
      );
      tl.to(
        rightItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: REVEAL_EASE,
          stagger: { each: ITEM_STAGGER, from: "start" },
        },
        0.48,
      );

      // Settle period — the final ~14% of the pin holds everything in place
      // (portrait fully landed, all rows revealed) so the arrival reads as a
      // deliberate, settled moment before the user scrolls past.
      tl.to({}, { duration: 0.14 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="skills-section-v3" aria-label="What I bring">
      <div className="skills-spotlight-v3" aria-hidden />
      <div className="skills-grain-v3" aria-hidden />
      <div className="skills-inner-v3">
        <div className="skills-row-v3">
          <div className="skills-column-v3 skills-column-v3--soft" aria-label="Approach">
            <header className="skills-head-v3" data-skills-title data-skills-reveal>
              <h2 className="skills-title-v3">What I bring.</h2>
              <span className="skills-keyline-v3" aria-hidden />
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

          <ol className="skills-column-v3 skills-column-v3--tech" aria-label="Stack">
            {technicalSpecs.map((item, index) => (
              <li
                key={item.key}
                className="skills-spec-v3"
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
                  <div className="skills-spec-v3__detail">
                    <div className="skills-spec-v3__detail-inner">
                      <p className="skills-spec-v3__proof">{item.proof}</p>
                      <ul className="skills-spec-v3__tools">
                        {item.tools.map((tool) => (
                          <li key={tool} className="skills-spec-v3__tool">
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

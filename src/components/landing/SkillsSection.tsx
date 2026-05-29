"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { softSkills, technicalSpecs } from "./skills-data";

const REVEAL_EASE = "power3.out";
const ITEM_STAGGER = 0.06;
const TOOLS_EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1100px)").matches;

    if (reduced || !desktop) {
      // Static fallback — set everything to its final state.
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

      gsap.set([title, ...leftItems, ...rightItems], { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 35%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      tl.to(title, { opacity: 1, y: 0, duration: 0.9, ease: REVEAL_EASE });
      tl.addLabel("columns", "+=0.15");
      tl.to(
        leftItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: REVEAL_EASE,
          stagger: { each: ITEM_STAGGER, from: "start" },
        },
        "columns",
      );
      tl.to(
        rightItems,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: REVEAL_EASE,
          stagger: { each: ITEM_STAGGER, from: "start" },
        },
        "columns",
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="skills-section-v3" aria-label="What I bring">
      <div className="skills-inner-v3">
        <h2 className="skills-title-v3" data-skills-title data-skills-reveal>
          What I bring.
        </h2>

        <div className="skills-row-v3">
          <ul className="skills-column-v3 skills-column-v3--soft" aria-label="Approach">
            {softSkills.map((item) => (
              <li
                key={item.title}
                className="skills-item-v3"
                data-skills-soft
                data-skills-reveal
              >
                <p className="skills-item__title-v3">{item.title}</p>
                <p className="skills-item__note-v3">{item.note}</p>
              </li>
            ))}
          </ul>

          <div className="skills-portrait-slot-v3" aria-hidden />

          <ul className="skills-column-v3 skills-column-v3--tech" aria-label="Stack">
            {technicalSpecs.map((item) => (
              <li
                key={item.key}
                className="skills-item-v3"
                data-skills-tech
                data-skills-reveal
              >
                <TechSpecRow item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TechSpecRow({ item }: { item: (typeof technicalSpecs)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p className="skills-item__title-v3">{item.title}</p>
      <p className="skills-item__note-v3">{item.note}</p>
      <button
        type="button"
        className="tools-toggle-v3"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Tools</span>
        <motion.span
          className="tools-toggle-v3__chevron"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18, ease: TOOLS_EASE }}
          aria-hidden
        >
          →
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            className="tools-list-v3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: TOOLS_EASE }}
          >
            {item.tools.map((tool) => (
              <li key={tool} className="tools-list-v3__item">
                {tool}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { past } from "@/data/past";
import { DUR, EASE, STAGGER, THRESHOLD, reveal, rise } from "@/lib/motion";

/**
 * MY PAST — the background, as four words you open.
 *
 * It is a WALL of type, not a list of rows. The words are centred so the block is ragged on BOTH
 * sides and the four read as one sculptural shape, and sized so the longest nearly fills the
 * measure. An earlier pass set them left-aligned at the statement rung with a hairline under each
 * and an oversized heading above, and it read as an FAQ accordion.
 *
 * The section is sized to land near a screenful. It follows the complete work index, where the
 * background reads as supporting credibility rather than as a gate before the first project.
 *
 * Everything a row has to say lives inside its panel — where, what, when, then the specifics, in
 * that order every time. Nothing is parked in the margin beside the word: an annotation out there
 * competes with the display type for the same glance and says a fraction of what the panel does.
 * The only thing outside the word is the + that marks the row as openable.
 *
 * Three deliberate exceptions to DESIGN.md live here, all recorded there: the centred axis,
 * Kumbh at 900, and the serif reaching a third place on the site. The serif's argument is the one
 * already in its own rule — it is for where the site speaks about
 * itself rather than describing something, and a biography is exactly that.
 *
 * One row is open at a time. Two open panels turn a list of claims into a wall of text and lose
 * the reason the section is closed to begin with — you should be able to see all four words at
 * once and choose one.
 */
export function Past() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="past gutter measure">
      {/* A centred title above the block rather than the reference's label tucked into the left
          margin. The margin version was too small and too far off the words to say what the
          section was; this reads as a title at a glance, and the serif keeps it from looking
          like a fifth, quieter row of the same list. */}
      <motion.h2 className="past__title" {...(reduce ? {} : reveal())}>
        My Past
      </motion.h2>

      <motion.ul
        className="past__list"
        variants={reduce ? undefined : STAGGER}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: THRESHOLD }}
      >
        {past.map((chapter) => {
          const isOpen = open === chapter.id;
          const panelId = `past-panel-${chapter.id}`;

          return (
            <motion.li
              key={chapter.id}
              className="past__row"
              variants={reduce ? undefined : rise}
            >
              {/* Three columns, the same template on every row so the words share one centre
                  line and the marks share one left edge. A real <button>, because the row has to
                  be operable from the keyboard and announce its own state. */}
              <button
                type="button"
                className="past__toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : chapter.id)}
              >
                <span className="past__word">{chapter.word}</span>
                {/* Two hairlines crossed into a +, turned 45° into a × when the row opens. Built
                    from the same 1px rule every divider on the site uses rather than from an icon
                    set — the form language has no borders or fills to spend on an affordance. */}
                <span className="past__sign" aria-hidden />
              </button>

              {/* Every panel is rendered, open or not, and collapsed by height rather than
                  unmounted. A panel that only exists while open keeps its contents out of the
                  served HTML — so the degree, the thesis and the rest would never be crawled,
                  and a visitor without JS would have four words and nothing behind them.
                  `inert` is what makes the collapsed copy safe: it takes the hidden links and
                  text out of the tab order and off the accessibility tree, which `height: 0`
                  alone does not do. */}
              <motion.div
                id={panelId}
                className="past__panel"
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                /* Height is a layout property, which the system otherwise leaves alone — but here
                   the height change IS the content arriving, not an effect dressed on top of it.
                   On the house curve, at the length reserved for something moving a long way over
                   a large area. */
                transition={
                  reduce ? { duration: 0 } : { duration: DUR.media, ease: EASE }
                }
                inert={!isOpen}
              >
                <div className="past__body">
                  <p className="past__where">{chapter.lines[0]}</p>
                  <p className="past__what">{chapter.lines[1]}</p>

                  {chapter.period ? (
                    <p className="past__period">{chapter.period}</p>
                  ) : null}

                  <ul className="past__detail">
                    {chapter.detail.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>

                  {chapter.link ? (
                    <a
                      className="past__link"
                      href={chapter.link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="underline-link">
                        {chapter.link.label}
                      </span>
                      <ArrowUpRight
                        className="past__link-arrow"
                        width="13"
                        height="13"
                        aria-hidden
                      />
                    </a>
                  ) : null}
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}

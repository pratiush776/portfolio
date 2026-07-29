"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { past } from "@/data/past";
import {
  DUR,
  EASE,
  STAGGER,
  THRESHOLD,
  reveal,
  rise,
  useGlide,
} from "@/lib/motion";

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
 *
 * ONE ROW HAS PHOTOGRAPHS, and they live INSIDE its panel — a pair under the specifics, at the end,
 * so all four panels still open the same way and the eye finds "where" and "what" in the same place
 * whichever row it opened.
 *
 * That took three tries, and the first two were the same mistake twice: a photo card set into the
 * word itself, then hung off the word's edge. Both treated the picture as an ornament on the wall,
 * and at that scale a photograph is texture — the only sizes that read as a picture are the sizes
 * that fight the display type beside it. It is content, and the panel is where this section keeps
 * content. Closed, the wall is still four words and nothing else; opened, the Jets row has the
 * evidence in it.
 *
 * They are one row's and not four on purpose: pictures on every row turn the wall back into the
 * logo bar this section was built instead of.
 */
export function Past() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string | null>(null);

  // Its leaving window is the one on the page that may not finish, since the footer beneath it is
  // around a viewport tall and the document stops there. Any residue is a few tens of pixels inside
  // a chapter step of ~280px, so it is invisible — but it is the reason the footer itself is left
  // out entirely, where the same residue would show as bare page under the ink.
  const section = useRef<HTMLElement>(null);
  const { drift } = useGlide(section);

  return (
    <motion.section
      ref={section}
      className="past gutter measure"
      style={{ y: drift }}
    >
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

                  {/* Rendered only where there are specifics. An empty list still spends its own
                      22px above itself, which on the thesis row would open a gap under the heading
                      that reads as something missing. */}
                  {chapter.detail?.length ? (
                    <ul className="past__detail">
                      {chapter.detail.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : null}

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

                {/* A SIBLING of the body rather than a child of it, because the body is a 54ch
                    text measure and these are not text — sitting inside it they would be held to
                    the width of a paragraph. Out here they take their own, wider one, which is the
                    ordinary editorial move for media under a column of copy.

                    Left LAZY, and the collapsed panel is what makes that exactly right: a panel at
                    height 0 never intersects, so a visitor who opens no rows never fetches a photo.
                    They land during the 0.7s the panel takes to open, over the frame's own ground.

                    Real alt text here, unlike everywhere else images have appeared in this section:
                    the panel is content, not a control, so nothing is swallowed into an accessible
                    name and these can say what they are. */}
                {chapter.gallery ? (
                  <div
                    className="past__gallery"
                    // What the row is worth in units, and how many gaps it has to pay for. The
                    // stylesheet turns the two into a width that makes THIS row's pictures exactly
                    // as tall as every other row's — see --past-shot-span. Measured here rather
                    // than in CSS because CSS cannot add up a list it never sees.
                    style={
                      {
                        "--shot-sum": chapter.gallery.reduce(
                          (sum, shot) => sum + (shot.ratio ?? 1),
                          0,
                        ),
                        "--shot-count": chapter.gallery.length,
                      } as CSSProperties
                    }
                  >
                    {chapter.gallery.map((shot) => (
                      <span
                        key={shot.src}
                        className="frame past__shot"
                        // The frame's ratio is also what sizes it — the row splits its width by
                        // these so every shot comes out the same height. One number, spent twice,
                        // so a wide frame can never end up in a column that is not wide.
                        style={
                          {
                            "--shot-ratio": shot.ratio ?? 1,
                            "--shot-zoom": shot.zoom ?? 1,
                          } as CSSProperties
                        }
                      >
                        <Image
                          className="past__shot-media"
                          src={shot.src}
                          alt={shot.alt}
                          fill
                          // The frame's box is already held open by its ratio, so this is not
                          // load-bearing for the layout — it is so an opening panel shows the shape
                          // of the photograph instead of a grey rectangle for the moment the real
                          // file is in flight. See `blur` in data/past.ts.
                          placeholder="blur"
                          blurDataURL={shot.blur}
                          // The widest a shot lays out at anywhere in this section, now that every
                          // row shares one height: education's wide centre at ~298px, against
                          // ~265px for the honours 4:3 and ~199px for a square. Declared for the
                          // widest, since a `sizes` under the real width picks a variant that has
                          // to be upscaled.
                          sizes="(max-width: 768px) 92vw, 310px"
                        />
                      </span>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.section>
  );
}

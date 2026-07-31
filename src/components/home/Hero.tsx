"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { TypedLine } from "@/components/home/TypedLine";
import { useIntro } from "@/components/intro/IntroContext";
import { kerned } from "@/lib/kerning";
import { STAGGER, rise, useGlide } from "@/lib/motion";

/**
 * The opening, as one sentence down the page's centre line: the script greeting, the name at
 * display scale, then the bracketed portrait and the meta beneath them. It takes the whole fold and
 * sits centred in it on both axes — balanced silence above and below, balanced weight left and
 * right, nothing of the next section peeking in.
 *
 * The row under the name is TWO systems that read as one: the bracketed portrait, and the meta.
 * They are held apart by the page's --col-gap, which is about twice the bracket's own internal
 * rhythm — enough to tell them apart, not enough to let them come loose from each other.
 *
 * All three rows arrive on the one gesture, and only the typed line keeps moving afterwards.
 * Nothing here is tied to scroll.
 *
 * The cascade waits for the intro's cue rather than firing on mount. Mounting happens BEHIND the
 * ink field, so an unconditional entrance would spend itself where nobody can see it and the
 * curtain would lift on a hero that had already finished arriving. The cue comes partway through
 * the lift, so the two overlap and the page is already in motion as the ink clears. On the loads
 * with no intro — reduced motion, no JS — the cue is true from the first render and this behaves
 * exactly as it did before.
 */

/* Set letter by letter so the pairs can be spaced individually — see lib/kerning for what the
   values are and how they were measured. The aria-label below is what keeps the split readable. */
const NAME = "PRATIUSH";

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const { ready } = useIntro();

  // Only the LEAVING half ever runs here: the hero opens at the top of the document, so its
  // entering window is already spent before a visitor can scroll. What is left is the hero holding
  // back a little as the statement comes up past it — which is the one seam on the page where the
  // two blocks deliberately overlap, and so the one where a difference in speed reads most.
  const section = useRef<HTMLElement>(null);
  const { drift } = useGlide(section);

  return (
    <motion.header
      ref={section}
      className="hero gutter measure"
      style={{ y: drift }}
      variants={reduce ? undefined : STAGGER}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : ready ? "visible" : "hidden"}
    >
      <div className="hero__block">
        {/* Read, not decorative: it lands ahead of the h1 as "Hi, I'm" → "PRATIUSH Karki", which is
            the sentence it is. It arrives on the same gesture as the two rows below it. */}
        <motion.p
          className="hero__greeting script"
          variants={reduce ? undefined : rise}
        >
          Hi, I&apos;m
        </motion.p>

        <motion.h1
          className="hero__name display"
          aria-label="PRATIUSH Karki"
          variants={reduce ? undefined : rise}
        >
          {kerned(NAME).map(({ char, style }, i) => (
            <span key={i} style={style}>
              {char}
            </span>
          ))}
        </motion.h1>

        {/* The bracketed portrait, then the meta as a column that brackets its height. The
            portrait is the only thing on the page that isn't ink or bone — its ground is
            transparent, so the square reads as a block of ink that resolves into a face up
            close. */}
        <motion.div
          className="hero__lockup"
          variants={reduce ? undefined : rise}
        >
          <span className="hero__bracket display">
            <span className="hero__bracket-paren--open" aria-hidden>
              )
            </span>

            <span className="hero__portrait">
              {/* `preload`, not `priority` — the latter is deprecated as of Next 16. This is the
                  page's one preload: the single true LCP candidate, and the one image the intro
                  is most likely to still be waiting on. */}
              <Image
                src="/images/portrait_v2.png"
                alt="Portrait of Pratiush Karki"
                fill
                sizes="(max-width: 768px) 128px, 220px"
                preload
              />
            </span>

            <span aria-hidden>)</span>
          </span>

          {/* Role + statement bonded at the top, locator dropped to the bottom — the column
              spans the bracket so the text brackets the frame instead of huddling beside it. */}
          <div className="hero__meta">
            <div className="hero__meta-top">
              {/* The anchor: a fixed noun that answers "who is this", so the moving line below
                  can answer "what do they do" without a visitor having to wait out a cycle to
                  learn either. */}
              <p className="hero__role note">Software Engineer</p>
              <p className="hero__tagline h3">
                <TypedLine start={ready} reduced={reduce} />
              </p>
            </div>
            {/* Split so the phone can break it after the separator — the one place this line
                may fold is between the two facts it states, and a wrap point left to the measure
                would move with the font metrics instead. The spans lay out inline, so above
                768px this is character-for-character the string it has always been. */}
            <p className="hero__foot label muted">
              <span>Open to relocation</span>
              <span className="hero__foot-sep" aria-hidden>
                {" · "}
              </span>
              <span>USA</span>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

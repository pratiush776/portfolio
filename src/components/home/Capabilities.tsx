"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { capabilities } from "@/data/capabilities";
import { STAGGER, THRESHOLD, reveal, rise } from "@/lib/motion";

/**
 * What I do — three capability domains, each a claim that links to the work that proves it.
 * The section title is set at display scale; each row carries the domain, a one-line gloss,
 * and a pointer to the project that backs it, so a claim is never left standing on its own.
 * The whole row is the link, with the same nudge + arrow the archive uses.
 *
 * The rows arrive one after another rather than as a slab. Three claims that appear together read
 * as a block of layout; three that land in sequence read as three separate things being said — and
 * the page already cascades everywhere else it has more than one of something, so a list that came
 * in whole was the odd one out rather than the restrained one.
 */
export function Capabilities() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="gutter measure">
      <motion.h2 className="display-section" {...(reduce ? {} : reveal())}>
        What I do
      </motion.h2>

      <motion.ul
        className="capabilities__list"
        variants={reduce ? undefined : STAGGER}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: THRESHOLD }}
      >
        {capabilities.map((capability) => (
          <motion.li
            key={capability.id}
            className="capabilities__row"
            variants={reduce ? undefined : rise}
          >
            <Link
              href={`/works/${capability.proof.slug}`}
              className="capabilities__link"
            >
              <span className="capabilities__line h2">{capability.line}</span>
              <span className="capabilities__sub prose">{capability.sub}</span>
              <span className="capabilities__proof">
                <span className="underline-link">{capability.proof.label}</span>
                <ArrowUpRight
                  className="capabilities__proof-arrow"
                  width="14"
                  height="14"
                  aria-hidden
                />
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

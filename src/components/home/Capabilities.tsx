"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { capabilities } from "@/data/capabilities";
import { EASE, RISE } from "@/lib/motion";

/**
 * What I do — three capability domains, each a claim that links to the work that proves it.
 * The section title is set at display scale; each row carries the domain, a one-line gloss,
 * and a pointer to the project that backs it, so a claim is never left standing on its own.
 * The whole row is the link, with the same nudge + arrow the archive uses.
 */
export function Capabilities() {
  const reduce = useReducedMotion() ?? false;

  const reveal = reduce
    ? {}
    : {
        initial: RISE.hidden,
        whileInView: RISE.visible,
        viewport: { once: true, margin: "0px 0px -15% 0px" },
        transition: { duration: 0.8, ease: EASE },
      };

  return (
    <section className="gutter measure">
      <motion.h2 className="display-section" {...reveal}>
        What I do
      </motion.h2>

      <motion.ul className="capabilities__list" {...reveal}>
        {capabilities.map((capability) => (
          <li key={capability.id} className="capabilities__row">
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
          </li>
        ))}
      </motion.ul>
    </section>
  );
}

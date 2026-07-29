import type { CSSProperties } from "react";

/**
 * Optical kerning for the display face.
 *
 * WHY THIS EXISTS. A word set at --display-size is 200px+ tall, and at that scale the spacing
 * between two letters stops being a detail and becomes a shape you look at. Kumbh Sans handles
 * this itself — it ships 128 uppercase kern pairs — but two things defeat that here:
 *
 *   1. Splitting a word into per-letter spans (which the hero does, so the pairs can be tuned)
 *      puts every glyph in its own inline box. There is no longer a PAIR for the browser to
 *      apply a kern to, so the font's whole table is discarded. Whatever we split, we must
 *      re-space by hand.
 *   2. The font's own kerning is drawn for text sizes, where a residual of a few hundredths of
 *      an em is invisible. At 15rem it is ten pixels.
 *
 * HOW THE VALUES WERE DERIVED. Not by eye. For each pair, the glyph outlines were scanned row by
 * row across the cap band to find the narrowest point between the right edge of one letter and
 * the left edge of the next — the pair's minimum clearance. Because adding N units to a pair's
 * advance shifts its entire gap profile by exactly N, clearance is linear in the kern and the
 * correction solves in closed form:
 *
 *      kern = RATE * (target_clearance - measured_clearance)
 *
 * with a target of 150 units (the fit of a normal stem-to-stem pair like P–R in this face) and
 * RATE = 0.6. The rate is short of 1.0 on purpose. Diagonal and open letters legitimately carry
 * more white than stems do, and closing them all the way to a stem's fit reads as a collision;
 * the same method run against the font's own 128 pairs shows its designer applying about 0.23 of
 * full equalisation at text size, so 0.6 is the display-scale end of the same judgement rather
 * than a different one.
 *
 * The method was checked before it was trusted: run across the whole uppercase alphabet, the
 * pairs it flags hardest are AV, VA, LY, AY, YA, LV, AW, WA, LT, AT, TA — which is the canonical
 * list of problem pairs in uppercase setting, and very nearly the designer's own top ten.
 *
 * WHAT IT FIXES, CONCRETELY. In PRATIUSH, R–A measured 5 units of clearance — the R's leg and the
 * A's foot all but touching — while A–T measured 425, three times the fit of every other pair in
 * the word. That is one letter jammed against its left neighbour with a hole in front of its
 * right one, which is what "the A looks off" means in numbers.
 *
 * SCOPE. Only the giant tier: the hero name, the footer sign-off and the projects word, all at
 * --display-size, where these errors are 7–10px. Case titles, the intro word and the plate words
 * are NOT split, so they still get the font's own kerning, and their problem pairs (TA, LU, DT,
 * VA, AW, AT) are all ones the designer covered. Leaving them alone is the correct call, not an
 * omission.
 *
 * TO RE-DERIVE. The measurement reads the font binary; if the display face is ever swapped, every
 * number here is void and has to be measured again against the new outlines.
 */
const KERN: Record<string, number> = {
  RA: 0.042, // the R's leg and the A's foot converge to 5 units — this is the "A looks off" pair
  AT: -0.08, // 425 units of clearance against a 150-unit norm; the font's own -0.049 is a text value
  TI: 0.02,
  IU: -0.01,
  US: -0.015,
  CT: 0.033, // 39 units in PROJECTS — the C's terminal and the T's crossbar nearly touching
  JE: -0.01,
  TS: 0.008,
};

export type KernedLetter = {
  char: string;
  /** Style to spread onto the letter's span, or undefined when the pair needs no correction. */
  style: CSSProperties | undefined;
};

/**
 * Splits a word into letters carrying their kern to the NEXT letter as `--kern`, which
 * `.display > span` spends as margin-right. The pair is looked up uppercased because the display
 * face is uppercased by CSS rather than in the source, so "Pratiush" has to kern as "PRATIUSH".
 *
 * Anything split this way loses its readable text for a screen reader, which will spell it out.
 * Give the element an `aria-label` with the real word — every caller here does.
 */
export function kerned(text: string): KernedLetter[] {
  return [...text].map((char, i) => {
    const pair = `${char}${text[i + 1] ?? ""}`.toUpperCase();
    const k = KERN[pair];
    return {
      char,
      style: k ? ({ "--kern": `${k}em` } as CSSProperties) : undefined,
    };
  });
}

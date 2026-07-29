import {
  Instrument_Sans,
  Instrument_Serif,
  Kumbh_Sans,
  Style_Script,
} from "next/font/google";

/* FOUR faces, one role each: a display, a text, an editorial and a signature. Within a role all
 * hierarchy still comes from size, weight, case and tracking — a face is never added to make one
 * line louder than the line above it.
 *
 * Each face exposes a CSS variable that rules in globals.css reference DIRECTLY
 * (`font-family: var(--font-kumbh), sans-serif`). Routing a family through an intermediate
 * alias silently drops to the fallback face, so no aliases exist. */

/**
 * DISPLAY — the name and section titles, set huge in uppercase with tight tracking and sub-1
 * line-height. Kumbh Sans is a geometric sans whose caps stay even at 12vw.
 *
 * TWO weights, and the second has exactly one user. 700 is the display voice everywhere — the
 * hero name, the section titles, the PROJECTS word, the footer signature. 900 is spent only on
 * the "My Past" wall, where four words stack into a single block and the extra weight is what
 * makes that block read as one mass rather than as four headings. Anywhere else, 700.
 */
export const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

/**
 * TEXT — everything that carries information: headings below the display, prose, nav, meta,
 * labels. Instrument Sans is a neo-grotesque with a variable weight axis, so 400 (prose) and
 * 500 (headings, labels) come from one file.
 */
export const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

/**
 * EDITORIAL — the statement on the landing page, and the brief at the top of a case page. The two
 * places the site speaks about itself rather than describing something. Instrument Serif is the
 * sibling of the text face above, drawn as one superfamily, which is what lets a serif join
 * without the page reading as two typographic systems bolted together. 400 only, and never body
 * copy: it earns its place by appearing twice, large, and nowhere else.
 *
 * `preload: false` on purpose. Both uses sit below the fold, and the intro gates its lift on
 * `document.fonts.ready` (see Preloader) — preloading a face nobody sees during the intro would
 * let it stretch the intro's floor. Drop the flag if the statement ever flashes its fallback.
 */
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/**
 * SCRIPT — the "Hi, I'm" greeting, and nothing else. A single hand-written note against the
 * flat duotone; kept to one phrase so it reads as a signature rather than a system.
 */
export const styleScript = Style_Script({
  variable: "--font-style-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

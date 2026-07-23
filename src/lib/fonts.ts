import { Instrument_Sans, Kumbh_Sans, Style_Script } from "next/font/google";

/* THREE faces, one role each. All hierarchy comes from size, weight, case and tracking —
 * never from adding a fourth face.
 *
 * Each face exposes a CSS variable that rules in globals.css reference DIRECTLY
 * (`font-family: var(--font-kumbh), sans-serif`). Routing a family through an intermediate
 * alias silently drops to the fallback face, so no aliases exist. */

/**
 * DISPLAY — the name and section titles, set huge in uppercase with tight tracking and sub-1
 * line-height. Kumbh Sans is a geometric sans whose caps stay even at 12vw. Bold (700) only:
 * the display never appears at another weight.
 */
export const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh",
  subsets: ["latin"],
  weight: "700",
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
 * SCRIPT — the "Hi, I'm" greeting, and nothing else. A single hand-written note against the
 * flat duotone; kept to one phrase so it reads as a signature rather than a system.
 */
export const styleScript = Style_Script({
  variable: "--font-style-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

import { Fraunces, Hanken_Grotesk, Style_Script } from "next/font/google";

/* THE TYPE SYSTEM — three faces, each a single role (the whole site's variation comes from
 * size / weight / opacity / tracking / case / hierarchy, NOT from more fonts):
 *   • Fraunces      — the ONE display/title voice (hero name morph, PERSONA/PROJECTS, project +
 *                     case titles, thesis, footer headline, the editorial taglines).
 *   • Hanken Grotesk — the ONE primary text/UI voice (body, nav, metadata, labels, capability
 *                     spine, chips, links).
 *   • Style Script  — the accent hand, used sparingly (the "Hi, I'm" greeting + eyebrows only). */

/**
 * Primary text/UI. Hanken Grotesk is a humanist grotesque with a full weight axis — crafted and
 * quietly confident. Variable, so every UI weight comes from one file. Carries body, nav,
 * metadata, labels, the capability spine and chips.
 */
export const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The display/title voice. Fraunces is a variable old-style serif with soft/wonk character and an
 * optical-size axis: pushed to its display optical size (`opsz` 144) at a light-to-mid weight it
 * gains the thin hairlines + thick stems of a high-contrast Didone without reading as a template
 * face. It now carries EVERY large editorial title — the morphing hero name, PERSONA/PROJECTS,
 * project + case titles, the thesis, the footer headline, and the taglines. The `opsz`/`SOFT`/`WONK`
 * axes are tuned per-rule in `globals.css` via `font-variation-settings`; `wght` is the variable
 * default axis.
 */
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

/**
 * Calligraphy for the hero greeting ("Hi, I'm"). A single hand-written accent that contrasts the
 * clean caps below — the personal voice note, kept to the greeting only so it reads as a flourish,
 * never a system. Style Script (Robert Leuschke) is a fluid, full-bodied brush hand: warm and
 * polished with confident strokes, not the thin spindly hairlines that read rough at this size.
 * Single weight (400).
 */
export const styleScript = Style_Script({
  variable: "--font-style-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

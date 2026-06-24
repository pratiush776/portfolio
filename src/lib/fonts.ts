import {
  Anton,
  Bricolage_Grotesque,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Style_Script,
} from "next/font/google";
import localFont from "next/font/local";

/**
 * Workhorse: long-form body copy. Hanken Grotesk is a humanist grotesque with a full weight axis —
 * crafted and quietly confident where Noto Sans (the prior workhorse) read as a generic coverage
 * default. Variable, so every body weight comes from one file.
 */
export const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display grotesque (Google Fonts, open source — free for commercial use). Bricolage Grotesque
 * takes a geometric-grotesque skeleton and adds deliberate quirk: confident, contemporary, and
 * characterful rather than neutral. It carries the morphing PRATIUSH / PROJECTS wordmark and the
 * structural display text.
 */
export const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Tall cinematic display face for the transition thesis. Kept deliberately separate from the
 * PRATIUSH / PROJECTS wordmark: Anton gives the right-side statement the condensed poster force
 * the brand needs without turning the whole system into one flat grotesque voice.
 */
export const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Editorial serif (Fontshare, ITF — free for commercial use). The page's human voice: the hero
 * tagline, the scroll manifesto, and the work titles. Sentient is a warm old-style humanist serif —
 * soft modulation, calligraphic roots, and a more refined, contemporary elegance at display sizes
 * than the prior Gambetta, while keeping the same warm editorial register. Regular + Medium mirror
 * the weights actually used (the 550/600 display rules resolve to Medium, the heaviest face loaded).
 */
export const sentient = localFont({
  variable: "--font-sentient",
  display: "swap",
  src: [
    { path: "../fonts/Sentient/Sentient-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Sentient/Sentient-Medium.woff2", weight: "500", style: "normal" },
  ],
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

/**
 * Editorial monospace for the technical role line ("SOFTWARE ENGINEER · PRODUCT & DESIGN"). IBM Plex
 * Mono reads as precise/engineered without the retro quirk of typewriter monos — the credential set
 * as data. Static family, so the used weights are loaded explicitly.
 */
export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

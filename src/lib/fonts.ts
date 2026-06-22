import { Anton, Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
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
 * tagline, the scroll manifesto, and the work titles. Gambetta is a warm, calligraphic-rooted serif
 * with real humanist character — a warmer counterpart to Bricolage's contemporary grotesque.
 */
export const gambetta = localFont({
  variable: "--font-gambetta",
  display: "swap",
  src: [
    { path: "../fonts/Gambetta/Gambetta-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Gambetta/Gambetta-Medium.woff2", weight: "500", style: "normal" },
  ],
});

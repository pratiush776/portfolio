import { Fraunces, Hanken_Grotesk, League_Spartan } from "next/font/google";
import localFont from "next/font/local";

/**
 * Workhorse: body copy + the tracked-caps micro-labels (eyebrow / role / locator). Hanken
 * Grotesk is a humanist grotesque with a full weight axis — crafted and quietly confident
 * where Noto Sans (the prior workhorse) read as a generic coverage default. Variable font,
 * so every weight the labels need (400/500/600) comes from one file.
 */
export const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Editorial display serif for the Signature Statement headline. Fraunces is a variable,
 * high-contrast serif with an optical-sizing axis — it satisfies the display-serif traits
 * in v4-handbook/signature-statement/02-typography-traits.md. Swappable for any face that
 * keeps those traits (high contrast, display cut, refined serifs, strong weight).
 */
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

/**
 * Heavy geometric display face for the morphing PRATIUSH / PROJECTS wordmark. The variable
 * weight lets the mark carry enough mass at hero scale without forcing a static black cut.
 */
export const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

export const pierSans = localFont({
  variable: "--font-pier-sans",
  src: [
    {
      path: "../fonts/Pier-Sans/PPPierSans-Bold.otf",
      style: "normal",
    },
  ],
});

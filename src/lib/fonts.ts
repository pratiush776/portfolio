import { Fraunces, Noto_Sans } from "next/font/google";
import localFont from "next/font/local";

export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
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

export const pierSans = localFont({
  variable: "--font-pier-sans",
  src: [
    {
      path: "../fonts/Pier-Sans/PPPierSans-Bold.otf",
      style: "normal",
    },
  ],
});

import { Bricolage_Grotesque, Hanken_Grotesk, Kaushan_Script } from "next/font/google";
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
 * Display + label grotesque (Google Fonts, open source — free for commercial use). Bricolage
 * Grotesque takes a geometric-grotesque skeleton and adds deliberate quirk: confident, contemporary,
 * and characterful rather than neutral. It carries the morphing PRATIUSH / PROJECTS wordmark
 * (Extrabold) and the hero's tracked-caps labels (Medium). Chosen after League Spartan read generic,
 * Cabinet Grotesk read squat at hero scale, and Clash Display felt impersonal. Variable, so the
 * heavy display weight and the lighter label weight come from one file.
 */
export const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Editorial serif (Fontshare, ITF — free for commercial use). The page's human voice: the hero
 * tagline, the scroll manifesto, and the work titles. Gambetta is a warm, calligraphic-rooted serif
 * with real humanist character — distinct from the banned AI-default serifs (Fraunces, Newsreader,
 * Playfair…) and a warmer counterpart to Bricolage's contemporary grotesque.
 */
export const gambetta = localFont({
  variable: "--font-gambetta",
  display: "swap",
  src: [
    { path: "../fonts/Gambetta/Gambetta-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Gambetta/Gambetta-Medium.woff2", weight: "500", style: "normal" },
  ],
});

/**
 * Hand-lettered brush script (Kaushan Script, Google Fonts, SIL OFL — free for commercial use). The
 * page's spoken, personal annotations: the "Hi, I'm" greeting that opens the lockup and the oversized
 * "My" echo set behind the landed PROJECTS. A confident brush calligraphy — gestural and warm — and a
 * third type category beside Bricolage (display grotesque) and Gambetta (humanist serif), sharing
 * their hand-tooled warmth. Single weight (400) — Kaushan Script ships one cut.
 */
export const kaushanScript = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
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

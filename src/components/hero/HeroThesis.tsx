/**
 * The big thesis statement that crests in beside the landed PROJECTS — a typographic composition, not
 * a caption. Set in Anton so the statement keeps its tall, cinematic poster force beside the
 * PRATIUSH → PROJECTS wordmark, with per-word SIZE variation so the words read as a designed, rhythmic
 * stack (small → LARGE → tiny → LARGEST → medium). Right-aligned, mostly ink-only, with "polished"
 * carrying the terracotta payoff.
 *
 * This is pure markup. It lives inside <HeroThesisBeat/>, a normal-flow section that SCROLLS the whole
 * statement through the viewport (real document scroll — no scripted translate). The per-word ink-on
 * (each word a faint GHOST guide with an INK layer wiping across it via clip-path) is driven by a
 * GSAP scrub timeline in the beat, so the line writes itself on as it crests into view. A
 * visually-hidden real sentence carries the value prop to screen readers / SEO; the decorative lines
 * are aria-hidden so the sentence isn't read word-by-word or doubled.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier
   (em) off the container's base clamp, so the whole block scales together and the rhythm is tunable
   here by eye. The words also render in reading order, which is the order the GSAP ink-on staggers. */
const LINES: ThesisWord[][] = [
  [{ word: "Turning", scale: 0.62 }],
  [
    { word: "rough", scale: 1 },
    { word: "ideas", scale: 1 },
  ],
  // "into" lifted off its old runt size (0.46) so the dip reads as designed rhythm, not an accident.
  [{ word: "into", scale: 0.64 }],
  [{ word: "polished", scale: 1.12, tone: "accent" }],
  [{ word: "products", scale: 0.88 }],
];

export function HeroThesis() {
  return (
    <p className="hero-thesis-v4">
      {LINES.map((line, li) => (
        <span className="hero-thesis-v4__line" key={li} aria-hidden>
          {line.map((token, wi) => (
            <span
              key={wi}
              className={
                token.tone === "accent"
                  ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
                  : "hero-thesis-v4__word"
              }
              style={{ fontSize: `${token.scale}em` }}
            >
              {/* GHOST: a faint guide that the GSAP timeline shows then fades as the ink wipes past. */}
              <span className="hero-thesis-v4__ghost">{token.word}</span>
              {/* INK: the same glyphs revealed by the clip-path wipe (GSAP-scrubbed). */}
              <span className="hero-thesis-v4__ink">{token.word}</span>
            </span>
          ))}{" "}
        </span>
      ))}
      {/* The real value-prop sentence, exposed once for AT/SEO (PRODUCT.md: real text exists even where
          the visible type is decorative). Appended LAST (position:absolute) so the
          .hero-thesis-v4__line:nth-child(3) "into" rule still targets the right line. */}
      <span className="visually-hidden">
        Turning rough ideas into polished products.
      </span>
    </p>
  );
}

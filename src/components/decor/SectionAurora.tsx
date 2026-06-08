/**
 * Continuous warm "aurora" backdrop for the post-hero scroll (Signature Statement +
 * Featured Works). Same idea as `HeroAurora` — two soft mesh-gradient layers drifting
 * slowly in opposite directions — but mounted once as a fixed, full-viewport field so the
 * whole long scroll shares one moving atmosphere. Fixed (not an ancestor of the sticky
 * work cards) so it can never break their `position: sticky`. Drift is slower/calmer than
 * the hero and pauses under `prefers-reduced-motion` (see globals.css). z-index 0.
 */
export function SectionAurora() {
  return (
    <div className="section-aurora-v4" aria-hidden>
      <div className="section-aurora-v4__layer section-aurora-v4__layer--a" />
      <div className="section-aurora-v4__layer section-aurora-v4__layer--b" />
      <div className="section-aurora-v4__grain" />
    </div>
  );
}

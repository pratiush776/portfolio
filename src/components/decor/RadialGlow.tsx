/**
 * Warm upper-left light source for the hero. The inner `.radial-glow-v3` owns the perpetual
 * "breathing" keyframe (scale + opacity), so the intro BLOOM can't live on it — a running
 * animation would override the transitioned opacity/transform. Hence the wrapper: the opening
 * fades/scales `.radial-glow-wrap-v3` in (see globals.css "decor bloom") while the inner element
 * keeps breathing underneath; the two transforms simply compose.
 */
export function RadialGlow() {
  return (
    <div className="radial-glow-wrap-v3" aria-hidden>
      <div className="radial-glow-v3" />
    </div>
  );
}

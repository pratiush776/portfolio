// Shared depth model for the "scroll = flying forward through 3D space" system.
// Given an EASED progress `t` (0 → at rest, 1 → fully receded) and a set of
// depth params, `depthRecede` returns the transform/opacity/filter values that
// send an element BACK into space: it lifts, translates on Z (so perspective
// shrinks it), tilts its top edge away, blurs (depth-of-field), and fades.
//
// Easing is the CALLER's responsibility (pass an already-eased `t`) so the
// choreography can use a single GSAP ease across every plane and keep this
// module framework-agnostic. This is the reusable core every receding plane
// shares so the whole page reads as one camera dollying forward. A future
// `depthApproach` (content arriving from the back) will invert the same model.

export interface DepthParams {
  // Fan rank 0..1 — scales tilt + z so a stack can fan into depth (top = 1).
  depth: number;
  // Max translateZ (px) at full recede. Larger = deeper dive (perspective shrinks it).
  maxZ: number;
  // Max rotateX (deg) at full recede. +tips the top edge away from the viewer.
  maxTilt: number;
  // Max blur (px) at full recede — depth-of-field as it leaves focus.
  maxBlur: number;
  // Max upward drift (px) at full recede, layered on the natural scroll.
  maxLift: number;
}

export interface DepthTransform {
  y: number;
  z: number;
  rotationX: number;
  opacity: number;
  filter: string;
}

// `t` is the already-eased progress (0 → at rest, 1 → fully receded). All
// channels are driven by the same `t` so the recede reads as one coherent move.
export function depthRecede(t: number, prm: DepthParams): DepthTransform {
  const blur = prm.maxBlur * prm.depth * t;
  return {
    y: -prm.maxLift * t,
    z: -prm.maxZ * prm.depth * t,
    rotationX: prm.maxTilt * prm.depth * t,
    opacity: 1 - t,
    filter: blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none",
  };
}

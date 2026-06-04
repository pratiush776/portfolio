// Fraction of viewport height the skills section stays pinned during the
// "flying through the sky" sequence: the nine items fly in from depth and LOCK
// one at a time (SkillsSection's scrubbed timeline) while the clouds part and
// ease to wispy and the portrait dwells centred (PortraitScrollChoreography).
// ~3 viewport-heights so the nine one-at-a-time reveals each breathe and the
// clouds animate the whole way through. Owned by PortraitScrollChoreography
// (the single scroll director, which both pins the section and drives the
// content); read here so the value lives in one place.
export const SKILLS_PIN_FRACTION = 3.0;

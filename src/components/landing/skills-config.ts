// Fraction of viewport height the skills section stays pinned during the
// scroll-driven sequence: radial bloom (dark section grows from behind the
// settled portrait) → title → columns. Shared by SkillsSection (which sets up
// the pin + scrub timeline + bloom) and PortraitScrollChoreography (which holds
// the portrait centred for the duration of the pin). A touch longer than one
// viewport so the bloom and the staggered reveal each get room without the
// scroll ever feeling trapped.
export const SKILLS_PIN_FRACTION = 0.85;

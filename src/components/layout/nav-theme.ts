// Single source of truth for the fixed nav's dark/light theme.
//
// Two independent signals decide it, so neither component owns `data-nav-theme`
// alone:
//   • sectionAtNav  — the dark skills section's box is crossing the nav band
//                     (NavThemeObserver, via IntersectionObserver). Handles the
//                     EXIT: nav returns to dark-ink once the section scrolls up
//                     past the nav into the light sections below.
//   • bloomCovers   — the dark has actually filled the area behind the nav.
//                     During the desktop radial bloom the pinned section is at
//                     the nav line but still MASKED to a small circle around the
//                     portrait, so its box "intersects" while the nav band is
//                     still over the pale hero backdrop. Flipping to off-white
//                     then would make the nav vanish. SkillsSection sets this
//                     true only once the bloom radius reaches the nav band.
//
// The nav is off-white ("dark" theme) only when BOTH hold. Defaults to
// bloomCovers = true so the reduced-motion / mobile path (no bloom) behaves
// exactly as before — the IntersectionObserver alone drives the flip.

// 1px detection line at the nav's vertical band. Shared so the bloom's
// nav-coverage test lines up with where the observer watches.
export const NAV_LINE_PX = 56;

let sectionAtNav = false;
let bloomCovers = true;

function apply() {
  if (typeof document === "undefined") return;
  if (sectionAtNav && bloomCovers) document.body.dataset.navTheme = "dark";
  else delete document.body.dataset.navTheme;
}

export function setSectionAtNav(value: boolean) {
  sectionAtNav = value;
  apply();
}

export function setBloomCovers(value: boolean) {
  bloomCovers = value;
  apply();
}

export function resetNavTheme() {
  sectionAtNav = false;
  bloomCovers = true;
  apply();
}

---
target: landing hero + PRATIUSH→PROJECTS morph
total_score: 32
p0_count: 0
p1_count: 1
timestamp: 2026-06-15T13-29-27Z
slug: hero-morph-landing
---
# Critique — Landing hero + PRATIUSH→PROJECTS morph

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Scroll cue + morph give feedback; dark work panel may flash empty while video lazy-loads |
| 2 | Match System / Real World | 4 | Plain, first-person, natural reading order |
| 3 | User Control and Freedom | 3 | 220vh pinned scrub can feel like scroll-jack; nav anchors mitigate; reduced-motion path exists |
| 4 | Consistency and Standards | 4 | One accent, one ink, coherent type system |
| 5 | Error Prevention | 3 | n/a (no forms in view) |
| 6 | Recognition Rather Than Recall | 3 | Nav labels clear and persistent |
| 7 | Flexibility and Efficiency | 3 | No skip past the long scrub; Works/Resume anchors help |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, but the "MY" ghost garbles PROJECTS and the resting hero is a large void |
| 9 | Error Recovery | 3 | n/a |
| 10 | Help and Documentation | 3 | n/a for a portfolio |
| **Total** | | **32/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment:** Does NOT read as AI slop. The palette is committed (terracotta drench on warm field, single accent), the type system is deliberate, the morph is a genuine signature move, and the brand's anti-tell discipline (no section eyebrows, no 01/02/03) holds. The one regression: the ghosted **"MY"** reintroduces a *label* — the exact AI-tell the brand explicitly rejects — and it currently reads as a typographic collision, not depth.

**Deterministic scan:** `detect.mjs` over hero/works/layout/footer components returned `[]` (exit 0). Clean — no gradient text, side-stripe borders, eyebrow scaffolding, or glass defaults.

**Visual overlays:** Not run. Per project rule (`no-visual-verification-when-present`) headless-browser injection is off; critique is from the three supplied frames + source.

## Overall Impression

The bones are strong and on-brand. The morph is the right bet and the resting type lockup has taste. Two things hold it back from impeccable: (1) the **"MY" ghost collides with PROJECTS** and reads as a bug at the exact peak-end moment the whole page is built around, and (2) the **resting hero is mostly empty warm field**, so the first 2 seconds — before any scroll — under-sell. Both are fixable without touching the architecture.

## What's Working

- **Committed palette + type.** Terracotta-on-cream with one ink, League Spartan display against the serif voice note — distinctive, not template. Detector and eye agree: no slop tells.
- **The morph concept.** PRATIUSH→PROJECTS as a per-letter gravity pull that lands as the section title is a real idea, executed with genuine type-fidelity engineering (per-slot width/kern handoff). This is the proof-of-work the brief asks for.
- **Diagonal landed composition.** Thesis line upper-left, PROJECTS mid-right, work panel cresting bottom — a real thirds composition, not a two-column split.

## Priority Issues

- **[P1] The "MY" ghost garbles the landed wordmark.** In the frames, "MY" is right-aligned at the row edge so its M sits over JE and Y over TS, reading "PROJE-MY-CTS." It's the same terracotta as PROJECTS at 0.16 opacity, so there's no tonal separation to make it read as *behind* — it reads as interleaved foreground glyphs. Worse, it reintroduces a section *label*, which the brand explicitly bans as an AI-tell. **Fix:** either kill it (cleanest, most on-brand), or make it unmistakably a set-back echo — shift it off the wordmark's horizontal band (up/behind, not overlapping the letter run), drop opacity toward 0.06–0.08, and tone it away from the accent (a desaturated ink tint, not terracotta) so occlusion reads as depth. **Command:** `/impeccable distill` (remove) or `/impeccable layout` (re-stage).

- **[P2] The resting hero is a large empty field.** Everything lives in the lower-left ~third; the upper 60% and right 55% are blank gradient with only nav + a faint "SCROLL". The composition leans entirely on the morph to fill space, but the pre-scroll frame is what a time-poor recruiter judges first. **Fix:** give the resting frame a second anchor — pull the glow/aurora to do real compositional work in the void, add a quiet right-side element (the scroll cue could be more deliberate), or tighten the vertical rhythm so the lockup isn't stranded in one corner. **Command:** `/impeccable layout`.

- **[P2] Dark work panel may flash empty during lazy-load.** Frame 2 shows the NILINK panel as a flat dark slab beside PROJECTS. With demo videos `preload="none"`, there's likely a beat where the panel is a void with no poster. **Fix:** ship a poster/first-frame or a typographic placeholder so the panel never renders as an empty rectangle. **Command:** `/impeccable harden`.

- **[P2] Verify micro-label contrast.** "SCROLL" (vertical, right edge) and "BASED IN USA" (bottom-right) read very light against the cream. Tracked-caps at small sizes on a tinted near-white is the classic AA failure. **Fix:** measure against `#F4E3CE`; push toward the plum ink end if below 4.5:1 (3:1 for the larger tracked caps). **Command:** `/impeccable audit`.

## Persona Red Flags

**Morgan (time-poor recruiter — project-specific):** Lands, sees a near-empty warm page with a name and a tagline that's voice, not proof. The "can this person ship?" answer is gated entirely behind a long scrub they must discover via a faint "SCROLL." If they don't scroll, they leave with nothing. The nav "Works"/"Resume" are the safety net — make sure they're obviously clickable on first paint.

**Riley (stress tester):** The 220vh pinned scrub is a long commitment; fast-scrolling or trackpad-flinging through it may skip the morph's payoff or land mid-transform. What happens on resize mid-scrub, or on a refresh at 50% through the pin? The ResizeObserver re-measure helps, but worth confirming the landing stays right-aligned.

**Casey (mobile):** Can't assess from desktop frames, but the entire move depends on horizontal travel (left anchor → right edge) and a two-column landed frame — both of which compress hard on a narrow viewport. CLAUDE.md already flags "hero responsive CSS rewrite pending"; this is the highest-risk surface for it.

## Minor Observations

- Two terracotta focal points at the landed frame: the accent word "polished" and "PROJECTS" itself. Mild competition; consider letting PROJECTS own the accent there.
- "Hi, I'm" reads as a genuine sentence fragment into the name (voice), not a section eyebrow — it's on the right side of the anti-tell line. Keep it.
- The serif tagline copy ("Good products feel obvious. Getting there isn't.") differs from what CLAUDE.md records ("Ideas come in rough / I ship them polished"). Update the doc if the new line is final.

## Questions to Consider

- Does "MY PROJECTS" earn a word the rest of the page refuses to use? The whole thesis is *transitions are the headings* — is the ghost fighting your own best principle?
- What does the recruiter see in the 2 seconds before they scroll, and is that frame doing enough on its own?
- If the morph is the one big move, should the resting hero be *more* composed to set it up, or is the emptiness deliberate tension before the payoff?

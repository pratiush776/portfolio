# Design USP — research + options for the works section

A working note. Two parts:

1. **Diagnosis** of the current video / hover issues, with concrete root causes.
2. **Research + options** for a signature design move ("USP") layered on top of the editorial calm.

---

## Part 1 — Diagnosis: video + hover

### 1.1 Why Lucid Tone flickers

Ran `ffprobe` on the actual file. Findings:

| File | Resolution | FPS | Video bitrate | Duration | Size |
|---|---|---|---|---|---|
| `LucidTone/demo.mp4` | 1920×1246 | 30 | **~93 kbps** | 4m 34s | 6.5 MB |
| `WhiskItAll/demo.mp4` | **3570×1894** | **60** | **~3.1 Mbps** | 63s | 24 MB |
| `LucidTone/demo_original.mp4` | (raw) | — | — | — | **235 MB** |

Three independent problems:

- **Lucid Tone is over-compressed.** 93 kbps for a 1920×1246 video is roughly **0.0013 bits per pixel** — well below the floor where h264 holds together. The codec runs out of bits during any motion and falls back to coarse blocks, which read as flicker on hover. This is the dominant cause of the "not smooth" feeling.
- **Whisk It All is the opposite — wildly over-spec'd.** 3570×1894 @ 60fps at 3.1 Mbps gets downsampled by the browser to fit a ~320px-wide preview. The browser is decoding ~6.7 megapixels per frame to draw a thumbnail. Decode pressure → janky first frames after hover triggers play.
- **Both videos are minutes long but the preview only ever sees the first few seconds.** You're downloading multi-minute payloads to show 5–10s loops.

### 1.2 Why playback feels delayed even when the file is fine

- `<video preload="metadata">` + `play()` only on hover means the actual video bytes aren't fetched until the moment of intent. First frames arrive over the wire mid-animation. On a marginal network or with a heavy file, this lands as the perceived "delay" / "flicker."
- No `poster` attribute → between hover-start and first-frame-decoded the element shows transparent until the codec has something to draw. That blank gap is part of the visual stutter.

### 1.3 Why `next-video` isn't helping

`next-video@2.7.1` is installed, the dev script even runs `next-video sync -w`, and there's a `videos/get-started.mp4.json` stub from the starter. But `RecentWorks.tsx` imported raw paths (`/projects_assets/.../demo.mp4`) and used a plain `<video>` tag — completely bypassing the optimization pipeline. No HLS/adaptive bitrate, no auto-generated poster, no resized variants. The infrastructure is sitting idle.

### 1.4 Hover smoothness — what to keep and what to drop

You named the correct fix: snappy timing, no layout-shifting animations. Applied this turn:

- `HOVER_INTENT_DELAY_MS: 260 → 0` — hover triggers immediately on intent.
- Removed the `__row-inner` translate-X (`clamp(0.25rem, 0.5vw, 0.5rem)` → gone). This was the "subtle shift to the right" you flagged.
- Removed the `__thumb-brand-mark` hover scale (`-2px / 1.03`) — also a non-zero motion that contributed to the gliding-trigger feel.
- Shortened the red left-bar transition from `0.5s` to `0.22s` so it tracks the snappier timing.
- Removed the mid-row `RowPreview` component and its CSS rule entirely.

What remains as the hover affordance: red bar slides up on the left edge + title color shifts to `--v3-accent-red`. Both are repaints, neither shifts layout.

### 1.5 Recommended video remediation (separate workstream)

When you decide to bring video back — in any form — do these first:

1. **Re-encode** Lucid Tone with h264 CRF 22, target ~1.2–1.6 Mbps, max bitrate cap ~2.5 Mbps. Trim to a 6–10s loop of the most-representative motion.
2. **Re-encode** Whisk It All at 1280×720 (or 1280×680 to keep its aspect) @ 30fps, CRF 22. Trim to a similar short loop.
3. **Generate a poster** (first or representative frame) as `.webp` per video.
4. Wire through `next-video` so adaptive streaming and the optimized poster are used automatically. Replace direct `/projects_assets/.../demo.mp4` paths with the `next-video` import pattern.
5. Set `preload="auto"` on the *trimmed* short loop (it's small enough), or keep `preload="metadata"` + show the poster eagerly so the visible state is always a real frame.

`ffmpeg` one-liners for reference:

```sh
# Lucid Tone: re-encode + trim to a 8s loop starting at 12s
ffmpeg -ss 12 -i demo_original.mp4 -t 8 -vf "scale=1280:-2" \
  -c:v libx264 -crf 22 -preset slow -movflags +faststart -an demo.mp4

# Whisk It All: downsize + trim to 8s, drop 60→30fps
ffmpeg -ss 4 -i demo.mp4 -t 8 -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -crf 22 -preset slow -movflags +faststart -an demo.mp4

# Poster
ffmpeg -ss 2 -i demo.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 80 poster.webp
```

---

## Part 2 — USP research: how good portfolios break the rules

### 2.1 The principle behind all of this

Across the references I sifted (Awwwards SOTDs, Muzli's 2026 portfolio roundup, Eva Sánchez, Rauno Freiberg, Bruno Simon, the neo-brutalist crop), one through-line keeps surfacing: **the best portfolios pair a quiet, disciplined base with exactly one signature move**. Not three. Not a brutalist takeover. One.

That signature move:
- Is unmistakably the designer's voice ("oh, this is Rauno's site").
- Is doing real work — not decoration. It either tells you something about how they think, or it changes how you navigate.
- Costs them effort that a templated portfolio wouldn't pay. The labor is the message.

This matches your current setup well: the editorial Casi-Studio base is the discipline. The USP is the one thing you add that nobody else has.

### 2.2 The pattern library

A catalog of moves I found in the wild. Each one has a referenced source, a rough effort estimate, and where it pulls weight.

| # | Pattern | What it is | Reference / example | Effort | Risk |
|---|---|---|---|---|---|
| A | **Cursor-locked preview** | Cursor over a row turns into a small floating tile that shows the project's hero artwork; tile moves with the cursor | Eva Sánchez (Awwwards SOTD); Squarestylist "image follows cursor list" | M | Low |
| B | **Context-aware cursor label** | Default cursor is a dot; on row hover, expands into a circle containing a verb ("open", "see", "play") | "découvrir" cursor pattern (HubSpot animated cursor writeup) | M | Low |
| C | **Marginalia / footnotes** | Small italic/serif sidebar notes next to each row — a sentence on what was hard, what shipped, what you'd redo | Books, not websites; Rauno's "Field Notes"; Robin Sloan's site | L | None |
| D | **Manifesto block** | A short repetitive cadence somewhere on the page that crystallizes how you work — Rauno's "Make it fast. Make it beautiful…" pattern | Rauno Freiberg | S | None |
| E | **Hand-drawn / signed annotations** | Hand-lettered marks, arrows, circles, signatures over the editorial layout | Grit Pictures "mad man's scrapbook"; Tobias van Schneider | M | Med |
| F | **One row breaks the grid** | The middle/featured row escapes the column system — different bg color, larger thumb, italic title, bleeds off the gutter | Awwwards SOTD agency portfolios; intentional brutalist break | S | Low |
| G | **Off-canvas / bleed title** | Section title intentionally clipped by the viewport edge so reading it requires presence | Neo-brutalist roundup ("content overflows grid boundaries… violations create tension") | S | Med |
| H | **Mixed typographic register** | One element — usually role/year — set in a contrasting family (serif italic in an all-sans page) | Editorial print convention; Pentagram | S | Low |
| I | **Real-time / live state** | Status pill that's actually live: "shipping today", "iterating", "🟢 online" tied to a feed | Vercel, Linear, indie devs | M | Low |
| J | **Audio cue on hover** | Soft tick/whisper plays once per row hover, muted by default with a toggle | Active Theory; Resn | M | Med |
| K | **Time-of-day theming** | Background tint shifts by viewer's local hour — cream in morning, deeper green at night | Robin Sloan, Bruno's earlier portfolios | M | Low |
| L | **Easter egg in DevTools** | Open console → ASCII art / hire-me note / colored credits | Stripe, Vercel, Cassie Evans' GSAP demos | S | None |
| M | **Sticker / stamp overlay** | Small image element (sticker, stamp, polaroid corner) breaking the grid on one project as a non-typographic "featured" mark | Grit Pictures collage; physical-media revival trend | M | Med |
| N | **Drag-rearrangeable list** | Reader can drag the project rows to reorder them, with the order persisted client-side | Natalie Almosa portfolio | L | High |
| O | **Asymmetric scroll-driven entry** | Each row enters from a different direction / angle on first scroll-in — feels human, not template-generated | Awwwards 2025–26 portfolio nominees | M | Med |

### 2.3 What fits *your* site specifically

Your base is the Casi Studio editorial register: pale yellow-green, ledger rows, big Pier display title. A signature move needs to extend that voice, not fight it. The candidates that map best:

#### Option 1 — Cursor-locked preview tile  *(strongest interaction-design move)*

**The move:** When the cursor enters a row, a small tile (~280×175px) materializes next to the cursor showing the project's hero. The tile moves with the cursor, lags slightly for damping (Framer Motion `useSpring`), fades out on row-exit.

**Why it fits:** Solves the same problem the mid-row video was trying to solve (showing more than a logo), but without forcing the user to commit to one location. Editorial portfolios use this exact move (Eva Sánchez, multiple Squarespace plugins) and it reads as craft, not gimmick.

**What goes wrong if rushed:** spring damping needs tuning or the tile feels twitchy. Mobile gets no benefit — needs a fallback (just show the thumb larger inline).

#### Option 2 — Marginalia notes  *(strongest narrative move)*

**The move:** Each row gets a short hand-set sidebar (left or right gutter, italic Noto or a tiny serif if you add one) that's 1–2 sentences in your voice. "Built the auth flow twice — second time was the right one." "First product I shipped where I designed and coded every screen." Signed `— PS`.

**Why it fits:** It's the highest-personality move with the lowest visual disruption. Reads like a book's margin notes. Almost nobody does this on dev portfolios — most stick to tech-stack tags.

**What goes wrong if rushed:** notes need genuine substance; templated "Built with love using Next.js" reads worse than nothing. This is a writing task as much as a design one.

#### Option 3 — One row breaks the grid  *(strongest visual move)*

**The move:** Pick one project (probably Lucid Tone since it's the most personal). That row alone gets: a different bg color (a warm cream that fights the green), a larger thumb (maybe a stamp/sticker overlay), the title set in a different weight or italic. The rest of the list stays disciplined.

**Why it fits:** Demonstrates editorial confidence — you know the rules well enough to break them in exactly one place. Reference roundups specifically call this out as an intentional brutalist move when done in moderation.

**What goes wrong if rushed:** if the break feels arbitrary it reads as a layout bug. Needs to correspond to a real distinction — "founder project" vs. "client / capstone work" — so the visual differentiation maps to a real category.

#### Option 4 — Manifesto block + DevTools easter egg  *(strongest "voice" move, lowest risk)*

**The move:** Add a short manifesto-cadence block above the works list (5–7 lines, repetitive structure, Rauno-style). And `console.log` a colored greeting + hire-me line on page load with `%c` styling.

**Why it fits:** It's the cheapest signal of intentionality you can ship in an afternoon, and it survives any future redesign because both elements are self-contained.

**What goes wrong if rushed:** the manifesto has to actually be yours. If it reads as "Make it ___. Make it ___." pastiche of Rauno it backfires immediately.

#### Option 5 — Time-of-day tint  *(strongest atmosphere move)*

**The move:** The `--v3-bg-primary` value shifts by 30–60° of hue / a few percent of lightness based on the viewer's local hour. Pale yellow-green at noon, warm cream at evening, cool sage at night. Tiny, no toggles.

**Why it fits:** Atmospheric without being a feature. Reader doesn't have to "discover" it for it to do its job. Pairs with the editorial register because it's a print-magazine kind of move (different paper stock for different sections).

**What goes wrong if rushed:** color drift can break accessibility contrast at certain hours. Needs to clamp inside a defined palette range, not just lerp freely.

### 2.4 What I'd recommend stacking

The pattern from the references that ship best: **one interaction move + one voice move**, layered. So:

- **Option 1 (cursor-locked preview) + Option 2 (marginalia)** — interaction + narrative. The cursor preview gives the page kinetic energy; the marginalia gives it a person behind it. Both are quiet enough that the editorial base still reads.
- Or, if Option 1 feels too close to "every Awwwards portfolio of 2025" — **Option 3 (one row breaks grid) + Option 4 (manifesto + DevTools)**. Static but distinctive.

Avoid layering more than two — the references that fail are the ones that try to be cursor-following AND brutalist AND audio-on AND animated-cursor AND 3D-WebGL. That's not voice, that's noise.

### 2.5 What I'd avoid for *this* site

- **Full 3D / WebGL** (Bruno Simon style). Wrong register for an editorial works list.
- **Hand-drawn annotations** (E). Would clash with the disciplined typography unless you commit to a more scrapbook aesthetic globally.
- **Drag-rearrangeable list** (N). High effort, marginal signal, breaks the "curated by me" implication.
- **Audio cues** (J). Hostile on autoplay, ignored if opt-in.

---

## Sources

- [100 Best Designer Portfolio Websites of 2026 — Muzli Blog](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [Eva Sánchez Portfolio — "The result of a collaboration" Case Study — Awwwards](https://www.awwwards.com/eva-sanchez-portfolio-the-result-of-a-collaboration-case-study.html)
- [16 Neo Brutalist Website Examples — Really Good Designs](https://reallygooddesigns.com/neo-brutalist-website-examples/)
- [Brutalism in Web Design — The Joomla Community Magazine (March 2026)](https://magazine.joomla.org/all-issues/march-2026/brutalism-in-web-design)
- [Web Design Trends 2026: The Definitive Guide — Line25](https://line25.com/articles/web-design-trends-2026/)
- [Portfolio hover effect — Awwwards inspiration](https://www.awwwards.com/inspiration/portfolio-hover-effect-fooror-event-design-agency)
- [Image Follows Cursor List Layout — Schwartz-Edmisten Web Design](https://schwartz-edmisten.com/squarespace-plugins/p/image-follows-cursor-list-layout)
- [8 CSS & JavaScript Snippets for Unique Cursor Effects — Speckyboy](https://speckyboy.com/css-javascript-cursor-effects/)
- [How to use custom animated cursors to upgrade your website UX — HubSpot](https://blog.hubspot.com/website/animated-cursor)
- [Rauno Freiberg — rauno.me](https://rauno.me/)
- [Bruno Simon — Portfolio (case study) — Medium](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
- [Best Portfolio Websites — Awwwards](https://www.awwwards.com/websites/portfolio/)

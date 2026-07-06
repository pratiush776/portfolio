"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";

import {
  DNA_EXIT,
  DNA_SET_IN,
  DNA_SET_OUT,
} from "@/components/hero/heroTimeline";
import { useIntro } from "@/components/intro/IntroProvider";
import { capabilities, type Node } from "@/data/capabilities";

/**
 * The stack as a living double helix — a self-portrait in tools, and a PERMANENT fixture of the
 * narrative track's right void (NarrativeSection `.narrative-dna-rail-v4`). It is present from the very
 * first frame as a bare SKELETON, and the icons FLOW THROUGH it as the capabilities chapter arrives:
 *
 *   1. SKELETON — the two backbone strands + base-pair rungs (no icons) ink DOWN the column once, top
 *      to bottom, right after the hero name has risen (SKELETON_DELAY_MS after `foregroundIn`). This
 *      draw-on is time-based (DRAW_MS), and once done the bare helix simply stays, rotating slowly.
 *   2. ICONS FLOW — driven by the master `progress`, MULTI-SET (Phase 2): the four capability domains
 *      (src/data/capabilities.ts) each own an icon set. Set s POURS in over DNA_SET_IN[s] (top rows
 *      first — a waterfall), SEATS for the dwell, then DRAINS off the base over DNA_SET_OUT[s]; the
 *      windows are sequential, so a brief bare-skeleton BREATH sits between sets — the reset beat that
 *      lets ONE shared node pool re-dress into the next domain's logos without a bead ever visibly
 *      flipping. A bead's angle/depth/x/y derive from its CURRENT path fraction, so it correctly
 *      spirals and picks up depth scale as it travels. Which set the pool is WEARING is derived purely
 *      from `progress` (idempotent, direction-safe — scrolling up re-dresses correctly too).
 *      CHROMA + DEPTH (review-driven, guidebook §6 / §4 demote-without-removing):
 *        • logos are CONTENT, not chrome — they keep their TRUE brand colour wherever they're
 *          legible (no mono filter; two desaturation schemes failed — see the chroma note below).
 *          The one-accent discipline lives in the CHROME: strands, rungs and discs.
 *        • depth is ONE SMOOTH GROW-AND-REVEAL — every node is always the same paper disc; on the
 *          far side it's a small clean dot, and it smoothly ENLARGES as it rounds to the front,
 *          the logo fading in across a wide window while it grows (no thresholds — thresholds are
 *          what read as dark far dots and "blinking" logos). Identity arrives with size.
 *   3. EXIT — after the icons drain, the bare strands FADE OUT entirely (DNA_EXIT, presence 1 → 0) as
 *      the projects frame arrives; after DNA_EXIT the canvas draws nothing and the nodes are hidden.
 *
 * (No pointer interaction — a cursor tilt/steer was tried and cut by the user; the helix's only life
 * is its own slow idle spin.)
 *
 * ALL per-frame work is compositor-only: one canvas repaint (backbones + rungs) plus transform/
 * opacity/filter on the logo DOM nodes — NO React re-render, and the scroll progress is read via
 * `.get()` inside the rAF, never subscribed. Reduced motion renders one static pose: skeleton fully
 * inked + all icons SEATED, no draw, no flow, no spin.
 *
 * Logos are grouped by family and kept adjacent along the helix (each rung pairs two related tools).
 */

/* ── The icon SETS — one per capability domain (src/data/capabilities.ts) ─────────────────────────
 * The four domains' rung tables. The shared node POOL is sized to the LARGEST set (2 × max rungs), and
 * a set with fewer rungs uses its first 2×n pool nodes — the rest stay hidden for that set. The pool's
 * <img> srcs/pads are RE-DRESSED per set during the bare-skeleton breath between drains (see the state
 * machine). SET_COUNT[s] is that set's rung count; MAX_RUNGS sizes the pool. */
const SETS = capabilities.map((c) => c.rungs);
const SET_COUNT = SETS.map((rungs) => rungs.length);
const MAX_RUNGS = Math.max(...SET_COUNT); // 8 → POOL = 16 span nodes
const POOL = MAX_RUNGS * 2; // total logo span nodes (both strands of every possible rung)

// Set 0 dresses the pool initially (SSR markup + reduced-motion static pose). Each pool index maps to
// (rung k, strand s) = (Math.floor(i/2), i%2); a set shorter than MAX_RUNGS leaves the tail undressed.
const dressOf = (rungs: readonly (readonly [Node, Node])[]): (Node | null)[] => {
  const out: (Node | null)[] = [];
  for (let k = 0; k < MAX_RUNGS; k++) {
    const rung = rungs[k];
    out.push(rung ? rung[0] : null, rung ? rung[1] : null);
  }
  return out;
};

// The pool's initial dress (SET 0) for the SSR markup — the rAF re-dresses on scroll.
const INITIAL_DRESS = dressOf(SETS[0]);

/* ── Geometry — a NARROW, TALL helix so the two strands read as a twisting ribbon, not wide bars ── */
const TURNS = 2; // full twists over the column height (adjacent logos ~65° apart → they ride the wave)
const ANGLE_TOTAL = 2 * Math.PI * TURNS;
const PHASE0 = Math.PI / 2; // resting pose: strands start broadside (widest) at the top
const RADIUS_RATIO = 0.2; // strand half-spread as a fraction of column width…
const RADIUS_MAX = 122; // …capped so the helix stays a NARROW, tall ribbon (user-directed: slimmer
// reads more premium/elegant than the wide swing — the mass lives in the chips, not the spread).
const PAD_Y_RATIO = 0.06; // vertical inset top & bottom, as a fraction of column height
const BACKBONE_STEPS = 90; // sample segments per strand for a smooth backbone curve

/* ── Skeleton draw-on ──────────────────────────────────────────────────────────────────────────── */
const SKELETON_DELAY_MS = 900; // after `foregroundIn`, the skeleton inks in RIGHT AFTER the name rises
const DRAW_MS = 1700; // time-based draw-on for the strands + rungs (rotation held until it finishes)

/* ── Icons flow (scroll-scrubbed along the strand path) ─────────────────────────────────────────── */
// A node's REST path-fraction is fRest = k/(N-1); both strand beads of rung k share it. During the
// flow the bead's CURRENT path-fraction `g` is what places it, so it spirals around the strand as it
// travels (angle/depth/x/y all derive from g), pouring in from just above the top and draining below.
const FLOW_TOP = -0.06; // just above the helix top — where the beads pour in from
const FLOW_BOTTOM = 1.1; // just below the base — where they drain out to
const IN_STAGGER = 0.03; // per-node lead: top rungs seat first (a waterfall down the strand)
const OUT_STAGGER = 0.02; // gentler drain stagger — the column empties top-first, off the bottom
// The stagger SPANs depend on the active set's rung count (so the last node lands exactly at the
// window edge for a set of any length). Precomputed per set.
const inSpanOf = (n: number) => 1 - (n - 1) * IN_STAGGER;
const outSpanOf = (n: number) => 1 - (n - 1) * OUT_STAGGER;

/* ── Motion ───────────────────────────────────────────────────────────────────────────────────── */
const ROT_SPEED = 0.0003; // radians / ms once alive (~21s per full revolution — calmer, more serene)

/* ── Working pulse (wow-within-restraint) ─────────────────────────────────────────────────────────
 * While progress sits INSIDE any pour/drain window the helix visibly "works" — the idle spin eases up
 * to PULSE_ROT× and the rungs brighten by +PULSE_RUNG_ALPHA — then settles during the seated dwells.
 * A smoothstep in/out at each window edge (computed per frame from the distance INTO the nearest
 * IN/OUT window) drives it, so it ramps rather than snapping, and needs no timer. */
const PULSE_ROT = 1.25; // idle-spin multiplier at the peak of a swap (dialed back — a gentle lift, not a whir)
const PULSE_RUNG_ALPHA = 0.035; // rung stroke-alpha lift at the peak (subtler brighten)
const PULSE_EDGE = 0.006; // fraction-of-progress ramp width at each window edge (~4vh of scroll)

/* ── Depth → look ─────────────────────────────────────────────────────────────────────────────── */
// z = cos(angle) ∈ [-1 (back), +1 (front)]; d = (z+1)/2 ∈ [0,1].
const SCALE_FRONT = 1;
// Back-node presence: the far side is small paper dots — the same chip, grown down — so they get
// enough opacity to read as intentional strand beads, not dust. (No blur, no colour filter: depth
// is scale + opacity only.)
const OPACITY_BACK = 0.46;
const OPACITY_FRONT = 1;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
// Hermite smoothstep — a soft 0→1 ramp across [e0, e1], flat-tangent at both ends.
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/* ── Chroma: logos are CONTENT, not chrome ───────────────────────────────────────────────────────
 * NO colour filter on the marks. Two failed attempts taught this: a c^2.2 warm-mono bled a muddy
 * gray across the far side, and a clay-mono-with-front-bloom washed the light wordmarks (Next,
 * Express, GSAP…) into their white discs — a helix of BLANK circles. The guidebook's own §6
 * exception settles it: when the work itself is the colour (photography, product shots — or brand
 * marks), the CHROME disappears and the content keeps its colour. So the chrome (strands, rungs,
 * discs, beads) is strictly terracotta-family, and a logo, wherever it is legible, is simply its
 * true self. Depth is told by scale + opacity + the bead crossfade below — nothing else. */

/* ── Depth = one smooth GROW-AND-REVEAL (user-directed) ──────────────────────────────────────────
 * Every node is ALWAYS the same warm paper disc (the CSS chip — background/ring/shadow are static,
 * never repainted): on the far side it's a small clean dot, and as it rounds toward the front it
 * SMOOTHLY ENLARGES, the logo fading in across a WIDE depth window while it grows. One continuous
 * curve — no colour crossfade and no narrow threshold, which is what made the earlier versions read
 * as dark far-side dots and logos "blinking" in and out. */
const SCALE_DOT = 0.34; // the far-side dot, as a fraction of the full chip
const GROW_START = 0.15; // depth range over which the dot grows into the full chip…
const GROW_END = 0.9; // …front-facing chips sit at full size for a beat, not just an instant
const LOGO_IN_START = 0.45; // the logo fades in across THIS wide window while the chip enlarges —
const LOGO_IN_END = 0.8; //   gradual over the rotation, so identity arrives with size, no blink

export function TechDNA({ progress }: { progress: MotionValue<number> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // The logo <img> inside each node, cached once so the frame path can fade it (FIX 3) without a
  // re-query. Same index space as nodeRefs (k*2 + strand).
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const { foregroundIn } = useIntro();
  const reduce = useReducedMotion() ?? false;

  // The skeleton draw-on fires SKELETON_DELAY_MS after the foreground gate opens. A ref carries the
  // "go" signal into the rAF loop without re-subscribing it. `foregroundIn` never flips back.
  const skeletonGoRef = useRef(false);

  // Which set the shared pool is currently WEARING (its <img> srcs). Starts at 0 (the SSR dress); the
  // frame loop re-dresses it as progress crosses set boundaries. A ref so a re-dress never re-renders.
  const wornSetRef = useRef(0);

  useEffect(() => {
    if (!foregroundIn) return;
    const t = window.setTimeout(() => {
      skeletonGoRef.current = true;
    }, SKELETON_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [foregroundIn]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    let W = 0;
    let H = 0;

    const resize = () => {
      W = root.clientWidth;
      H = root.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) drawStatic(); // keep the static pose fitted on resize
    };

    // Place ONE bead (rung k, strand dir) at path-fraction g, with rotation phase t and opacity
    // multiplier `mul`. Angle/depth/x/y all derive from g, so a flowing bead spirals correctly.
    const placeNode = (k: number, dir: 1 | -1, g: number, t: number, mul: number) => {
      const idx = k * 2 + (dir === 1 ? 0 : 1);
      const el = nodeRefs.current[idx];
      if (!el) return;
      const cx = W / 2;
      const padY = H * PAD_Y_RATIO;
      const span = H - padY * 2;
      const R = Math.min(W * RADIUS_RATIO, RADIUS_MAX);
      const a = PHASE0 + g * ANGLE_TOTAL + t;
      const x = cx + dir * R * Math.sin(a);
      const y = padY + g * span;
      const d = (dir * Math.cos(a) + 1) / 2; // 0 back … 1 front
      // One smooth grow-and-reveal: the chip (always the same paper disc — its background/ring are
      // static CSS, never repainted) enlarges continuously from a far-side dot to the full front
      // chip, and the logo fades in across a WIDE window while it grows — identity arrives with
      // size. No thresholds, no colour crossfade: that's what read as dark dots + blinking logos.
      const scale = lerp(SCALE_DOT, SCALE_FRONT, smoothstep(GROW_START, GROW_END, d));
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      el.style.opacity = (lerp(OPACITY_BACK, OPACITY_FRONT, d) * clamp01(mul)).toFixed(3);
      el.style.zIndex = String(Math.round(d * 100));
      // The logo keeps its TRUE colour (content, not chrome — see the chroma note above); no
      // element filter (a grayscale() on the node would desaturate its background too).
      const img = imgRefs.current[idx];
      if (img) img.style.opacity = smoothstep(LOGO_IN_START, LOGO_IN_END, d).toFixed(3);
    };

    // Paint the skeleton (backbones + rungs) for draw progress dp ∈ [0,1] (top→bottom), rotation t,
    // presence (a global stroke-alpha multiplier for the dim-to-watermark), and rungLift (the working-
    // pulse's +alpha on the rungs during a swap). The rung ladder is the FULL MAX_RUNGS geometry (a
    // permanent fixture) regardless of which set is currently worn — icons ride whichever it fills.
    const drawSkeleton = (dp: number, t: number, presence: number, rungLift = 0) => {
      const cx = W / 2;
      const padY = H * PAD_Y_RATIO;
      const span = H - padY * 2;
      const R = Math.min(W * RADIUS_RATIO, RADIUS_MAX);

      ctx.clearRect(0, 0, W, H);
      // BUTT caps, not round: the backbone is stroked segment-by-segment (each segment carries its
      // own depth alpha/width), and round caps at semi-transparent alpha DOUBLE-PAINT at every
      // shared joint — a beading of tiny darker dots down the whole strand. Butt caps tile the
      // joints exactly, so the curve reads as one continuous line.
      ctx.lineCap = "butt";

      // ── Backbones: two continuous sine curves, 180° apart, drawn segment-by-segment so each segment
      //    can carry its own depth (near side brighter + thicker). Drawn top→bottom up to dp (draw-on).
      for (let strand = 0; strand < 2; strand++) {
        const dir = strand === 0 ? 1 : -1;
        for (let s = 0; s < BACKBONE_STEPS; s++) {
          const f0 = s / BACKBONE_STEPS;
          const f1 = (s + 1) / BACKBONE_STEPS;
          if (f0 > dp) break; // draw-on: only the inked-in portion
          const a0 = PHASE0 + f0 * ANGLE_TOTAL + t;
          const a1 = PHASE0 + f1 * ANGLE_TOTAL + t;
          const x0 = cx + dir * R * Math.sin(a0);
          const x1 = cx + dir * R * Math.sin(a1);
          const y0 = padY + f0 * span;
          const y1 = padY + f1 * span;
          const d = (dir * (Math.cos(a0) + Math.cos(a1)) * 0.5 + 1) / 2; // 0 back … 1 front
          ctx.strokeStyle = `rgba(201, 84, 46, ${((0.1 + 0.4 * d) * presence).toFixed(3)})`;
          ctx.lineWidth = 1.1 + 1.5 * d;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }

      // ── Base-pair rungs: hairline between the two strands, foreshortening as the pair turns edge-on.
      //    These carry the pairing CONCEPT — related tools share a base pair — so they're the helix's
      //    information design and must actually RENDER (the review found them invisible). Alpha and
      //    lineWidth lifted; presence (the watermark dim) still multiplies all of it.
      for (let k = 0; k < MAX_RUNGS; k++) {
        const f = MAX_RUNGS === 1 ? 0.5 : k / (MAX_RUNGS - 1);
        if (f > dp) continue; // draw-on
        const a = PHASE0 + f * ANGLE_TOTAL + t;
        const sinA = Math.sin(a);
        const y = padY + f * span;
        const facing = Math.abs(sinA);
        ctx.strokeStyle = `rgba(201, 84, 46, ${((0.14 + rungLift + 0.2 * facing) * presence).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(cx + R * sinA, y);
        ctx.lineTo(cx - R * sinA, y);
        ctx.stroke();
      }
    };

    // RE-DRESS the shared pool with a set's logos — swap each <img>'s src + pad. Idempotent (guarded by
    // wornSetRef, and the loop skips an already-correct src so the browser doesn't re-fetch), and only
    // ever called while every bead is HIDDEN (the bare-skeleton breath), so a bead never visibly flips.
    // Pool node i = (rung k = i>>1, strand s = i&1). A set shorter than MAX_RUNGS leaves the tail nodes
    // undressed (blank) — the frame loop keeps those hidden for that set.
    const dressPool = (setIndex: number) => {
      const dress = dressOf(SETS[setIndex]);
      for (let i = 0; i < POOL; i++) {
        const img = imgRefs.current[i];
        if (!img) continue;
        const node = dress[i];
        if (node) {
          if (img.getAttribute("src") !== node.src) img.src = node.src;
          const pct = node.pad !== undefined ? `${node.pad * 100}%` : "";
          if (img.style.width !== pct) {
            img.style.width = pct; // "" falls back to the CSS 58%
            img.style.height = pct;
          }
        }
      }
    };

    // Reduced-motion / static pose: skeleton fully inked, SET 0 seated at rest, no dim, no flow.
    const drawStatic = () => {
      dressPool(0);
      drawSkeleton(1, 0, 1);
      const n = SET_COUNT[0];
      for (let k = 0; k < MAX_RUNGS; k++) {
        if (k >= n) {
          // beyond set 0's rung count: keep the tail pool nodes hidden
          placeNode(k, 1, 0, 0, 0);
          placeNode(k, -1, 0, 0, 0);
          continue;
        }
        const fRest = n === 1 ? 0.5 : k / (n - 1);
        placeNode(k, 1, fRest, 0, 1);
        placeNode(k, -1, fRest, 0, 1);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    if (reduce) {
      drawStatic();
      return () => ro.disconnect();
    }

    // Pause per-frame work while well off-screen — the clock is time-based, so it resumes seamlessly
    // (the accumulated rotation naturally pauses with it, which is fine).
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), {
      rootMargin: "40% 0px 40% 0px",
    });
    io.observe(root);

    // The four sets' pour/drain windows (all from heroTimeline). Sequential by design: set s drains
    // ~10vh before set s+1 pours, and the LAST set drains at C3 start (the final flow-through). The gap
    // between OUT[s] and IN[s+1] is the bare-skeleton BREATH — the reset beat that lets ONE pool swap
    // identities without a bead ever visibly flipping.
    const SET_IN = DNA_SET_IN; // [s] = [start, end]
    const SET_OUT = DNA_SET_OUT; // [s] = [start, end]
    const [EXIT0, EXIT1] = DNA_EXIT;
    const NSETS = SETS.length;

    // Which set the pool SHOULD be wearing at progress p — derived purely from p (idempotent + direction-
    // safe, so scrolling up re-dresses correctly too): the set whose IN..OUT span contains p, or — while
    // p sits in the bare-skeleton breath / before the first pour / after the last drain — the set whose
    // pour is NEXT to arrive (so the pool is already dressed in what pours in next). Before set 0 pours
    // it's set 0; after the last drain it stays on the last set (nothing else pours).
    const targetSet = (p: number): number => {
      for (let s = 0; s < NSETS; s++) {
        if (p < SET_OUT[s][1]) return s; // p is before set s finishes draining → wear s (it's active,
        //   pouring, seated, draining, OR p is in the breath just before s pours — all want s dressed)
      }
      return NSETS - 1; // past the last drain — keep the last set on (nothing new pours)
    };

    // The working PULSE: how deep p sits inside ANY pour/drain window (0 outside, 1 at a window's core),
    // smoothstepped at each edge so the spin/rung lift ramps rather than snapping. Computed per frame.
    const pulseAt = (p: number): number => {
      let best = 0;
      for (let s = 0; s < NSETS; s++) {
        for (const [w0, w1] of [SET_IN[s], SET_OUT[s]]) {
          if (p <= w0 || p >= w1) continue;
          // rise over PULSE_EDGE at the start, fall over PULSE_EDGE at the end, flat 1 in the middle
          const up = smoothstep(w0, w0 + PULSE_EDGE, p);
          const down = 1 - smoothstep(w1 - PULSE_EDGE, w1, p);
          best = Math.max(best, Math.min(up, down));
        }
      }
      return best;
    };

    let raf = 0;
    let drawStart: number | null = null; // set when the skeleton is cued (SKELETON_DELAY_MS after gate)
    let lastNow = 0;
    let rot = 0; // ACCUMULATED idle rotation (starts once the skeleton draw completes)

    const frame = (now: number) => {
      const dt = lastNow ? now - lastNow : 16;
      lastNow = now;

      if (skeletonGoRef.current && drawStart === null) drawStart = now;

      if (onScreen && drawStart !== null) {
        const dp = clamp01((now - drawStart) / DRAW_MS);
        const p = progress.get();

        // RE-DRESS the pool if p says a different set should be worn. Derived purely from p, so it's
        // idempotent and correct in BOTH scroll directions. The re-dress only happens on the frame the
        // target changes, and by design that frame lands in the bare-skeleton breath where every bead is
        // hidden — so no bead ever visibly flips logos. (dressPool is a no-op when already correct.)
        const want = targetSet(p);
        if (want !== wornSetRef.current) {
          wornSetRef.current = want;
          dressPool(want);
        }
        const set = wornSetRef.current;
        const n = SET_COUNT[set];
        const [IN0, IN1] = SET_IN[set];
        const [OUT0, OUT1] = SET_OUT[set];
        const inSpan = inSpanOf(n);
        const outSpan = outSpanOf(n);

        // Working pulse: idle spin eases up to PULSE_ROT× during a swap, rungs brighten by +alpha.
        const pulse = pulseAt(p);
        // Idle spin ACCUMULATES once the draw completes — the helix's one piece of self-life; the pulse
        // multiplies its rate while a set flows through.
        if (dp >= 1) rot += dt * ROT_SPEED * lerp(1, PULSE_ROT, pulse);
        const t = rot;

        // The bare skeleton draws (once inked) until DNA_EXIT fades presence FULLY to 0 — after which
        // it paints nothing (the projects frame owns the void). No watermark. Rungs lift with the pulse.
        const presence =
          p <= EXIT0 ? 1 : p >= EXIT1 ? 0 : lerp(1, 0, (p - EXIT0) / (EXIT1 - EXIT0));
        drawSkeleton(dp, t, presence, PULSE_RUNG_ALPHA * pulse);

        // The worn set's beads flow in/out along the path; pool nodes beyond this set's rung count stay
        // hidden. Before IN0 (the breath before the pour) / after OUT1 (drained) they're hidden; between,
        // each bead sits at its CURRENT path-fraction g (rest, pouring from the top, or off the base).
        for (let k = 0; k < MAX_RUNGS; k++) {
          if (k >= n) {
            placeNode(k, 1, 0, t, 0); // beyond the worn set — keep hidden
            placeNode(k, -1, 0, t, 0);
            continue;
          }
          const fRest = n === 1 ? 0.5 : k / (n - 1);
          let g: number;
          let mul: number;
          if (p < IN0) {
            g = fRest;
            mul = 0; // not yet poured in (bare-skeleton breath)
          } else if (p < IN1) {
            const u = (p - IN0) / (IN1 - IN0);
            const tIn = clamp01((u - k * IN_STAGGER) / inSpan);
            g = lerp(FLOW_TOP, fRest, easeOutCubic(tIn)); // spiral DOWN into the seat
            mul = Math.min(1, tIn * 2.5); // opacity ramps in fast
          } else if (p < OUT0) {
            g = fRest; // SEATED — this domain's resting pose
            mul = 1;
          } else if (p < OUT1) {
            const uOut = (p - OUT0) / (OUT1 - OUT0);
            const tOut = clamp01((uOut - k * OUT_STAGGER) / outSpan);
            g = lerp(fRest, FLOW_BOTTOM, easeInCubic(tOut)); // continue DOWN off the base
            mul = clamp01((FLOW_BOTTOM - g) / 0.12); // fade as it nears the bottom
          } else {
            g = fRest;
            mul = 0; // drained away (breath before the next set pours)
          }
          placeNode(k, 1, g, t, mul);
          placeNode(k, -1, g, t, mul);
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce, progress]);

  return (
    <div className="tech-dna-v4" ref={rootRef} aria-hidden>
      <canvas ref={canvasRef} className="tech-dna-v4__canvas" />
      {/* POOL span nodes — ONE shared pool (2 × MAX_RUNGS), re-dressed per set by the rAF loop. Rendered
          once, dressed with SET 0 initially (the rAF swaps srcs/pads as progress crosses sets). Beyond a
          set's rung count the tail nodes stay hidden. Index i = (rung k = i>>1, strand s = i&1). */}
      {INITIAL_DRESS.map((node, i) => (
        <span
          key={i}
          className="tech-dna-v4__node"
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small brand SVG/PNGs, no next/image gain */}
          <img
            src={node ? node.src : ""}
            alt=""
            draggable={false}
            className="tech-dna-v4__logo"
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            // Static per-node padding for square/full-bleed marks. Default 58% stays in the CSS rule;
            // padded nodes override to their fraction. The rAF re-dress rewrites these on a set swap.
            style={node?.pad !== undefined ? { width: `${node.pad * 100}%`, height: `${node.pad * 100}%` } : undefined}
          />
        </span>
      ))}
    </div>
  );
}

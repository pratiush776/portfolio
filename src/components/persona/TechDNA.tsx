"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";

import {
  DNA_EXIT,
  DNA_FLOW,
  DNA_IN,
} from "@/components/hero/heroTimeline";
import { useIntro } from "@/components/intro/IntroProvider";
import { capabilities } from "@/data/capabilities";

/**
 * The stack as a quiet double helix — the SUPPORTING ATMOSPHERE of the persona chapter's right-centre
 * (NarrativeSection `.narrative-dna-rail-v4`), deliberately secondary to the statement + capability
 * spine on the left.
 *
 *   1. SKELETON — the two backbone strands + base-pair rungs ink DOWN the column once
 *      (SKELETON_DELAY_MS after `foregroundIn`), but the helix is CHAPTER-SPECIFIC: a presence
 *      multiplier holds it at 0 through the hero (DNA_IN) so PRATIUSH owns its stage alone; the
 *      already-drawn helix then fades in as the persona chapter opens. Rotation is SCROLL-LINKED
 *      (t = p × ROT_TOTAL) — the old time-based idle spin kept the beads orbiting while the reader
 *      sat still, which read as restless churn (user-flagged); now a stopped page is a stopped
 *      helix. Chrome (strands, rungs, discs) is terracotta-family at a demoted alpha (CHROME_ALPHA).
 *   2. ICONS — ONE CONTINUOUS CONVEYOR, locked to scroll (revision pass — replaces the per-set
 *      pour → rest → drain, which read as four separate in/stick/out bits with dead stops between
 *      items, user-flagged). Every bead rides DOWN the strands at ONE constant path speed (a full
 *      helix length per capability dwell): set s's beads are timed so they sit spread over the
 *      whole helix exactly at the MIDDLE of dwell s, so as the reader moves toward the next item
 *      the outgoing set is already flowing off the bottom while the next pours in off the top — no
 *      gap, no held rest, one unbroken stream. Stop scrolling anywhere and a full spread of icons
 *      is parked on the helix (motion is purely scroll-derived). The edge cases keep their drama
 *      for free: set 0's beads enter top-first to FILL the empty helix, and the last set rides off
 *      the bottom as its exit. Every bead's position is a PURE function of the master progress, so
 *      scrubbing up runs the stream in reverse and a frame is always correct.
 *   3. EXIT — the whole helix (skeleton + any in-flight icons) fades fully out over DNA_EXIT as the
 *      thesis bridge opens; after it the canvas draws nothing and the nodes are hidden.
 *
 * Each bead is its OWN permanently-dressed DOM node (~50 small imgs, one per rung-end per set) —
 * the old shared re-dressed pool is gone: with sets flowing (and adjacent sets coexisting during a
 * hand-off), swapping srcs mid-flight would visibly flip logos; permanent dressing makes every frame
 * trivially idempotent. Logos keep their TRUE brand colour (content, not chrome); depth is one
 * smooth grow-and-reveal — the far side is a small clean dot that enlarges as it rounds to the
 * front, the logo fading in across a wide window while it grows.
 *
 * ALL per-frame work is compositor-only: one canvas repaint plus transform/opacity on the logo DOM
 * nodes — no React re-render; scroll progress is read via `.get()` inside the rAF, never subscribed.
 * Reduced motion renders one static pose: skeleton fully inked + set 0 spread over the helix.
 */

/* ── The icon SETS — one per capability domain (src/data/capabilities.ts) ─────────────────────────
 * Every rung-end of every set gets its own permanent node; BASE[s] is set s's first node index in
 * that flat list (node order: sets in order, rungs in order, [strand +1, strand −1] per rung). */
const SETS = capabilities.map((c) => c.rungs);
const SET_COUNT = SETS.map((rungs) => rungs.length);
const NSETS = SETS.length;
const BASE: number[] = [];
{
  let acc = 0;
  for (let s = 0; s < NSETS; s++) {
    BASE.push(acc);
    acc += SET_COUNT[s] * 2;
  }
}
const FLAT_NODES = SETS.flatMap((rungs) => rungs.flatMap((rung) => [rung[0], rung[1]]));

/* ── Geometry — a NARROW, TALL helix so the two strands read as a twisting ribbon ─────────────── */
const TURNS = 2;
const ANGLE_TOTAL = 2 * Math.PI * TURNS;
const PHASE0 = Math.PI / 2; // resting pose: strands start broadside (widest) at the top
const RADIUS_RATIO = 0.22;
const RADIUS_MAX = 140; // revision pass: a touch more presence now the rail sits inward off the gutter
const PAD_Y_RATIO = 0.06;
const BACKBONE_STEPS = 90;

/* ── Skeleton draw-on ─────────────────────────────────────────────────────────────────────────── */
const SKELETON_DELAY_MS = 900;
const DRAW_MS = 1700;

/* ── Motion — a subtle scroll-linked twist ONLY across the capability flow (not the whole page).
   When scroll stops, rotation stops — no idle spin. Kept small so beads read as flowing down the
   strands, not orbiting in place. ── */
const ROT_FLOW = Math.PI / 3; // ~60° across the full four-dwell flow

/* ── Chrome register — a global alpha demotion on the strands + rungs so the skeleton reads as
   supporting atmosphere behind the left-column content, never a co-star. ──────────────────────── */
const CHROME_ALPHA = 0.75;

/* ── THE CONVEYOR (the flow's whole mechanic) ─────────────────────────────────────────────────────
 * Every bead rides down the path at ONE constant speed: a full helix length per DNA_FLOW window
 * (= per capability dwell). Bead (s, k)'s position is just (p − mid_s) / width_s + seat_k — at the
 * MIDDLE of dwell s the set sits exactly on its padded spread (the composed "every icon visible"
 * frame lands precisely when its capability line is lit), and on either side of that moment the
 * beads are simply earlier/later along the same unbroken ride. Consecutive sets overlap naturally:
 * while set s's top beads are still riding off the bottom, set s+1's bottom beads are already
 * pouring in off the top — one continuous stream across all four domains, no per-set stop/start.
 * (The old pour → held-rest → drain phases and their stagger are deleted — they were the four
 * separate "bits" the user rejected.) */
/* Beads soften in/out over this fraction of the path at the helix's ends, so they materialise just
   inside the ribbon instead of popping at the edge. */
const PATH_EDGE = 0.09;
/* The mid-dwell spread's inset from the path ends — strictly > PATH_EDGE so a parked spread's end
   beads sit at full ink, clear of the fade zones. */
const SPREAD_PAD = 0.11;

/* ── Depth → look ─────────────────────────────────────────────────────────────────────────────── */
// z = cos(angle) ∈ [-1 (back), +1 (front)]; d = (z+1)/2 ∈ [0,1].
const SCALE_FRONT = 1;
const OPACITY_BACK = 0.35; // far-side dots present but quiet
const OPACITY_FRONT = 1;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// Hermite smoothstep — a soft 0→1 ramp across [e0, e1], flat-tangent at both ends.
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/* ── Depth = one smooth GROW-AND-REVEAL ───────────────────────────────────────────────────────────
 * Every node is ALWAYS the same warm paper disc (the CSS chip — background/ring/shadow are static,
 * never repainted): on the far side it's a small clean dot, and as it rounds toward the front it
 * SMOOTHLY ENLARGES, the logo fading in across a WIDE depth window while it grows. */
const SCALE_DOT = 0.34;
const GROW_START = 0.15;
const GROW_END = 0.9;
const LOGO_IN_START = 0.45;
const LOGO_IN_END = 0.8;

/** Rung k's mid-dwell SEAT on the path (0 = top, 1 = bottom) for a set of n rungs: the padded even
 *  spread, rung 0 at the bottom (it leads the ride), rung n−1 at the top. */
const rungSeat = (k: number, n: number): number => {
  if (n === 1) return 0.5;
  const fr = k / (n - 1);
  return SPREAD_PAD + (1 - fr) * (1 - 2 * SPREAD_PAD);
};

/** THE CONVEYOR: bead (s, k)'s path position at master progress p (outside [0,1] = off the helix).
 *  Constant speed — one full path per flow-window width — anchored so the set sits on its spread
 *  exactly at its window's middle. Pure in p — idempotent + direction-safe. */
const conveyorPos = (p: number, s: number, k: number, n: number): number => {
  const [F0, F1] = DNA_FLOW[s];
  return (p - (F0 + F1) / 2) / (F1 - F0) + rungSeat(k, n);
};

export function TechDNA({ progress }: { progress: MotionValue<number> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const { foregroundIn } = useIntro();
  const reduce = useReducedMotion() ?? false;

  // The skeleton draw-on fires SKELETON_DELAY_MS after the foreground gate opens. A ref carries the
  // "go" signal into the rAF loop without re-subscribing it. `foregroundIn` never flips back.
  const skeletonGoRef = useRef(false);

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

    // Place ONE bead (flat node index `idx`, strand dir) at path-fraction g, with rotation phase t
    // and opacity multiplier `mul` (the flow's edge envelope × the helix presence).
    const placeNode = (idx: number, dir: 1 | -1, g: number, t: number, mul: number) => {
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
      const scale = lerp(SCALE_DOT, SCALE_FRONT, smoothstep(GROW_START, GROW_END, d));
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      el.style.opacity = (lerp(OPACITY_BACK, OPACITY_FRONT, d) * clamp01(mul)).toFixed(3);
      el.style.zIndex = String(Math.round(d * 100));
      // The logo keeps its TRUE colour (content, not chrome); no element filter.
      const img = imgRefs.current[idx];
      if (img) img.style.opacity = smoothstep(LOGO_IN_START, LOGO_IN_END, d).toFixed(3);
    };

    // Zero ONE bead's opacity (position left stale — it's invisible).
    const hideNode = (idx: number) => {
      const el = nodeRefs.current[idx];
      if (el) el.style.opacity = "0";
    };

    // Paint the skeleton (backbones + rungs) for draw progress dp ∈ [0,1] (top→bottom), rotation t,
    // and presence (the global stroke-alpha multiplier — 1 through the persona chapter, fading to 0
    // over DNA_EXIT). CHROME_ALPHA demotes the whole register. The rung count for the chrome uses
    // the largest set so the skeleton reads consistently dense across every domain.
    const RUNG_LINES = Math.max(...SET_COUNT);
    const drawSkeleton = (dp: number, t: number, presence: number) => {
      const cx = W / 2;
      const padY = H * PAD_Y_RATIO;
      const span = H - padY * 2;
      const R = Math.min(W * RADIUS_RATIO, RADIUS_MAX);

      ctx.clearRect(0, 0, W, H);
      // BUTT caps, not round: round caps at semi-transparent alpha double-paint at every shared
      // segment joint — a beading of darker dots down the strand. Butt caps tile exactly.
      ctx.lineCap = "butt";

      const alpha = presence * CHROME_ALPHA;

      // ── Backbones: two continuous sine curves, 180° apart, segment-by-segment so each segment
      //    carries its own depth (near side brighter + thicker). Drawn top→bottom up to dp.
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
          const d = (dir * (Math.cos(a0) + Math.cos(a1)) * 0.5 + 1) / 2;
          ctx.strokeStyle = `rgba(201, 84, 46, ${((0.1 + 0.4 * d) * alpha).toFixed(3)})`;
          ctx.lineWidth = 1.1 + 1.5 * d;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }

      // ── Base-pair rungs: hairline between the strands, foreshortening as the pair turns edge-on.
      for (let k = 0; k < RUNG_LINES; k++) {
        const f = RUNG_LINES === 1 ? 0.5 : k / (RUNG_LINES - 1);
        if (f > dp) continue; // draw-on
        const a = PHASE0 + f * ANGLE_TOTAL + t;
        const sinA = Math.sin(a);
        const y = padY + f * span;
        const facing = Math.abs(sinA);
        ctx.strokeStyle = `rgba(201, 84, 46, ${((0.14 + 0.2 * facing) * alpha).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(cx + R * sinA, y);
        ctx.lineTo(cx - R * sinA, y);
        ctx.stroke();
      }
    };

    // Reduced-motion / static pose: skeleton fully inked, SET 0 spread over the helix, no spin.
    const drawStatic = () => {
      drawSkeleton(1, 0, 1);
      for (let s = 0; s < NSETS; s++) {
        const n = SET_COUNT[s];
        for (let k = 0; k < n; k++) {
          const idx = BASE[s] + k * 2;
          if (s !== 0) {
            hideNode(idx);
            hideNode(idx + 1);
            continue;
          }
          // The same padded spread the conveyor parks on at mid-dwell.
          const g = rungSeat(k, n);
          placeNode(idx, 1, g, 0, 1);
          placeNode(idx + 1, -1, g, 0, 1);
        }
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    if (reduce) {
      drawStatic();
      return () => ro.disconnect();
    }

    // Pause per-frame work while well off-screen — the clock is time-based, so it resumes
    // seamlessly.
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), {
      rootMargin: "40% 0px 40% 0px",
    });
    io.observe(root);

    const FLOW = DNA_FLOW;
    const [FLOW_START] = FLOW[0];
    const FLOW_END = FLOW[NSETS - 1][1];
    const [IN0, IN1] = DNA_IN;
    const [EXIT0, EXIT1] = DNA_EXIT;

    let raf = 0;
    let drawStart: number | null = null;

    const frame = (now: number) => {
      if (skeletonGoRef.current && drawStart === null) drawStart = now;

      if (onScreen && drawStart !== null) {
        const dp = clamp01((now - drawStart) / DRAW_MS);
        const p = progress.get();

        const flowSpan = FLOW_END - FLOW_START;
        const flowT = flowSpan > 0 ? clamp01((p - FLOW_START) / flowSpan) : 0;
        const t = flowT * ROT_FLOW;

        const presence =
          smoothstep(IN0, IN1, p) *
          (p <= EXIT0 ? 1 : p >= EXIT1 ? 0 : lerp(1, 0, (p - EXIT0) / (EXIT1 - EXIT0)));
        drawSkeleton(dp, t, presence);

        const inFlow =
          presence > 0 && p >= FLOW_START - 0.04 && p <= FLOW_END + 0.06;

        if (!inFlow) {
          for (let i = 0; i < FLAT_NODES.length; i++) hideNode(i);
        } else {
          for (let s = 0; s < NSETS; s++) {
            const n = SET_COUNT[s];
            for (let k = 0; k < n; k++) {
              const g = conveyorPos(p, s, k, n);
              const vis =
                g <= 0 || g >= 1
                  ? 0
                  : smoothstep(0, PATH_EDGE, g) *
                    (1 - smoothstep(1 - PATH_EDGE, 1, g));
              const idx = BASE[s] + k * 2;
              if (vis > 0.01) {
                placeNode(idx, 1, g, t, vis * presence);
                placeNode(idx + 1, -1, g, t, vis * presence);
              } else {
                hideNode(idx);
                hideNode(idx + 1);
              }
            }
          }
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
      {/* One PERMANENT node per rung-end per set (see FLAT_NODES ordering) — no shared pool, no
          re-dressing: a bead is born wearing its logo and only ever moves/fades. All start at
          opacity 0 (the CSS); the rAF flow lights them inside their set's window. */}
      {FLAT_NODES.map((node, i) => (
        <span
          key={i}
          className="tech-dna-v4__node"
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small brand SVG/PNGs, no next/image gain */}
          <img
            src={node.src}
            alt=""
            draggable={false}
            className="tech-dna-v4__logo"
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            // Static per-node padding for square/full-bleed marks. Default 58% stays in the CSS rule.
            style={
              node.pad !== undefined
                ? { width: `${node.pad * 100}%`, height: `${node.pad * 100}%` }
                : undefined
            }
          />
        </span>
      ))}
    </div>
  );
}

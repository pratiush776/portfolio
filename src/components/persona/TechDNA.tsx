"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";

import {
  DNA_DIM,
  DNA_ICONS_IN,
  DNA_ICONS_OUT,
} from "@/components/hero/heroTimeline";
import { useIntro } from "@/components/intro/IntroProvider";

/**
 * The stack as a living double helix — a self-portrait in tools, and now a PERMANENT fixture of the
 * pinned hero stage (HeroSection `.hero-persona-dna-v4`). It is no longer cued in/out with the persona
 * beat; it's present from the very first frame as a bare SKELETON, and the icons FLOW THROUGH it as the
 * beat arrives:
 *
 *   1. SKELETON — the two backbone strands + base-pair rungs (no icons) ink DOWN the column once, top
 *      to bottom, right after the hero name has risen (SKELETON_DELAY_MS after `foregroundIn`). This
 *      draw-on is time-based (DRAW_MS), and once done the bare helix simply stays, rotating slowly.
 *   2. ICONS FLOW — driven by the hero's pinned `progress`: the beads POUR IN at the top and spiral
 *      DOWN the strands to their seats (DNA_ICONS_IN, top rows first — a waterfall), REST as the
 *      resting pose through the persona frame, then DRAIN off the bottom (DNA_ICONS_OUT) — flowing
 *      THROUGH the DNA. A bead's angle/depth/x/y are computed from its CURRENT path fraction, so it
 *      correctly spirals and picks up depth colour/scale as it travels.
 *      CHROMA + DEPTH (review-driven, guidebook §6 / §4 demote-without-removing):
 *        • logos are CONTENT, not chrome — they keep their TRUE brand colour wherever they're
 *          legible (no mono filter; two desaturation schemes failed — see the chroma note below).
 *          The one-accent discipline lives in the CHROME: strands, rungs and discs.
 *        • depth is ONE SMOOTH GROW-AND-REVEAL — every node is always the same paper disc; on the
 *          far side it's a small clean dot, and it smoothly ENLARGES as it rounds to the front,
 *          the logo fading in across a wide window while it grows (no thresholds — thresholds are
 *          what read as dark far dots and "blinking" logos). Identity arrives with size.
 *   3. WATERMARK — after the icons drain, the bare strands DIM (DNA_DIM, presence → DIM_LEVEL) to a
 *      faint living watermark behind the arriving thesis, and ride out with the stage at the unpin.
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

type Node = { name: string; src: string; pad?: number };
type Rung = [Node, Node]; // [strand A, strand B] — the two logos of one base pair

// `pad` = the logo's size as a fraction of the chip (default 0.58 via the CSS .tech-dna-v4__logo
// rule). Square / full-bleed marks (JS, TS, Docker, SQL) read oversized inside the circular chip,
// so they get an explicit smaller fraction; it's written as a static inline size on the img.
const T = (name: string, file: string, pad?: number): Node => ({
  name,
  src: `/tech_logos/${file}`,
  ...(pad !== undefined ? { pad } : {}),
});

// Family-grouped base pairs, top → bottom. Related tools share a rung; families sit on adjacent rungs.
const RUNGS: Rung[] = [
  [T("HTML", "HTML.svg"), T("CSS", "CSS.svg")], // foundations
  [T("Sass", "SASS.svg"), T("Tailwind", "TAILWIND.svg")], // styling
  [T("JavaScript", "JAVASCRIPT.svg", 0.5), T("TypeScript", "TYPESCRIPT.svg", 0.5)], // language
  [T("React", "REACT.svg"), T("Next.js", "NEXTJS.svg")], // frontend
  [T("GSAP", "GSAP.svg"), T("Framer", "Framer.svg")], // animation
  [T("Figma", "FIGMA.svg"), T("GitHub", "GITHUB.svg")], // workspace
  [T("Node.js", "NODE.svg"), T("Express", "EXPRESS.svg")], // JS backend
  [T("Python", "PYTHON.svg"), T("Django", "DJANGO.svg")], // Python backend
  [T("MongoDB", "MONGODB.svg"), T("SQL", "SQL.svg", 0.5)], // databases
  [T("Firebase", "FIREBASE.svg"), T("Docker", "docker.png", 0.5)], // infra / deploy
  [T("ChromaDB", "chroma.png"), T("OpenAI", "OPENAI.svg")], // RAG
  [T("Groq", "GROQ.svg"), T("DeepSeek", "DEEPSEEK.svg")], // AI inference
];

const N = RUNGS.length; // rungs (base pairs) → also logos per strand

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
const IN_SPAN = 1 - (N - 1) * IN_STAGGER; // so the LAST node finishes exactly at DNA_ICONS_IN[1]
const OUT_STAGGER = 0.02; // gentler drain stagger — the column empties top-first, off the bottom
const OUT_SPAN = 1 - (N - 1) * OUT_STAGGER; // so the last node clears exactly at DNA_ICONS_OUT[1]

/* ── Presence dim (the watermark under the thesis) ─────────────────────────────────────────────── */
const DIM_LEVEL = 0.45; // the bare skeleton fades to this stroke-alpha multiplier as the thesis inks in

/* ── Motion ───────────────────────────────────────────────────────────────────────────────────── */
const ROT_SPEED = 0.00045; // radians / ms once alive (~14s per full revolution — slow, premium)

/* ── Depth → look ─────────────────────────────────────────────────────────────────────────────── */
// z = cos(angle) ∈ [-1 (back), +1 (front)]; d = (z+1)/2 ∈ [0,1].
const SCALE_FRONT = 1;
// Back-node presence: the far side is small paper dots — the same chip, grown down — so they get
// enough opacity to read as intentional strand beads, not dust. (No blur, no colour filter: depth
// is scale + opacity only.)
const OPACITY_BACK = 0.55;
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
    // and presence (a global stroke-alpha multiplier for the dim-to-watermark).
    const drawSkeleton = (dp: number, t: number, presence: number) => {
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
      for (let k = 0; k < N; k++) {
        const f = N === 1 ? 0.5 : k / (N - 1);
        if (f > dp) continue; // draw-on
        const a = PHASE0 + f * ANGLE_TOTAL + t;
        const sinA = Math.sin(a);
        const y = padY + f * span;
        const facing = Math.abs(sinA);
        ctx.strokeStyle = `rgba(201, 84, 46, ${((0.14 + 0.2 * facing) * presence).toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(cx + R * sinA, y);
        ctx.lineTo(cx - R * sinA, y);
        ctx.stroke();
      }
    };

    // Reduced-motion / static pose: skeleton fully inked, all icons SEATED at rest, no dim.
    const drawStatic = () => {
      drawSkeleton(1, 0, 1);
      for (let k = 0; k < N; k++) {
        const fRest = N === 1 ? 0.5 : k / (N - 1);
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

    const [IN0, IN1] = DNA_ICONS_IN;
    const [OUT0, OUT1] = DNA_ICONS_OUT;
    const [DIM0, DIM1] = DNA_DIM;

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
        // Idle spin ACCUMULATES once the draw completes — the helix's one piece of self-life.
        if (dp >= 1) rot += dt * ROT_SPEED;
        const t = rot;

        // The bare skeleton always draws (once inked). Presence dims it to a watermark over DNA_DIM.
        const p = progress.get();
        const presence =
          p <= DIM0 ? 1 : p >= DIM1 ? DIM_LEVEL : lerp(1, DIM_LEVEL, (p - DIM0) / (DIM1 - DIM0));
        drawSkeleton(dp, t, presence);

        // Icons flow in/out along the path. Before P0 / after Q1 they're hidden; between, each bead
        // sits at its CURRENT path-fraction g (rest, pouring in from the top, or draining off the base).
        for (let k = 0; k < N; k++) {
          const fRest = N === 1 ? 0.5 : k / (N - 1);
          let g: number;
          let mul: number;
          if (p < IN0) {
            g = fRest;
            mul = 0; // not yet poured in
          } else if (p < IN1) {
            const u = (p - IN0) / (IN1 - IN0);
            const tIn = clamp01((u - k * IN_STAGGER) / IN_SPAN);
            g = lerp(FLOW_TOP, fRest, easeOutCubic(tIn)); // spiral DOWN into the seat
            mul = Math.min(1, tIn * 2.5); // opacity ramps in fast
          } else if (p < OUT0) {
            g = fRest; // SEATED — today's resting pose
            mul = 1;
          } else if (p < OUT1) {
            const uOut = (p - OUT0) / (OUT1 - OUT0);
            const tOut = clamp01((uOut - k * OUT_STAGGER) / OUT_SPAN);
            g = lerp(fRest, FLOW_BOTTOM, easeInCubic(tOut)); // continue DOWN off the base
            mul = clamp01((FLOW_BOTTOM - g) / 0.12); // fade as it nears the bottom
          } else {
            g = fRest;
            mul = 0; // drained away
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
      {RUNGS.map((rung, k) =>
        rung.map((node, s) => (
          <span
            key={node.name}
            className="tech-dna-v4__node"
            ref={(el) => {
              nodeRefs.current[k * 2 + s] = el;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- small brand SVG/PNGs, no next/image gain */}
            <img
              src={node.src}
              alt=""
              draggable={false}
              className="tech-dna-v4__logo"
              ref={(el) => {
                imgRefs.current[k * 2 + s] = el;
              }}
              // Static per-node padding for square/full-bleed marks (FIX 3). Default 58% stays in
              // the CSS rule; padded nodes override to their fraction. Written once, not per frame.
              style={node.pad !== undefined ? { width: `${node.pad * 100}%`, height: `${node.pad * 100}%` } : undefined}
            />
          </span>
        )),
      )}
    </div>
  );
}

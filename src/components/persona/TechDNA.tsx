"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The persona beat's right-hand graphic: the stack as a living double helix — a self-portrait in tools.
 * It lives INSIDE the pinned hero stage (HeroSection `.hero-persona-dna-v4`), so its cue comes from the
 * hero's beat sheet, not from viewport intersection: the parent flips `play` as the persona beat
 * begins (heroTimeline PERSONA_IN) and scrub-reveals the layer around it.
 *
 * WHAT MAKES IT READ AS DNA: two CONTINUOUS sine-wave backbone strands (drawn on a canvas), 180° out of
 * phase, winding down a NARROW, TALL column so they visibly cross over each other. Each logo is a node
 * that RIDES its strand; base-pair rungs (hairlines) connect the two at each step. It performs in two
 * acts:
 *   1. DRAW-ON — the two strands + their logos ink DOWN the column together, top to bottom
 *      (connect-the-dots), triggered by `play`. Rotation is held still here.
 *   2. ALIVE   — once drawn, the whole helix rotates slowly about its vertical axis. Depth (cos of each
 *      node's helix angle) drives scale / opacity / blur / z-index AND colour: a logo blooms into its
 *      true brand colour as it turns to the FRONT and settles back into warm mono as it turns away, and
 *      the backbone brightens/thickens on its near side. Colour + weight literally follow the rotation.
 *
 * Per-frame work is one canvas repaint (backbones + rungs) plus transform/opacity/filter on the logo
 * DOM nodes — no React re-render. Reduced motion renders one static, fully-drawn, warm-mono pose.
 *
 * Logos are grouped by family and kept adjacent along the helix (each rung pairs two related tools).
 */

type Node = { name: string; src: string };
type Rung = [Node, Node]; // [strand A, strand B] — the two logos of one base pair

const T = (name: string, file: string): Node => ({ name, src: `/tech_logos/${file}` });

// Family-grouped base pairs, top → bottom. Related tools share a rung; families sit on adjacent rungs.
const RUNGS: Rung[] = [
  [T("HTML", "HTML.svg"), T("CSS", "CSS.svg")], // foundations
  [T("Sass", "SASS.svg"), T("Tailwind", "TAILWIND.svg")], // styling
  [T("JavaScript", "JAVASCRIPT.svg"), T("TypeScript", "TYPESCRIPT.svg")], // language
  [T("React", "REACT.svg"), T("Next.js", "NEXTJS.svg")], // frontend
  [T("GSAP", "GSAP.svg"), T("Framer", "Framer.svg")], // animation
  [T("Figma", "FIGMA.svg"), T("GitHub", "GITHUB.svg")], // workspace
  [T("Node.js", "NODE.svg"), T("Express", "EXPRESS.svg")], // JS backend
  [T("Python", "PYTHON.svg"), T("Django", "DJANGO.svg")], // Python backend
  [T("MongoDB", "MONGODB.svg"), T("SQL", "SQL.svg")], // databases
  [T("Firebase", "FIREBASE.svg"), T("Docker", "docker.png")], // infra / deploy
  [T("ChromaDB", "chroma.png"), T("OpenAI", "OPENAI.svg")], // RAG
  [T("Groq", "GROQ.svg"), T("DeepSeek", "DEEPSEEK.svg")], // AI inference
];

const N = RUNGS.length; // rungs (base pairs) → also logos per strand

/* ── Geometry — a NARROW, TALL helix so the two strands read as a twisting ribbon, not wide bars ── */
const TURNS = 2; // full twists over the column height (adjacent logos ~65° apart → they ride the wave)
const ANGLE_TOTAL = 2 * Math.PI * TURNS;
const PHASE0 = Math.PI / 2; // resting pose: strands start broadside (widest) at the top
const RADIUS_RATIO = 0.22; // strand half-spread as a fraction of column width…
const RADIUS_MAX = 112; // …capped so the helix stays narrow on wide columns (px)
const PAD_Y_RATIO = 0.06; // vertical inset top & bottom, as a fraction of column height
const BACKBONE_STEPS = 90; // sample segments per strand for a smooth backbone curve

/* ── Motion ───────────────────────────────────────────────────────────────────────────────────── */
const ROT_SPEED = 0.00045; // radians / ms once alive (~14s per full revolution — slow, premium)
const DRAW_MS = 1700; // draw-on time once in view (rotation held still until it finishes)
const REVEAL_FRAC = 0.14; // fraction of the draw window each logo takes to pop in

/* ── Depth → look ─────────────────────────────────────────────────────────────────────────────── */
// z = cos(angle) ∈ [-1 (back), +1 (front)]; d = (z+1)/2 ∈ [0,1].
const SCALE_BACK = 0.55;
const SCALE_FRONT = 1;
const OPACITY_BACK = 0.3;
const OPACITY_FRONT = 1;
const BLUR_BACK = 1.4; // px on the farthest nodes
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Warm-mono → brand-colour filter, driven by front-ness c ∈ [0,1] (1 = full colour at the front). The
// colour only blooms near the very front (c^2.2 — a tighter bloom than before, so at any moment only
// the two or three nodes actually facing the viewer carry colour and the rest of the helix stays in
// the page's warm ink; restraint over sticker-bomb).
function filterFor(c: number): string {
  const m = 1 - Math.pow(clamp01(c), 2.2); // "mono-ness"
  return `grayscale(${m.toFixed(3)}) sepia(${(0.45 * m).toFixed(3)}) hue-rotate(${(-14 * m).toFixed(1)}deg) saturate(${(1 + 0.35 * m).toFixed(3)}) brightness(${(1 - 0.24 * m).toFixed(3)})`;
}

export function TechDNA({ play }: { play: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion() ?? false;

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
      if (reduce) place(1, 0); // keep the static pose fitted on resize
    };

    // Draw the whole helix for a given draw progress (dp ∈ [0,1], top→bottom) and rotation phase (t).
    const place = (dp: number, t: number) => {
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
          ctx.strokeStyle = `rgba(201, 84, 46, ${(0.1 + 0.36 * d).toFixed(3)})`;
          ctx.lineWidth = 1.1 + 1.5 * d;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }

      // ── Rungs + logo nodes
      for (let k = 0; k < N; k++) {
        const f = N === 1 ? 0.5 : k / (N - 1);
        const drawn = f <= dp;
        const a = PHASE0 + f * ANGLE_TOTAL + t;
        const sinA = Math.sin(a);
        const cosA = Math.cos(a);
        const y = padY + f * span;

        // Base-pair rung: hairline between the two strands, faint, foreshortening as the pair turns edge-on.
        if (drawn) {
          const facing = Math.abs(sinA);
          ctx.strokeStyle = `rgba(201, 84, 46, ${(0.05 + 0.13 * facing).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx + R * sinA, y);
          ctx.lineTo(cx - R * sinA, y);
          ctx.stroke();
        }

        const nodeDraw = clamp01((dp - f) / REVEAL_FRAC);
        for (let strand = 0; strand < 2; strand++) {
          const dir = strand === 0 ? 1 : -1;
          const x = cx + dir * R * sinA;
          const d = (dir * cosA + 1) / 2;
          const el = nodeRefs.current[k * 2 + strand];
          if (!el) continue;
          const scale = lerp(SCALE_BACK, SCALE_FRONT, d) * lerp(0.5, 1, nodeDraw);
          el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
          el.style.opacity = (lerp(OPACITY_BACK, OPACITY_FRONT, d) * nodeDraw).toFixed(3);
          el.style.zIndex = String(Math.round(d * 100));
          el.style.filter = `${filterFor(d)} blur(${(BLUR_BACK * (1 - d)).toFixed(2)}px)`;
        }
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    if (reduce) {
      place(1, 0); // static, fully-drawn, warm-mono pose
      return () => ro.disconnect();
    }

    // Pause per-frame work while well off-screen — the clock is time-based, so it resumes seamlessly.
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), {
      rootMargin: "40% 0px 40% 0px",
    });
    io.observe(root);

    let raf = 0;
    let drawStart: number | null = null; // set when the parent cues the beat (play)

    const frame = (now: number) => {
      if (play && drawStart === null) drawStart = now;
      if (onScreen && drawStart !== null) {
        const dp = clamp01((now - drawStart) / DRAW_MS);
        // Rotation is held still until the draw-on finishes, then the helix comes alive.
        const rot = Math.max(0, now - (drawStart + DRAW_MS)) * ROT_SPEED;
        place(dp, rot);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce, play]);

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
            <img src={node.src} alt="" draggable={false} className="tech-dna-v4__logo" />
          </span>
        )),
      )}
    </div>
  );
}

"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { registerCloudDeck } from "@/components/landing/cloud-bridge";

// Imperative handle the scroll choreography drives. Unchanged contract — the
// choreography (PortraitScrollChoreography) and cloud-bridge still push these
// four scroll-derived signals. Only the RENDERER changed: from a stack of 14
// oversized GPU DOM layers (each scaled per-frame past the GPU texture/layer-
// memory budget, which the compositor then re-tiled mid-scrub → rectangular-band
// FLICKER) to a SINGLE 2D <canvas> we draw the sprites into ourselves. One
// composited layer, no tiling, no re-raster banding, and far less GPU cost.
export type CloudDeckHandle = {
  // Radial parting front: 0 → no parting (cover intact), 1 → fully parted.
  setProgress: (p: number) => void;
  // Overall cloud amount/opacity: 0 → no clouds, 1 → dense.
  setCoverage: (c: number) => void;
  // Continuous, monotonic scroll-driven flow (0 → 1+): drives the per-sprite
  // parallax scale/stream so the clouds rush past the camera as you fly forward.
  setFlow: (f: number) => void;
  // Parting origin in viewport CSS px (top-left). Clouds clear from here out.
  setCenter: (cssX: number, cssY: number) => void;
};

type CloudDeckProps = {
  className?: string;
};

// One parallax cloud sprite, back (depth 0) → front (depth 1). Each is a CC0
// cloud PNG (public/images/clouds, warm tint baked into the asset) drawn into the
// shared canvas at its own footprint/position/depth, scattered so the puffs read
// as a cloud field with real sky GAPS — never an opaque white fill. `depth`
// scales the fly-through parallax; front sprites scale up + stream faster so you
// appear to dive INTO the bank. Overlapping semi-transparent sprites accumulate
// alpha, so overlaps build real density/volume rather than muddy flat patches.
type LayerCfg = {
  src: string;
  depth: number; // 0 far … 1 near — parallax + dolly strength
  size: number; // footprint as % of the longer viewport side
  posX: number; // sprite-centre X as % of viewport width
  posY: number; // sprite-centre Y as % of viewport height
  opacity: number; // base per-sprite opacity (depth cue)
  driftSpeed: number; // ambient drift angular speed (rad/s)
  dir: 1 | -1; // ambient drift direction (variety)
  phase: number; // ambient drift phase offset
};

// 7 overlapping puffs (5 unique sprites, some reused at a different scale/spot)
// spread across the WHOLE frame — including the centre — at varied depths.
const LAYERS: LayerCfg[] = [
  { src: "cloud-1.png", depth: 0.0, size: 95, posX: 50, posY: 32, opacity: 0.5, driftSpeed: 0.108, dir: 1, phase: 0.0 },
  { src: "cloud-3.png", depth: 0.18, size: 72, posX: 22, posY: 52, opacity: 0.55, driftSpeed: 0.126, dir: -1, phase: 0.9 },
  { src: "cloud-2.png", depth: 0.36, size: 76, posX: 76, posY: 44, opacity: 0.6, driftSpeed: 0.143, dir: 1, phase: 1.8 },
  { src: "cloud-4.png", depth: 0.54, size: 82, posX: 46, posY: 60, opacity: 0.64, driftSpeed: 0.165, dir: -1, phase: 2.7 },
  { src: "cloud-5.png", depth: 0.72, size: 66, posX: 84, posY: 68, opacity: 0.68, driftSpeed: 0.190, dir: 1, phase: 3.6 },
  { src: "cloud-3.png", depth: 0.88, size: 90, posX: 60, posY: 48, opacity: 0.72, driftSpeed: 0.217, dir: -1, phase: 4.5 },
  { src: "cloud-1.png", depth: 1.0, size: 74, posX: 34, posY: 74, opacity: 0.78, driftSpeed: 0.242, dir: 1, phase: 5.4 },
];

// Ambient drift amplitude as a fraction of the viewport (kept tiny — the clouds
// breathe, they don't slide).
const DRIFT_AMP = 0.016;
// Cap the backing-store DPR. Clouds are soft, so 1.5 is indistinguishable from
// full retina but roughly halves the per-frame fill cost / texture memory.
const MAX_DPR = 1.5;
// Above this coverage the deck is "active" and runs a continuous rAF (so the
// ambient drift is smooth between scroll events). At/below it we only draw
// on-demand when the bridge setters fire — so the faint hero "peek" never sits a
// perpetual animation loop on the idle landing page.
const ACTIVE_COVERAGE = 0.25;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const CloudDeck = forwardRef<CloudDeckHandle, CloudDeckProps>(
  function CloudDeck({ className }, ref) {
    const [enabled, setEnabled] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Latest scroll-driven values, kept out of React state (the scrubbed scroll
    // must never re-render us). Center defaults to upper-centre until the
    // choreography tracks the portrait.
    const sRef = useRef({ coverage: 0, progress: 0, flow: 0, cx: 0, cy: 0 });

    // The live setters are swapped in once mounted; before that they just stash
    // the value so nothing is lost on early calls.
    const apiRef = useRef<CloudDeckHandle>({
      setProgress: (p) => {
        sRef.current.progress = p;
      },
      setCoverage: (c) => {
        sRef.current.coverage = c;
      },
      setFlow: (f) => {
        sRef.current.flow = f;
      },
      setCenter: (x, y) => {
        sRef.current.cx = x;
        sRef.current.cy = y;
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        setProgress: (p) => apiRef.current.setProgress(p),
        setCoverage: (c) => apiRef.current.setCoverage(c),
        setFlow: (f) => apiRef.current.setFlow(f),
        setCenter: (x, y) => apiRef.current.setCenter(x, y),
      }),
      [],
    );

    // Desktop / cursor devices only, honor reduced motion — same gate as the hero
    // FluidSmoke so they appear/disappear together.
    useEffect(() => {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const cursor = window.matchMedia("(hover: hover) and (pointer: fine)");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const compute = () => setEnabled(cursor.matches && !reduced.matches);
      compute();
      cursor.addEventListener("change", compute);
      reduced.addEventListener("change", compute);
      return () => {
        cursor.removeEventListener("change", compute);
        reduced.removeEventListener("change", compute);
      };
    }, []);

    useEffect(() => {
      if (!enabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Default the parting origin to upper-centre before the first setCenter.
      if (sRef.current.cx === 0 && sRef.current.cy === 0) {
        sRef.current.cx = window.innerWidth / 2;
        sRef.current.cy = window.innerHeight * 0.42;
      }
      // Stable handle to the data ref for use in the cleanup (it never changes
      // identity; capturing it satisfies the hooks lint).
      const s = sRef.current;

      // Preload the sprites once. drawImage skips any not-yet-loaded image, so a
      // late-arriving cloud simply appears on the next frame.
      const images = LAYERS.map((L) => {
        const img = new Image();
        img.src = `/images/clouds/${L.src}`;
        return img;
      });

      let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;
      };
      resize();

      const start = performance.now();
      let visible = false;

      // ── One full canvas repaint. Three scroll signals combine per sprite:
      //  • flow     → forward dolly (front sprites stream down + scale up faster)
      //  • progress → each puff DISPERSES outward from the portrait + fades, so the
      //               centre clears first (reads as a radial part)
      //  • coverage → master alpha (thickens on approach, holds, dissolves on exit)
      // Plus a tiny time-based ambient drift so the bank breathes.
      const draw = () => {
        const { coverage, progress: p, flow: f, cx, cy } = sRef.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);
        if (coverage < 0.01) return;

        const maxSide = Math.max(vw, vh);
        const part = p * p; // ease-in onset
        const t = (performance.now() - start) / 1000;

        for (let i = 0; i < LAYERS.length; i++) {
          const L = LAYERS[i];
          const img = images[i];
          if (!img.complete || img.naturalWidth === 0) continue;

          const d = L.depth;
          // Fade out as it disperses so the parted view is clean; nearer (front)
          // layers clear a touch sooner.
          const fade = smoothstep(0.32 + (1 - d) * 0.16, 0.95, p);
          const alpha = L.opacity * coverage * (1 - fade);
          if (alpha <= 0.002) continue;

          const sx = (L.posX / 100) * vw;
          const sy = (L.posY / 100) * vh;
          // direction from the portrait centre to this puff's screen position
          let nx = sx - cx;
          let ny = sy - cy;
          const len = Math.hypot(nx, ny) || 1;
          nx /= len;
          ny /= len;

          const disperse = part * (0.45 + d * 0.55) * maxSide;
          const flowY = f * (0.05 + d * 0.4) * vh;
          const driftX =
            Math.sin(t * L.driftSpeed + L.phase) * DRIFT_AMP * vw * L.dir;
          const driftY =
            Math.cos(t * L.driftSpeed * 0.8 + L.phase) *
            DRIFT_AMP *
            0.5 *
            vh *
            L.dir;

          const scale = (1 + f * (0.25 + d * 1.15)) * (1 + part * 0.6);
          const footprint = (L.size / 100) * maxSide * scale;

          const drawX = sx + nx * disperse + driftX;
          const drawY = sy + ny * disperse + flowY + driftY;

          ctx.globalAlpha = alpha;
          ctx.drawImage(
            img,
            drawX - footprint / 2,
            drawY - footprint / 2,
            footprint,
            footprint,
          );
        }
        ctx.globalAlpha = 1;
      };

      // Drive the canvas. While the deck is prominent (coverage > ACTIVE) a
      // continuous rAF keeps the ambient drift smooth; otherwise we only draw a
      // single coalesced frame when the bridge setters fire (no idle loop).
      let loopRaf = 0;
      let onceRaf = 0;

      const setVisible = (v: boolean) => {
        if (v === visible) return;
        visible = v;
        canvas.style.display = v ? "block" : "none";
      };

      const loop = () => {
        draw();
        if (sRef.current.coverage > ACTIVE_COVERAGE) {
          loopRaf = requestAnimationFrame(loop);
        } else {
          loopRaf = 0;
        }
      };

      const schedule = () => {
        const cov = sRef.current.coverage;
        setVisible(cov >= 0.01);
        if (cov > ACTIVE_COVERAGE) {
          if (!loopRaf) loopRaf = requestAnimationFrame(loop);
          return;
        }
        // Low coverage: one coalesced draw on the next frame.
        if (onceRaf) return;
        onceRaf = requestAnimationFrame(() => {
          onceRaf = 0;
          draw();
        });
      };

      const onResize = () => {
        resize();
        schedule();
      };
      window.addEventListener("resize", onResize);

      apiRef.current = {
        setFlow: (f) => {
          sRef.current.flow = f;
          schedule();
        },
        setCoverage: (c) => {
          sRef.current.coverage = c;
          schedule();
        },
        setProgress: (p) => {
          sRef.current.progress = p;
          schedule();
        },
        setCenter: (x, y) => {
          sRef.current.cx = x;
          sRef.current.cy = y;
          schedule();
        },
      };
      registerCloudDeck(apiRef.current);

      // Reflect whatever the choreography already pushed before we mounted.
      schedule();

      return () => {
        registerCloudDeck(null);
        if (loopRaf) cancelAnimationFrame(loopRaf);
        if (onceRaf) cancelAnimationFrame(onceRaf);
        window.removeEventListener("resize", onResize);
        apiRef.current = {
          setProgress: (p) => {
            s.progress = p;
          },
          setCoverage: (c) => {
            s.coverage = c;
          },
          setFlow: (f) => {
            s.flow = f;
          },
          setCenter: (x, y) => {
            s.cx = x;
            s.cy = y;
          },
        };
      };
    }, [enabled]);

    if (!enabled) return null;

    return <canvas ref={canvasRef} className={className} aria-hidden />;
  },
);

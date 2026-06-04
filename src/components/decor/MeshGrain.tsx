'use client';

import { useEffect, useId, useRef, useState } from 'react';

type MeshGrainProps = {
  /** Selects which pastel mesh to paint. */
  variant?: 'lilac' | 'twilight';
  /** Overrides `--grain-opacity` inline (default contract value is 0.18). */
  grainOpacity?: number;
  /** Slowly drift the mesh. Disabled automatically on touch / reduced-motion. */
  animated?: boolean;
  /** Render the soft radial vignette layer. */
  vignette?: boolean;
  /** Extra classes for the root container. */
  className?: string;
};

// Vignette edge color per variant: a deeper periwinkle for twilight, a soft
// warm edge for lilac. Center is always transparent so sections read through.
const VIGNETTE = {
  lilac: 'rgba(157, 130, 122, 0.18)', // warm taupe, derived from blush
  // Lighter lavender edge (was the deep #6F6CB0, which read too dark/purple).
  twilight: 'color-mix(in srgb, var(--v3-sky-edge) 55%, transparent)',
} as const;

export function MeshGrain({
  variant = 'lilac',
  grainOpacity,
  animated = true,
  vignette = true,
  className,
}: MeshGrainProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Unique, CSS-safe token so the injected keyframes/class never collide
  // across multiple mounted instances.
  const rawId = useId();
  const uid = `mg${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Desktop + motion gating. Mirrors FluidSmoke's matchMedia approach, but we
  // degrade to a *static* mesh rather than rendering nothing.
  const [allowMotion, setAllowMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const cursor = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compute = () => setAllowMotion(cursor.matches && !reduced.matches);
    compute();
    cursor.addEventListener('change', compute);
    reduced.addEventListener('change', compute);
    return () => {
      cursor.removeEventListener('change', compute);
      reduced.removeEventListener('change', compute);
    };
  }, []);

  const motionOn = animated && allowMotion;

  // Pause the CSS animation when offscreen or the tab is hidden, via
  // animation-play-state. Same lifecycle discipline as FluidSmoke's rAF loop.
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!motionOn) return;
    if (typeof window === 'undefined') return;
    const el = rootRef.current;
    if (!el) return;

    let hidden = document.hidden;
    let offscreen = false;
    const sync = () => setPlaying(!hidden && !offscreen);

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener('visibilitychange', onVis);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) offscreen = !entry.isIntersecting;
        sync();
      },
      { rootMargin: '120px' },
    );
    io.observe(el);
    sync();

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, [motionOn]);

  const meshClass =
    variant === 'twilight' ? 'mesh-grad mesh-grad--twilight' : 'mesh-grad';

  const playState = motionOn && playing ? 'running' : 'paused';

  return (
    <div
      ref={rootRef}
      className={className}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        isolation: 'isolate',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {motionOn ? (
        <style>{`
          @keyframes ${uid}-drift {
            0%   { transform: translateZ(0) translate3d(0, 0, 0) scale(1.08); }
            25%  { transform: translateZ(0) translate3d(-1.5%, 1%, 0) scale(1.12); }
            50%  { transform: translateZ(0) translate3d(1%, -1.5%, 0) scale(1.1); }
            75%  { transform: translateZ(0) translate3d(1.5%, 1.5%, 0) scale(1.13); }
            100% { transform: translateZ(0) translate3d(0, 0, 0) scale(1.08); }
          }
          .${uid}-mesh {
            animation: ${uid}-drift 32s ease-in-out infinite;
            animation-play-state: ${playState};
            will-change: transform;
          }
        `}</style>
      ) : null}

      {/* (a) Mesh gradient layer. Overscaled so the drift never reveals edges. */}
      <div
        className={`${meshClass}${motionOn ? ` ${uid}-mesh` : ''}`}
        style={{
          position: 'absolute',
          inset: 0,
          // Static (or motion-base) overscale keeps drift edge-safe and gives
          // a touch of depth even when paused.
          transform: motionOn ? undefined : 'scale(1.08) translateZ(0)',
          backgroundSize: 'cover',
        }}
      />

      {/* (b) Film grain layer — reuses the global contract class. */}
      <div
        className="grain-overlay"
        style={
          grainOpacity != null
            ? ({ '--grain-opacity': String(grainOpacity) } as React.CSSProperties)
            : undefined
        }
      />

      {/* (c) Soft radial vignette: transparent center → subtle edge darken. */}
      {vignette ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 120% at 50% 45%, transparent 55%, ${VIGNETTE[variant]} 100%)`,
            mixBlendMode: 'multiply',
          }}
        />
      ) : null}
    </div>
  );
}

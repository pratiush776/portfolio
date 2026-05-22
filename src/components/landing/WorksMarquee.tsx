"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
  useTransform,
  useAnimationFrame,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { pierSans } from "@/lib/fonts";
import { projects, type Project } from "../../../data/projects";

const CARD_GAP_PX = 24;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function useHasFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const listener = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return fine;
}

type ProjectCardProps = {
  project: Project;
  canHoverPlay: boolean;
};

function ProjectCard({ project, canHoverPlay }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hero = project.hero;

  const handleEnter = () => {
    if (!canHoverPlay || !videoRef.current) return;
    try {
      videoRef.current.currentTime = 0;
      const p = videoRef.current.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {}
  };
  const handleLeave = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } catch {}
  };

  return (
    <Link
      href={`/works/${project.slug}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className="group block w-[75vw] shrink-0 sm:w-[300px]"
      aria-label={`${project.title} case study`}
    >
      <article className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-navy border-r-[4px] border-b-[4px] bg-beige transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative h-[70%] w-full overflow-hidden bg-navy/5">
          {hero?.kind === "video" ? (
            <video
              ref={videoRef}
              src={hero.src}
              poster={hero.poster}
              muted
              loop
              playsInline
              preload="metadata"
              className="block h-full w-full object-cover"
              aria-label={`${project.title} preview`}
            />
          ) : hero?.kind === "image" ? (
            <Image
              src={hero.src}
              alt={`${project.title} preview`}
              fill
              sizes="(min-width: 768px) 300px, 75vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-navy/5" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between px-4 py-3">
          <h3 className={`${pierSans.className} truncate text-lg text-navy`}>
            {project.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-navy/60">
            <span className="truncate">{project.role}</span>
            <span className="ml-2 shrink-0">{project.year}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function TerminatorCard() {
  return (
    <Link
      href="/works"
      className="group block w-[75vw] shrink-0 sm:w-[300px]"
      aria-label="See all works"
    >
      <article className="flex h-[420px] flex-col items-center justify-center gap-4 rounded-xl border border-navy border-r-[4px] border-b-[4px] bg-navy px-6 text-center text-beige transition-transform duration-300 group-hover:-translate-y-1">
        <span className="text-xs uppercase tracking-widest text-beige/70">
          The full archive
        </span>
        <h3
          className={`${pierSans.className} text-3xl leading-tight sm:text-4xl`}
        >
          See all works
        </h3>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium">
          Open the index
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </article>
    </Link>
  );
}

type MarqueeRowProps = {
  baseSpeed: number; // px/sec
  direction: 1 | -1; // -1 = drift visually L->R, 1 = drift visually R->L
  reduced: boolean;
  velocityFactor: MotionValue<number>;
  children: React.ReactNode;
};

function MarqueeRow({
  baseSpeed,
  direction,
  reduced,
  velocityFactor,
  children,
}: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const hoveredRef = useRef(false);
  const loopWidthRef = useRef(0);

  // Measure half the track width (since we render the content twice).
  useEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      if (!trackRef.current) return;
      loopWidthRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Apply x as a transform manually (avoids re-rendering on every frame).
  useEffect(() => {
    const unsub = x.on("change", (v) => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${v}px,0,0)`;
      }
    });
    return () => unsub();
  }, [x]);

  useAnimationFrame((_t, delta) => {
    if (reduced) return;
    if (hoveredRef.current) return;
    const loop = loopWidthRef.current;
    if (!loop) return;
    const factor = velocityFactor.get();
    const dx = baseSpeed * (delta / 1000) * factor * direction;
    let next = x.get() - dx;
    // Normalize into (-loop, 0]
    if (next <= -loop) next += loop;
    if (next > 0) next -= loop;
    x.set(next);
  });

  if (reduced) {
    return (
      <div className="w-full overflow-x-auto">
        <div
          ref={trackRef}
          className="flex w-max"
          style={{ gap: `${CARD_GAP_PX}px` }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{
          gap: `${CARD_GAP_PX}px`,
          transform: "translate3d(0,0,0)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function WorksMarquee() {
  const reduced = usePrefersReducedMotion();
  const finePointer = useHasFinePointer();

  // Scroll velocity coupling
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300,
  });
  // Map |velocity| (px/s) into a multiplier in roughly [1, 3].
  const velocityFactor = useTransform(smoothVelocity, (v) => {
    const speed = Math.min(Math.abs(v), 3000);
    return 1 + (speed / 3000) * 2; // 1..3
  });

  const cards = projects;
  const loopedCards = [...cards, ...cards];
  const loopedTicker = [...cards, ...cards];

  return (
    <section
      className="relative w-full overflow-hidden bg-beige py-16 sm:py-20 md:min-h-[60vh] md:py-24"
      aria-label="Selected works marquee"
    >
      <div className="mx-auto mb-8 max-w-6xl px-4 sm:mb-10 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-navy/60">
          Selected works
        </p>
        <h2
          className={`${pierSans.className} mt-2 text-3xl text-navy sm:text-4xl md:text-5xl`}
        >
          Things I&apos;ve built
        </h2>
      </div>

      {/* Row 1 — project cards, drift L -> R */}
      <MarqueeRow
        baseSpeed={40}
        direction={-1}
        reduced={reduced}
        velocityFactor={velocityFactor}
      >
        {loopedCards.map((project, i) => (
          <ProjectCard
            key={`card-${project.slug}-${i}`}
            project={project}
            canHoverPlay={finePointer}
          />
        ))}
        <TerminatorCard key="terminator-a" />
        <TerminatorCard key="terminator-b" />
      </MarqueeRow>

      {/* Row 2 — typographic ticker, drift R -> L (slower) */}
      <div className="mt-10 sm:mt-14">
        <MarqueeRow
          baseSpeed={25}
          direction={1}
          reduced={reduced}
          velocityFactor={velocityFactor}
        >
          {loopedTicker.map((project, i) => (
            <div
              key={`ticker-${project.slug}-${i}`}
              className="flex shrink-0 items-center gap-4"
            >
              <span
                className={`${pierSans.className} text-2xl text-navy sm:text-3xl md:text-4xl`}
              >
                {project.role}
              </span>
              {project.techStack.slice(0, 4).map((t) => (
                <span
                  key={`${project.slug}-${t}-${i}`}
                  className="shrink-0 rounded-full border border-navy/25 bg-beige px-3 py-1 text-xs text-navy/75 sm:text-sm"
                >
                  {t}
                </span>
              ))}
              <span
                aria-hidden
                className="text-2xl text-navy/40 sm:text-3xl md:text-4xl"
              >
                •
              </span>
            </div>
          ))}
        </MarqueeRow>
      </div>
    </section>
  );
}

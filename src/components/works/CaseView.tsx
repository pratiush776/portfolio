"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { STAGGER, rise } from "@/lib/motion";
import type { FeaturedWork } from "@/data/works";

/**
 * One project's case page. The opening earns a fast skim — title, brief, real media — before the
 * page settles into Why / What / How and the decisions underneath. The structure repeats so a
 * reader knows where to look; the evidence does not.
 *
 * The brief above the media is the page's ONLY summary line. An outcome statement used to sit
 * under the media as a second one, and at that distance the two read as the same claim made
 * twice — Why / What / How already carries the result in prose.
 */

export function CaseView({
  work,
  prev,
  next,
}: {
  work: FeaturedWork;
  prev: FeaturedWork;
  next: FeaturedWork;
}) {
  const reduce = useReducedMotion() ?? false;

  const brief = work.tagline ?? work.description;
  const v = reduce ? undefined : rise;

  return (
    <main id="main" className="case gutter measure">
      <motion.div
        className="case__opening"
        variants={reduce ? undefined : STAGGER}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "visible"}
      >
        <CaseOpening
          work={work}
          brief={brief}
          variants={v}
        />
      </motion.div>

      <CaseNarrative work={work} />
      <CaseActions work={work} prev={prev} next={next} />
    </main>
  );
}

function CaseOpening({
  work,
  brief,
  variants,
}: {
  work: FeaturedWork;
  brief: string;
  variants?: Variants;
}) {
  return (
    <>
      <header className="case__intro">
        <motion.h1 className="display-section" variants={variants}>
          {work.title}
        </motion.h1>
      </header>

      <motion.div variants={variants}>
        <CaseMediaGallery work={work} brief={brief} />
      </motion.div>
    </>
  );
}

function CaseNarrative({ work }: { work: FeaturedWork }) {
  const { caseStudy } = work;

  return (
    <>
      <article className="case__narrative">
        <CaseBeat title="Why">
          <p className="prose">{caseStudy.why}</p>
        </CaseBeat>

        <CaseBeat title="What">
          <p className="prose">{caseStudy.what}</p>
        </CaseBeat>

        <CaseBeat title="How">
          <p className="prose">{caseStudy.how}</p>
          <div className="case__decisions">
            {caseStudy.decisions.map((decision) => (
              <section className="case__decision" key={decision.title}>
                <h3>{decision.title}</h3>
                <p>{decision.detail}</p>
              </section>
            ))}
          </div>
        </CaseBeat>
      </article>
    </>
  );
}

function CaseBeat({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="case__beat">
      <h2 className="case__beat-title editorial">{title}</h2>
      <div className="case__beat-content">{children}</div>
    </section>
  );
}

function CaseMediaGallery({
  work,
  brief,
}: {
  work: FeaturedWork;
  brief: string;
}) {
  const [selected, setSelected] = useState(0);
  const highlights = work.caseStudy.highlights ?? [];
  const leadLabel = work.media.kind === "video" ? "Demo" : "Overview";
  const stageRatio =
    work.media.kind === "poster" ? "16 / 10" : work.media.aspectRatio;

  // The same ratio as a NUMBER, handed to the stylesheet so it can cap the stage by HEIGHT — see
  // --case-stage-cap. CSS cannot multiply the `16 / 9` form, and the data is written that way
  // because that is the form `aspect-ratio` reads.
  const [ratioW, ratioH] = stageRatio.split("/").map((n) => parseFloat(n));
  const stageScalar = ratioW / ratioH;

  return (
    <section
      className="case__media-gallery"
      aria-label={`${work.title} media`}
    >
      <div className="case__media-context">
        <p className="case__brief editorial">{brief}</p>

        {/* ALWAYS RENDERED, including on a work with a single piece of media. The rail is part of
            what a case page IS — brief, marks, stage, in that order on all six — and hiding it on
            the pages that happen to have one artifact made those read as a different template
            rather than as the same one with less in it. A lone mark is not a choice going
            unoffered; it is the label for what is on the stage, which is the job it does on every
            page. It keeps its pressed state for the same reason: it is the current thing, and the
            mark's active styling is what says so. */}
        <div
          className="case__highlights"
          role="group"
          aria-label="Choose media"
        >
          <button
            type="button"
            className="case__highlight"
            aria-pressed={selected === 0}
            onClick={() => setSelected(0)}
          >
            <span className="case__highlight-thumb case__highlight-thumb--lead">
              {work.media.kind === "video" ? (
                <span className="case__highlight-play" aria-hidden />
              ) : work.media.kind === "image" ? (
                <Image
                  src={work.media.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="case__highlight-thumb-image"
                />
              ) : (
                <span className="case__highlight-letter" aria-hidden>
                  {work.title.charAt(0)}
                </span>
              )}
            </span>
            <span>{leadLabel}</span>
          </button>

          {highlights.map((highlight, index) => (
            <button
              type="button"
              className="case__highlight"
              aria-pressed={selected === index + 1}
              onClick={() => setSelected(index + 1)}
              key={highlight.src}
            >
              <span className="case__highlight-thumb">
                <Image
                  src={highlight.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="case__highlight-thumb-image"
                />
              </span>
              <span>{highlight.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="case__media-view">
        <div
          className="case__media-stage"
          style={
            {
              aspectRatio: stageRatio,
              "--stage-ratio": stageScalar,
            } as CSSProperties
          }
        >
          <div className="case__media-panel" hidden={selected !== 0}>
            <CaseLeadMedia work={work} active={selected === 0} />
          </div>

          {highlights.map((highlight, index) => (
            <div
              className="case__media-panel"
              hidden={selected !== index + 1}
              key={highlight.src}
            >
              <Image
                src={highlight.src}
                alt={highlight.alt}
                fill
                sizes="(max-width: 767px) 100vw, 1024px"
                className="case__media-image"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseActions({
  work,
  prev,
  next,
}: {
  work: FeaturedWork;
  prev: FeaturedWork;
  next: FeaturedWork;
}) {
  return (
    <>
      {work.links.length > 0 && (
        <nav className="case__links" aria-label="Project links">
          {work.links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="underline-link">{label}</span>
              <ArrowUpRight width="16" height="16" aria-hidden />
            </a>
          ))}
        </nav>
      )}

      <nav className="case__nav" aria-label="More projects">
        <Link
          href={`/works/${prev.slug}`}
          className="case__nav-item case__nav-item--previous"
          aria-label={`Previous project: ${prev.title}`}
        >
          <span aria-hidden>←</span>
          <span className="underline-link">{prev.title}</span>
        </Link>

        <Link href="/#work" className="case__nav-item">
          <span className="underline-link">All work</span>
        </Link>

        <Link
          href={`/works/${next.slug}`}
          className="case__nav-item case__nav-item--next"
          aria-label={`Next project: ${next.title}`}
        >
          <span className="underline-link">{next.title}</span>
          <span aria-hidden>→</span>
        </Link>
      </nav>
    </>
  );
}

/** Video leads when it exists. Poster-only work keeps its honest typographic plate. */
function CaseLeadMedia({
  work,
  active,
}: {
  work: FeaturedWork;
  active: boolean;
}) {
  if (work.media.kind === "poster") {
    return (
      <div
        className="case__poster"
        role="img"
        aria-label={`${work.media.word}. ${work.media.caption}`}
      >
        <div className="plate" aria-hidden>
          <span className="plate__word">{work.media.word}</span>
          <span className="plate__caption">{work.media.caption}</span>
        </div>
      </div>
    );
  }

  // The stage already carries this still's own ratio, so it fills the frame without a crop.
  if (work.media.kind === "image") {
    return (
      <Image
        src={work.media.src}
        alt={work.media.alt}
        fill
        sizes="(max-width: 767px) 100vw, 1024px"
        className="case__media-image"
      />
    );
  }

  return (
    <CaseDemo title={work.title} src={work.media.src} active={active} />
  );
}

const DEMO_TIMEOUT_MS = 12_000;

function CaseDemo({
  title,
  src,
  active,
}: {
  title: string;
  src: string;
  active: boolean;
}) {
  const [phase, setPhase] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const [attempt, setAttempt] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gateRef = useRef<HTMLButtonElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const stallTimeoutRef = useRef<number | null>(null);
  const preserveKeyboardFocus = useRef(false);
  const requested = phase !== "idle";

  useEffect(() => {
    if (phase !== "loading" || !active) return;

    const timeout = window.setTimeout(() => {
      setPhase("error");
    }, DEMO_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [active, attempt, phase]);

  useEffect(() => {
    const video = videoRef.current;

    if (!active) {
      video?.pause();
      if (stallTimeoutRef.current !== null) {
        window.clearTimeout(stallTimeoutRef.current);
        stallTimeoutRef.current = null;
      }
      return;
    }

    if (phase === "loading") {
      void video?.play().catch(() => {
        setPhase("error");
      });
    }
  }, [active, attempt, phase]);

  useEffect(() => {
    if (!preserveKeyboardFocus.current) return;

    if (phase === "loading") {
      gateRef.current?.focus({ preventScroll: true });
    } else if (phase === "error") {
      retryRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(
    () => () => {
      if (stallTimeoutRef.current !== null) {
        window.clearTimeout(stallTimeoutRef.current);
      }
    },
    [],
  );

  const rememberInput = (event: MouseEvent<HTMLButtonElement>) => {
    preserveKeyboardFocus.current = event.detail === 0;
  };

  const requestDemo = (event: MouseEvent<HTMLButtonElement>) => {
    if (phase === "loading") return;
    rememberInput(event);
    setPhase("loading");
  };

  const retryDemo = (event: MouseEvent<HTMLButtonElement>) => {
    rememberInput(event);
    setAttempt((value) => value + 1);
    setPhase("loading");
  };

  const handlePlaying = () => {
    if (stallTimeoutRef.current !== null) {
      window.clearTimeout(stallTimeoutRef.current);
      stallTimeoutRef.current = null;
    }

    setPhase("playing");

    if (preserveKeyboardFocus.current) {
      window.requestAnimationFrame(() => {
        videoRef.current?.focus({ preventScroll: true });
        preserveKeyboardFocus.current = false;
      });
    }
  };

  const handleStall = () => {
    if (phase !== "playing" || stallTimeoutRef.current !== null) return;

    stallTimeoutRef.current = window.setTimeout(() => {
      stallTimeoutRef.current = null;
      setPhase("error");
    }, DEMO_TIMEOUT_MS);
  };

  const handleError = () => {
    if (stallTimeoutRef.current !== null) {
      window.clearTimeout(stallTimeoutRef.current);
      stallTimeoutRef.current = null;
    }
    setPhase("error");
  };

  return (
    <section
      className="case__demo"
      aria-label={`${title} demo`}
      aria-busy={phase === "loading"}
    >
      {requested && (
        <video
          key={attempt}
          ref={videoRef}
          className={`case__demo-video${
            phase === "playing" ? " case__demo-video--visible" : ""
          }`}
          src={src}
          muted
          playsInline
          controls
          autoPlay
          preload="auto"
          tabIndex={0}
          onPlaying={handlePlaying}
          onStalled={handleStall}
          onWaiting={handleStall}
          onError={handleError}
        >
          <a href={src}>Open the {title} demo video</a>
        </video>
      )}

      {(phase === "idle" || phase === "loading") && (
        <button
          ref={gateRef}
          type="button"
          className="case__demo-gate"
          onClick={requestDemo}
          aria-disabled={phase === "loading"}
          aria-label={
            phase === "loading"
              ? `Loading ${title} demo`
              : `Play ${title} demo`
          }
        >
          <DemoMark loading={phase === "loading"} />
        </button>
      )}

      {phase === "loading" && (
        <span className="sr-only" role="status">
          Loading {title} demo
        </span>
      )}

      {phase === "error" && (
        <div className="case__demo-error" role="alert">
          <p>The demo didn’t load.</p>
          <div className="case__demo-error-actions">
            <button
              ref={retryRef}
              type="button"
              className="underline-link"
              onClick={retryDemo}
            >
              Try again
            </button>
            <a href={src} className="underline-link">
              Open the video
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function DemoMark({ loading = false }: { loading?: boolean }) {
  const orbitId = useId().replace(/:/g, "");
  const orbitText = loading
    ? "Loading · Loading · Loading · Loading · "
    : "Demo · Demo · Demo · Demo · Demo · Demo · Demo · ";

  return (
    <span
      className={`demo-mark${loading ? " demo-mark--loading" : ""}`}
      aria-hidden
    >
      <svg
        className="demo-mark__orbit"
        viewBox="0 0 160 160"
        focusable="false"
      >
        <defs>
          <path
            id={orbitId}
            d="M 80,80 m -58,0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0"
          />
        </defs>
        <text>
          <textPath
            href={`#${orbitId}`}
            textLength="354"
            lengthAdjust="spacing"
          >
            {orbitText}
          </textPath>
        </text>
      </svg>
      <span className="demo-mark__button">
        <span className="demo-mark__triangle" />
      </span>
    </span>
  );
}

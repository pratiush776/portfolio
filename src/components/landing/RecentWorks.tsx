"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { projects, type Project } from "@/data/projects";
import { WorksCursorPreview } from "./WorksCursorPreview";

const FEATURED_SLUGS = ["nilink", "lucid-tone", "whisk-it-all"] as const;
const HOVER_INTENT_DELAY_MS = 0;
const ENTRY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRING_CONFIG = { stiffness: 350, damping: 38, mass: 0.6 };
// Tile bounding box (max width × aspect 4:3). Used to clamp the cursor so the
// tile can't drift off-screen at the section edges. translate(-50%, -110%)
// means the tile sits 1.10 × tileH above the cursor and centered horizontally.
const TILE_MAX_W = 300;
const TILE_MAX_H = 225;
const TILE_EDGE_PAD = 12;

const sectionVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: ENTRY_EASE },
  },
};

const ledeVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: ENTRY_EASE },
  },
};

const listVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.085,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.64, ease: ENTRY_EASE },
  },
};

const footerVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: ENTRY_EASE },
  },
};

function getFeatured(): Project[] {
  return FEATURED_SLUGS.map((slug) =>
    projects.find((p) => p.slug === slug),
  ).filter((p): p is Project => Boolean(p));
}

function Thumb({ project }: { project: Project }) {
  return (
    <div className="recent-works-v3__thumb-brand" aria-hidden>
      <span className="recent-works-v3__thumb-brand-mark">
        <Image
          src={project.logo}
          alt=""
          fill
          sizes="(max-width: 900px) 40vw, 96px"
        />
      </span>
    </div>
  );
}

function NoteBlock({
  text,
  variant,
}: {
  text: string;
  variant: "column" | "inline";
}) {
  const className =
    variant === "inline"
      ? "recent-works-v3__note recent-works-v3__note--inline"
      : "recent-works-v3__note";
  return (
    <p className={className}>
      {text}
      <span className="recent-works-v3__note-sig">— PS</span>
    </p>
  );
}

function Row({
  project,
  reduceMotion,
  onActivate,
}: {
  project: Project;
  reduceMotion: boolean;
  onActivate: (
    project: Project | null,
    event?: PointerEvent<HTMLAnchorElement>,
  ) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (!hoverTimerRef.current) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  useEffect(() => clearHoverTimer, []);

  const handlePointerEnter = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;
    clearHoverTimer();
    onActivate(project, event);

    if (reduceMotion) {
      setHovered(true);
      return;
    }

    hoverTimerRef.current = setTimeout(() => {
      setHovered(true);
      hoverTimerRef.current = null;
    }, HOVER_INTENT_DELAY_MS);
  };

  const handlePointerLeave = () => {
    clearHoverTimer();
    setHovered(false);
    onActivate(null);
  };

  return (
    <motion.li className="recent-works-v3__item" variants={rowVariants}>
      <Link
        href={`/works/${project.slug}`}
        className="recent-works-v3__row"
        data-hover={hovered ? "true" : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={() => setHovered(true)}
        onBlur={handlePointerLeave}
      >
        <div className="recent-works-v3__row-inner">
          <div className="recent-works-v3__col-a">
            <h3 className="recent-works-v3__row-title">{project.title}</h3>
            <p className="recent-works-v3__row-meta">
              {project.techStack.slice(0, 3).join(" · ")}
            </p>
            {project.note && <NoteBlock text={project.note} variant="inline" />}
          </div>

          <div className="recent-works-v3__col-b">
            <span className="recent-works-v3__year">{project.year}</span>
            <span className="recent-works-v3__role">{project.role}</span>
          </div>

          {project.note && (
            <div className="recent-works-v3__col-note">
              <NoteBlock text={project.note} variant="column" />
            </div>
          )}

          <div className="recent-works-v3__thumb">
            <Thumb project={project} />
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

export function RecentWorks() {
  const reduceMotion = useReducedMotion();
  const featured = getFeatured();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);

  const trackX = reduceMotion ? mouseX : springX;
  const trackY = reduceMotion ? mouseY : springY;

  // Compute section-relative cursor position, clamped so the tile
  // (translate(-50%, -110%)) stays inside the section bounds.
  const computeClampedPos = (clientX: number, clientY: number) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    const minX = TILE_MAX_W / 2 + TILE_EDGE_PAD;
    const maxX = rect.width - TILE_MAX_W / 2 - TILE_EDGE_PAD;
    const minY = TILE_MAX_H * 1.1 + TILE_EDGE_PAD;
    const maxY = rect.height + TILE_MAX_H * 0.1 - TILE_EDGE_PAD;
    return {
      x: Math.max(minX, Math.min(maxX, rawX)),
      y: Math.max(minY, Math.min(maxY, rawY)),
    };
  };

  const setPositionFromEvent = (clientX: number, clientY: number) => {
    const pos = computeClampedPos(clientX, clientY);
    if (!pos) return null;
    mouseX.set(pos.x);
    mouseY.set(pos.y);
    return pos;
  };

  const handleSectionPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    setPositionFromEvent(e.clientX, e.clientY);
  };

  const handleSectionPointerEnter = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    // Seed position so the preview doesn't sweep in from off-screen.
    const pos = setPositionFromEvent(e.clientX, e.clientY);
    if (pos) {
      springX.jump(pos.x);
      springY.jump(pos.y);
    }
  };

  const handleSectionPointerLeave = () => {
    setActiveProject(null);
  };

  const handleActivate = (
    project: Project | null,
    event?: PointerEvent<HTMLAnchorElement>,
  ) => {
    if (project !== null && event) {
      // Recompute from the activating row's event so scroll-triggered
      // pointerenter (no preceding pointermove) doesn't use stale coords.
      const pos = setPositionFromEvent(event.clientX, event.clientY);
      if (pos && activeProject === null) {
        springX.jump(pos.x);
        springY.jump(pos.y);
      }
    }
    setActiveProject(project);
  };

  return (
    <motion.section
      ref={sectionRef}
      className="recent-works-v3"
      aria-labelledby="recent-works-title"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionVariants}
      onPointerEnter={handleSectionPointerEnter}
      onPointerMove={handleSectionPointerMove}
      onPointerLeave={handleSectionPointerLeave}
    >
      <div className="recent-works-v3__inner">
        <motion.header
          className="recent-works-v3__head"
          variants={headerVariants}
        >
          <h2 id="recent-works-title" className="recent-works-v3__title">
            Selected work
          </h2>
          <motion.p
            className="recent-works-v3__lede"
            variants={ledeVariants}
          >
            Selected projects from the last two years, shipped end-to-end.
          </motion.p>
        </motion.header>

        <div className="recent-works-v3__list-wrap">
          <motion.ol className="recent-works-v3__list" variants={listVariants}>
            {featured.map((p) => (
              <Row
                key={p.slug}
                project={p}
                reduceMotion={Boolean(reduceMotion)}
                onActivate={handleActivate}
              />
            ))}
          </motion.ol>
        </div>

        <motion.div className="recent-works-v3__footer" variants={footerVariants}>
          <Link href="/works" className="recent-works-v3__see-all">
            <span>See all works</span>
            <span aria-hidden className="recent-works-v3__see-all-arrow">
              →
            </span>
          </Link>
        </motion.div>
      </div>

      <WorksCursorPreview
        project={activeProject}
        springX={trackX}
        springY={trackY}
      />
    </motion.section>
  );
}

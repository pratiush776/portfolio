"use client";

/**
 * KineticText — reusable kinetic typography primitive.
 *
 * Renders text in the display font (Bricolage Grotesque, exposed as the CSS
 * variable `--font-display`) and animates the variable-font `wght` axis (plus
 * letter-spacing) through a Motion spring. Styling is fully self-contained via
 * inline styles + motion values; it does NOT depend on any rules in
 * globals.css.
 *
 * ── Public API ────────────────────────────────────────────────────────────
 *   <KineticHeading>Section title</KineticHeading>
 *
 *   Props (KineticText + KineticHeading share the same contract):
 *     as          — heading/element tag. KineticText default "h2",
 *                   KineticHeading default "h2".
 *     children    — text content (string preferred; per-char mode needs a string).
 *     mode        — "hover" | "inView" (KineticText default "inView",
 *                   KineticHeading default "inView").
 *     perChar     — animate each character independently (default: true for
 *                   "hover", false for "inView").
 *     weightFrom  — starting wght axis value (200–800). Defaults per mode.
 *     weightTo    — target/settled wght axis value (200–800). Defaults per mode.
 *     opsz        — optical-size axis value (default 40, a display setting).
 *     className   — extra classes appended to the root.
 *     style       — extra inline styles merged onto the root.
 *
 *   The root always carries the literal className "display-kinetic" so other
 *   agents/components can target or recognize kinetic display text.
 *
 *   Reduced motion: when `prefers-reduced-motion: reduce` is set, the text is
 *   rendered statically at `weightTo` with no animation and no interaction.
 * ───────────────────────────────────────────────────────────────────────────
 */

import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type KineticMode = "hover" | "inView";

export type KineticTextProps = {
  as?: ElementType;
  children: ReactNode;
  mode?: KineticMode;
  perChar?: boolean;
  weightFrom?: number;
  weightTo?: number;
  opsz?: number;
  className?: string;
  style?: CSSProperties;
};

const clampWeight = (w: number) => Math.max(200, Math.min(800, w));

/** Build a `font-variation-settings` string for a given weight + optical size. */
function variation(wght: number, opsz: number) {
  return `"opsz" ${opsz}, "wght" ${clampWeight(wght)}`;
}

const SPRING = { stiffness: 220, damping: 26, mass: 0.9 } as const;

/* ── Per-character glyph: each char gets its own spring-driven weight ─────── */

function KineticChar({
  char,
  weight,
  letterSpacing,
  opsz,
}: {
  char: string;
  weight: MotionValue<number>;
  letterSpacing: MotionValue<number>;
  opsz: number;
}) {
  const fvs = useTransform(weight, (w) => variation(w, opsz));
  const ls = useTransform(letterSpacing, (v) => `${v}em`);
  return (
    <motion.span
      aria-hidden
      style={{
        display: "inline-block",
        fontVariationSettings: fvs,
        letterSpacing: ls,
        whiteSpace: char === " " ? "pre" : undefined,
        willChange: "font-variation-settings",
      }}
    >
      {char === " " ? " " : char}
    </motion.span>
  );
}

export function KineticText({
  as: Tag = "h2",
  children,
  mode = "inView",
  perChar,
  weightFrom,
  weightTo,
  opsz = 40,
  className = "",
  style,
}: KineticTextProps) {
  const reduced = useReducedMotion();

  // Mode-aware defaults.
  const from = weightFrom ?? (mode === "hover" ? 400 : 240);
  const to = weightTo ?? (mode === "hover" ? 760 : 620);
  const animatePerChar = perChar ?? mode === "hover";

  const rootRef = useRef<HTMLElement | null>(null);
  const inView = useInView(rootRef, { once: mode === "inView", amount: 0.5 });

  // Spring drives the whole-word (or shared) weight + tracking.
  const weight = useSpring(from, SPRING);
  const tracking = useSpring(mode === "inView" ? 0.06 : 0, SPRING);

  // For inView mode, settle weight/tracking when the element enters the viewport.
  useEffect(() => {
    if (reduced) return;
    if (mode !== "inView") return;
    if (inView) {
      weight.set(to);
      tracking.set(0);
    }
  }, [reduced, mode, inView, to, weight, tracking]);

  // For hover mode, ensure resting state matches `from`.
  useEffect(() => {
    if (reduced) return;
    if (mode === "hover") {
      weight.set(from);
      tracking.set(0);
    }
  }, [reduced, mode, from, weight, tracking]);

  const handleEnter = () => {
    if (reduced || mode !== "hover") return;
    weight.set(to);
    tracking.set(0.02);
  };
  const handleLeave = () => {
    if (reduced || mode !== "hover") return;
    weight.set(from);
    tracking.set(0);
  };

  const text = typeof children === "string" ? children : null;
  const chars = useMemo(() => (text ? Array.from(text) : null), [text]);

  const rootClassName = ["display-kinetic", className].filter(Boolean).join(" ");

  const baseStyle: CSSProperties = {
    fontFamily: "var(--font-display)",
    // Static fallback variation; live value is animated below when motion is on.
    fontVariationSettings: variation(reduced ? to : from, opsz),
    margin: 0,
    ...style,
  };

  const MotionTag = useMemo(() => motion.create(Tag), [Tag]);

  // ── Reduced motion: render static at the settled weight, no interaction. ──
  if (reduced) {
    return (
      <Tag
        ref={rootRef as React.Ref<HTMLElement>}
        className={rootClassName}
        style={{ ...baseStyle, fontVariationSettings: variation(to, opsz) }}
      >
        {children}
      </Tag>
    );
  }

  // ── Per-character animation (best for hover; needs a string child). ───────
  if (animatePerChar && chars) {
    return (
      <Tag
        ref={rootRef as React.Ref<HTMLElement>}
        className={rootClassName}
        style={baseStyle}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
      >
        {/* Accessible text for SR / copy-paste; glyphs are aria-hidden. */}
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
        {chars.map((c, i) => (
          <KineticChar
            key={`${c}-${i}`}
            char={c}
            weight={weight}
            letterSpacing={tracking}
            opsz={opsz}
          />
        ))}
      </Tag>
    );
  }

  // ── Whole-word animation (default for inView / non-string children). ──────
  return (
    <WholeWord
      Tag={MotionTag}
      rootRef={rootRef}
      className={rootClassName}
      baseStyle={baseStyle}
      weight={weight}
      tracking={tracking}
      opsz={opsz}
      onEnter={mode === "hover" ? handleEnter : undefined}
      onLeave={mode === "hover" ? handleLeave : undefined}
    >
      {children}
    </WholeWord>
  );
}

/* Hooks (useTransform) must run unconditionally, so the whole-word render path
 * lives in its own component rather than inline in a branch above. */
function WholeWord({
  Tag,
  rootRef,
  className,
  baseStyle,
  weight,
  tracking,
  opsz,
  onEnter,
  onLeave,
  children,
}: {
  Tag: React.ComponentType<Record<string, unknown>>;
  rootRef: React.MutableRefObject<HTMLElement | null>;
  className: string;
  baseStyle: CSSProperties;
  weight: MotionValue<number>;
  tracking: MotionValue<number>;
  opsz: number;
  onEnter?: () => void;
  onLeave?: () => void;
  children: ReactNode;
}) {
  const fvs = useTransform(weight, (w) => variation(w, opsz));
  const ls = useTransform(tracking, (v) => `${v}em`);
  return (
    <Tag
      ref={rootRef}
      className={className}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        ...baseStyle,
        fontVariationSettings: fvs,
        letterSpacing: ls,
        willChange: "font-variation-settings, letter-spacing",
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * KineticHeading — stable, opinionated contract for downstream headings.
 * Same props as KineticText, but with heading-friendly defaults
 * (inView settle, tasteful weight swell). Always carries `display-kinetic`.
 */
export function KineticHeading(props: KineticTextProps) {
  return (
    <KineticText
      as={props.as ?? "h2"}
      mode={props.mode ?? "inView"}
      weightFrom={props.weightFrom ?? 260}
      weightTo={props.weightTo ?? 640}
      {...props}
    />
  );
}

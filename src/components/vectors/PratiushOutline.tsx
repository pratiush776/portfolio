import { PRATIUSH_PATHS } from "./PratiushMain";

type Props = { className?: string; "aria-hidden"?: boolean };

// The outline shares PratiushMain's exact paths/viewBox. An SVG stroke is
// CENTRED on the path, so a raw stroke would bleed half its width OUTSIDE the
// fill silhouette — making the border look bigger than the solid behind it.
// SVG `stroke-align: inner` isn't reliably supported, so instead we clip the
// stroke to the fill region: only the inner half renders, so the outer edge
// lines up exactly with the solid wordmark. strokeWidth 12 → ~6px visible line.
const CLIP_ID = "pratiush-outline-clip";

export function PratiushOutline({ className, "aria-hidden": ariaHidden }: Props) {
  return (
    <svg
      className={className}
      aria-hidden={ariaHidden}
      viewBox="0 0 1452 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={CLIP_ID}>
          {PRATIUSH_PATHS.map((d, i) => (
            <path key={`clip-${i}`} d={d} />
          ))}
        </clipPath>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="12"
        fill="none"
        strokeLinejoin="round"
        clipPath={`url(#${CLIP_ID})`}
      >
        {PRATIUSH_PATHS.map((d, i) => (
          <path key={`stroke-${i}`} d={d} />
        ))}
      </g>
    </svg>
  );
}

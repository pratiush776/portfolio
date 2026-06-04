// Hidden inline SVG duotone filter referenced by the portrait's `--duo` crossfade
// layer (see HeroPhoto + .hero-photo-v3__image--duo). It maps the photo's
// LUMINANCE onto a two-tone Dusk ramp — deep twilight #221E2E in the shadows →
// warm gold #E3B98A in the highlights — turning the candid grey figure into a
// deliberate graphic silhouette. Alpha is preserved (row `0 0 0 1 0`) so the
// transparent cutout stays transparent; only the figure pixels are recoloured.
//
// The filter is STATIC (no per-frame rebuild). The portrait is transform-animated
// every frame during the descent, so the *animation* is the opacity crossfade on
// the layer that references this filter (compositor-only) — not the filter itself.
// colorInterpolationFilters="sRGB" so the table endpoints land on the literal hex
// colours (linearRGB would shift them toward the lights).
export function DuotoneFilter() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <filter id="v3-duotone" colorInterpolationFilters="sRGB">
        {/* RGB → luminance (Rec. 709 weights); alpha untouched. */}
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0
                  0.2126 0.7152 0.0722 0 0
                  0.2126 0.7152 0.0722 0 0
                  0      0      0      1 0"
        />
        {/* luma 0 → #221E2E shadow, luma 1 → #E3B98A highlight. */}
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.133 0.890" />
          <feFuncG type="table" tableValues="0.118 0.725" />
          <feFuncB type="table" tableValues="0.180 0.541" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

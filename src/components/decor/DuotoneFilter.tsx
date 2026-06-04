// Hidden inline SVG duotone filter referenced by the portrait's `--duo` crossfade
// layer (see HeroPhoto + .hero-photo-v3__image--duo). It maps the photo's
// LUMINANCE onto a two-tone Dusk ramp — deep twilight plum #1A1730 in the shadows
// → clean warm cream #F3D2A6 in the highlights — turning the candid grey figure
// into a deliberate, luminous graphic silhouette. Alpha is preserved (row
// `0 0 0 1 0`) so the transparent cutout stays transparent; only the figure pixels
// are recoloured.
//
// The photo is mostly mid/light tones, so a flat 2-stop map piled everything into a
// muddy khaki mid-band. Each feFunc therefore uses a 5-stop S-CURVE (luma
// 0/.25/.5/.75/1): the mids are pushed toward the two ends so the figure separates
// into real shadow/light instead of one flat tan. The stop values come from the
// shadow→highlight pair shaped by a smoothstep — they're the main eyeball-tune.
//
// The filter is STATIC (no per-frame rebuild). The portrait is transform-animated
// every frame, so the *animation* is the opacity crossfade on the layer that
// references this filter (compositor-only) — never the filter itself.
// colorInterpolationFilters="sRGB" so the stops land on the literal hex colours
// (linearRGB would shift them toward the lights).
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
        {/* S-curve duotone ramp: shadow #1A1730 → highlight #F3D2A6.
            R 0.102→0.953, G 0.090→0.824, B 0.188→0.651, mids pulled apart. */}
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.102 0.187 0.527 0.868 0.953" />
          <feFuncG type="table" tableValues="0.090 0.164 0.457 0.750 0.824" />
          <feFuncB type="table" tableValues="0.188 0.234 0.420 0.605 0.651" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

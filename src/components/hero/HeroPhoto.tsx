import Image from "next/image";

export function HeroPhoto() {
  return (
    <div className="hero-photo-v3" aria-hidden>
      <Image
        className="hero-photo-v3__image"
        src="/images/hero-image-new.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1100px) 52vw, 560px"
      />
      {/* Duotone copy stacked on top, crossfaded in by --pg (0 in hero → 1 in
          skills). Opacity-only animation on this ~560px layer (the #v3-duotone
          filter itself is static) → compositor-safe, no flicker. */}
      <Image
        className="hero-photo-v3__image hero-photo-v3__image--duo"
        src="/images/hero-image-new.png"
        alt=""
        fill
        sizes="(max-width: 1100px) 52vw, 560px"
      />
    </div>
  );
}

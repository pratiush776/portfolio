import Image from "next/image";

export function HeroPhoto() {
  return (
    <div className="hero-photo-v3" aria-hidden>
      <Image
        className="hero-photo-v3__image"
        src="/images/hero-image.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1100px) 52vw, 560px"
      />
    </div>
  );
}

import Image from "next/image";
import type { Media } from "../../../data/projects";

export function ProjectThumb({ media, title }: { media?: Media; title: string }) {
  if (!media) {
    return (
      <div className="h-12 w-12 shrink-0 rounded-md bg-navy/10" aria-hidden />
    );
  }
  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        muted
        playsInline
        loop
        autoPlay
        poster={media.poster}
        className="h-12 w-12 shrink-0 rounded-md object-cover bg-navy/10"
        aria-label={`${title} thumbnail`}
      />
    );
  }
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-navy/10">
      <Image
        src={media.src}
        alt={`${title} thumbnail`}
        fill
        sizes="48px"
        className="object-cover"
      />
    </div>
  );
}

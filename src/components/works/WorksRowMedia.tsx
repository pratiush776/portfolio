import Image from "next/image";
import type { Media } from "../../../data/projects";

type WorksRowMediaProps = {
  media: Media;
  title: string;
  priority?: boolean;
};

export function WorksRowMedia({ media, title, priority }: WorksRowMediaProps) {
  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        className="block h-full w-full object-cover"
        aria-label={`${title} preview`}
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={`${title} preview`}
      fill
      sizes="(min-width: 768px) 60vw, 100vw"
      priority={priority}
      className="object-cover"
    />
  );
}

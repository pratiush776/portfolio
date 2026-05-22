import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Media } from "../../../data/projects";

export type SiblingLink = {
  slug: string;
  title: string;
  hero?: Media;
};

type SiblingNavProps = {
  prev: SiblingLink;
  next: SiblingLink;
};

function Thumb({ media, title }: { media?: Media; title: string }) {
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

export function SiblingNav({ prev, next }: SiblingNavProps) {
  return (
    <nav
      aria-label="Project navigation"
      className="sticky bottom-4 z-40 mx-auto mt-16 w-full max-w-5xl px-3 sm:px-4"
    >
      <div className="flex items-stretch gap-2 rounded-2xl border border-navy border-r-[4px] border-b-[4px] bg-beige p-2 shadow-md sm:gap-3 sm:p-3">
        <Link
          href={`/works/${prev.slug}`}
          className="group flex flex-1 min-w-0 items-center gap-2 rounded-xl px-2 py-2 hover:bg-navy/5 sm:gap-3 sm:px-3"
        >
          <ChevronLeft
            className="h-5 w-5 shrink-0 text-navy transition-transform group-hover:-translate-x-0.5"
            aria-hidden
          />
          <Thumb media={prev.hero} title={prev.title} />
          <div className="min-w-0 text-left">
            <div className="text-[10px] uppercase tracking-wider text-navy/60">
              Previous
            </div>
            <div className="truncate text-sm font-semibold text-navy sm:text-base">
              {prev.title}
            </div>
          </div>
        </Link>

        <div className="hidden w-px shrink-0 bg-navy/15 sm:block" aria-hidden />

        <Link
          href={`/works/${next.slug}`}
          className="group flex flex-1 min-w-0 items-center justify-end gap-2 rounded-xl px-2 py-2 hover:bg-navy/5 sm:gap-3 sm:px-3"
        >
          <div className="min-w-0 text-right">
            <div className="text-[10px] uppercase tracking-wider text-navy/60">
              Next
            </div>
            <div className="truncate text-sm font-semibold text-navy sm:text-base">
              {next.title}
            </div>
          </div>
          <Thumb media={next.hero} title={next.title} />
          <ChevronRight
            className="h-5 w-5 shrink-0 text-navy transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </nav>
  );
}

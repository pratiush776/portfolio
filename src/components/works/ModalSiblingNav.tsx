"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SiblingLink } from "./SiblingNav";
import { ProjectThumb } from "./ProjectThumb";

type ModalSiblingNavProps = {
  prev: SiblingLink;
  next: SiblingLink;
};

export function ModalSiblingNav({ prev, next }: ModalSiblingNavProps) {
  const router = useRouter();
  const goPrev = () =>
    router.replace(`/works/${prev.slug}`, { scroll: false });
  const goNext = () =>
    router.replace(`/works/${next.slug}`, { scroll: false });

  return (
    <nav
      aria-label="Modal project navigation"
      className="mx-auto w-full"
    >
      <div className="flex items-stretch gap-2 rounded-2xl border border-navy border-r-[4px] border-b-[4px] bg-beige p-2 shadow-md sm:gap-3 sm:p-3">
        <button
          type="button"
          onClick={goPrev}
          className="group flex flex-1 min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-navy/5 sm:gap-3 sm:px-3"
        >
          <ChevronLeft
            className="h-5 w-5 shrink-0 text-navy transition-transform group-hover:-translate-x-0.5"
            aria-hidden
          />
          <ProjectThumb media={prev.hero} title={prev.title} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-navy/60">
              Previous
            </div>
            <div className="truncate text-sm font-semibold text-navy sm:text-base">
              {prev.title}
            </div>
          </div>
        </button>

        <div className="hidden w-px shrink-0 bg-navy/15 sm:block" aria-hidden />

        <button
          type="button"
          onClick={goNext}
          className="group flex flex-1 min-w-0 items-center justify-end gap-2 rounded-xl px-2 py-2 text-right hover:bg-navy/5 sm:gap-3 sm:px-3"
        >
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-navy/60">
              Next
            </div>
            <div className="truncate text-sm font-semibold text-navy sm:text-base">
              {next.title}
            </div>
          </div>
          <ProjectThumb media={next.hero} title={next.title} />
          <ChevronRight
            className="h-5 w-5 shrink-0 text-navy transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      </div>
    </nav>
  );
}

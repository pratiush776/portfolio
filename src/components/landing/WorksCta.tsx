import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pierSans } from "@/lib/fonts";

export function WorksCta() {
  return (
    <section
      className="w-full bg-beige px-4 py-24 text-navy sm:px-6 sm:py-32"
      aria-label="See all works"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-8">
        <p className="text-xs uppercase tracking-widest text-navy/60">
          The whole shelf
        </p>
        <h2
          className={`${pierSans.className} text-4xl leading-[1.05] text-navy sm:text-6xl md:text-7xl`}
        >
          Want the full story?
        </h2>
        <p className="max-w-2xl text-base text-navy/70 sm:text-lg">
          Each project has its own page — context, decisions, trade-offs, and
          what shipped. Some are deep case studies. Others are quick snapshots.
        </p>
        <Link
          href="/works"
          className="group inline-flex items-center gap-2 rounded-full border border-navy bg-navy px-6 py-3 text-sm font-medium text-beige transition hover:bg-navy/90"
        >
          See all works
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { pierSans } from "@/lib/fonts";
import { WorksRowMedia } from "./WorksRowMedia";
import { HeroViewTransition } from "./HeroViewTransition";
import type { Media } from "../../../data/projects";

type WorksRowMotionProps = {
  slug: string;
  index: number;
  title: string;
  description: string;
  role: string;
  year: number;
  techStack?: string[];
  hero?: Media;
};

export function WorksRowMotion({
  slug,
  index,
  title,
  description,
  role,
  year,
  techStack,
  hero,
}: WorksRowMotionProps) {
  const num = String(index + 1).padStart(2, "0");

  const handleClick = () => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "works-modal-return-scroll",
          String(window.scrollY)
        );
      } catch {}
    }
  };

  return (
    <Link
      href={`/works/${slug}`}
      scroll={false}
      onClick={handleClick}
      className="group block border-t border-navy/15 py-10 md:py-16"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
          <div className="text-sm font-medium text-navy/50">{num}</div>
          <h2
            className={`${pierSans.className} mt-2 text-3xl text-navy sm:text-4xl md:text-5xl`}
          >
            {title}
          </h2>
          <p className="mt-3 text-base text-navy/75 sm:text-lg">{description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-navy/70">
            <span className="rounded-full border border-navy/30 bg-beige px-3 py-1">
              {role}
            </span>
            <span className="rounded-full border border-navy/30 bg-beige px-3 py-1">
              {year}
            </span>
          </div>
          {techStack?.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {techStack.slice(0, 6).map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-navy/20 bg-beige px-2.5 py-0.5 text-[11px] text-navy/80"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
            View case study
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </div>
        </div>

        <div className="md:col-span-7">
          <motion.div
            layoutId={`works-card-${slug}`}
            className="relative aspect-video w-full overflow-hidden rounded-xl border border-navy/20 bg-navy/5 md:min-h-[60vh]"
          >
            {hero ? (
              <HeroViewTransition name={`hero-${slug}`}>
                <WorksRowMedia
                  media={hero}
                  title={title}
                  priority={index === 0}
                />
              </HeroViewTransition>
            ) : null}
          </motion.div>
        </div>
      </div>
    </Link>
  );
}

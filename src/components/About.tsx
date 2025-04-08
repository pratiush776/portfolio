import { pierSans } from "@/lib/fonts";
import { ChevronUp, ExternalLink } from "lucide-react";
import React from "react";

interface AboutProps {
  className?: string;
}

export default function About({ className }: AboutProps) {
  return (
    <div
      className={`container top-0 z-8 flex flex-col justify-center gap-[16px] ${className}`}
    >
      <div className="md:w-[40em] mx-auto">
        <h1 className={`title ${pierSans.className}`}>About</h1>
        <p className="p text-navy font-light">
          I am a passionate computer science student with a knack for crafting
          digital experiences. My journey in software development is fueled by
          curiosity and a drive to turn innovative ideas into user-friendly
          websites and apps. With a solid foundation in programming and a love
          for creative problem solving, I design solutions that not only meet
          but exceed business needs.
        </p>
        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="button mt-[16px] bg-neutral-700 text-beige max-w-fit flex justify-center items-center gap-2"
        >
          <h3>Resume</h3>
          <ExternalLink className="btn-icon" />
        </a>
      </div>

      <ChevronUp className="btn-icon text-navy absolute bottom-10 left-1/2 -translate-x-1/2" />
    </div>
  );
}

// import Lenis from "lenis";
import React from "react";

interface NavProps {
  className?: string;
}

export default function MiniNav({ className }: NavProps) {
  return (
    <div className={`w-full flex justify-end items-center ${className}`}>
      {/* Hamburger (left, in Nav) carries navigation — top bar keeps just the CTA */}
      <a
        href="#contact"
        aria-label="Go to contact section"
        className="shrink-0 flex items-center bg-beige text-navy font-semibold text-[14px] tracking-[.5px] leading-[20px] rounded-[20px] px-5 py-1.5 border-navy border-1 border-b-[3px] border-r-[3px] hover:-translate-y-px hover:border-b-[4px] hover:border-r-[4px] transition-all duration-200 ease-in-out"
      >
        Connect
      </a>
    </div>
  );
}

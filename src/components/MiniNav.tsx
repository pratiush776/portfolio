// import Lenis from "lenis";
import React from "react";

interface NavProps {
  className?: string;
}

export default function MiniNav({ className }: NavProps) {
  return (
    <div className={`w-full flex justify-end items-center ${className}`}>
      <div className="text-[14px] text-beige tracking-[.5px] leading-[20px] font-medium flex flex-wrap items-center gap-3 md:gap-4">
        <a href="#about" className="relative group hidden md:block ">
          About
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-beige group-hover:w-full group-hover:transition-all"></span>
        </a>
        <a href="#projects" className="relative group hidden md:block">
          Projects
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-beige group-hover:w-full group-hover:transition-all"></span>
        </a>
        <a href="#skills" className="relative group hidden md:block">
          Skills
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-beige group-hover:w-full group-hover:transition-all"></span>
        </a>
        <a
          href="#contact"
          className={`button shrink-0 font-bold hover:opacity-100 opacity-90 transition duration-200 ease-in-out bg-beige text-navy rounded-[20px] px-3 py-1 hover:-translate-y-px`}
        >
          Contact
        </a>
        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={`button shrink-0 font-bold bg-beige text-navy rounded-[20px] px-3 py-1 hover:opacity-100 opacity-90 transition duration-200 ease-in-out hover:-translate-y-px`}
        >
          CV
        </a>
      </div>
    </div>
  );
}

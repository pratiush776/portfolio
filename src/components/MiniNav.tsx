"use client";
// import Lenis from "lenis";
import React, { useEffect, useRef } from "react";

interface NavProps {
  className?: string;
}

export default function MiniNav({ className }: NavProps) {
  // const lenisRef = useRef<Lenis | null>(null);

  // useEffect(() => {
  //   lenisRef.current = new Lenis({
  //     // Adjust settings as needed.
  //     duration: 1.2,
  //     easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  //   });

  //   const raf = (time: number) => {
  //     lenisRef.current?.raf(time);
  //     requestAnimationFrame(raf);
  //   };
  //   requestAnimationFrame(raf);

  //   // Cleanup on unmount.
  //   return () => {
  //     if (lenisRef.current) {
  //       lenisRef.current.destroy();
  //       lenisRef.current = null;
  //     }
  //   };
  // }, []);

  // const handleScroll = (
  //   e: React.MouseEvent<HTMLAnchorElement>,
  //   target: string
  // ) => {
  //   e.preventDefault();
  //   if (lenisRef.current) {
  //     lenisRef.current.scrollTo(target);
  //   }
  // };
  return (
    <div className={` w-full flex justify-between items-center ${className}`}>
      <div className="text-[14px] text-beige tracking-[.5px] leading-[20px] font-medium flex justify-evenly items-center gap-4">
        <a
          href="#about"
          className="relative group hidden md:block "
          // onClick={(e) => handleScroll(e, "#about")}
        >
          About
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-beige group-hover:w-full group-hover:transition-all"></span>
        </a>
        <a
          href="#projects"
          className="relative group hidden md:block"
          // onClick={(e) => handleScroll(e, "#projects")}
        >
          Projects
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-beige group-hover:w-full group-hover:transition-all"></span>
        </a>
        <a
          href="#skills"
          className="relative group hidden md:block"
          // onClick={(e) => handleScroll(e, "#skills")}
        >
          Skills
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-beige group-hover:w-full group-hover:transition-all"></span>
        </a>
        <a
          href="#contact"
          className=""
          // onClick={(e) => handleScroll(e, "#contact")}
        >
          <button
            className={` h-full w-full font-bold bg-beige text-navy rounded-[20px] px-3 py-1`}
          >
            Contact
          </button>
        </a>
        <a href="/CV.pdf" download className="">
          <button
            className={` h-full w-full font-bold bg-beige text-navy rounded-[20px] px-3 py-1`}
          >
            CV
          </button>
        </a>
      </div>
    </div>
  );
}

"use client";
import { ChevronUp, Scroll } from "lucide-react";
import React, { use, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (heroRef.current) {
      const tl = gsap.timeline({
        defaults: { duration: 0.5 },
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top center",
          end: "bottom top",
        },
      });

      const childrenArray = Array.from(heroRef.current.children);

      gsap.set(childrenArray, { autoAlpha: 0 });
      tl.fromTo(
        childrenArray,
        { autoAlpha: 0, y: 25 },
        { autoAlpha: 1, y: 0, stagger: 0.4, ease: "power1.inOut" }
      ).to("#scroll", {
        y: -10,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 0.5,
        stagger: 0.2,
      });
      // .to("#scroll", { y: 0, ease: "power1.inOut" });
    }
  });
  return (
    <div
      id="hero"
      // className={`relative bg-navy h-[75vh] w-full flex flex-col justify-center items-center rounded-[20px] shadow-2xl ${className}`}
      className={` container z-9 !bg-navy flex flex-col justify-center items-center ${className}`}
    >
      <div className="text-beige text-center" ref={heroRef}>
        <h1 className="md:text-[40px]  md:leading-[40px] leading-[24px] text-[24px] font-semibold tracking-[.5px]">
          Pratiush Karki
        </h1>

        <p className="p font-semibold  text-navy  bg-beige rounded-[3px] py-[4px] px-[8px]">
          Software Developer
        </p>
      </div>
      <div
        id="scroll"
        className="absolute bottom-10 text-beige flex flex-col items-center opacity-50"
      >
        <ChevronUp />
        <h3 className="text-[12px] tracking-[.5px] font-medium ">Scroll</h3>
      </div>
    </div>
  );
}

import { Menu } from "lucide-react";
import React from "react";

interface NavProps {
  className?: string;
}

export default function MiniNav({ className }: NavProps) {
  return (
    <div className={` w-full flex justify-between items-center ${className}`}>
      <div className="text-[14px] tracking-[.5px] leading-[20px] font-medium flex justify-evenly items-center gap-4">
        <a href="#about" className="text-beige">
          About
        </a>
        <a href="#projects" className="text-beige">
          Projects
        </a>
        <a href="#skills" className="text-beige">
          Skills
        </a>
        <a href="#contact" className="text-beige">
          <button className="h-full w-full bg-beige text-navy rounded-[20px] px-3 py-1">
            Contact
          </button>
        </a>
      </div>
    </div>
  );
}

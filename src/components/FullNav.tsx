import { Download, Github, Linkedin, Send } from "lucide-react";
import React from "react";
import Email from "./Email";

interface FullNavProps {
  className?: string;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FullNav: React.FC<FullNavProps> = ({ className, setIsOpen }) => {
  return (
    <div
      className={` flex flex-col h-90svh items-center justify-evenly ${className}`}
    >
      <div className="h3 font-light flex flex-col items-center justify-evenly h-[50dvh] ">
        <a
          onClick={() => {
            if (setIsOpen) setIsOpen(false);
          }}
          href="#about"
          className="text-beige -translate-x-[1em]"
        >
          <button className="button full-nav-btn font-semibold w-[8em] border-beige border-1">
            About
          </button>
        </a>
        <a
          onClick={() => {
            if (setIsOpen) setIsOpen(false);
          }}
          href="#projects"
          className="text-beige"
        >
          <button className="button w-[8em] full-nav-btn font-semibold translate-x-[1em] border-beige border-1">
            Projects
          </button>
        </a>
        <a
          onClick={() => {
            if (setIsOpen) setIsOpen(false);
          }}
          href="#skills"
          className="text-beige -translate-x-[1em]"
        >
          <button className="button w-[8em] full-nav-btn font-semibold border-beige border-1">
            Skills
          </button>
        </a>
        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="text-beige"
        >
          <button className="button w-[8em] full-nav-btn flex font-semibold translate-x-[1em] border-beige border-1">
            <h3>Resume</h3>
            <Download className="btn-icon" />
          </button>
        </a>
      </div>
      <div className="grid grid-cols-3 grid-rows-3 gap-x-[8px] gap-y-[16px]">
        <Email className="h-fit w-fit self-center place-self-center full-nav-btn2" />
        <a
          href={"https://www.linkedin.com/in/pratiush-k-810324223"}
          target="_blank"
          className="flex flex-col items-center justify-center"
        >
          <button className="button full-nav-btn2 bg-beige text-navy !rounded-[20px]">
            <Linkedin size={18} />
          </button>
        </a>
        <a
          href={"https://github.com/pratiush776"}
          target="_blank"
          className="flex flex-col items-center justify-center "
        >
          <button className="button full-nav-btn2 bg-beige text-navy !rounded-[20px]">
            <Github size={18} />
          </button>
        </a>
        <a href="#contact" className="text-beige col-span-3 row-span-2">
          <button
            onClick={() => {
              if (setIsOpen) setIsOpen(false);
            }}
            className="h-full w-full bg-beige full-nav-btn2 text-navy border-black border-r-[4px] border-b-[4px] rounded-[20px] px-3 py-1 flex items-center justify-center gap-[16px]"
          >
            <h3 className="font-semibold">Connect</h3>
            <Send size={20} strokeWidth={1.5} className="translate-y-[1px]" />
          </button>
        </a>
      </div>
    </div>
  );
};

export default FullNav;

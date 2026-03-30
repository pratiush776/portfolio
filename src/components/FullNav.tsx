import { Download, Github, Linkedin, Send } from "lucide-react";
import React from "react";
import Email from "./Email";

interface FullNavProps {
  className?: string;
  closeMenu?: (restoreFocus?: boolean) => void;
}

const FullNav: React.FC<FullNavProps> = ({ className, closeMenu }) => {
  return (
    <div
      className={` flex flex-col h-90svh items-center justify-evenly ${className}`}
    >
      <div className="h3 font-light flex flex-col items-center justify-evenly h-[50dvh] ">
        <a
          onClick={() => closeMenu?.()}
          href="#about"
          className="button full-nav-btn font-semibold w-[8em] border-beige border-1 text-beige -translate-x-[1em] transition-transform duration-200 hover:-translate-y-px"
        >
          About
        </a>
        <a
          onClick={() => closeMenu?.()}
          href="#projects"
          className="button w-[8em] full-nav-btn font-semibold translate-x-[1em] border-beige border-1 text-beige transition-transform duration-200 hover:-translate-y-px"
        >
          Projects
        </a>
        <a
          onClick={() => closeMenu?.()}
          href="#skills"
          className="button w-[8em] full-nav-btn font-semibold border-beige border-1 text-beige -translate-x-[1em] transition-transform duration-200 hover:-translate-y-px"
        >
          Skills
        </a>
        <a
          onClick={() => closeMenu?.()}
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="button w-[8em] full-nav-btn flex font-semibold translate-x-[1em] border-beige border-1 text-beige transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Resume</span>
          <Download className="btn-icon" />
        </a>
      </div>
      <div className="grid grid-cols-3 grid-rows-3 gap-x-[8px] gap-y-[16px]">
        <Email className="h-fit w-fit self-center place-self-center full-nav-btn2 transition-transform duration-200 hover:-translate-y-px" />
        <a
          href={"https://www.linkedin.com/in/pratiush-k-810324223"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open LinkedIn profile in a new tab"
          className="button full-nav-btn2 bg-beige text-navy !rounded-[20px] flex flex-col items-center justify-center transition-transform duration-200 hover:-translate-y-px"
        >
          <Linkedin size={18} />
        </a>
        <a
          href={"https://github.com/pratiush776"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open GitHub profile in a new tab"
          className="button full-nav-btn2 bg-beige text-navy !rounded-[20px] flex flex-col items-center justify-center transition-transform duration-200 hover:-translate-y-px"
        >
          <Github size={18} />
        </a>
        <a
          href="#contact"
          onClick={() => closeMenu?.()}
          className="h-full w-full bg-beige full-nav-btn2 text-navy border-black border-r-[4px] border-b-[4px] rounded-[20px] px-3 py-1 flex items-center justify-center gap-[16px] col-span-3 row-span-2 transition-transform duration-200 hover:-translate-y-px"
        >
          <h3 className="font-semibold">Connect</h3>
          <Send size={20} strokeWidth={1.5} className="translate-y-[1px]" />
        </a>
      </div>
    </div>
  );
};

export default FullNav;

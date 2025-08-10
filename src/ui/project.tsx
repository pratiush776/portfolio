"use client";
import { Globe, Maximize2, Plus } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import CollapsibleText from "./CollapsibleText";
import Carousel from "./Carousel";
import { pierSans } from "@/lib/fonts";

// import Link from "next/link";

interface ProjectProps {
  className?: string;
  title: string;
  logo: string;
  description: string;
  url: string;
  fullDescription?: string;
  videos?: string[];
  imgs?: string[];
  techStack?: string[];
  i?: number;
}

export function FloatingProject({
  className,
  title,
  logo,
  description,
  url,
  fullDescription,
  techStack,
  videos,
  imgs,
  i,
}: ProjectProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{
          scale: { duration: 0.2, ease: "easeInOut" },
        }}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className={`w-full   bg-[#ffffff90] cursor-pointer border-navy  border-r-[4px] border-b-[4px] h-[56px] rounded-[20px] px-[16px] py-[4px] flex items-center justify-between text-navy${className}`}
      >
        <motion.div className="flex gap-[8px] items-center animate-fade">
          <div className="w-[36px] h-[36px] rounded-full bg-[#afa9a9d2] flex items-center justify-center overflow-hidden drop-shadow-sm"></div>
          <div className="flex flex-col gap-[4px]">
            <h3 className="p !font-semibold h-[1rem] rounded-[10px] w-[5em] bg-[#afa9a9d2] "></h3>
            <p className="text-[12px] opacity-50 h-[.8rem] rounded-[10px] w-[10em]  bg-[#afa9a9d2]"></p>
          </div>
        </motion.div>
        <Maximize2 className="btn-icon" />
      </motion.div>
    );
  }
  return (
    <>
      <motion.div
        key={i}
        initial={{ scale: 1 }}
        whileHover={{ scale: 0.98, borderRadius: "20px", zIndex: 999 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className={`carousel-item drop-shadow-lg border-navy border-1 border-r-[4px] border-b-[4px] relative rounded-[20px]  box-border shrink-0 h-full md:w-[25em] w-[18em] md::shrink-0 flex items-center z-10 justify-around cursor-pointer ${className}`}
      >
        <div
          className={`relative 
            flex gap-[4px] items-center justify-center bg-[#8d99aec2] w-full h-[100svh] rounded-[19px] p-[16px] hover:translate-0 -translate-[8px] transition duration-200`}
        >
          <div
            className={`  w-[3em] md:w-[5em] aspect-square  rounded-full 
              flex items-center justify-center overflow-hidden  z-999 opacity-75`}
          >
            <Image
              src={logo}
              alt={title}
              width={100}
              height={100}
              className="h-[3em] w-[3em] md:h-[5em] bg-[#ffffffe5]  md:w-[5em] rounded-full "
            />
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="h3 !font-semibold !tracking-[1.75px] text-[#3c4555] drop-shadow-sm">
              {title}
            </h3>
            <p className="text-[16px] opacity-75 z-1000">{description}</p>
          </div>
          <Maximize2 className="absolute top-[16px] right-[16px] btn-icon" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className=" absolute bottom-[16px] hover:scale-110 transition duration-200 ease-in-out right-[16px] btn-icon"
          >
            <button className="button bg-slate-500 text-beige">
              <Globe size={16} />
            </button>
          </a>
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key={"expanded-project"}
              initial={{ opacity: 1, height: 100, y: 20 }}
              animate={{ opacity: 1, height: "99vh" }}
              exit={{ opacity: 1, height: 0, y: "100%" }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="fixed h-[95svh] w-[100vw] md:w-[50em] md:bottom-0 md:py-[4em] bg-[#f5efeb97] md:border-r-[6px] md:rounded-[20px] md:border-navy md:border-1 md:left-1/2 md:-translate-x-1/2 bottom-0 left-0  overflow-x-hidden backdrop-blur-sm p-10 z-10 overflow-y-auto"
            >
              <button
                onClick={() => isExpanded && setIsExpanded(!isExpanded)}
                className="bg-navy cursor-pointer text-beige p-2 rounded-full absolute top-5 right-5"
              >
                <Plus className=" rotate-45" size={16} />
              </button>
              <div className="flex flex-col gap-[24px] justify-start items-center md:w-[40em] mx-auto">
                <h1
                  className={`${pierSans.className} !tracking-[1.2px] h3 text-navy`}
                >
                  {title}
                </h1>
                {/* <VideoPreview /> */}
                <Carousel videos={videos} imgs={imgs} />
                <div className="flex flex-col text-navy px-[36px] self-start gap-2">
                  <p className="p bg-white border-navy border-1 w-fit button">
                    Tech Stack
                  </p>
                  <ul className="flex gap-2 pl-[16px] text-navy text-nowrap overflow-auto">
                    {(techStack ?? []).map((tech, index) => (
                      <li key={index}>
                        {tech}
                        {index == (techStack?.length ?? 0) - 1 ? " " : " . "}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="self-start mx-[36px] text-navy">
                  <p className="p bg-white border-navy border-1 w-fit button">
                    Description
                  </p>
                  <CollapsibleText
                    fullDescription={fullDescription ? fullDescription : ""}
                  />
                  <button className="text-navy max-w-fit hover:scale-104 transition-all  ease-in-out font-semibold button mt-[32px] border-navy border-1 bg-white border-b-[4px] border-r-[4px] justify-self-end">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-[8px]"
                    >
                      <p>Live Demo</p>
                      <Globe size={16} />
                    </a>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

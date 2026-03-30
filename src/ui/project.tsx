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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const dialogTitleId = React.useId();
  const canRenderPortal = typeof document !== "undefined";

  const toggleExpanded = () => {
    setIsExpanded((prevIsExpanded) => !prevIsExpanded);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
    }
  };

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);
  return (
    <>
      <motion.div
        key={i}
        initial={{ scale: 1 }}
        whileHover={{ scale: 0.98, borderRadius: "20px", zIndex: 999 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={toggleExpanded}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isExpanded}
        aria-label={`Open ${title} project details`}
        className={`carousel-item drop-shadow-lg border-navy border-1 border-r-[4px] border-b-[4px] relative rounded-[20px] box-border shrink-0 h-full md:w-[25em] w-[18em] lg:w-full lg:h-full lg:min-h-[16em] lg:col-span-1 lg:row-span-1 flex items-center z-10 justify-around cursor-pointer transition-all duration-300 ${className}`}
      >
        <div
          className={`relative 
            flex gap-[4px] items-center justify-center bg-[#8d99aec2] w-full h-full rounded-[19px] p-[16px] hover:translate-0 -translate-[8px] transition duration-200`}
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
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${title} live demo in a new tab`}
              className="absolute bottom-[16px] hover:scale-110 transition duration-200 ease-in-out right-[16px] z-50 button bg-slate-500 text-beige"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe size={16} />
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="absolute bottom-[16px] right-[16px] z-50 button bg-slate-300 text-slate-500 cursor-not-allowed"
            >
              <Globe size={16} />
            </span>
          )}
        </div>
      </motion.div>

      {canRenderPortal &&
        createPortal(
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key={"expanded-project"}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                className="fixed h-[95svh] w-[100vw] md:w-[50em] md:bottom-0 md:py-[4em] bg-[#f5efeb97] md:border-r-[6px] md:rounded-[20px] md:border-navy md:border-1 md:left-1/2 md:-translate-x-1/2 bottom-0 left-0  overflow-x-hidden backdrop-blur-sm p-10 z-[60] overflow-y-auto"
              >
                <button
                  onClick={() => setIsExpanded(false)}
                  aria-label={`Close ${title} details`}
                  className="bg-navy cursor-pointer text-beige p-2 rounded-full absolute top-5 right-5"
                >
                  <Plus className=" rotate-45" size={16} />
                </button>
                <div className="flex flex-col gap-[24px] justify-start items-center md:w-[40em] mx-auto">
                  <h1
                    id={dialogTitleId}
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
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy max-w-fit hover:scale-104 transition-all ease-in-out font-semibold button mt-[32px] border-navy border-1 bg-white border-b-[4px] border-r-[4px] justify-self-end flex items-center justify-center gap-[8px]"
                      >
                        <p>Live Demo</p>
                        <Globe size={16} />
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="text-gray-500 max-w-fit font-semibold button mt-[32px] border-gray-400 border-1 bg-gray-100 border-b-[4px] border-r-[4px] justify-self-end cursor-not-allowed opacity-80"
                      >
                        <div className="flex items-center justify-center gap-[8px]">
                          <p>Coming Soon</p>
                        </div>
                      </span>
                    )}
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

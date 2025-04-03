"use client";
import React from "react";
import MiniNav from "./MiniNav";
import FullNav from "./FullNav";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Plus } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface NavToggleProps {
  className?: string;
}
const NavToggle: React.FC<NavToggleProps> = ({ className }) => {
  useGSAP(() => {
    const sections = ["#hero", "#about", "#projects", "#skills", "#contact"];

    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      endTrigger: "#contact",
      end: "bottom bottom",

      //snap: 1 / (sections.length - 1)

      snap: {
        snapTo: 1 / (sections.length - 1),
        duration: { min: 0.25, max: 0.5 }, // the snap animation should be at least 0.25 seconds, but no more than 0.75 seconds (determined by velocity)
        // delay: 0.125, // wait 0.125 seconds from the last scroll event before doing the snapping
        ease: "power1.inOut", // the ease of the snap animation ("power3" by default)
        directional: true, // snap in the direction of the scroll (true by default)
      },
    });
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  return (
    <motion.nav
      initial={{
        height: "10vh",
        backgroundColor: "#2f4156",
        borderRadius: "0px 0px 20px 20px",
      }}
      animate={{
        height: isOpen ? "100vh" : "10vh",
        backgroundColor: isOpen ? "#1d242d" : "#2f4156",
        borderRadius: isOpen ? "0" : "0px 0px 20px 20px",
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      className={`fixed w-[100vw] top-0 left-0 z-10  flex ${
        isOpen ? "flex-col " : "justify-between items-start pt-[2.8vh] "
      }  px-8 items-center rounded-b-[20px]  overflow-hidden ${className}`}
    >
      <span
        className={`${
          isOpen ? "flex items-center h-[10vh] w-full justify-start " : ""
        } overflow-hidden`}
      >
        <button
          onClick={() => setIsOpen && setIsOpen(!isOpen)}
          className="bg-beige p-2 rounded-full "
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="plus"
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, rotate: 180, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <Plus className="rotate-45 text-navy" size={16} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="text-navy" size={16} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </span>
      {!isAnimating && (
        <motion.div>
          {isOpen ? <FullNav setIsOpen={setIsOpen} /> : <MiniNav />}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default NavToggle;

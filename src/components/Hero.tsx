"use client";
import { ChevronUp } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  return (
    <div
      id="hero"
      className={`container z-9 !bg-navy flex flex-col justify-center items-center ${className}`}
    >
      <div className="text-beige text-center">
        <h1 className="md:text-[40px] md:leading-[40px] leading-[24px] text-[24px] font-semibold tracking-[.5px]">
          {/* First Name: "P" visible immediately, then slides right */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-block"
          >
            P
          </motion.span>
          {/* "ratiush" slides in from left */}
          <motion.span
            initial={{ display: "none", opacity: 0, x: -20, width: 0 }} // Bring ratiush from the left
            animate={{
              opacity: 1,
              x: 0,
              display: "inline-block",
              width: "3.5em",
            }}
            transition={{ duration: 0.4, delay: 1 }}
            className="inline-block"
          >
            ratiush
          </motion.span>
          {/* <motion.span
            initial={{ opacity: 100, height: 100 }}
            animate={{ opacity: 0, height: 100 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          > */}{" "}
          {/* </motion.span> */}
          {/* Space between first and last name */}
          {/* Last Name: "K" visible immediately */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-block"
          >
            K
          </motion.span>
          {/* "arki" slides in from right */}
          <motion.span
            initial={{ display: "none", opacity: 0, x: -20, width: 0 }} // Bring ratiush from the left
            animate={{
              opacity: 1,
              x: 0,
              display: "inline-block",
              width: "1.9em",
            }}
            transition={{ duration: 0.4, delay: 1 }}
            className="inline-block"
          >
            arki
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="p font-semibold text-navy bg-beige rounded-[3px] py-[4px] px-[8px] inline-block mt-4"
        >
          Software Developer
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="absolute bottom-10 text-beige flex flex-col items-center"
      >
        <ChevronUp />
        <h3 className="text-[12px] tracking-[.5px] font-medium">Scroll</h3>
      </motion.div>
    </div>
  );
}

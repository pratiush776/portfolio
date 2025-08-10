"use client";
import React, { useRef } from "react";

interface StackingCompProps {
  className?: string;
  children: React.ReactNode;
  height: string;
  id: string;
}

const StackingComp: React.FC<StackingCompProps> = ({
  children,
  className,
  height,
  id,
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={divRef}
      className={`relative w-[100vw] h-[${height}00svh] ${className}`}
    >
      {children}
      {Array.from({ length: parseInt(height) - 1 }).map((_, i) =>
        i === parseInt(height) - 2 ? (
          <div
            key={i}
            className="container z-1 opacity-0 snap-center"
            id={id}
          ></div>
        ) : (
          <div key={i} className="container -z-1 opacity-0"></div>
        )
      )}
    </div>
  );
};

export default StackingComp;

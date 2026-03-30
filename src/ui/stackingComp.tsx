"use client";
import React from "react";

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
  const ghostCount = Math.max(Number.parseInt(height, 10) - 1, 0);

  return (
    <div
      className={`relative w-[100vw] ${className}`}
      style={{ height: `${height}00dvh` }}
    >
      {children}
      {Array.from({ length: ghostCount }).map((_, i) =>
        i === ghostCount - 1 ? (
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

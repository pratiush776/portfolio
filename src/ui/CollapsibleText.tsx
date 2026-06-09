import React, { useState } from "react";
import { ChevronUp } from "lucide-react";

interface CollapsibleTextProps {
  fullDescription: string;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  fullDescription,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full">
      {/* Text — clamped to a clean line boundary when collapsed (no overlay,
          so there's no halo over the semi-transparent modal background). */}
      <div className="text-navy">
        <p className={`break-words ${expanded ? "" : "line-clamp-3"}`}>
          {fullDescription}
        </p>
      </div>

      {/* Toggle button — always in normal flow, below the text */}
      <div className="mt-2 flex justify-start">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="text-navy flex items-center gap-[4px] cursor-pointer font-semibold"
        >
          <span className="button !text-[16px] !font-semibold !px-0 !drop-shadow-none text-navy">
            {expanded ? "View Less" : "View More"}
          </span>
          <ChevronUp
            className={`btn-icon transition-transform duration-200 ${
              expanded ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default CollapsibleText;

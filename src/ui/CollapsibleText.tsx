import React, { useState } from "react";
import { motion } from "framer-motion";

interface CollapsibleTextProps {
  fullDescription: string;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  fullDescription,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative w-[80%] overflow-hidden">
      {/* Animated text container */}
      <motion.div
        // initial={{ maxHeight: "6rem" }}
        // layout
        // animate={{ maxHeight: expanded ? "fit-content" : "6rem" }}
        // transition={{ duration: 0.5, ease: "easeInOut" }}
        className="text-navy flex items-start justify-start overflow-hidden pl-[16px] "
        // When collapsed, restrict the height; when expanded, remove the restriction.
        style={{ maxHeight: expanded ? undefined : "6rem" }}
      >
        <p>{fullDescription}</p>
      </motion.div>

      {/* Fade overlay and "View More" button when collapsed */}
      {!expanded && (
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t bg-[#ffffff90] to-transparent flex justify-center items-end pointer-events-none">
          <button
            onClick={() => setExpanded(true)}
            className="pointer-events-auto cursor-pointer  text-navy font-medium translate-y-[6px] px-2 rounded-t"
          >
            <span className="button bg-navy text-white">View More</span>
          </button>
        </div>
      )}

      {/* "View Less" button when expanded */}
      {expanded && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => setExpanded(false)}
            className="text-navy cursor-pointer font-semibold px-2 rounded"
          >
            <span className="button bg-navy text-white translate-y-[6px]">
              View Less
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CollapsibleText;

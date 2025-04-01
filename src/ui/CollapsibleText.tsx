import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

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
        className="text-navy flex-col flex items-start justify-start overflow-hidden pl-[16px] "
        // When collapsed, restrict the height; when expanded, remove the restriction.
        style={{ maxHeight: expanded ? undefined : "6rem" }}
      >
        <p>{fullDescription}</p>
        {/* Fade overlay and "View More" button when collapsed */}
        {!expanded && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#ffffff90] to-transparent flex justify-center items-end pointer-events-none">
              <button
                onClick={() => setExpanded(true)}
                className="pointer-events-auto  mx-auto cursor-pointer flex flex-col translate-y-[.25rem] backdrop-blur-3xl rounded-[20px] items-center justify-center text-navy font-medium  px-2 "
              >
                <span className="button  text-navy !text-[16px] !font-semibold">
                  View More
                </span>
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* "View Less" button when expanded */}
      {expanded && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => setExpanded(false)}
            className="text-navy flex flex-col items-center justify-center cursor-pointer font-semibold px-2 rounded"
          >
            <ChevronUp className="btn-icon translate-y-[.25rem]" />
            <span className="button  text-navy !text-[16px] !font-semibold">
              View Less
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CollapsibleText;

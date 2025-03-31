import { ChevronUp } from "lucide-react";
import React from "react";
import FilterSkills from "@/ui/FilterSkills";

interface SkillsProps {
  className?: string;
}

const Skills: React.FC<SkillsProps> = ({ className }) => {
  return (
    <div
      // id="skills"
      className={`container z-6 flex flex-col justify-center gap-[16px] ${className}`}
    >
      <div className="flex flex-col md:w-[40em] md:mx-auto md:translate-y-[2em]">
        <h1 className="title">Skills</h1>
        <FilterSkills />
      </div>
      <ChevronUp className="btn-icon text-navy absolute bottom-10 left-1/2 -translate-x-1/2" />
    </div>
  );
};

export default Skills;

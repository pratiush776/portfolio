"use client";
import React, { useState } from "react";
import Image from "next/image";
import { skills, Skill, SkillsCategory } from "../../data/skills";
import Link from "next/link";

const FilterSkills: React.FC = () => {
  // Extract category names from the skills array (each object has one key)
  const categories: string[] = skills.map((cat) => Object.keys(cat)[0]);

  // Include "All" as the first option.
  const allCategories = ["All", ...categories];

  // State to track the selected category filter; default is "All"
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Returns a flattened array of skills based on the selected category.
  const getDisplayedSkills = (): Skill[] => {
    if (selectedCategory === "All") {
      const skillMap = new Map<string, Skill>();
      skills.forEach((cat) => {
        const key = Object.keys(cat)[0] as keyof SkillsCategory;
        const tech = cat[key];
        if (tech) {
          tech.forEach((skill) => {
            if (!skillMap.has(skill.name)) {
              skillMap.set(skill.name, skill);
            }
          });
        }
      });
      return Array.from(skillMap.values());
    } else {
      // Find the matching category object.
      const categoryObj = skills.find(
        (cat) => Object.keys(cat)[0] === selectedCategory
      );
      if (categoryObj) {
        const key = Object.keys(categoryObj)[0] as keyof SkillsCategory;
        return categoryObj[key] || [];
      }
      return [];
    }
  };

  const displayedSkills = getDisplayedSkills();

  return (
    <div className="flex  flex-col gap-[8px] md:gap-[12px] ">
      {/* Category Filter Buttons */}

      <div
        className="relative mb-[8px] flex gap-2 overflow-x-scroll w-full "
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, black 80%, transparent 100%)",
          maskImage: "linear-gradient(90deg, black 80%, transparent 100%)",
        }}
      >
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`cursor-pointer hover:bg-navy hover:opacity-70 hover:text-beige px-[8px] py-[4px] drop-shadow-md  max-w-fit text-nowrap font-semibold rounded-[10px] border-navy border-1  ${
              selectedCategory === category
                ? "bg-navy text-beige"
                : "bg-beige text-navy"
            }`}
          >
            {category}
          </button>
        ))}
        <div className="bg-beige min-w-[16px] h-full"></div>
      </div>

      {/* Display Tech Logos */}
      <div
        className="float-animation border-1 border-navy border-r-[4px] border-b-[4px]  rounded-[20px]
         w-full h-[40vh] overflow-visible"
      >
        <div className=" h-full w-full overflow-y-scroll bg-[#8d99aec2] p-[16px] -translate-[8px] rounded-[20px] grid grid-cols-5 gap-4 text-center place-items-center auto-rows-min">
          {displayedSkills.map((skill, index) => (
            <Link
              key={index}
              href={skill.link}
              target="_blank"
              rel="noopener noreferrer"
              className=" flex flex-col items-center gap-0 "
            >
              <Image
                src={skill.logo}
                alt={skill.name}
                width={40}
                height={40}
                className="w-[36px] aspect-square drop-shadow-md"
              />
              <label className="text-[10px] tracking-[.75px] leading-[14px] opacity-75">
                {skill.name}
              </label>
            </Link>
          ))}
        </div>
      </div>
      <div className="float-shadow w-full h-[1em] absolute bottom-[-3em] bg-[#4a464634] rounded-[100%]  blur-xs "></div>
    </div>
  );
};

export default FilterSkills;

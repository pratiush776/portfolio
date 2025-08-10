import { FloatingProject } from "@/ui/project";
import { ChevronUp } from "lucide-react";
import React from "react";
import { projects } from "../../data/projects";
import { pierSans } from "@/lib/fonts";

interface ProjectsProps {
  className?: string;
}

export default function Projects({ className }: ProjectsProps) {
  return (
    <div
      // data-index="3"
      // id="projects"
      className={`container z-7 flex flex-col justify-center gap-[16px] ${className}`}
    >
      <div className="relative md:w-[40em] h-[85svh] mt-auto md:mx-auto flex flex-col  justify-center md:items-center gap-[16px]">
        <h1 className={`title ${pierSans.className}`}>Projects</h1>
        <div className="carousel carousel-center rounded-[20px] space-x-4 p-4 h-[20em] w-[100vw] self-center max-w-fit flex snap snap-mandatory gap-[8px] items-center justify-start overflow-x-auto">
          {projects.map((project, index) => (
            <FloatingProject
              key={project.title}
              title={project.title}
              logo={project.logo}
              description={project.description}
              url={project.url}
              fullDescription={project.fullDescription}
              techStack={project.techStack}
              videos={project.videos}
              imgs={project.imgs}
              i={index}
            />
          ))}
        </div>
        {/* <div className="md:w-[40em] md:mx-auto flex flex-col items-center">
        <h1 className={`title ${pierSans.className} !mb-[16px]`}>Projects</h1>
        <div className="flex  justify-center gap-[12px] ">
          {projects.map((project, index) => (
            <FloatingProject
              key={project.title}
              title={project.title}
              logo={project.logo}
              description={project.description}
              url={project.url}
              fullDescription={project.fullDescription}
              techStack={project.techStack}
              videos={project.videos}
              imgs={project.imgs}
              i={index + 1}
            />
          ))}
        </div> */}
      </div>
      <ChevronUp className="btn-icon text-navy absolute bottom-10 left-1/2 -translate-x-1/2" />
    </div>
  );
}

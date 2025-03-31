import { FloatingProject } from "@/ui/project";
import { ChevronUp } from "lucide-react";
import React from "react";
import { projects } from "../../data/projects";

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
      <div className="md:w-[40em] md:mx-auto">
        <h1 className="title ">Projects</h1>
        <div className="flex flex-col justify-center gap-[12px] ">
          {projects.map((project) => (
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
            />
          ))}
        </div>
      </div>
      <ChevronUp className="btn-icon text-navy absolute bottom-10 left-1/2 -translate-x-1/2" />
    </div>
  );
}

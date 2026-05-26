import { projects } from "@/data/projects";
import { WorkCard } from "@/components/works/WorkCard";

export default function WorksPage() {
  // Phase 1: test card = Whisk It All (has both video hero AND a live link,
  // so we can see the secondary CTA render).
  const testIndex = projects.findIndex((p) => p.slug === "whisk-it-all");
  const project = projects[testIndex >= 0 ? testIndex : 0];
  return (
    <main className="works-root-v3">
      <WorkCard project={project} index={testIndex >= 0 ? testIndex : 0} />
    </main>
  );
}

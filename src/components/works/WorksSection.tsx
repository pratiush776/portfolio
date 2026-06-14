import { featured } from "@/data/works";
import { WorkPanel } from "./WorkPanel";

/**
 * The work. No section heading, no eyebrows, no index rules — the hero itself lands as
 * the PROJECTS title (see MorphName), and each case panel carries only its own story:
 * title, the build, one quiet meta line, links. The full catalogue will live on a
 * dedicated /works page; the landing shows just these four.
 */
export function WorksSection() {
  return (
    <section id="works" className="works-v4" aria-label="Projects">
      <div className="works-v4__panels">
        {featured.map((work, index) => (
          <WorkPanel key={work.title} work={work} index={index} />
        ))}
      </div>
    </section>
  );
}

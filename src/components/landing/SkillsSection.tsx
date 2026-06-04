import { approach, technicalSpecs } from "./skills-data";
import { KineticHeading } from "@/components/type/KineticText";
import { toolIcons } from "./skills-icons";

// Pure markup. ALL motion for this section — the pin, the one-at-a-time item
// fly-in/lock, the clouds and the sky — is driven by the single scroll director
// (PortraitScrollChoreography), so there is one source of truth and nothing can
// drift out of sync. The twilight sky + clouds are viewport-fixed layers mounted
// at the stage level (see page.tsx). On mobile / reduced-motion the director
// no-ops, so the items are simply visible (CSS) on a static twilight surface.
export function SkillsSection() {
  return (
    <section className="skills-section-v3" aria-label="What I bring">
      <div className="skills-inner-v3">
        {/* Oversized editorial "ghost" word behind the constellation — pure
            scale/depth, faded + drifted in by the director via --ghost (opacity
            on a single element = compositor-safe). Sits behind every card/chip
            and the portrait. Swap the word freely (CRAFT / SKILLS / PRATIUSH). */}
        <span className="skills-ghost-v3" aria-hidden>
          CRAFT
        </span>
        {/* Spatial scatter: the structural wrappers below collapse to
            `display: contents` (see globals.css) so every item positions
            absolutely within this inner — a constellation around the centered
            portrait — while the list semantics + reading order are preserved.
            The director writes each item's fly-in transform per scroll frame. */}
        <div className="skills-row-v3">
          {/* Left flank — "Approach" voice block + playful trait stickers. */}
          <div className="skills-column-v3 skills-column-v3--soft" aria-label="Approach">
            <header className="skills-head-v3 skills-pos-head" data-skills-title>
              <KineticHeading className="skills-title-v3" weightTo={680}>
                What I bring.
              </KineticHeading>
              <p className="skills-approach-lead-v3">{approach.lead}</p>
            </header>
            <ul className="skills-traits-v3" role="list">
              {approach.traits.map((trait, index) => (
                <li
                  key={trait.title}
                  className={`skills-trait-v3 skills-pos-t${index + 1}`}
                  data-skills-soft
                >
                  <span className="skills-trait-v3__title">{trait.title}</span>
                  <span className="skills-trait-v3__note">{trait.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="skills-portrait-slot-v3" aria-hidden />

          {/* Right flank — numbered "Stack" spec sticker-cards. */}
          <ol className="skills-column-v3 skills-column-v3--tech" aria-label="Stack" role="list">
            {technicalSpecs.map((item, index) => (
              <li
                key={item.key}
                className={`skills-spec-v3 skills-sticker-v3 skills-sticker-v3--s${index % 4} skills-pos-c${index + 1}`}
                data-skills-tech
                tabIndex={0}
                aria-label={`${item.title}. ${item.note} ${item.proof} Stack: ${item.tools.join(", ")}.`}
              >
                <span className="skills-spec-v3__index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="skills-spec-v3__body">
                  <p className="skills-spec-v3__title">{item.title}</p>
                  <p className="skills-spec-v3__note">{item.note}</p>
                  <ul className="skills-spec-v3__tools" aria-hidden>
                    {item.tools.map((tool) => {
                      const Icon = toolIcons[tool];
                      return (
                        <li key={tool} className="skills-spec-v3__tool" title={tool}>
                          {Icon ? <Icon className="skills-spec-v3__tool-icon" /> : tool}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

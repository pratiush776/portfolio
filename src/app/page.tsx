import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import StackingComp from "@/ui/stackingComp";

export default function Home() {
  return (
    <>
      <main
        className={` box-border text-navy bg-beige snap-y snap-mandatory max-h-[100svh] scroll-smooth overflow-y-scroll w-[100vw] overflow-x-hidden`}
      >
        <StackingComp height="5" id="contact">
          <Contact className="!sticky top-0" />
          <div className="absolute top-0">
            <StackingComp height="4" id="skills">
              <Skills className="!sticky top-0" />
              <div className="absolute top-0">
                <StackingComp height="3" id="projects">
                  <Projects className="!sticky top-0" />
                  <div className="absolute top-0">
                    <StackingComp height="2" id="about">
                      <About className="!sticky top-0" />
                      <Hero className="!absolute top-0 snap-center" />
                    </StackingComp>
                  </div>
                </StackingComp>
              </div>
            </StackingComp>
          </div>
        </StackingComp>
        {/* <Footer /> */}
      </main>
    </>
  );
}

/**
 * Featured Works — 3–4 selected pieces for the sticky-fold gallery on the landing page.
 * Placeholder content for now: titles/descriptions are stand-ins, and `image` points at
 * open-source photos (Lorem Picsum, Unsplash license) in /public/projects_assets/
 * placeholders/ purely so the layout looks premium while eyeballing. Swap all of it for
 * the real featured pieces later (keep aspect/cover behaviour identical so it's a pure
 * content swap).
 */
export type Work = {
  title: string;
  year: string;
  category: string;
  /** One- or two-sentence brief shown beside the card on desktop. */
  description: string;
  image: string;
  /** Optional alt text; falls back to the title. */
  alt?: string;
};

export const works: Work[] = [
  {
    title: "Aurelia",
    year: "2025",
    category: "Brand & Web",
    description:
      "A skincare house rebuilt around restraint — a quiet identity and storefront that lets the product breathe.",
    image: "/projects_assets/placeholders/work-1.jpg",
    alt: "Aurelia brand and web case study",
  },
  {
    title: "Field Notes",
    year: "2024",
    category: "Editorial",
    description:
      "A long-form reading experience for a design studio's journal, paced entirely by typography and white space.",
    image: "/projects_assets/placeholders/work-2.jpg",
    alt: "Field Notes editorial case study",
  },
  {
    title: "Lumen",
    year: "2024",
    category: "Product",
    description:
      "A lighting configurator where the interface disappears and the room you're designing takes the stage.",
    image: "/projects_assets/placeholders/work-3.jpg",
    alt: "Lumen product case study",
  },
  {
    title: "Cadence",
    year: "2023",
    category: "Motion & Web",
    description:
      "A music label site built around rhythm — scroll-timed reveals tuned to feel like the drop, never the noise.",
    image: "/projects_assets/placeholders/work-4.jpg",
    alt: "Cadence motion and web case study",
  },
];

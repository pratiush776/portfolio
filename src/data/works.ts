/**
 * Real shipped work, modelled on two independent axes — *has a case page* vs *where it shows on
 * the landing page*:
 *  • `works` — every piece with a case page at /works/[slug]. Media is honest: a demo video
 *    where one exists, a real screen where the artifacts are stills, and a typographic poster
 *    only where neither exists.
 *  • `featured` — the `primary`-tier subset shown as big cards in the landing index.
 *  • `archive` — the text rows under the index: `secondary`-tier case works (which link in to
 *    their own case page) above the smaller external-only pieces.
 */
export type WorkMedia =
  | {
      kind: "video";
      src: string;
      /** Native video ratio, so the ink play face and the playing demo occupy the same frame
          without cropping a project whose recording is not 16:9. */
      aspectRatio: string;
      /** Used by the landing card only. Case pages deliberately show an ink play face until the
          visitor asks for the demo, so a browser-chosen first frame never becomes the cover. */
      poster?: string;
    }
  | {
      kind: "image";
      src: string;
      /** Native ratio of the still, so the stage frames the screen as shot rather than cropping
          a capture that is not 16:10 to fit a plate's proportions. */
      aspectRatio: string;
      alt: string;
    }
  | {
      /** The last resort, for work with no demo and no screen worth standing at full width. */
      kind: "poster";
      /** Big display word on the poster face. */
      word: string;
      /** Small caps line under the word. */
      caption: string;
    };

export type CaseDecision = {
  /** A short, active description of the judgment — written as a thought, not a category label. */
  title: string;
  /** What the choice changed, protected, or made possible. */
  detail: string;
};

export type CaseHighlight = {
  /** Short control label under the circular media preview. */
  label: string;
  src: string;
  alt: string;
};

export type CaseStudy = {
  /** Why the work needed to exist: problem and binding constraint. */
  why: string;
  /** What Pratiush owned and what actually shipped. */
  what: string;
  /** How the system was built, with enough technical detail to make the decisions credible. */
  how: string;
  /** Two or three project-specific decisions that expose judgment rather than list tasks. */
  decisions: CaseDecision[];
  /** Real screens offered directly beneath the case premise as compact media highlights. */
  highlights?: CaseHighlight[];
};

export type FeaturedWork = {
  title: string;
  /** URL segment for the dedicated case route (/works/[slug]). Stable, lowercase, hand-written
      per work so a title rename never silently 404s an existing link. */
  slug: string;
  /** Which landing surface it shows on: `primary` is a big card in the grid; `secondary` is a
      text row in the archive that still links to its own case page. Independent of whether a
      case page exists — every entry here has one. */
  tier: "primary" | "secondary";
  year: string;
  role: string;
  /** A short, definition-style gloss. The case page uses it as the brief, falling back to
      `description` when absent. */
  tagline?: string;
  /** A terse one-liner used only when this work shows as an archive row (secondary tier) —
      shorter than `description`, which is the grid and case-page voice. */
  archiveNote?: string;
  /** First-person, concrete. This is the human voice of the section. */
  description: string;
  /** The dedicated case narrative. Every page follows the same Why / What / How reading path,
      while the actual copy and decision evidence stay specific to the work. */
  caseStudy: CaseStudy;
  /** A photographed product still for the landing index; the case route leads with the real demo
      instead of repeating this image. */
  cover?: string;
  /** Voiced alt text for the cover still — describes the actual scene, not "Title product".
      Falls back to a generic label when absent. */
  coverAlt?: string;
  stack: string[];
  media: WorkMedia;
  links: { label: string; href: string }[];
};

export type ArchiveWork = {
  title: string;
  year: string;
  note: string;
  href?: string;
  /** True when `href` is an in-site case route (client-navigated) rather than an external link
      (opened in a new tab). */
  internal?: boolean;
};

export const works: FeaturedWork[] = [
  {
    title: "NILINK",
    slug: "nilink",
    tier: "primary",
    year: "2025",
    role: "Software Engineer",
    tagline:
      "A platform that connects college athletes with brands centralizing NIL deals.",
    description:
      "NILINK connects college athletes and local brands through discovery, campaign & application management and deal tracking adhering to NIL laws. This was a software engineering capstone project where my role was Full-Stack Software Engineer.",
    caseStudy: {
      why: "NIL—short for name, image, and likeness—allows college athletes to earn through sponsorships, endorsements, and other brand partnerships. Yet these deals often begin in direct messages, then fragment across spreadsheets, emails, and informal agreements. Athletes need a clear way to present their value, while local brands need a practical way to discover talent and manage each opportunity.",
      what: "NILINK is a two-sided NIL marketplace where college athletes showcase their audience, interests, and partnership offers, while brands discover relevant athletes and manage collaborations in one place. It replaces fragmented outreach and deal tracking with a shared workflow from discovery through completion.",
      how: "The platform uses Next.js and TypeScript for the athlete and brand experiences, Supabase for authentication and data storage, SWR for current marketplace activity, and Vitest to protect critical access and deal-state transitions.",
      decisions: [
        {
          title: "My role",
          detail:
            "I worked on the athlete & brand interfaces with authentication and role-based authorization, protected API flows, and developed explore, campaign, application, offer, and deal-management experiences and workflows.",
        },
        {
          title: "Requirements",
          detail:
            "We worked backward from the business and legal requirements of NIL partnerships to technology. Eligibility, contracts, deliverables, and so on were translated into product roles and clear actions for each side.",
        },
        {
          title: "Collaboration",
          detail:
            "We combined product, technical, and domain expertise. I contributed to the product design and technical architecture, while other team members focused on the database, project management and legal compliance.",
        },
      ],
      highlights: [
        {
          label: "Explore",
          src: "/projects_assets/NILINK/NILINK_product_img.png",
          alt: "The NILINK athlete explore view on a laptop, with popular and aligned athletes in a card grid above search and filters.",
        },
      ],
    },
    cover: "/projects_assets/NILINK/NILINK_product_img.png",
    coverAlt:
      "The NILINK athlete explore view open on a laptop, its card grid of athletes lit by afternoon shadow.",
    stack: ["Next.js", "Supabase", "TypeScript", "Vercel"],
    media: {
      kind: "video",
      src: "/projects_assets/NILINK/demo.mp4",
      aspectRatio: "16 / 9",
    },
    links: [
      { label: "Visit NILINK", href: "https://mvp-inky-eta.vercel.app/" },
    ],
  },
  {
    title: "Lucid Tone",
    slug: "lucid-tone",
    tier: "primary",
    year: "2025",
    role: "Founder",
    tagline:
      "Focus app that generates customizable background music in real time.",
    description:
      "A focus app that composes its audio in real time instead of looping a playlist. The engine paces every session through an entry, anchor, sustain, and re-focus arc, so the sound shifts with your attention rather than against it.",
    caseStudy: {
      why: "I built this app out of own experience: Finding the perfect background music to focus takes valuable time away from the actual work. Browsing several playlists to find that one track that fits your mood is tedious.",
      what: "I started Lucid Tone and built the real-time audio system behind it. Rather than serving another playlist, each session composes an evolving stream with fine-grained controls that shape the music around the listener’s mood.",

      how: "A FastAPI server runs a Markov chain–based music engine and streams each composition to the client over WebSockets. React and TypeScript power the listening interface, while Redis maintains session state and supports stream continuity across persistent connections.",

      decisions: [
        {
          title: "Compose instead of catalog",
          detail:
            "The generative engine is the product. A larger fixed library would only spread repetition across more tracks, eventually making the listening experience predictable and stale.",
        },
        {
          title: "Give attention an arc",
          detail:
            "Entry, anchor, sustain, and refocus phases give each session direction, allowing the music to support changing attention without requiring the listener to manage it.",
        },
        {
          title: "Treat egress as a constraint",
          detail:
            "Minimizing audio egress was a core engineering priority. The streaming format and delivery strategy were designed around the right balance of sound quality, performance, cost, and connection stability.",
        },
      ],
      highlights: [
        {
          label: "Session",
          src: "/projects_assets/LucidTone/lucidTone_product_img.png",
          alt: "The Lucid Tone focus app open mid-session, with its real-time audio arc on screen.",
        },
      ],
    },
    cover: "/projects_assets/LucidTone/lucidTone_product_img.png",
    coverAlt:
      "The Lucid Tone focus app open mid-session, its real-time audio arc on screen.",
    stack: ["React", "TypeScript", "Python", "FastAPI", "Redis"],
    media: {
      kind: "video",
      src: "/projects_assets/LucidTone/demo.mp4",
      aspectRatio: "1920 / 1246",
      poster: "/projects_assets/LucidTone/poster.jpg",
    },
    links: [],
  },
  {
    title: "Private Law",
    slug: "private-law",
    tier: "secondary",
    year: "2024",
    role: "Hackathon · Backend & LLM integration",
    tagline:
      "A research assistant that is completely local and keeps confidential files off the cloud.",
    archiveNote: "Completely local RAG agent for confidential legal records.",
    description:
      "A research assistant for law firms that can't ship documents to the cloud. Ingestion, embeddings, retrieval, and generation all run on local infrastructure, so decades of confidential records become searchable without a byte leaving the building.",
    caseStudy: {
      why: "Law firms have years of useful case files they cannot send to a cloud model. Privacy was not a setting; it decided the architecture.",
      what: "I handled backend logic and integration as part of a team. The prototype ingests a firm’s files, finds the relevant passages, and grounds a local model’s answer in them.",
      how: "Python chunks the documents, ChromaDB stores embeddings, and Ollama runs LLaMA locally. Streamlit shows the answer and its source context; Docker packages the private deployment.",
      decisions: [
        {
          title: "Move the whole pipeline inside",
          detail:
            "Ingestion, embeddings, retrieval, and generation all stay inside the same controlled boundary.",
        },
        {
          title: "Separate ingestion from answering",
          detail:
            "New files can enter the knowledge base without retraining the model.",
        },
        {
          title: "Show what the model used",
          detail:
            "Retrieved context stays visible, and RAG can be switched off to check what the model actually knows.",
        },
      ],
    },
    stack: ["Python", "Streamlit", "ChromaDB", "Ollama", "Docker"],
    media: {
      kind: "image",
      src: "/projects_assets/RAG/homescreen.png",
      aspectRatio: "770 / 488",
      alt: "The private legal assistant running locally: the model and ChromaDB collection it is connected to, the retrieval controls, and the question field.",
    },
    links: [
      {
        label: "Browse the code",
        href: "https://github.com/pratiush776/Private-Law-RAG-Agent",
      },
    ],
  },
  {
    title: "Whisk It All",
    slug: "whisk-it-all",
    tier: "primary",
    year: "2025",
    role: "Full-stack Engineer",
    tagline: "A local café  & bakery website optimized for homely experience.",
    description:
      "A real website for a real bakery. I led design and development for a local business owner: story, services, testimonials, and a CMS they update without calling me. Small project, real stakes, actual customers.",
    caseStudy: {
      why: "The business wanted to elevate their online presence. Similarly, they wanted a self-maintainable site to reduce external vendor dependencies for frequent updates.",
      what: "The outcome was a user-friendly and elegant website that tells a story. Also, story, services, testimonials, and menu now live together, with a light-weight and secure CMS for everyday updates.",
      how: "Next.js for the frontend and route handling; Tailwind & GSAP for the desing & motion. And, Tina CMS for the content management with Next.js middleware for secure authentication.",
      decisions: [
        {
          title: "Context",
          detail:
            "The owner’s story and the business's values builds trust for anyone to place an order. Therefore, the website is designed to tell a story and showcase the business's values.",
        },
        {
          title: "Why Tina CMS?",
          detail:
            "It integrates through github triggering a CI/CD pipeline whenever a change is triggered. Best for a site with low writes than read and is free.",
        },
        {
          title: "Motion",
          detail:
            "It has animations to elevate the handmade feel. It also makes the site feel alive and engaging, enhancing the user experience.",
        },
      ],
      highlights: [
        {
          label: "Site",
          src: "/projects_assets/WhiskItAll/whisk-it-all-product-img.png",
          alt: "The Whisk It All homepage open on a laptop at a café table, its custom-order and menu calls to action on screen.",
        },
      ],
    },
    cover: "/projects_assets/WhiskItAll/whisk-it-all-product-img.png",
    coverAlt:
      "The Whisk It All homepage open on a laptop at a café table, beside a latte, a croissant, and a printed specials card.",
    stack: ["Next.js", "Tailwind", "GSAP", "Tina CMS"],
    media: {
      kind: "video",
      src: "/projects_assets/WhiskItAll/demo.mp4",
      aspectRatio: "3570 / 1894",
      poster: "/projects_assets/WhiskItAll/poster.jpg",
    },
    links: [
      {
        label: "Visit Whisk It All",
        href: "https://whisk-it-all-official.onrender.com/",
      },
    ],
  },
  {
    title: "HomeDoc",
    slug: "homedoc",
    tier: "secondary",
    year: "2023",
    role: "Hackathon start · Finished solo",
    tagline:
      "A symptom checker that gives you a read, then sends you to a doctor.",
    archiveNote:
      "AI health diagnoser that predicts possible conditions based on input symptoms.",
    description:
      "A health insight prototype built around a local Llama 3 model. You give it your age, gender, and what you're feeling, and it returns a plain-language preliminary read — with the reminder, every time, that a real diagnosis comes from a healthcare professional.",
    caseStudy: {
      why: "Searching a symptom usually lands somewhere between useless and terrifying. The idea was a checker that reads the actual input and answers in proportion to it — which meant the hard constraint was what the thing is allowed to claim, not how well it generates text.",
      what: "It began at a hackathon with two teammates and did not get finished inside the weekend. I took it back afterwards and completed the prototype on my own: the AI layer was my part from the start, and the frontend and backend became mine too.",
      how: "React runs the intake, Node and Express carry the API, and Llama 3 generates the assessment. Age, gender, and symptoms go into the prompt together, so the response is about a person rather than about a word.",
      decisions: [
        {
          title: "Bound what it is allowed to claim",
          detail:
            "Every response carries the reminder to see a professional. The app offers a preliminary read, and it says so in the same breath.",
        },
        {
          title: "Ask for what changes the answer",
          detail:
            "Age and gender travel with the symptoms, because the same complaint does not mean the same thing across them.",
        },
        {
          title: "Finish it after the weekend ended",
          detail:
            "The hackathon build was a concept. Making it real meant owning the parts that were never my assignment.",
        },
      ],
    },
    stack: ["React", "Node", "Express", "Llama 3"],
    media: {
      kind: "video",
      src: "/projects_assets/HomeDoc/demo.mp4",
      aspectRatio: "1 / 1",
    },
    links: [
      {
        label: "Visit HomeDoc",
        href: "https://homedoc-backend.onrender.com/",
      },
    ],
  },
  {
    title: "RoomMates",
    slug: "roommates",
    tier: "secondary",
    year: "2022",
    role: "Solo build · First full-stack app",
    tagline:
      "A weekly chore rota housemates settle once instead of arguing about daily.",
    archiveNote:
      "Chore management web app project made for housemates. Built from scratch with Vanilla JS and Express.",
    description:
      "Household chore management for people sharing a flat. Housemates join a group, one of them lays out the week, and everybody else opens the app to a single question answered: what am I doing today.",
    caseStudy: {
      why: "Chores between housemates fail as a memory problem long before they fail as a fairness problem. What was missing was not effort but a shared record of who agreed to what, visible to everyone at once.",
      what: "My first application built end to end. Groups you create or join by ID, an admin screen that assigns tasks across Monday through Sunday and finalises the week, and a per-person view of the day.",
      how: "Node and Express serve the app; NeDB's promise API stores groups, members, and assignments as file-backed documents. No database server to stand up, which was the right size for a first full-stack build and kept the whole thing deployable as one process.",
      decisions: [
        {
          title: "Make the week a decision",
          detail:
            "The admin fills Monday through Sunday and finalises it, so the rota gets settled once rather than renegotiated every evening.",
        },
        {
          title: "Give everyone the smallest view",
          detail:
            "Once the week is set, a housemate's home screen is just Today. The full schedule exists, but nobody has to read it to know their part.",
        },
        {
          title: "Onboard with one field",
          detail:
            "A group is created or joined by ID, because an app for shared chores is worth nothing until the second person is in it.",
        },
      ],
      highlights: [
        {
          label: "Today",
          src: "/projects_assets/RoomMates/dashboard.png",
          alt: "The RoomMates home card headed Today, listing the day's chores each paired with the housemate assigned to it.",
        },
        {
          label: "Week",
          src: "/projects_assets/RoomMates/admin.png",
          alt: "The RoomMates admin screen with a Monday-to-Sunday rail beside the day's assigned tasks, a member picker, and a Finalize control.",
        },
        {
          label: "Group",
          src: "/projects_assets/RoomMates/welcome.png",
          alt: "The RoomMates welcome panel inviting a new user to create a group or join an existing one with a group ID.",
        },
      ],
    },
    stack: ["Node", "Express", "JavaScript", "NeDB"],
    media: {
      kind: "poster",
      word: "Whose turn is it?",
      caption: "A week of chores, agreed once.",
    },
    links: [
      {
        label: "Visit RoomMates",
        href: "https://roommatesapp.onrender.com/",
      },
    ],
  },
];

/** The primary-tier subset — the big cards in the landing grid. */
export const featured: FeaturedWork[] = works.filter(
  (work) => work.tier === "primary",
);

/** Look up a case work by its route slug — the /works/[slug] page's single entry point. Searches
    all `works`, so a secondary-tier case page (the RAG agent) still resolves even though it isn't
    in the grid. Returns undefined when nothing matches so the route can `notFound()`. */
export function getWork(slug: string): FeaturedWork | undefined {
  return works.find((work) => work.slug === slug);
}

/** The archive list: every secondary-tier case work, each row linking in to its own case page.
    Newest-first falls out of the `works` order — RAG (2024) → HomeDoc (2023) → RoomMates (2022). */
export const archive: ArchiveWork[] = works
  .filter((work) => work.tier === "secondary")
  .map((work) => ({
    title: work.title,
    year: work.year,
    note: work.archiveNote ?? work.description,
    href: `/works/${work.slug}`,
    internal: true,
  }));

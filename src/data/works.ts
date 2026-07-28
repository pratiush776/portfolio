/**
 * Real shipped work, modelled on two independent axes — *has a case page* vs *where it shows on
 * the landing page*:
 *  • `works` — every piece with a case page at /works/[slug]. Media is honest: a demo video
 *    where one exists, a typographic poster where the only artifacts are rough screenshots.
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
      kind: "poster";
      /** Big display word on the poster face. */
      word: string;
      /** Small caps line under the word. */
      caption: string;
      /** Poster field colour (keep it in the warm/plum family). */
      tint: string;
    };

export type CaseDecision = {
  /** A short, active description of the judgment — written as a thought, not a category label. */
  title: string;
  /** What the choice changed, protected, or made possible. */
  detail: string;
};

export type CaseArtifact = {
  src: string;
  alt: string;
  /** A human annotation: what to notice and why it mattered. */
  note: string;
  /** Preserves the real artifact without forcing every screenshot through one crop. */
  aspectRatio: string;
};

export type CaseStudy = {
  /** The result readers see directly after the demo. No invented metrics: shipped state, changed
      workflow, or demonstrated capability are valid outcomes when numbers do not exist. */
  outcome: string;
  /** Why the work needed to exist: problem and binding constraint. */
  why: string;
  /** What Pratiush owned and what actually shipped. */
  what: string;
  /** How the system was built, with enough technical detail to make the decisions credible. */
  how: string;
  /** Two or three project-specific decisions that expose judgment rather than list tasks. */
  decisions: CaseDecision[];
  /** Real screens that add evidence beyond the demo. Optional because a decision can be the
      stronger artifact when the repository does not contain a distinct, honest image. */
  artifacts?: CaseArtifact[];
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
  /** A photographed product still. Preferred as the frame image in the index and on the case
      page; falls back to the video's own poster frame when absent. */
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
    title: "NIL Marketplace",
    slug: "nilink",
    tier: "primary",
    year: "2025",
    role: "Software Engineer",
    tagline: "Athletes on one side. Brands on the other.",
    description:
      "A platform connecting college athletes and local brands through one streamlined deal workflow.",
    caseStudy: {
      outcome:
        "The shipped MVP gives both sides one place to move a deal from discovery to agreement.",
      why:
        "College athletes can earn from their name, image, and likeness, but the practical work still gets scattered across DMs, spreadsheets, and handshakes. For a local brand, even finding the right athlete can become its own project. The problem was not another profile directory; it was the broken handoff between discovery and a real agreement.",
      what:
        "I worked as the software engineer on the product and built the marketplace as two connected experiences. Athletes can present what they offer, brands can find the right fit, and both sides can keep the deal in one place. What shipped is a working MVP, not a concept deck.",
      how:
        "Next.js and Supabase carry the product surface, data, and authentication. TypeScript keeps the shared deal shapes honest, SWR keeps marketplace state fresh, and Vitest covers the boundaries where one side’s action changes what the other side sees.",
      decisions: [
        {
          title: "Keep the deal visible",
          detail:
            "Discovery, outreach, and agreement belong to one flow. Moving the handoff out of private messages makes the status legible to both sides.",
        },
        {
          title: "Respect the two sides",
          detail:
            "Athletes and brands need different entry points and permissions, but they still have to meet around one shared deal rather than two disconnected products.",
        },
        {
          title: "Test the handoffs",
          detail:
            "The risky moments are state changes and auth boundaries, so those are the parts the test suite protects instead of chasing broad, shallow coverage.",
        },
      ],
    },
    cover: "/projects_assets/NILINK/NILINK_product_img.png",
    coverAlt:
      "The NILINK marketplace open on a laptop, showing athlete and brand deal listings side by side.",
    // Headline tech first — the case meta line shows the first two.
    stack: ["Next.js", "Supabase", "TypeScript", "SWR", "Vitest"],
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
    description:
      "A focus app that composes its audio in real time instead of looping a playlist. The engine paces every session through an entry, anchor, sustain, and re-focus arc, so the sound shifts with your attention rather than against it.",
    caseStudy: {
      outcome:
        "The result is a focus session that changes with time instead of giving itself away as a loop.",
      why:
        "Most focus audio eventually gives itself away. Once I can predict the restart, the sound stops supporting attention and starts asking for it. I wanted music that behaved more like a work session: settle in, hold, then help you recover when attention drifts.",
      what:
        "I started Lucid Tone as my own product and built a real-time audio system that generates a changing stream for each session. Instead of asking someone to pick another playlist, it shapes the listening arc while they work.",
      how:
        "A Python and FastAPI service runs the composition engine while React and TypeScript own the session interface. Redis and persistent connections keep the long-running stream in step. The custom Markov Chain is there to vary the music with rules, not to sprinkle AI over a playlist.",
      decisions: [
        {
          title: "Compose instead of catalog",
          detail:
            "The product is the engine, not a shelf of tracks. That keeps the experience responsive to a session rather than limited by a fixed recording.",
        },
        {
          title: "Give attention an arc",
          detail:
            "Entry, anchor, sustain, and re-focus became the pacing model so the audio has somewhere to go without demanding a user’s attention.",
        },
        {
          title: "Treat continuity as product",
          detail:
            "A generative session only works if it feels unbroken, so persistent data flow, long-running processes, and fault tolerance shaped the architecture early.",
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
    title: "Private Law RAG Agent",
    slug: "private-law-rag",
    tier: "secondary",
    year: "2024",
    role: "Team build · Backend & integration",
    archiveNote:
      "Local-only RAG over confidential legal records — nothing leaves the building.",
    description:
      "A research assistant for law firms that can't ship documents to the cloud. Ingestion, embeddings, retrieval, and generation all run on local infrastructure, so decades of confidential records become searchable without a byte leaving the building.",
    caseStudy: {
      outcome:
        "The prototype retrieves from private files, shows the context behind each answer, and runs inside controlled infrastructure.",
      why:
        "A law firm may have decades of useful case material and still be unable to send any of it to a cloud model. Confidentiality changes the architecture before model choice even enters the conversation. The useful question was simple: can retrieval and generation stay inside the firm’s environment?",
      what:
        "I contributed the backend logic and system integration in a team build. The prototype ingests a firm’s own files, retrieves the relevant passages, and grounds a local model’s response in that material without uploading the source documents to a third party.",
      how:
        "Python handles ingestion and chunking, ChromaDB stores the embeddings, and Ollama runs LLaMA locally. A Streamlit interface exposes both the answer and its retrieved context, while Docker makes the pieces reproducible on a private machine or server.",
      decisions: [
        {
          title: "Move the whole pipeline inside",
          detail:
            "Local generation alone was not enough. Ingestion, embeddings, retrieval, and the model runtime all had to stay within the same controlled boundary.",
        },
        {
          title: "Separate ingestion from answering",
          detail:
            "New documents can be processed into the store without retraining the model, which keeps the knowledge base maintainable as the archive changes.",
        },
        {
          title: "Show what the model used",
          detail:
            "The interface exposes retrieved context and can disable RAG, making it possible to inspect where an answer came from instead of treating it as a black box.",
        },
      ],
      artifacts: [
        {
          src: "/projects_assets/RAG/homescreen.png",
          alt: "The private legal assistant home screen with a document question field and local RAG controls.",
          note:
            "The opening screen makes the boundary visible: this assistant answers from the records supplied to the private deployment.",
          aspectRatio: "770 / 488",
        },
        {
          src: "/projects_assets/RAG/example.png",
          alt: "A legal assistant response shown with the retrieved source context used to produce it.",
          note:
            "Retrieved context stays beside the response, so a useful answer can still be checked against the underlying material.",
          aspectRatio: "1038 / 592",
        },
      ],
    },
    stack: ["Python", "Streamlit", "ChromaDB", "Ollama", "Docker"],
    media: {
      kind: "poster",
      word: "Private, by design",
      caption: "Local-only RAG. Nothing leaves the building.",
      tint: "#3A2A22",
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
    role: "Client work · Design & build",
    description:
      "A real website for a real bakery. I led design and development for a local business owner: story, services, testimonials, and a CMS they update without calling me. Small project, real stakes, actual customers.",
    caseStudy: {
      outcome:
        "The bakery left with a live front door it can keep current without waiting on a developer.",
      why:
        "Whisk It All had a real business, a real owner, and no useful digital front door. The site had to feel personal enough for a neighborhood bakery, but practical enough to answer what people could order, why the business was different, and how to get in touch.",
      what:
        "I worked directly with the owner and carried the job from design through development and deployment. The finished site brings the story, services, testimonials, and contact into one place, then leaves the owner with a CMS instead of a dependency on me.",
      how:
        "Next.js and Tailwind carry the site, with GSAP used for the moments where motion adds some handmade warmth. Tina CMS keeps the content in the owner’s hands, which mattered more here than building an elaborate editing system nobody wanted to learn.",
      decisions: [
        {
          title: "Start with the person",
          detail:
            "The bakery’s story gives the products context and trust, so the site opens like a local business rather than an anonymous menu.",
        },
        {
          title: "Make updates boring",
          detail:
            "A familiar CMS flow means changing services or copy is routine. The handoff only works if the owner can keep using the site after mine ends.",
        },
        {
          title: "Let motion add warmth",
          detail:
            "Animation supports the handmade character, but ordering information and contact stay still, direct, and easy to find.",
        },
      ],
      artifacts: [
        {
          src: "/projects_assets/WhiskItAll/page.png",
          alt: "A full page from the Whisk It All bakery website showing its story, offerings, testimonials, and contact flow.",
          note:
            "The long page carries the business from story to proof to contact in one editable flow, without making customers learn a complicated site.",
          aspectRatio: "1170 / 1750",
        },
      ],
    },
    coverAlt:
      "The Whisk It All bakery site on screen — its story, menu, and booking laid out for local customers.",
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

/** The external-only pieces — no case page of their own, so their rows link straight out. */
const externalArchive: ArchiveWork[] = [
  {
    title: "HomeDoc",
    year: "2023",
    note: "AI symptom checker started at a hackathon, finished solo when the weekend ran out.",
    href: "https://homedoc-backend.onrender.com/",
  },
  {
    title: "RoomMates",
    year: "2022",
    note: "Chore management for housemates. My first full-stack app end to end.",
    href: "https://roommatesapp.onrender.com/",
  },
];

/** The archive list: secondary-tier case works (linking in to their own case page) above the
    external-only pieces. Newest-first falls out on its own — RAG (2024) → HomeDoc (2023) →
    RoomMates (2022). */
export const archive: ArchiveWork[] = [
  ...works
    .filter((work) => work.tier === "secondary")
    .map((work) => ({
      title: work.title,
      year: work.year,
      note: work.archiveNote ?? work.description,
      href: `/works/${work.slug}`,
      internal: true,
    })),
  ...externalArchive,
];

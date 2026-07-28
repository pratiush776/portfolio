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
      "A two-sided marketplace that keeps NIL deals out of scattered DMs.",
    description:
      "A platform connecting college athletes and local brands through one streamlined deal workflow.",
    caseStudy: {
      outcome:
        "A working MVP where athletes and brands can find each other and carry one deal through.",
      why:
        "NIL deals often start in a DM and disappear into spreadsheets and handshakes. Athletes need a clear way to show what they offer; local brands need a practical way to find them and follow a deal.",
      what:
        "As the software engineer, I built two connected experiences: athletes present their offers, brands find a fit, and both work from the same deal state.",
      how:
        "Next.js and Supabase handle the product, data, and authentication. TypeScript keeps deal shapes shared across both sides; SWR keeps listings current; Vitest protects auth and state changes.",
      decisions: [
        {
          title: "Keep the deal visible",
          detail:
            "Discovery, outreach, and agreement share one flow, so neither side has to rebuild the story from private messages.",
        },
        {
          title: "Respect the two sides",
          detail:
            "Athletes and brands get different permissions and entry points, but meet around the same deal.",
        },
        {
          title: "Test the handoffs",
          detail:
            "Tests focus on the moments when one person’s action changes what the other can see.",
        },
      ],
      highlights: [
        {
          label: "Product",
          src: "/projects_assets/NILINK/NILINK_product_img.png",
          alt: "The NILINK marketplace open on a laptop, showing athlete and brand deal listings side by side.",
        },
      ],
    },
    cover: "/projects_assets/NILINK/NILINK_product_img.png",
    coverAlt:
      "The NILINK marketplace open on a laptop, showing athlete and brand deal listings side by side.",
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
    tagline: "Focus music that composes itself as the session unfolds.",
    description:
      "A focus app that composes its audio in real time instead of looping a playlist. The engine paces every session through an entry, anchor, sustain, and re-focus arc, so the sound shifts with your attention rather than against it.",
    caseStudy: {
      outcome:
        "A live audio stream with a beginning, a middle, and a way back when focus slips.",
      why:
        "Looping focus tracks work until you can hear the restart. Once I noticed it, the sound became another interruption.",
      what:
        "I started Lucid Tone and built the real-time audio system behind it. Each session composes a changing stream instead of serving another playlist.",
      how:
        "A Python and FastAPI service runs a custom Markov Chain; React and TypeScript control the session; Redis and persistent connections keep the stream alive.",
      decisions: [
        {
          title: "Compose instead of catalog",
          detail:
            "The engine is the product. A fixed library would only hide the same looping problem behind more tracks.",
        },
        {
          title: "Give attention an arc",
          detail:
            "Entry, anchor, sustain, and re-focus give the music direction without asking the listener to manage it.",
        },
        {
          title: "Treat continuity as product",
          detail:
            "If the stream breaks, the idea breaks. Persistent playback shaped the architecture from the start.",
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
    title: "Private Law RAG Agent",
    slug: "private-law-rag",
    tier: "secondary",
    year: "2024",
    role: "Team build · Backend & integration",
    tagline:
      "A legal research assistant that keeps confidential files off the cloud.",
    archiveNote:
      "Local-only RAG over confidential legal records — nothing leaves the building.",
    description:
      "A research assistant for law firms that can't ship documents to the cloud. Ingestion, embeddings, retrieval, and generation all run on local infrastructure, so decades of confidential records become searchable without a byte leaving the building.",
    caseStudy: {
      outcome:
        "A private prototype that answers from local records and shows the context it used.",
      why:
        "Law firms have years of useful case files they cannot send to a cloud model. Privacy was not a setting; it decided the architecture.",
      what:
        "I handled backend logic and integration as part of a team. The prototype ingests a firm’s files, finds the relevant passages, and grounds a local model’s answer in them.",
      how:
        "Python chunks the documents, ChromaDB stores embeddings, and Ollama runs LLaMA locally. Streamlit shows the answer and its source context; Docker packages the private deployment.",
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
      highlights: [
        {
          label: "Home",
          src: "/projects_assets/RAG/homescreen.png",
          alt: "The private legal assistant home screen with a document question field and local RAG controls.",
        },
        {
          label: "Context",
          src: "/projects_assets/RAG/example.png",
          alt: "A legal assistant response shown with the retrieved source context used to produce it.",
        },
      ],
    },
    stack: ["Python", "Streamlit", "ChromaDB", "Ollama", "Docker"],
    media: {
      kind: "poster",
      word: "Private, by design",
      caption: "Local-only RAG. Nothing leaves the building.",
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
    tagline:
      "A bakery website the owner can update without calling a developer.",
    description:
      "A real website for a real bakery. I led design and development for a local business owner: story, services, testimonials, and a CMS they update without calling me. Small project, real stakes, actual customers.",
    caseStudy: {
      outcome:
        "A live front door for the bakery that stays in the owner’s hands.",
      why:
        "The bakery needed more than an online menu. Its site had to introduce the owner, explain dietary options, and make the business easy to reach.",
      what:
        "I worked directly with the owner and handled design, development, and deployment. Story, services, testimonials, and contact now live together, with a CMS for everyday updates.",
      how:
        "Next.js and Tailwind carry the site. GSAP adds warmth where it helps; Tina CMS keeps routine changes out of the codebase.",
      decisions: [
        {
          title: "Start with the person",
          detail:
            "The owner’s story builds trust before the site asks anyone to order.",
        },
        {
          title: "Make updates boring",
          detail:
            "Services and copy change through a familiar CMS instead of a developer handoff.",
        },
        {
          title: "Let motion add warmth",
          detail:
            "Animation carries the handmade feel; ordering details and contact stay direct.",
        },
      ],
      highlights: [
        {
          label: "Site",
          src: "/projects_assets/WhiskItAll/page.png",
          alt: "A full page from the Whisk It All bakery website showing its story, offerings, testimonials, and contact flow.",
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
  {
    title: "HomeDoc",
    slug: "homedoc",
    tier: "secondary",
    year: "2023",
    role: "Hackathon start · Finished solo",
    tagline:
      "A symptom checker that gives you a read, then sends you to a doctor.",
    archiveNote:
      "AI symptom checker started at a hackathon, finished solo when the weekend ran out.",
    description:
      "A health insight prototype built around a local Llama 3 model. You give it your age, gender, and what you're feeling, and it returns a plain-language preliminary read — with the reminder, every time, that a real diagnosis comes from a healthcare professional.",
    caseStudy: {
      outcome:
        "A finished prototype that turns symptoms into a readable assessment and never presents it as a diagnosis.",
      why:
        "Searching a symptom usually lands somewhere between useless and terrifying. The idea was a checker that reads the actual input and answers in proportion to it — which meant the hard constraint was what the thing is allowed to claim, not how well it generates text.",
      what:
        "It began at a hackathon with two teammates and did not get finished inside the weekend. I took it back afterwards and completed the prototype on my own: the AI layer was my part from the start, and the frontend and backend became mine too.",
      how:
        "React runs the intake, Node and Express carry the API, and Llama 3 generates the assessment. Age, gender, and symptoms go into the prompt together, so the response is about a person rather than about a word.",
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
    tagline: "A weekly chore rota housemates settle once instead of arguing about daily.",
    archiveNote:
      "Chore management for housemates. My first full-stack app end to end.",
    description:
      "Household chore management for people sharing a flat. Housemates join a group, one of them lays out the week, and everybody else opens the app to a single question answered: what am I doing today.",
    caseStudy: {
      outcome:
        "A working rota app where one housemate builds the week and everyone else just sees today.",
      why:
        "Chores between housemates fail as a memory problem long before they fail as a fairness problem. What was missing was not effort but a shared record of who agreed to what, visible to everyone at once.",
      what:
        "My first application built end to end. Groups you create or join by ID, an admin screen that assigns tasks across Monday through Sunday and finalises the week, and a per-person view of the day.",
      how:
        "Node and Express serve the app; NeDB's promise API stores groups, members, and assignments as file-backed documents. No database server to stand up, which was the right size for a first full-stack build and kept the whole thing deployable as one process.",
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

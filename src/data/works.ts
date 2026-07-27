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
      /** First-frame still shown before the video downloads/plays — keeps the frame from
          flashing an empty black box while preload="none" defers the actual video. */
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
  /** The fuller case write-up, one paragraph per entry — the dedicated /works page renders these
      in order under the brief. Optional and honest: it expands the REAL story (problem / how I built
      it / where it landed) from `description` + `stack`, inventing no metrics. When unset the case
      page falls back to `description`. */
  caseBody?: string[];
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
    title: "NILINK",
    slug: "nilink",
    tier: "primary",
    year: "2025",
    role: "Software Engineer",
    tagline: "Athletes on one side. Brands on the other.",
    description:
      "A platform centralizing NIL deals end-to-end for college athletes and local brands.",
    caseBody: [
      "College athletes can finally earn from their name, image, and likeness — but the deal-making is scattered across DMs, spreadsheets, and handshakes. NILINK pulls the whole cycle onto one platform: athletes list what they offer, local brands browse and reach out, and the agreement lives in one place instead of a group chat.",
      "I built it as a two-sided marketplace on Next.js and Supabase, with TypeScript across the stack and SWR handling the data fetching so listings stay fresh without a heavy client. Vitest covers the pieces I couldn't afford to get wrong — the deal state and the auth boundaries between the two sides.",
    ],
    cover: "/projects_assets/NILINK/NILINK_product_img.png",
    coverAlt:
      "The NILINK marketplace open on a laptop, showing athlete and brand deal listings side by side.",
    // Headline tech first — the case meta line shows the first two.
    stack: ["Next.js", "Supabase", "TypeScript", "SWR", "Vitest"],
    media: {
      kind: "video",
      src: "/projects_assets/NILINK/demo.mp4",
    },
    links: [{ label: "Visit live", href: "https://mvp-inky-eta.vercel.app/" }],
  },
  {
    title: "Lucid Tone",
    slug: "lucid-tone",
    tier: "primary",
    year: "2025",
    role: "Founder",
    description:
      "A focus app that composes its audio in real time instead of looping a playlist. The engine paces every session through an entry, anchor, sustain, and re-focus arc, so the sound shifts with your attention rather than against it.",
    caseBody: [
      "Most focus apps hand you a looping playlist and hope it works. Lucid Tone starts from a different premise: attention has a shape over time, so the sound should too. Instead of replaying a fixed track, the engine composes each session live, pacing it through an entry, an anchor, a sustain, and a re-focus arc.",
      "The audio engine is a Python and FastAPI service that generates and shapes the arc, driving a React and TypeScript front end that keeps the session state and controls in step with what's playing. It's my own product — the founder call was to make the composition the feature, not a library of loops.",
    ],
    cover: "/projects_assets/LucidTone/lucidTone_product_img.png",
    coverAlt:
      "The Lucid Tone focus app open mid-session, its real-time audio arc on screen.",
    stack: ["React", "TypeScript", "Python", "FastAPI"],
    media: {
      kind: "video",
      src: "/projects_assets/LucidTone/demo.mp4",
      poster: "/projects_assets/LucidTone/poster.jpg",
    },
    links: [],
  },
  {
    title: "Private Law RAG Agent",
    slug: "private-law-rag",
    tier: "secondary",
    year: "2024",
    role: "Solo build",
    archiveNote:
      "Local-only RAG over confidential legal records — nothing leaves the building.",
    description:
      "A research assistant for law firms that can't ship documents to the cloud. Ingestion, embeddings, retrieval, and generation all run on local infrastructure, so decades of confidential records become searchable without a byte leaving the building.",
    caseBody: [
      "Law firms sit on decades of case files they can't send to a cloud API — privilege and confidentiality rule that out. So the useful question isn't \"which model,\" it's \"can the whole pipeline run inside the building.\" This agent answers yes: ingestion, embeddings, retrieval, and generation all stay local.",
      "I built it end to end as a solo project — ChromaDB holds the embeddings, Ollama runs the model on local hardware, and the whole thing ships in Docker so a firm can stand it up without wiring services together by hand. The result is a searchable assistant over confidential records where nothing leaves the premises.",
    ],
    stack: ["Python", "ChromaDB", "Ollama", "Docker"],
    media: {
      kind: "poster",
      word: "Private, by design",
      caption: "Local-only RAG. Nothing leaves the building.",
      tint: "#3A2A22",
    },
    links: [
      {
        label: "View code",
        href: "https://github.com/pratiush776/Private-Law-RAG-Agent",
      },
    ],
  },
  {
    title: "Whisk It All",
    slug: "whisk-it-all",
    tier: "primary",
    year: "2024",
    role: "Client work · Design & build",
    description:
      "A real website for a real bakery. I led design and development for a local business owner: story, services, testimonials, and a CMS they update without calling me. Small project, real stakes, actual customers.",
    caseBody: [
      "A local bakery owner needed a real website, not a template — somewhere to tell their story, list services, show testimonials, and be found by actual customers. I owned both sides of it: the design and the build. Small project on paper, but real stakes, because a business's front door was riding on it.",
      "It's a Next.js and Tailwind site with GSAP carrying the motion, and — the part that mattered most to the client — a Tina CMS so they can update their own copy and content without calling me. The brief was to hand over something they'd keep using, and a self-serve CMS was how I made sure of that.",
    ],
    coverAlt:
      "The Whisk It All bakery site on screen — its story, menu, and booking laid out for local customers.",
    stack: ["Next.js", "Tailwind", "GSAP", "Tina CMS"],
    media: {
      kind: "video",
      src: "/projects_assets/WhiskItAll/demo.mp4",
      poster: "/projects_assets/WhiskItAll/poster.jpg",
    },
    links: [
      {
        label: "Visit live",
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

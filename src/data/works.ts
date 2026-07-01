/**
 * Real shipped work, in two tiers:
 *  • `featured` — the four case panels on the landing page. Media is honest: a demo video
 *    where one exists, a typographic poster where the only artifacts are rough screenshots
 *    (a designed cover reads deliberate; a blurry capture reads careless).
 *  • `archive` — the smaller pieces. NOT rendered on the landing page (by design); reserved
 *    for the upcoming dedicated /works page that lists the full catalogue.
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
  year: string;
  role: string;
  /** Short editorial category for the cinematic stage's rotated label (e.g. "NIL Marketplace").
      Optional — the stage falls back to the role line when absent. */
  kicker?: string;
  /** A short, definition-style gloss shown under the project name (Serendipity DNA). Optional. */
  tagline?: string;
  /** First-person, concrete. This is the human voice of the section. */
  description: string;
  /** A photographed product still shown as the editorial spread's bleed image (the laptop scene
      on the lead spread). The demo `media` still drives the play-in-place / detail-overlay video.
      Optional — only the recomposed editorial spreads use it. */
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
};

export const featured: FeaturedWork[] = [
  {
    title: "NILINK",
    year: "2025",
    role: "Software Engineer",
    kicker: "NIL Marketplace",
    tagline: "Athletes on one side. Brands on the other.",
    description:
      "A platform centralizing NIL deals end-to-end for college athletes and local brands.",
    cover: "/projects_assets/NILINK/NILINK_product_img.png",
    coverAlt:
      "The NILINK marketplace open on a laptop, showing athlete and brand deal listings side by side.",
    // Headline tech first — the spread meta shows the first two as "Next.js / Supabase".
    stack: ["Next.js", "Supabase", "TypeScript", "SWR", "Vitest"],
    media: {
      kind: "video",
      src: "/projects_assets/NILINK/demo.mp4",
      poster: "/projects_assets/NILINK/poster.jpg",
    },
    links: [{ label: "Visit live", href: "https://mvp-inky-eta.vercel.app/" }],
  },
  {
    title: "Lucid Tone",
    year: "2025",
    role: "Founder",
    description:
      "A focus app that composes its audio in real time instead of looping a playlist. The engine paces every session through an entry, anchor, sustain, and re-focus arc, so the sound shifts with your attention rather than against it.",
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
    year: "2024",
    role: "Solo build",
    description:
      "A research assistant for law firms that can't ship documents to the cloud. Ingestion, embeddings, retrieval, and generation all run on local infrastructure, so decades of confidential records become searchable without a byte leaving the building.",
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
    year: "2024",
    role: "Client work · Design & build",
    description:
      "A real website for a real bakery. I led design and development for a local business owner: story, services, testimonials, and a CMS they update without calling me. Small project, real stakes, actual customers.",
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

export const archive: ArchiveWork[] = [
  {
    title: "HomeDoc",
    year: "2023",
    note: "AI symptom checker started at a hackathon, finished solo when the weekend ran out.",
    href: "https://homedoc-backend.onrender.com/",
  },
  {
    title: "Whisk It All — business card",
    year: "2023",
    note: "QR-scannable digital card for the same bakery, before the full site.",
    href: "https://whisk-it-all-business.web.app/",
  },
  {
    title: "RoomMates",
    year: "2022",
    note: "Chore management for housemates. My first full-stack app end to end.",
    href: "https://roommatesapp.onrender.com/",
  },
];

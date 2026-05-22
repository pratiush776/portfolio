export type CaseStudyType = "deep" | "snapshot";

export type Media = {
  kind: "video" | "image";
  src: string;
  poster?: string;
};

export type ProcessBeat = {
  heading: string;
  body: string;
  media?: Media;
};

export type OutcomeMetric = {
  label: string;
  value: string;
};

export type Outcome = {
  summary: string;
  metrics?: OutcomeMetric[];
};

export type ProjectLinks = {
  live?: string;
  repo?: string;
};

export type Project = {
  // existing
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  techStack: string[];
  logo: string;
  url: string;
  imgs?: string[];
  videos?: string[];

  // new — required
  slug: string;
  year: number;
  role: string;
  caseStudyType: CaseStudyType;

  // new — optional, used by deep variant
  timeline?: string;
  hero?: Media;
  context?: string;
  problem?: string;
  process?: ProcessBeat[];
  outcome?: Outcome;
  reflection?: string;
  links?: ProjectLinks;
};

export const projects: Project[] = [
  {
    id: 6,
    title: "NILINK",
    description:
      "A full-stack NIL marketplace connecting college athletes and brands",
    fullDescription:
      "NILINK is a two-sided Name, Image, and Likeness marketplace built as a software engineering capstone MVP. Athletes can create verified profiles, showcase social metrics and content, discover brand campaigns, apply to opportunities, review offers, and manage active deals. Brands can build company profiles, launch campaigns, search athletes, review applications, send offers, upload contracts, track deliverables, and manage payouts from a role-aware dashboard.",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Supabase",
      "SWR",
      "Recharts",
      "Framer Motion",
      "Lucide React",
      "Nodemailer",
      "Vitest",
      "Vercel",
    ],
    logo: "/projects_assets/NILINK/logo.png",
    url: "https://mvp-inky-eta.vercel.app/",

    slug: "nilink",
    year: 2025,
    role: "Solo developer",
    caseStudyType: "deep",
    // TODO(user): "14 weeks" / "Hackathon weekend + 2 weeks solo" etc
    timeline: undefined,
    hero: {
      kind: "image",
      src: "/projects_assets/NILINK/logo.png",
    },
    context:
      "NILINK is a two-sided Name, Image, and Likeness marketplace built as a software engineering capstone MVP.\n\nAthletes can create verified profiles, showcase social metrics and content, discover brand campaigns, apply to opportunities, review offers, and manage active deals.\n\nBrands can build company profiles, launch campaigns, search athletes, review applications, send offers, upload contracts, track deliverables, and manage payouts from a role-aware dashboard.",
    // TODO(user): 1-2 paragraphs on the actual pain this solved
    problem: undefined,
    // TODO(user): 3-5 decision-moment beats — what trade-offs you made and why
    process: undefined,
    outcome: {
      summary:
        "Shipped a two-sided marketplace MVP with role-aware dashboards for athletes and brands end-to-end.",
      // TODO(user): real numbers only, or omit
      metrics: undefined,
    },
    // TODO(user): 1 paragraph on what you'd do differently
    reflection: undefined,
    links: {
      live: "https://mvp-inky-eta.vercel.app/",
    },
  },
  {
    id: 5,
    title: "Lucid Tone",
    description:
      "An intelligent, adaptive soundscape engine designed to engineer focus",
    fullDescription:
      "Lucid Tone is a premium focus application that generates endless, personalized audio streams in real-time. Moving beyond static playlists, it actively shapes the listener's audio environment. By structuring music around a scientifically grounded \"Entry → Anchor → Sustain → Re-focus\" (EASR) arc, the system dynamically adapts its generation to align with the brain's natural cognitive processing and fatigue cycles. Built with a custom procedural generative engine (Python/FastAPI) and a highly polished interactive frontend (React/TypeScript), Lucid Tone offers multiple focus modes including Lo-Fi, Meditation, and Neoclassical.",
    techStack: ["React", "TypeScript", "Python", "FastAPI", "TailwindCSS"],
    logo: "/projects_assets/LucidTone/logo.svg",
    url: "",
    videos: ["/projects_assets/LucidTone/demo.mp4"],

    slug: "lucid-tone",
    year: 2025,
    role: "Solo developer",
    caseStudyType: "deep",
    // TODO(user): "14 weeks" / "Hackathon weekend + 2 weeks solo" etc
    timeline: undefined,
    hero: {
      kind: "video",
      src: "/projects_assets/LucidTone/demo.mp4",
    },
    context:
      "Lucid Tone is a premium focus application that generates endless, personalized audio streams in real-time. Moving beyond static playlists, it actively shapes the listener's audio environment.\n\nBy structuring music around a scientifically grounded \"Entry → Anchor → Sustain → Re-focus\" (EASR) arc, the system dynamically adapts its generation to align with the brain's natural cognitive processing and fatigue cycles.\n\nBuilt with a custom procedural generative engine (Python/FastAPI) and a highly polished interactive frontend (React/TypeScript), Lucid Tone offers multiple focus modes including Lo-Fi, Meditation, and Neoclassical.",
    // TODO(user): 1-2 paragraphs on the actual pain this solved
    problem: undefined,
    // TODO(user): 3-5 decision-moment beats — what trade-offs you made and why
    process: undefined,
    outcome: {
      summary:
        "Shipped a real-time procedural audio engine with multiple focus modes (Lo-Fi, Meditation, Neoclassical).",
      // TODO(user): real numbers only, or omit
      metrics: undefined,
    },
    // TODO(user): 1 paragraph on what you'd do differently
    reflection: undefined,
    links: {},
  },
  {
    id: 0,
    title: "Private Law RAG Agent",
    description: "Privacy Perserving Retrieval Augmented Generation Agent",
    fullDescription:
      "Many organizations, especially in law, healthcare, and finance, struggle to use large language models due to serious data privacy concerns. Cloud-based LLMs risk exposing sensitive or client-owned information, making them impractical for tasks like searching decades of confidential records, which are still handled manually at high cost and with frequent errors. <br>This project introduces a privacy-first, RAG-powered legal assistant that runs entirely on local or private infrastructure. All documents are processed and embedded locally, ensuring no data leaves the system. By using retrieval-augmented generation and a modular design, the system delivers accurate, secure insights while allowing new data to be added without retraining.",
    techStack: ["Python", "Streamlit", "ChromaDB", "LLaMAa(Ollama)", "Docker"],
    logo: "/projects_assets/RAG/logo.png",
    url: "https://github.com/pratiush776/Private-Law-RAG-Agent",
    imgs: ["/projects_assets/RAG/homescreen.png"],

    slug: "rag-legal-agent",
    year: 2024,
    role: "Solo developer",
    caseStudyType: "deep",
    // TODO(user): "14 weeks" / "Hackathon weekend + 2 weeks solo" etc
    timeline: undefined,
    hero: {
      kind: "image",
      src: "/projects_assets/RAG/homescreen.png",
    },
    context:
      "Many organizations, especially in law, healthcare, and finance, struggle to use large language models due to serious data privacy concerns. Cloud-based LLMs risk exposing sensitive or client-owned information, making them impractical for tasks like searching decades of confidential records, which are still handled manually at high cost and with frequent errors.\n\nThis project introduces a privacy-first, RAG-powered legal assistant that runs entirely on local or private infrastructure. All documents are processed and embedded locally, ensuring no data leaves the system.\n\nBy using retrieval-augmented generation and a modular design, the system delivers accurate, secure insights while allowing new data to be added without retraining.",
    // TODO(user): 1-2 paragraphs on the actual pain this solved
    problem: undefined,
    // TODO(user): 3-5 decision-moment beats — what trade-offs you made and why
    process: undefined,
    outcome: {
      summary:
        "Shipped a fully local RAG pipeline that ingests, embeds, and queries confidential documents without leaving private infrastructure.",
      // TODO(user): real numbers only, or omit
      metrics: undefined,
    },
    // TODO(user): 1 paragraph on what you'd do differently
    reflection: undefined,
    links: {
      repo: "https://github.com/pratiush776/Private-Law-RAG-Agent",
    },
  },
  {
    id: 1,
    title: "Whisk It All",
    description: "Professional Business Website",
    fullDescription:
      "Whisk It All is a professional business website designed to showcase the services and offerings of a local business. The website features a clean and modern design, with easy navigation and a focus on user experience. It includes sections for the business's story, services, testimonials, and contact information, all presented in a visually appealing manner. This project was a collaboration with the business owner, where I took the lead on the design and development aspects. My goal was to create a website that not only looks great but also effectively communicates the brand's message.",
    techStack: ["Next.js", "Tailwind", "GSAP", "Tina CMS"],
    logo: "/projects_assets/WhiskItAll/logo.png",
    url: "https://whisk-it-all-official.onrender.com/",
    videos: ["/projects_assets/WhiskItAll/demo.mp4"],

    slug: "whisk-it-all",
    year: 2024,
    role: "Design + frontend, solo",
    caseStudyType: "deep",
    // TODO(user): "14 weeks" / "Hackathon weekend + 2 weeks solo" etc
    timeline: undefined,
    hero: {
      kind: "video",
      src: "/projects_assets/WhiskItAll/demo.mp4",
    },
    context:
      "Whisk It All is a professional business website designed to showcase the services and offerings of a local business. The website features a clean and modern design, with easy navigation and a focus on user experience.\n\nIt includes sections for the business's story, services, testimonials, and contact information, all presented in a visually appealing manner.\n\nThis project was a collaboration with the business owner, where I took the lead on the design and development aspects. My goal was to create a website that not only looks great but also effectively communicates the brand's message.",
    // TODO(user): 1-2 paragraphs on the actual pain this solved
    problem: undefined,
    // TODO(user): 3-5 decision-moment beats — what trade-offs you made and why
    process: undefined,
    outcome: {
      summary:
        "Shipped a content-managed marketing site for a local business, covering story, services, testimonials, and contact.",
      // TODO(user): real numbers only, or omit
      metrics: undefined,
    },
    // TODO(user): 1 paragraph on what you'd do differently
    reflection: undefined,
    links: {
      live: "https://whisk-it-all-official.onrender.com/",
    },
  },
  {
    id: 2,
    title: "HomeDoc",
    description: "Diasease Diagnosis App using AI",
    fullDescription:
      "Home Doc is a health insight platform powered by AI (Llama3), designed to provide a Symptom Checker for quick, preliminary health assessments. Users can input their age, gender, and symptoms to receive personalized insights, with the reminder to consult a healthcare professional for definitive diagnoses. This project began as a concept app during a hackathon, where I collaborated with two teammates. Although we couldn't complete it in time, I later took the initiative to finish the prototype independently. My primary role was implementing the AI functionality, but I also developed the frontend and backend, transforming it into a comprehensive personal project.",
    techStack: ["Llama3", "Node", "React", "Express"],
    logo: "/projects_assets/HomeDoc/logo.png",
    url: "https://homedoc-backend.onrender.com/",
    videos: ["/projects_assets/HomeDoc/demo.mp4"],

    slug: "homedoc",
    year: 2023,
    role: "Hackathon team (3) → solo continuation",
    caseStudyType: "snapshot",
    hero: {
      kind: "video",
      src: "/projects_assets/HomeDoc/demo.mp4",
    },
    context:
      "Home Doc is a health insight platform powered by AI (Llama3), designed to provide a Symptom Checker for quick, preliminary health assessments. Users input their age, gender, and symptoms to receive personalized insights, with the reminder to consult a healthcare professional for definitive diagnoses.\n\nThis project began as a hackathon concept with two teammates. We didn't complete it in time, so I later took the initiative to finish the prototype independently — owning the AI functionality, frontend, and backend.",
    links: {
      live: "https://homedoc-backend.onrender.com/",
    },
  },
  {
    id: 3,
    title: "RoomMates",
    description: "Full stack home management app",
    fullDescription:
      "This app enables its users to manage household chores among their pals by adding each others in groups and creating tasks for one another.",
    techStack: ["Node", "JS", "NEDB Promises", "Express"],
    logo: "/projects_assets/RoomMates/logo.png",
    url: "https://roommatesapp.onrender.com/",
    imgs: [
      "/projects_assets/RoomMates/dashboard.png",
      "/projects_assets/RoomMates/login.png",
      "/projects_assets/RoomMates/admin.png",
      "/projects_assets/RoomMates/welcome.png",
    ],

    slug: "roommates",
    year: 2022,
    role: "Solo developer",
    caseStudyType: "snapshot",
    hero: {
      kind: "image",
      src: "/projects_assets/RoomMates/dashboard.png",
    },
    context:
      "RoomMates is a small full-stack app for managing household chores among friends. Users form groups and assign tasks to each other.\n\nIt was an early exercise in building a complete CRUD experience — auth, groups, tasks, and an admin view — on a lightweight Node + NEDB stack.",
    links: {
      live: "https://roommatesapp.onrender.com/",
    },
  },
  {
    id: 4,
    title: "Whisk It All",
    description: "Digital Business Card",
    fullDescription:
      "I created a digital business card for an actual local busniess. The was a digital business card which could be scanned as a QR Code then the customers would be directed to this webpage when all the details and links were available to them in a neat and friendly manner.",
    techStack: ["React", "CSS", "JS"],
    logo: "/projects_assets/WhiskItAll/logo.png",
    url: "https://whisk-it-all-business.web.app/",
    imgs: ["/projects_assets/WhiskItAll/page.png"],

    slug: "whisk-it-all-card",
    year: 2023,
    role: "Design + frontend, solo",
    caseStudyType: "snapshot",
    hero: {
      kind: "image",
      src: "/projects_assets/WhiskItAll/page.png",
    },
    context:
      "A digital business card for a real local business. The card was scannable as a QR code that directed customers to a single webpage containing all of the business's details and links.\n\nThe goal was a tidy, friendly landing surface that felt as approachable as the shop it represented.",
    links: {
      live: "https://whisk-it-all-business.web.app/",
    },
  },
];

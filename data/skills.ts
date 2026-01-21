export interface Skill {
  name: string;
  logo: string;
  link: string;
}

export interface SkillsCategory {
  Frontend?: Skill[];
  Backend?: Skill[];
  Database?: Skill[];
  Animations?: Skill[];
  "UI/UX"?: Skill[];
  "Programming Languages"?: Skill[];
  "Ai Integrations"?: Skill[];
}

export const skills = [
  {
    Frontend: [
      {
        name: "Next.js",
        logo: "/tech_logos/NEXTJS.svg",
        link: "https://nextjs.org/",
      },
      {
        name: "React",
        logo: "/tech_logos/REACT.svg",
        link: "https://reactjs.org/",
      },
      {
        name: "Tailwind CSS",
        logo: "/tech_logos/TAILWIND.svg",
        link: "https://tailwindcss.com/",
      },
      {
        name: "TypeScript",
        logo: "/tech_logos/TYPESCRIPT.svg",
        link: "https://www.typescriptlang.org/",
      },
      {
        name: "Vanilla JS",
        logo: "/tech_logos/JAVASCRIPT.svg",
        link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      },
      {
        name: "HTML",
        logo: "/tech_logos/HTML.svg",
        link: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      },
      {
        name: "CSS",
        logo: "/tech_logos/CSS.svg",
        link: "https://developer.mozilla.org/en-US/docs/Web/CSS",
      },
      {
        name: "SASS",
        logo: "/tech_logos/SASS.svg",
        link: "https://sass-lang.com/",
      },
    ],
  },
  {
    Backend: [
      {
        name: "Node.js",
        logo: "/tech_logos/NODE.svg",
        link: "https://nodejs.org/",
      },
      {
        name: "Express",
        logo: "/tech_logos/EXPRESS.svg",
        link: "https://expressjs.com/",
      },
      {
        name: "Next.js",
        logo: "/tech_logos/NEXTJS.svg",
        link: "https://nextjs.org/",
      },
      {
        name: "Firebase",
        logo: "/tech_logos/FIREBASE.svg",
        link: "https://firebase.google.com/",
      },
      {
        name: "GitHub",
        logo: "/tech_logos/GITHUB.svg",
        link: "https://github.com/",
      },
    ],
  },
  {
    "Ai Integrations": [
      {
        name: "ChatGPT",
        logo: "/tech_logos/OPENAI.svg",
        link: "https://openai.com/chatgpt",
      },
      {
        name: "Illama",
        logo: "/tech_logos/ILLAMA.svg",
        link: "https://github.com/facebookresearch/llama",
      },
      {
        name: "Deepseek",
        logo: "/tech_logos/DEEPSEEK.svg",
        link: "https://deepseek.ai/",
      },
      {
        name: "GROQ",
        logo: "/tech_logos/GROQ.svg",
        link: "https://www.sanity.io/docs/groq",
      },
    ],
  },
  {
    Database: [
      {
        name: "MongoDB",
        logo: "/tech_logos/MONGODB.svg",
        link: "https://www.mongodb.com/",
      },
      {
        name: "SQL",
        logo: "/tech_logos/SQL.svg",
        link: "https://www.mysql.com/",
      },
      {
        name: "Firebase",
        logo: "/tech_logos/FIREBASE.svg",
        link: "https://firebase.google.com/",
      },
      {
        name: "Django",
        logo: "/tech_logos/DJANGO.svg",
        link: "https://www.djangoproject.com/",
      },
      {
        name: "Nedb Promises",
        logo: "/tech_logos/NEDB.svg",
        link: "https://www.npmjs.com/package/nedb-promises",
      },
    ],
  },
  {
    Animations: [
      {
        name: "Framer Motion",
        logo: "/tech_logos/FRAMER.svg",
        link: "https://www.framer.com/motion/",
      },
      {
        name: "GSAP",
        logo: "/tech_logos/GSAP.svg",
        link: "https://greensock.com/gsap/",
      },
      {
        name: "CSS Animations",
        logo: "/tech_logos/CSS.svg",
        link: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations",
      },
    ],
  },
  {
    "UI/UX": [
      {
        name: "Figma",
        logo: "/tech_logos/FIGMA.svg",
        link: "https://www.figma.com/",
      },
      {
        name: "Adobe Illustrator",
        logo: "/tech_logos/ILLUSTRATOR.svg",
        link: "https://www.adobe.com/products/illustrator.html",
      },
    ],
  },
  {
    "Programming Languages": [
      {
        name: "JavaScript",
        logo: "/tech_logos/JAVASCRIPT.svg",
        link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      },
      {
        name: "Python",
        logo: "/tech_logos/PYTHON.svg",
        link: "https://www.python.org/",
      },
    ],
  },
];

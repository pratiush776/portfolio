export const projects = [
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
  },
];

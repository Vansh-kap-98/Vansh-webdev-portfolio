import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExpertiseItem {
  text: string;
  color: string;
}

export interface OtherProject {
  name: string;
  description: string;
  /** Omit when there is no public link yet — the card renders as plain text. */
  url?: string;
  category: string;
  /** Short, concrete result line shown under the description. */
  highlight?: string;
  year?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ContentStore {
  // Hero Section
  heroHeading: string[];
  heroSubtext: string;
  heroCornerLabel: string;
  heroCornerSublabel: string;

  // About Section
  aboutLabel: string;
  aboutText: string;
  aboutExpertise: ExpertiseItem[];
  aboutTechnologies: string[];
  aboutStats: StatItem[];
  otherProjects: OtherProject[];

  // Header
  headerLogo: string;

  // Footer
  footerHeading: string;
  footerEmail: string;
  footerCopyright: string;
  footerTagline: string;

  // Page Content
  aboutPageHeading: string;
  aboutPageSubtext: string;
  aboutBackgroundText: string;
  aboutApproachText: string;
  processPageHeading: string;
  processPageSubtext: string;
  contactPageHeading: string;
  contactPageSubtext: string;
  contactEmail: string;
  contactLocation: string;
  contactResponseTime: string;

  // Actions
  updateContent: (key: keyof Omit<ContentStore, 'updateContent' | 'resetContent'>, value: any) => void;
  resetContent: () => void;
}

const defaultContent = {
  heroHeading: ['VANSH', 'KAPOOR', '/', 'CREATIVE', 'DEVELOPER'],
  heroSubtext: 'Building immersive digital experiences with Three.js, GSAP, and WebGL',
  heroCornerLabel: 'V-DESIGNS',
  heroCornerSublabel: 'STUDIO',

  aboutLabel: 'ABOUT / PHILOSOPHY',
  aboutText: "I'm a creative developer obsessed with crafting immersive web experiences. My expertise lies at the intersection of design, technology, and storytelling — where pixels meet purpose.",
  aboutExpertise: [
    { text: 'WebGL, Three.js & React Three Fiber', color: '#2DD4BF' },
    { text: 'Interactive frontend architecture (React / TypeScript)', color: '#22D3EE' },
    { text: 'Motion design with GSAP & scroll-linked systems', color: '#C084FC' },
    { text: 'Applied ML — generative models, RAG, agentic pipelines', color: '#FB923C' },
    { text: 'Systems & open source (C++, CMake, performance work)', color: '#06B6D4' },
  ],
  aboutTechnologies: [
    'React', 'Three.js', 'WebGL', 'GSAP', 'TypeScript', 'JavaScript',
    'Python', 'C++', 'Dart', 'SQL',
    'Flutter', 'Electron', 'Node.js', 'Flask', 'Django',
    'PostgreSQL', 'MongoDB', 'Supabase', 'Firestore',
    'TensorFlow', 'Scikit-learn', 'FAISS', 'Gemini API', 'Google ADK',
    'GCP (Vertex AI, Cloud Run)', 'Docker', 'CMake', 'Git', 'Vercel',
    'Tailwind CSS', 'Vite',
  ],
  aboutStats: [
    { value: '03', label: 'Client Sites Shipped' },
    { value: '06', label: 'Merged Open-Source PRs' },
    { value: '01', label: 'IEEE Publication' },
    { value: '2027', label: 'B.Tech CSE (AI & ML)' },
  ],
  otherProjects: [
    {
      name: 'Synthetic Chest X-ray Generation',
      category: 'Research / Generative AI',
      year: '2026',
      description: 'Class-conditional StyleGAN2-ADA pipeline (8-layer mapping network, AdaIN, adaptive discriminator augmentation, R1 regularization) synthesizing 256×256 chest X-rays to address medical-imaging data scarcity.',
      highlight: 'FID 25.30 / KID 0.02 over 5,232 samples — enabled 97.99% VGG16 pneumonia detection accuracy. Published at IEEE AIC 2026.',
    },
    {
      name: 'Aegis — Governance Runtime for AI Agents',
      category: 'AI Infrastructure',
      year: '2026',
      description: 'Policy-gated runtime that routes every AI-agent tool call through a policy gateway, so an agent never touches a resource directly. Untrusted-input screening, human-in-the-loop approval, crash-safe persistence and a full audit trail.',
      highlight: 'Built on Gemini 3.6 Flash via Vertex AI / ADK, Cloud Run and Pub/Sub.',
    },
    {
      name: 'Release Radar',
      category: 'Desktop App / Developer Tooling',
      year: '2026',
      description: 'Cross-platform Electron + React app that turns a GitHub commit range into a categorized changelog. Provider-agnostic layer across four AI APIs, OS-keychain key encryption, sandboxed renderer.',
      highlight: 'Shared core reused unchanged inside a GitHub Action.',
    },
    {
      name: 'Sourcemeta Core & Blaze',
      category: 'Open Source — C++',
      year: '2026',
      url: 'https://github.com/sourcemeta/core/pull/2708',
      description: 'Six merged PRs on a C++ JSON Schema validation engine. Integrated the mimalloc allocator across ~30 libraries via CMake, debugging a CMake export-set collision and an AddressSanitizer/allocator CI crash to land it.',
      highlight: '40–70% latency gains across core benchmarks; also fixed a canonicalizer soundness bug that made the validator accept documents it should reject.',
    },
    {
      name: 'Cash Compass',
      category: 'Architecture Lead',
      year: '2026',
      description: 'Cross-platform personal finance app built with Southern Federal University, Russia — a React/TypeScript web dashboard and a Flutter mobile app on a shared Supabase backend, directing the Indian development team.',
      highlight: 'Designed the core domain model and a modular drag-and-drop widget system powering a multi-theme dashboard.',
    },
  ],

  headerLogo: 'V-designs',

  footerHeading: "LET'S CREATE SOMETHING EXTRAORDINARY",
  footerEmail: 'vansh.kap.98@gmail.com',
  footerCopyright: '© 2026 V-DESIGNS. ALL RIGHTS RESERVED.',
  footerTagline: 'DESIGNED & DEVELOPED WITH OBSESSIVE ATTENTION TO DETAIL',

  aboutPageHeading: 'Who I Am',
  aboutPageSubtext: 'Creative developer and CSE (AI & ML) undergraduate — immersive web experiences on one side, generative models and systems work on the other.',
  aboutBackgroundText: "I'm a CSE (AI & ML) undergraduate at Manipal University Jaipur, graduating in 2027. I build on two tracks that keep feeding each other: interactive 3D on the web with Three.js and WebGL, and the systems underneath — generative models, agent infrastructure, and performance work on open-source C++. Freelance client sites pay for the first; a StyleGAN2-ADA paper at IEEE AIC 2026 and six merged PRs on a JSON Schema validation engine came out of the second.",
  aboutApproachText: "Start with the one thing the page has to land, then spend the budget there. A 3D scene that costs a visitor four seconds of loading has to earn those four seconds — so I care about frame budget, draw calls and first paint as much as about the look. The same instinct carries into the non-web work: the open-source contribution I'm proudest of is a 40–70% latency win, and the bug I'm proudest of finding was a soundness hole nobody had noticed.",
  processPageHeading: 'How I Work',
  processPageSubtext: 'A structured approach to delivering exceptional digital experiences from concept to launch.',
  contactPageHeading: "Let's Work Together",
  contactPageSubtext: "Have a project in mind? I'd love to hear about it. Send me a message and let's create something amazing.",
  contactEmail: 'vansh.kap.98@gmail.com',
  contactLocation: 'Based in Jaipur, Rajasthan, India\nAvailable globally',
  contactResponseTime: 'Usually within 24 hours',
};

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      ...defaultContent,

      updateContent: (key, value) => set({ [key]: value }),

      resetContent: () => set(defaultContent),
    }),
    {
      name: 'website-content-v5',
    }
  )
);

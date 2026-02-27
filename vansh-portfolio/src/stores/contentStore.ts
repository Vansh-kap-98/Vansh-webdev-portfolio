import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExpertiseItem {
  text: string;
  color: string;
}

export interface OtherProject {
  name: string;
  description: string;
  url: string;
  category: string;
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
    { text: 'WebGL & Three.js Development', color: '#2DD4BF' },
    { text: '3D Design & Animation', color: '#FB923C' },
    { text: 'Interactive UI/UX Design', color: '#22D3EE' },
    { text: 'Motion Design & GSAP', color: '#C084FC' },
    { text: 'Modern Frontend Development', color: '#06B6D4' },
  ],
  aboutTechnologies: [
    'React', 'Three.js', 'WebGL', 'GSAP', 'TypeScript', 'JavaScript',
    'Tailwind CSS', 'HTML5', 'CSS3', 'Vite', 'Node.js', 'Express',
    'MongoDB', 'PostgreSQL', 'Git', 'GitHub', 'Blender', 'Figma',
    'Adobe Creative Suite', 'REST APIs', 'Responsive Design', 'Performance Optimization'
  ],
  otherProjects: [
    {
      name: 'Add Your Project',
      description: 'Description of your non-web design project',
      url: 'https://github.com/yourusername/project',
      category: 'Category'
    }
  ],

  headerLogo: 'V-designs',

  footerHeading: "LET'S CREATE SOMETHING EXTRAORDINARY",
  footerEmail: 'officialbusiness9818@gmail.com',
  footerCopyright: '© 2026 V-DESIGNS. ALL RIGHTS RESERVED.',
  footerTagline: 'DESIGNED & DEVELOPED WITH OBSESSIVE ATTENTION TO DETAIL',

  aboutPageHeading: 'Who I Am',
  aboutPageSubtext: 'A creative developer specializing in immersive web experiences, 3D design, and interactive storytelling.',
  aboutBackgroundText: "I'm a multidisciplinary designer and developer with a passion for creating unique digital experiences that push the boundaries of what's possible on the web. My work combines cutting-edge technology with thoughtful design to create memorable interactions.",
  aboutApproachText: "Every project starts with understanding the core message and audience. I believe that great design isn't just about aesthetics—it's about creating meaningful connections and solving real problems. I combine technical excellence with creative vision to deliver experiences that are not only visually stunning but also performant, accessible, and user-friendly.",
  processPageHeading: 'How I Work',
  processPageSubtext: 'A structured approach to delivering exceptional digital experiences from concept to launch.',
  contactPageHeading: "Let's Work Together",
  contactPageSubtext: "Have a project in mind? I'd love to hear about it. Send me a message and let's create something amazing.",
  contactEmail: 'officialbusiness9818@gmail.com',
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
      name: 'website-content-v3',
    }
  )
);

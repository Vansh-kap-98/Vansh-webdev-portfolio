import { useRef } from 'react';
import { useThemeStore, AccentColor } from '@/stores/themeStore';
import ProjectCard from './ProjectCard';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  tech: string[];
  accentColor: AccentColor;
  year: string;
  description: string;
  thumbnailEyebrow: string;
  thumbnailTitle: string;
  thumbnailCopy: string;
}

const projects: Project[] = [
  {
    id: 'the-estate',
    title: 'The Estate',
    subtitle: 'Immersive Property Viewer',
    type: 'Real Estate',
    tech: ['Dual Spline Rig', 'CatmullRomCurve3'],
    accentColor: 'teal',
    year: '2026',
    description: 'Scroll-driven camera flythrough from aerial establishing shot to interior',
    thumbnailEyebrow: 'Dual Spline Camera Rig',
    thumbnailTitle: 'Aerial View',
    thumbnailCopy: 'Separate position and look-at splines, so the camera can turn as it travels',
  },
  {
    id: 'gastro-lab',
    title: 'Gastro Lab',
    subtitle: 'Interactive Menu',
    type: 'Restaurant',
    tech: ['Exploded View', 'Procedural Textures'],
    accentColor: 'orange',
    year: '2026',
    description: 'Scroll pulls the dish apart layer by layer; every surface is drawn at runtime',
    thumbnailEyebrow: 'Scroll-Linked Explode',
    thumbnailTitle: 'The Dish',
    thumbnailCopy: 'Eight layers separating on a weighted curve, textured from canvas at runtime',
  },
  {
    id: 'void-streetwear',
    title: 'Void Streetwear',
    subtitle: 'E-commerce Experience',
    type: 'Fashion',
    tech: ['Verlet Cloth', 'Pointer Forces'],
    accentColor: 'neon',
    year: '2026',
    description: 'A real mass-spring cloth solver — push it with the cursor, or grab and pull',
    thumbnailEyebrow: 'Verlet Cloth Solver',
    thumbnailTitle: 'Feel the Movement',
    thumbnailCopy: 'Structural, shear and bend constraints relaxed every frame on the CPU',
  },
  {
    id: 'neurocore',
    title: 'NeuroCore',
    subtitle: 'Data Dashboard',
    type: 'SaaS',
    tech: ['InstancedMesh', 'Particle Morphing'],
    accentColor: 'purple',
    year: '2026',
    description: '2,600 instances morphing between formations sampled from real icon paths',
    thumbnailEyebrow: 'InstancedMesh + Particle Morphing',
    thumbnailTitle: 'Data Cloud',
    thumbnailCopy: 'Targets sampled from rasterised icon paths, blended continuously on scroll',
  },
  {
    id: 'velocity-ev',
    title: 'Velocity EV',
    subtitle: 'Car Configurator',
    type: 'Automotive',
    tech: ['Material Props', 'Camera Rig'],
    accentColor: 'gold',
    year: '2026',
    description: 'Real-time customization with interior camera transitions',
    thumbnailEyebrow: 'V2.1 PRO',
    thumbnailTitle: 'Velocity GT',
    thumbnailCopy: 'Real-time customization with interior camera transitions',
  },
  {
    id: 'artifacts',
    title: 'Artifacts',
    subtitle: 'Digital Gallery',
    type: 'Museum',
    tech: ['ScrollControls', 'Emissive Proximity'],
    accentColor: 'cyan',
    year: '2026',
    description: 'A fogged gallery corridor where each canvas lights as you approach it',
    thumbnailEyebrow: 'ScrollControls + Emissive Proximity',
    thumbnailTitle: 'Enter the Infinite',
    thumbnailCopy: 'Six public-domain works, each lighting up as the camera closes on it',
  },
];

const WorkGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { hoveredProject, setHoveredProject, setActiveAccent } = useThemeStore();

  const handleMouseEnter = (project: Project) => {
    setHoveredProject(project.id);
    setActiveAccent(project.accentColor);
  };

  const handleMouseLeave = () => {
    setHoveredProject(null);
    setActiveAccent(null);
  };

  return (
    <section id="work" className="relative py-section pt-8 md:pt-10 lg:pt-12 px-6 md:px-12 lg:px-20">
      {/* Section Header */}
      <div className="mb-16 flex items-end justify-between border-b border-border pb-8">
        <div>
          <span className="mono text-muted-foreground mb-2 block">02 / SELECTED WORK</span>
          <h2 className="section-heading">Featured Projects</h2>
        </div>
        <div className="hidden md:block font-mono text-[10px] text-muted-foreground text-right">
          <div>PROJECTS: 06</div>
          <div>YEAR: 2026</div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            isHovered={hoveredProject === project.id}
            isDimmed={hoveredProject !== null && hoveredProject !== project.id}
            onMouseEnter={() => handleMouseEnter(project)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </section>
  );
};

export default WorkGrid;

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
}

const projects: Project[] = [
  {
    id: 'the-estate',
    title: 'The Estate',
    subtitle: 'Immersive Property Viewer',
    type: 'Real Estate',
    tech: ['ScrollControls', 'CatmullRomCurve3'],
    accentColor: 'teal',
    year: '2026',
    description: 'Scroll-based camera flythrough from aerial to interior views',
  },
  {
    id: 'gastro-lab',
    title: 'Gastro Lab',
    subtitle: 'Interactive Menu',
    type: 'Restaurant',
    tech: ['GSAP Timeline', 'Scroll Linked'],
    accentColor: 'orange',
    year: '2026',
    description: 'Exploded view product showcase revealing dish layers',
  },
  {
    id: 'void-streetwear',
    title: 'Void Streetwear',
    subtitle: 'E-commerce Experience',
    type: 'Fashion',
    tech: ['Cloth Simulation', 'Vertex Shader'],
    accentColor: 'neon',
    year: '2026',
    description: 'Physics-based cloth that deforms with mouse interaction',
  },
  {
    id: 'neurocore',
    title: 'NeuroCore',
    subtitle: 'Data Dashboard',
    type: 'SaaS',
    tech: ['InstancedMesh', 'Particle Morphing'],
    accentColor: 'purple',
    year: '2026',
    description: 'Particles morph into icons as users scroll through features',
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
  },
  {
    id: 'artifacts',
    title: 'Artifacts',
    subtitle: 'Digital Gallery',
    type: 'Museum',
    tech: ['FogExp2', 'Infinite Loop'],
    accentColor: 'cyan',
    year: '2026',
    description: 'Infinite tunnel gallery with floating artworks and fog',
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
    <section id="work" className="relative py-section px-6 md:px-12 lg:px-20">
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

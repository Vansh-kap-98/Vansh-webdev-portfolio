import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from './WorkGrid';
import { useThemeStore, accentColors } from '@/stores/themeStore';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ProjectCardProps {
  project: Project;
  index: number;
  isHovered: boolean;
  isDimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ProjectCard = ({
  project,
  index,
  isHovered,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
}: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setCursorVariant, setCursorText } = useThemeStore();

  const isLarge = index % 3 === 0;
  const accentColor = project.accentColor ? accentColors[project.accentColor] : null;

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(
      card,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  const handleMouseEnter = () => {
    onMouseEnter();
    setCursorVariant('project');
    setCursorText('VIEW');

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    onMouseLeave();
    setCursorVariant('default');
    setCursorText('');

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`project-card group relative cursor-pointer ${isLarge ? 'md:col-span-2' : ''} ${
        isDimmed ? 'project-card-dimmed' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden bg-card rounded-sm ${
          isLarge ? 'aspect-[21/9]' : 'aspect-[4/3]'
        }`}
      >
        {/* Placeholder visual with accent glow */}
        <div
          ref={imageRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, hsl(${accentColor?.hsl} / 0.1), transparent)`,
          }}
        >
          {/* Abstract shape placeholder */}
          <div
            className="w-1/3 h-1/2 rounded-lg opacity-20"
            style={{
              background: `linear-gradient(180deg, hsl(${accentColor?.hsl}), transparent)`,
              boxShadow: isHovered
                ? `0 0 100px 20px hsl(${accentColor?.hsl} / 0.3)`
                : 'none',
              transition: 'box-shadow 0.5s ease',
            }}
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          {project.tech.map((t) => (
            <span key={t} className="label-chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-6 pb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              {project.type}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {project.year}
            </span>
          </div>
          <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-1">
            {project.title}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md">
            {project.description}
          </p>
        </div>

        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${
            isHovered
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-muted-foreground'
          }`}
        >
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-500 ease-out"
        style={{
          width: isHovered ? '100%' : '0%',
          background: `linear-gradient(90deg, hsl(${accentColor?.hsl}), transparent)`,
        }}
      />
    </div>
  );
};

export default ProjectCard;

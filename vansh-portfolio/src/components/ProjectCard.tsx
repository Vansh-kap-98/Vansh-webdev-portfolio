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
    // Kill all ScrollTrigger instances and reset scroll before navigating
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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

  const renderThumbnailDecorations = () => {
    const common = (children: JSX.Element) => children;

    switch (project.id) {
      case 'the-estate':
        return common(
          <>
            <div className="absolute left-6 bottom-7 h-24 w-24 rounded-sm border border-teal-400/25 rotate-[-8deg]" />
            <div className="absolute right-8 bottom-10 h-20 w-20 rounded-full border border-teal-400/20" />
            <div className="absolute left-10 top-14 h-px w-28 bg-teal-300/40" />
          </>
        );
      case 'gastro-lab':
        return common(
          <>
            <div className="absolute inset-x-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/25" />
            <div className="absolute inset-x-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200/35" />
            <div className="absolute bottom-10 left-8 h-px w-24 bg-orange-300/40" />
          </>
        );
      case 'void-streetwear':
        return common(
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.14),transparent_55%)]" />
            <div className="absolute left-[-8%] top-1/3 h-2 w-[120%] -rotate-12 bg-gradient-to-r from-transparent via-neon-400/60 to-transparent" />
            <div className="absolute right-[-10%] bottom-1/4 h-2 w-[120%] rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </>
        );
      case 'neurocore':
        return common(
          <>
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute left-8 top-12 h-28 w-28 rounded-full border border-purple-300/20" />
            <div className="absolute right-8 bottom-10 h-24 w-44 rounded-xl border border-purple-300/20 bg-white/5 backdrop-blur-[1px]" />
          </>
        );
      case 'velocity-ev':
        return common(
          <>
            <div className="absolute inset-x-1/2 bottom-14 h-20 w-48 -translate-x-1/2 rounded-[999px] border border-gold-400/25 bg-white/5" />
            <div className="absolute inset-x-1/2 bottom-18 h-10 w-32 -translate-x-1/2 rounded-[999px] border border-gold-300/35 bg-black/30" />
            <div className="absolute left-8 top-12 h-px w-20 bg-gold-300/40" />
          </>
        );
      case 'artifacts':
        return common(
          <>
            <div className="absolute inset-8 border border-cyan-300/20" />
            <div className="absolute inset-x-12 top-12 h-24 border border-cyan-300/15" />
            <div className="absolute right-10 bottom-10 h-24 w-16 border border-cyan-200/20 rotate-6" />
          </>
        );
      default:
        return null;
    }
  };

  const renderThumbnail = () => {
    const accent = accentColor?.hsl;
    const titleClass = project.id === 'velocity-ev' ? 'text-accent-gold' : 'text-foreground';

    return (
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-sm border border-white/5 bg-black/25 p-4 md:p-5"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${accent} / 0.2), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.05), transparent 38%)`,
        }}
      >
        <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 50% 45%, hsl(${accent} / 0.16), transparent 58%)` }} />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        {renderThumbnailDecorations()}

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <span className="label-chip bg-black/40 text-white/80 border-white/10">
              {project.thumbnailEyebrow}
            </span>
            <div className="text-right font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
              <div>{project.type}</div>
              <div className="mt-1">{project.year}</div>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center px-2 text-center">
            <div className="max-w-[90%]">
              <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-white/45">
                Loaded hero section
              </p>
              <h3 className={`mt-3 text-3xl font-bold leading-none md:text-5xl ${titleClass}`}>
                {project.thumbnailTitle}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-white/65 md:text-sm">
                {project.thumbnailCopy}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="max-w-[68%]">
              <div className="h-px w-16 bg-white/20" />
              <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.25em] text-white/40">
                {project.subtitle}
              </p>
            </div>
            <div className="text-right font-mono text-[8px] uppercase tracking-[0.3em] text-white/30">
              View {String(index + 1).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`project-card group relative cursor-pointer ${isLarge ? 'md:col-span-2' : ''} ${isDimmed ? 'project-card-dimmed' : ''
        }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden bg-card rounded-sm ${isLarge ? 'aspect-[21/9]' : 'aspect-[4/3]'
          }`}
      >
        <div
          ref={imageRef}
          className="absolute inset-0"
          style={{
            boxShadow: isHovered ? `inset 0 0 0 1px hsl(${accentColor?.hsl} / 0.3)` : 'none',
            transition: 'box-shadow 0.5s ease',
          }}
        >
          {renderThumbnail()}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-35" />

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
          className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${isHovered
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

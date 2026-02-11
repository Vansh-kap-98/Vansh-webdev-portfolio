import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useContentStore } from '@/stores/contentStore';

const Footer = () => {
  const { footerHeading, footerEmail, footerCopyright, footerTagline } = useContentStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorVariant } = useThemeStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom-=100',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={containerRef} className="relative py-section px-6 md:px-12 lg:px-20 border-t border-border">
      {/* Large CTA */}
      <div className="mb-20">
        <span className="mono text-muted-foreground mb-4 block">03 / CONTACT</span>
        <h2 className="font-heading text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter mb-8">
          {footerHeading}
        </h2>
        <a
          href={`mailto:${footerEmail}`}
          className="inline-flex items-center gap-4 group"
          onMouseEnter={() => setCursorVariant('hover')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          <span className="font-heading text-xl md:text-2xl">{footerEmail}</span>
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border group-hover:border-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-300">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* Footer Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border">
        {/* About Vansh Kapoor - Entity Authority Signal */}
        <div className="col-span-2 md:col-span-4 mb-8">
          <h4 className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">
            About
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            <strong className="text-foreground">Vansh Kapoor</strong> is a creative developer specializing in{' '}
            <span className="text-foreground">Three.js</span> and immersive web experiences. 
            Based in India, <strong className="text-foreground">Vansh Kapoor</strong> combines technical expertise in{' '}
            <span className="text-foreground">WebGL</span>, <span className="text-foreground">React</span>, and{' '}
            <span className="text-foreground">GSAP</span> with a passion for creative development that pushes the boundaries of what's possible on the web.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-4">
            Navigation
          </h4>
          <ul className="space-y-2">
            {['Work', 'About', 'Process', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-4">
            Social
          </h4>
          <ul className="space-y-2">
            {['Twitter', 'LinkedIn', 'Dribbble', 'GitHub'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-4">
            Services
          </h4>
          <ul className="space-y-2">
            {['3D Development', 'WebGL Experiences', 'Motion Design', 'Consulting'].map(
              (item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-4">
            Location
          </h4>
          <p className="text-sm text-muted-foreground">
            Remote-First Studio
            <br />
            Working Worldwide
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
        <div className="font-mono text-[10px] tracking-widest">
          {footerCopyright}
        </div>
        <div className="font-mono text-[10px] tracking-widest">
          {footerTagline}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

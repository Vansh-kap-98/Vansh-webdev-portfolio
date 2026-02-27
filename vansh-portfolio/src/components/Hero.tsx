import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useContentStore } from '@/stores/contentStore';

const Hero = () => {
  const { heroHeading, heroSubtext, heroCornerLabel, heroCornerSublabel } = useContentStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [whatsappOpacity, setWhatsappOpacity] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      // Background fade
      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' }
      );

      // Split text animation
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll('.word');
        tl.fromTo(
          words,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.5'
        );
      }

      // Subtext reveal
      tl.fromTo(
        subtextRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      );

      // Scroll indicator
      tl.fromTo(
        scrollIndicatorRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      );

      // WhatsApp button entrance
      tl.to(
        {},
        {
          duration: 0.01,
          onComplete: () => setWhatsappOpacity(1),
        },
        '-=0.3'
      );
    });

    return () => ctx.revert();
  }, []);

  // Fade WhatsApp button on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 100;
      const fadeEnd = 400;
      if (scrollY <= fadeStart) {
        setWhatsappOpacity(1);
      } else if (scrollY >= fadeEnd) {
        setWhatsappOpacity(0);
      } else {
        setWhatsappOpacity(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 opacity-0"
    >
      {/* Main Heading */}
      <h1
        ref={headingRef}
        className="hero-heading text-center text-foreground relative z-10"
      >
        {heroHeading.map((word, index) => (
          <span key={index}>
            <span className={`word inline-block ${index === heroHeading.length - 1 ? 'text-gradient' : ''}`}>
              {word}
            </span>
            {index < heroHeading.length - 1 && (index === 1 || index === heroHeading.length - 2) && <br />}
            {index < heroHeading.length - 1 && index !== 1 && index !== heroHeading.length - 2 && ' '}
          </span>
        ))}
      </h1>

      {/* Subtext */}
      <div
        ref={subtextRef}
        className="mt-8 flex items-center gap-8 text-muted-foreground"
      >
        <div className="label-chip">
          <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          THREE.JS
        </div>
        <div className="label-chip">
          <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
          GSAP
        </div>
        <div className="label-chip">
          <span className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
          WEBGL
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Scroll to Explore
        </span>
        <div className="scroll-indicator-line" />
        <ChevronDown className="w-4 h-4 text-muted-foreground animate-bounce" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-16 left-8 font-mono text-[10px] text-muted-foreground tracking-widest">
        <span className="opacity-50">01</span>
        <span className="mx-2">/</span>
        <span>{heroCornerLabel}</span>
      </div>
      <div className="absolute top-16 right-8 font-mono text-[10px] text-muted-foreground tracking-widest">
        <span>{heroCornerSublabel}</span>
        <span className="mx-2">—</span>
        <span className="opacity-50">2026</span>
      </div>

      {/* WhatsApp CTA Button */}
      <a
        href="https://wa.me/919818535499?text=Hi%20Vansh!%20I%20visited%20your%20portfolio%20and%20would%20love%20to%20connect."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 group"
        style={{
          opacity: whatsappOpacity,
          pointerEvents: whatsappOpacity > 0.1 ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <div className="relative flex items-center gap-3 px-5 py-3 rounded-full border border-[#25D366]/30 bg-background/80 backdrop-blur-md hover:border-[#25D366]/70 hover:bg-[#25D366]/10 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(37,211,102,0.15)]">
          {/* Pulse ring */}
          <span
            className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/10 pointer-events-none"
            style={{ animationDuration: '3s' }}
          />

          <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            Say Hello
          </span>
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        </div>
      </a>
    </section>
  );
};

export default Hero;

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContentStore } from '@/stores/contentStore';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { aboutLabel, aboutText } = useContentStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the large text on scroll
      if (textRef.current) {
        const words = textRef.current.querySelectorAll('.word');
        gsap.fromTo(
          words,
          { opacity: 0.2 },
          {
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top center',
              end: 'bottom center',
              scrub: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-section px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-5xl">
        <span className="mono text-muted-foreground mb-8 block">
          {aboutLabel}
        </span>

        <p
          ref={textRef}
          className="font-heading text-2xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight"
        >
          {aboutText.split(' ').map((word, i) => (
            <span key={i} className="word inline-block mr-[0.3em]">
              {word}
            </span>
          ))}
        </p>
      </div>

    </section>
  );
};

export default About;

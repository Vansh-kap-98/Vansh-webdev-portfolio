import { useEffect, useLayoutEffect, useRef, ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

const SmoothScroll = ({ children }: SmoothScrollProps) => {
  const { lite } = useDeviceProfile();
  const lenisRef = useRef<Lenis | null>(null);

  // Force scroll to top before Lenis takes over
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    // On touch devices Lenis replaces the platform's own momentum scrolling with
    // a JS-driven approximation, which is both slower and worse than what iOS and
    // Android already do. Let the OS scroll, and just keep ScrollTrigger in sync.
    if (lite) {
      const onScroll = () => ScrollTrigger.update();
      window.addEventListener('scroll', onScroll, { passive: true });
      ScrollTrigger.refresh();
      return () => window.removeEventListener('scroll', onScroll);
    }

    // Ensure we're at top before creating Lenis
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Scroll to top immediately
    lenis.scrollTo(0);

    lenis.on('scroll', ScrollTrigger.update);

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
      lenisRef.current = null;
    };
  }, [lite]);

  return <>{children}</>;
};

export default SmoothScroll;

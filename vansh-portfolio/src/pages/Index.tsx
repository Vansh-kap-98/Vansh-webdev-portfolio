import { useEffect } from 'react';
import Scene from '@/components/canvas/Scene';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import WorkGrid from '@/components/WorkGrid';
import Footer from '@/components/Footer';
import { useThemeStore, accentColors } from '@/stores/themeStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const { activeAccent } = useThemeStore();

  useEffect(() => {
    // Update CSS custom property for dynamic accent
    if (activeAccent && accentColors[activeAccent]) {
      document.documentElement.style.setProperty(
        '--current-accent',
        accentColors[activeAccent].hsl
      );
    } else {
      document.documentElement.style.removeProperty('--current-accent');
    }
  }, [activeAccent]);

  return (
    <SmoothScroll>
      {/* Custom Cursor */}
      <CustomCursor />

      {/* 3D Background Canvas */}
      <Scene />

      {/* HTML UI Overlay */}
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <About />
          <WorkGrid />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Index;

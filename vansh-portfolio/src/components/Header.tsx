import { useRef, useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useContentStore } from '@/stores/contentStore';
import gsap from 'gsap';

const Header = () => {
  const { headerLogo } = useContentStore();
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { setCursorVariant } = useThemeStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if we're past the opening position
      setIsScrolled(currentScrollY > 100);
      
      // Show header when at top
      if (currentScrollY < 50) {
        setIsVisible(true);
      }
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setCursorVariant('hover');
    gsap.to(e.currentTarget, {
      y: -2,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setCursorVariant('default');
    gsap.to(e.currentTarget, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-white shadow-md' : 'mix-blend-difference'
      }`}
    >
      <nav
        ref={navRef}
        className="flex items-center justify-between"
      >
        {/* Logo */}
        <a
          href="/"
          className={`font-heading font-bold text-2xl tracking-tight -ml-4 ${
            isScrolled ? 'text-black' : 'text-foreground'
          }`}
          onMouseEnter={(e) => handleMouseEnter(e)}
          onMouseLeave={(e) => handleMouseLeave(e)}
        >
          {headerLogo}
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#work"
            className={`font-mono text-[11px] tracking-widest transition-colors uppercase ${
              isScrolled ? 'text-black/70 hover:text-black' : 'text-foreground/80 hover:text-foreground'
            }`}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onMouseLeave={(e) => handleMouseLeave(e)}
          >
            Work
          </a>
          <a
            href="/about"
            className={`font-mono text-[11px] tracking-widest transition-colors uppercase ${
              isScrolled ? 'text-black/70 hover:text-black' : 'text-foreground/80 hover:text-foreground'
            }`}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onMouseLeave={(e) => handleMouseLeave(e)}
          >
            About
          </a>
          <a
            href="/process"
            className={`font-mono text-[11px] tracking-widest transition-colors uppercase ${
              isScrolled ? 'text-black/70 hover:text-black' : 'text-foreground/80 hover:text-foreground'
            }`}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onMouseLeave={(e) => handleMouseLeave(e)}
          >
            Process
          </a>
          <a
            href="/contact"
            className={`font-mono text-[11px] tracking-widest transition-colors uppercase ${
              isScrolled ? 'text-black/70 hover:text-black' : 'text-foreground/80 hover:text-foreground'
            }`}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onMouseLeave={(e) => handleMouseLeave(e)}
          >
            Contact
          </a>
        </div>

        {/* CTA Button */}
        <a
          href="/contact"
          className={`hidden md:flex items-center gap-2 px-4 py-2 border rounded-full font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
            isScrolled 
              ? 'border-black/20 text-black hover:bg-black hover:text-white' 
              : 'border-foreground/20 text-foreground hover:bg-foreground hover:text-background'
          }`}
          onMouseEnter={(e) => handleMouseEnter(e)}
          onMouseLeave={(e) => handleMouseLeave(e)}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-pulse" />
          Work in Progress
        </a>

        {/* Mobile Menu Button */}
        <button className="md:hidden flex flex-col gap-1.5">
          <span className={`w-6 h-px ${isScrolled ? 'bg-black' : 'bg-foreground'}`} />
          <span className={`w-4 h-px ${isScrolled ? 'bg-black' : 'bg-foreground'}`} />
        </button>
      </nav>
    </header>
  );
};

export default Header;

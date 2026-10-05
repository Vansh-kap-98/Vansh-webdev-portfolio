import { useRef, useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useContentStore } from '@/stores/contentStore';
import gsap from 'gsap';
import AsteroidsEasterEgg from './AsteroidsEasterEgg';

const NAV_LINKS = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/about' },
  { label: 'Process', href: '/process' },
  { label: 'Contact', href: '/contact' },
];

const Header = () => {
  const { headerLogo } = useContentStore();
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { setCursorVariant } = useThemeStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [launchRect, setLaunchRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const lastScrollY = useRef(0);
  const wipButtonRef = useRef<HTMLButtonElement>(null);

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
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          } ${isScrolled
            ? 'bg-white shadow-md'
            : isMenuOpen
              // mix-blend-difference would make the open panel unreadable over the hero,
              // so the menu gets its own surface instead.
              ? 'bg-background/95 backdrop-blur-md border-b border-border'
              : 'mix-blend-difference'
          }`}
      >
        <nav
          ref={navRef}
          className="flex items-center justify-between"
        >
          {/* Logo */}
          <a
            href="/"
            className={`font-heading font-bold text-2xl tracking-tight -ml-4 ${isScrolled ? 'text-black' : 'text-foreground'
              }`}
            onMouseEnter={(e) => handleMouseEnter(e)}
            onMouseLeave={(e) => handleMouseLeave(e)}
          >
            {headerLogo}
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`font-mono text-[11px] tracking-widest transition-colors uppercase ${isScrolled ? 'text-black/70 hover:text-black' : 'text-foreground/80 hover:text-foreground'
                  }`}
                onMouseEnter={(e) => handleMouseEnter(e)}
                onMouseLeave={(e) => handleMouseLeave(e)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex flex-col items-center gap-1">
            <button
              ref={wipButtonRef}
              onClick={() => {
                if (wipButtonRef.current) {
                  const rect = wipButtonRef.current.getBoundingClientRect();
                  setLaunchRect({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
                  setIsEasterEggActive(true);
                }
              }}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-full font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${isEasterEggActive ? 'hangar-open' : ''} ${isScrolled
                ? 'border-black/20 text-black hover:bg-black hover:text-white'
                : 'border-foreground/20 text-foreground hover:bg-foreground hover:text-background'
                }`}
              onMouseEnter={(e: any) => handleMouseEnter(e)}
              onMouseLeave={(e: any) => handleMouseLeave(e)}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-pulse" />
              Work in Progress
            </button>
            <span className={`font-mono text-[8px] tracking-[0.2em] opacity-30 uppercase transition-opacity hover:opacity-60 cursor-default ${isScrolled ? 'text-black' : 'text-foreground'
              }`}>
              ( click for a surprise )
            </span>
          </div>

          <style>{`
            .hangar-open {
              border-color: #fff !important;
              background: #000 !important;
              color: #fff !important;
              clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 85% 100%, 75% 85%, 25% 85%, 15% 100%, 0% 100%);
              transition: all 0.6s cubic-bezier(0.85, 0, 0.15, 1);
              pointer-events: none;
              box-shadow: 0 0 20px rgba(255,255,255,0.4), inset 0 0 15px rgba(0,255,255,0.2);
              animation: hangar-hiss 0.6s forwards, hangar-flicker 2s infinite 0.6s;
            }

            @keyframes hangar-hiss {
              0% { transform: scaleY(1); }
              50% { transform: scaleY(1.1) scaleX(1.02); filter: brightness(2); }
              100% { transform: scaleY(1); }
            }

            @keyframes hangar-flicker {
              0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.2); }
              50% { box-shadow: 0 0 30px rgba(0,255,255,0.4); }
            }

            .hangar-open::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 20%;
              right: 20%;
              height: 2px;
              background: #0ff;
              box-shadow: 0 0 10px #0ff;
              animation: energy-line 0.5s ease-out forwards;
            }

            @keyframes energy-line {
              0% { width: 0; left: 50%; opacity: 0; }
              100% { width: 60%; left: 20%; opacity: 1; }
            }
          `}</style>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-11 h-11 items-end -mr-2"
          >
            <span
              className={`h-px transition-all duration-300 ${isScrolled ? 'bg-black' : 'bg-foreground'} ${
                isMenuOpen ? 'w-6 translate-y-[3.5px] rotate-45' : 'w-6'
              }`}
            />
            <span
              className={`h-px transition-all duration-300 ${isScrolled ? 'bg-black' : 'bg-foreground'} ${
                isMenuOpen ? 'w-6 -translate-y-[3.5px] -rotate-45' : 'w-4'
              }`}
            />
          </button>
        </nav>

        {/* Mobile Nav Panel */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 pt-6 pb-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`font-mono text-[13px] tracking-widest uppercase py-4 min-h-[48px] flex items-center border-b transition-colors ${
                  isScrolled
                    ? 'text-black/70 hover:text-black border-black/10'
                    : 'text-foreground/80 hover:text-foreground border-foreground/10'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/Vansh_Kapoor_Resume.pdf"
              download="Vansh_Kapoor_Resume.pdf"
              onClick={() => setIsMenuOpen(false)}
              className={`font-mono text-[13px] tracking-widest uppercase py-4 min-h-[48px] flex items-center transition-colors ${
                isScrolled ? 'text-black/70 hover:text-black' : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              Resume ↓
            </a>
          </div>
        </div>
      </header>

      {isEasterEggActive && launchRect && (
        <AsteroidsEasterEgg launchRect={launchRect} />
      )}
    </>
  );
};

export default Header;

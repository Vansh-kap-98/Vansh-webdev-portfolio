import { useEffect, useRef, useState } from 'react';
import { useThemeStore, cursorStyles } from '@/stores/themeStore';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const { cursorVariant, cursorStyle } = useThemeStore();
  const [isVisible, setIsVisible] = useState(false);

  const styleConfig = cursorStyles[cursorStyle] || cursorStyles.default;

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = cursorRingRef.current;

    if (!cursor || !ring) return;

    // Set centering via GSAP once to avoid conflict with x/y quickSetters
    gsap.set([cursor, ring], {
      xPercent: -50,
      yPercent: -50,
      force3D: true
    });

    // Use GSAP quickSetter for high-performance updates
    const xSetDot = gsap.quickSetter(cursor, "x", "px");
    const ySetDot = gsap.quickSetter(cursor, "y", "px");
    const xSetRing = gsap.quickSetter(ring, "x", "px");
    const ySetRing = gsap.quickSetter(ring, "y", "px");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const speed = 0.2;

    const updatePosition = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const animate = () => {
      pos.x += (mouse.x - pos.x) * speed;
      pos.y += (mouse.y - pos.y) * speed;

      // Update dot directly to mouse position
      xSetDot(mouse.x);
      ySetDot(mouse.y);

      // Update ring with smoothed position
      xSetRing(pos.x);
      ySetRing(pos.y);

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseenter', () => setIsVisible(true));
    window.addEventListener('mouseleave', () => setIsVisible(false));

    const ticker = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      cancelAnimationFrame(ticker);
    };
  }, []); // Remove isVisible dependency to prevent effect re-runs

  useEffect(() => {
    const ring = cursorRingRef.current;
    if (!ring) return;

    if (cursorVariant === 'project') {
      gsap.to(ring, { width: 80, height: 80, opacity: 1, duration: 0.3, ease: 'power2.out' });
    } else if (cursorVariant === 'hover') {
      gsap.to(ring, { width: 50, height: 50, opacity: 1, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(ring, { width: 0, height: 0, opacity: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, [cursorVariant]);

  const baseContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 9999,
    willChange: 'transform',
  };

  return (
    <>
      {/* Main Dot - Follows mouse instantly */}
      <div
        ref={cursorRef}
        style={{
          ...baseContainerStyle,
          width: styleConfig.dotSize,
          height: styleConfig.dotSize,
          backgroundColor: styleConfig.dotColor,
          borderRadius: styleConfig.ringStyle === 'square' || styleConfig.ringStyle === 'diamond' ? '2px' : '50%',
          opacity: isVisible ? 1 : 0,
          mixBlendMode: 'difference',
        }}
      />

      {/* Lagging Ring - Follows with LERP */}
      <div
        ref={cursorRingRef}
        style={{
          ...baseContainerStyle,
          width: 0,
          height: 0,
          border: `1px solid ${styleConfig.ringColor}`,
          borderRadius: styleConfig.ringStyle === 'square' ? '4px' : '50%',
          opacity: 0,
          zIndex: 9998,
        }}
      />
    </>
  );
};

export default CustomCursor;

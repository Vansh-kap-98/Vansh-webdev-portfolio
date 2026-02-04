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

    const pos = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    const speed = 0.15;

    const updateCursor = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      setIsVisible(true);
    };

    const animate = () => {
      pos.x += (mouse.x - pos.x) * speed;
      pos.y += (mouse.y - pos.y) * speed;

      cursor.style.left = `${pos.x}px`;
      cursor.style.top = `${pos.y}px`;
      ring.style.left = `${pos.x}px`;
      ring.style.top = `${pos.y}px`;

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseenter', () => setIsVisible(true));
    window.addEventListener('mouseleave', () => setIsVisible(false));
    animate();

    return () => {
      window.removeEventListener('mousemove', updateCursor);
    };
  }, []);

  useEffect(() => {
    const ring = cursorRingRef.current;
    if (!ring) return;

    if (cursorVariant === 'project') {
      gsap.to(ring, {
        width: 80,
        height: 80,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else if (cursorVariant === 'hover') {
      gsap.to(ring, {
        width: 50,
        height: 50,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(ring, {
        width: 0,
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [cursorVariant]);

  const getRingStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: 0,
      height: 0,
      transform: 'translate(-50%, -50%)',
      opacity: 0,
    };

    switch (styleConfig.ringStyle) {
      case 'square':
        return { ...baseStyle, borderRadius: '4px', border: `2px solid ${styleConfig.ringColor}` };
      case 'diamond':
        return { ...baseStyle, borderRadius: '4px', border: `2px solid ${styleConfig.ringColor}`, rotate: '45deg' };
      case 'crosshair':
        return { ...baseStyle, borderRadius: '0', border: 'none' };
      case 'hexagon':
        return { ...baseStyle, borderRadius: '12px', border: `2px solid ${styleConfig.ringColor}` };
      case 'triangle':
        return { ...baseStyle, borderRadius: '0', border: 'none' };
      default:
        return { ...baseStyle, borderRadius: '50%', border: `1px solid ${styleConfig.ringColor}` };
    }
  };

  const getDotStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: styleConfig.dotSize,
      height: styleConfig.dotSize,
      backgroundColor: styleConfig.dotColor,
      transform: 'translate(-50%, -50%)',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s, background-color 0.3s',
    };

    switch (styleConfig.ringStyle) {
      case 'square':
        return { ...baseStyle, borderRadius: '2px' };
      case 'diamond':
        return { ...baseStyle, borderRadius: '2px', rotate: '45deg' };
      case 'crosshair':
        return { ...baseStyle, borderRadius: '0', width: 2, height: styleConfig.dotSize * 3 };
      default:
        return { ...baseStyle, borderRadius: '50%' };
    }
  };

  const renderCrosshairExtra = () => {
    if (styleConfig.ringStyle !== 'crosshair') return null;
    return (
      <div
        className="fixed pointer-events-none z-[9997]"
        style={{
          left: cursorRef.current?.style.left,
          top: cursorRef.current?.style.top,
          width: styleConfig.dotSize * 3,
          height: 2,
          backgroundColor: styleConfig.dotColor,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />
    );
  };

  const renderTriangleRing = () => {
    if (styleConfig.ringStyle !== 'triangle') return null;
    return (
      <svg
        className="fixed pointer-events-none z-[9997]"
        style={{
          left: cursorRingRef.current?.style.left,
          top: cursorRingRef.current?.style.top,
          width: 60,
          height: 60,
          transform: 'translate(-50%, -50%)',
          opacity: cursorVariant === 'project' || cursorVariant === 'hover' ? 0.8 : 0,
          transition: 'opacity 0.3s',
        }}
        viewBox="0 0 60 60"
      >
        <polygon
          points="30,5 55,50 5,50"
          fill="none"
          stroke={styleConfig.ringColor}
          strokeWidth="2"
        />
      </svg>
    );
  };

  const renderHexagonRing = () => {
    if (styleConfig.ringStyle !== 'hexagon') return null;
    const size = cursorVariant === 'project' ? 80 : cursorVariant === 'hover' ? 50 : 0;
    return (
      <svg
        className="fixed pointer-events-none z-[9997]"
        style={{
          left: cursorRingRef.current?.style.left,
          top: cursorRingRef.current?.style.top,
          width: size,
          height: size,
          transform: 'translate(-50%, -50%)',
          opacity: cursorVariant === 'project' || cursorVariant === 'hover' ? 0.8 : 0,
          transition: 'all 0.3s ease-out',
        }}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,3 93,25 93,75 50,97 7,75 7,25"
          fill="none"
          stroke={styleConfig.ringColor}
          strokeWidth="3"
        />
      </svg>
    );
  };

  return (
    <>
      {/* Main dot cursor */}
      <div
        ref={cursorRef}
        className="custom-cursor fixed pointer-events-none z-[9999] mix-blend-difference"
        style={getDotStyle()}
      />
      {/* Crosshair horizontal line */}
      {styleConfig.ringStyle === 'crosshair' && (
        <div
          className="fixed pointer-events-none z-[9998] mix-blend-difference"
          style={{
            left: cursorRef.current?.style.left || 0,
            top: cursorRef.current?.style.top || 0,
            width: styleConfig.dotSize * 3,
            height: 2,
            backgroundColor: styleConfig.dotColor,
            transform: 'translate(-50%, -50%)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        />
      )}
      {/* Expanding ring */}
      <div
        ref={cursorRingRef}
        className="custom-cursor fixed pointer-events-none z-[9998]"
        style={getRingStyle()}
      />
      {/* Special shape rings */}
      {renderTriangleRing()}
      {renderHexagonRing()}
    </>
  );
};

export default CustomCursor;

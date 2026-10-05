import { useEffect, useState } from 'react';

export interface DeviceProfile {
  /** Coarse pointer or narrow viewport — phones, and most tablets held in hand. */
  isMobile: boolean;
  /** The OS-level "reduce motion" preference. */
  reducedMotion: boolean;
  /**
   * Skip decorative, continuously-animating work: the background particle field,
   * smooth-scroll hijacking, the custom cursor, the grain overlay, scrubbed
   * per-word text reveals. The page should still look designed without them.
   */
  lite: boolean;
  /** Upper bound for Canvas `dpr`. Phones have dense screens and weak GPUs. */
  maxDpr: number;
}

const read = (): DeviceProfile => {
  if (typeof window === 'undefined') {
    return { isMobile: false, reducedMotion: false, lite: false, maxDpr: 1.5 };
  }

  const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  const isMobile = coarsePointer || narrow;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    isMobile,
    reducedMotion,
    lite: isMobile || reducedMotion,
    // A phone at dpr 3 with a full-screen WebGL canvas is rendering ~9× the
    // fragments of a dpr-1 pass, on a GPU with a fraction of the headroom.
    maxDpr: isMobile ? 1 : 1.5,
  };
};

/**
 * Resolved synchronously on the first render via a lazy initialiser. The older
 * `useIsMobile` reported `false` until its effect ran, so anything gated on it
 * mounted on the desktop path first and then tore itself down — which for a
 * WebGL canvas means creating and destroying a GL context on every phone load.
 */
export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(read);

  useEffect(() => {
    const update = () => setProfile((prev) => {
      const next = read();
      // Only re-render when something that matters actually flipped.
      return prev.isMobile === next.isMobile &&
        prev.reducedMotion === next.reducedMotion &&
        prev.maxDpr === next.maxDpr
        ? prev
        : next;
    });

    const pointer = window.matchMedia('(hover: none) and (pointer: coarse)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    pointer.addEventListener('change', update);
    motion.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      pointer.removeEventListener('change', update);
      motion.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return profile;
}

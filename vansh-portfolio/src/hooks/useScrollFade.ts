import { useEffect, useRef } from 'react';

/**
 * Fades an element out over the first `distance` px of scroll.
 *
 * This writes opacity straight to the DOM rather than holding it in React state.
 * State was the obvious implementation and it was the single worst thing for
 * smoothness on this site: the scroll handler fired a setState per scroll event,
 * which re-rendered the page component, and on the project pages that page
 * component owns the <Canvas>. So every scroll event re-created the whole 3D
 * scene's JSX and made the reconciler diff it — hundreds of elements, ~60×/s,
 * purely to animate one opacity value.
 *
 * Reads are also coalesced into a rAF so a burst of scroll events costs one
 * layout-affecting write per frame instead of one per event.
 */
export function useScrollFade<T extends HTMLElement>(distance = 200) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const opacity = Math.max(0, 1 - window.scrollY / distance);
      el.style.opacity = String(opacity);
      el.style.pointerEvents = opacity > 0.05 ? '' : 'none';
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [distance]);

  return ref;
}

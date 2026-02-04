/// <reference types="vite/client" />

declare module 'lenis' {
  interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    orientation?: 'vertical' | 'horizontal';
    gestureOrientation?: 'vertical' | 'horizontal' | 'both';
    smoothWheel?: boolean;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    infinite?: boolean;
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    raf(time: number): void;
    on(event: 'scroll', callback: (e: any) => void): void;
    destroy(): void;
    scrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }): void;
  }
}

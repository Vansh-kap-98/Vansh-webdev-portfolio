import { create } from 'zustand';

export type AccentColor = 'teal' | 'orange' | 'neon' | 'purple' | 'gold' | 'cyan' | null;
export type CursorStyle = 'default' | 'estate' | 'gastro' | 'void' | 'neuro' | 'velocity' | 'artifacts';

interface ThemeState {
  activeAccent: AccentColor;
  hoveredProject: string | null;
  cursorVariant: 'default' | 'hover' | 'project' | 'hidden';
  cursorText: string;
  cursorStyle: CursorStyle;
  setActiveAccent: (accent: AccentColor) => void;
  setHoveredProject: (project: string | null) => void;
  setCursorVariant: (variant: 'default' | 'hover' | 'project' | 'hidden') => void;
  setCursorText: (text: string) => void;
  setCursorStyle: (style: CursorStyle) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeAccent: null,
  hoveredProject: null,
  cursorVariant: 'default',
  cursorText: '',
  cursorStyle: 'default',
  setActiveAccent: (accent) => set({ activeAccent: accent }),
  setHoveredProject: (project) => set({ hoveredProject: project }),
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  setCursorText: (text) => set({ cursorText: text }),
  setCursorStyle: (style) => set({ cursorStyle: style }),
}));

export const accentColors: Record<string, { hsl: string; className: string }> = {
  teal: { hsl: '175 70% 50%', className: 'accent-teal' },
  orange: { hsl: '25 95% 55%', className: 'accent-orange' },
  neon: { hsl: '120 100% 50%', className: 'accent-neon' },
  purple: { hsl: '270 70% 60%', className: 'accent-purple' },
  gold: { hsl: '45 90% 55%', className: 'accent-gold' },
  cyan: { hsl: '190 100% 50%', className: 'accent-cyan' },
};

export const cursorStyles: Record<CursorStyle, { 
  dotColor: string; 
  ringColor: string; 
  dotSize: number;
  ringStyle: 'circle' | 'square' | 'diamond' | 'crosshair' | 'hexagon' | 'triangle';
}> = {
  default: { dotColor: 'white', ringColor: 'rgba(255, 255, 255, 0.5)', dotSize: 6, ringStyle: 'circle' },
  estate: { dotColor: '#2dd4bf', ringColor: 'rgba(45, 212, 191, 0.4)', dotSize: 8, ringStyle: 'square' },
  gastro: { dotColor: '#f97316', ringColor: 'rgba(249, 115, 22, 0.4)', dotSize: 10, ringStyle: 'circle' },
  void: { dotColor: '#22c55e', ringColor: 'rgba(34, 197, 94, 0.4)', dotSize: 4, ringStyle: 'crosshair' },
  neuro: { dotColor: '#a855f7', ringColor: 'rgba(168, 85, 247, 0.4)', dotSize: 6, ringStyle: 'hexagon' },
  velocity: { dotColor: '#eab308', ringColor: 'rgba(234, 179, 8, 0.4)', dotSize: 8, ringStyle: 'diamond' },
  artifacts: { dotColor: '#06b6d4', ringColor: 'rgba(6, 182, 212, 0.4)', dotSize: 5, ringStyle: 'triangle' },
};

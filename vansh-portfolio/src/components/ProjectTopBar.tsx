import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ProjectTopBarProps {
  category: string;
  title: string;
}

/**
 * Top bar for the project pages.
 *
 * Replaces the two separately-floating pieces these pages used to have — a
 * `top-8 left-8` back link and a `top-8 right-8` title block. On a phone that
 * back link measured 61×20px: under half the 44px minimum touch target, sitting
 * in the hardest corner of an 812px-tall screen to reach one-handed, with no
 * surface behind it so it disappeared over bright parts of the 3D scene.
 *
 * On mobile this becomes a single app-style bar: one row, a 44px-tall back
 * control, a gradient scrim so it stays legible over any scene, and padding for
 * the notch. Desktop keeps the original floating look, where it worked fine.
 */
const ProjectTopBar = ({ category, title }: ProjectTopBarProps) => (
  <div
    className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    style={{ paddingTop: 'env(safe-area-inset-top)' }}
  >
    {/* Scrim: mobile only — on desktop the elements sit over empty canvas. */}
    <div
      aria-hidden
      className="md:hidden absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background via-background/75 to-transparent"
    />

    <div className="relative flex items-start justify-between gap-3 px-2 md:px-8 pt-2 md:pt-8">
      <Link
        to="/"
        aria-label="Back to all work"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full
                   min-h-[44px] px-3 text-muted-foreground
                   hover:text-foreground active:bg-foreground/10 transition-colors
                   md:min-h-0 md:px-0 md:pt-0"
      >
        <ArrowLeft className="w-5 h-5 shrink-0" />
        <span className="font-mono text-[13px] md:text-sm">Back</span>
      </Link>

      <div className="text-right pt-2 pr-2 md:pt-0 md:pr-0">
        <span className="block font-mono text-[11px] md:text-[10px] text-muted-foreground uppercase tracking-[0.12em] md:tracking-widest">
          {category}
        </span>
        <h1 className="font-heading text-base md:text-2xl font-bold leading-tight">{title}</h1>
      </div>
    </div>
  </div>
);

export default ProjectTopBar;

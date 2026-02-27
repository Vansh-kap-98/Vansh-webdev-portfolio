import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmoothScroll from '@/components/SmoothScroll';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scene from '@/components/canvas/Scene';
import { useContentStore } from '@/stores/contentStore';
import { ArrowLeft, Sparkles, Code, Rocket, Palette } from 'lucide-react';

const Process = () => {
  const navigate = useNavigate();
  const { processPageHeading, processPageSubtext } = useContentStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Discovery & Strategy',
      icon: Sparkles,
      description: 'Understanding your vision, goals, and target audience. We define the project scope and create a roadmap for success.',
      deliverables: ['Project Brief', 'Research Report', 'Strategy Document', 'Timeline & Budget'],
    },
    {
      number: '02',
      title: 'Design & Concept',
      icon: Palette,
      description: 'Translating ideas into visual concepts. Creating wireframes, mockups, and prototypes that bring your vision to life.',
      deliverables: ['Wireframes', 'Visual Design', 'Interactive Prototypes', '3D Concepts'],
    },
    {
      number: '03',
      title: 'Development',
      icon: Code,
      description: 'Building the experience with clean, performant code. Implementing 3D elements, animations, and interactions.',
      deliverables: ['Frontend Development', '3D Implementation', 'Animation & Effects', 'Testing & QA'],
    },
    {
      number: '04',
      title: 'Launch & Support',
      icon: Rocket,
      description: 'Deploying to production and ensuring everything runs smoothly. Providing ongoing support and optimization.',
      deliverables: ['Deployment', 'Performance Optimization', 'Documentation', 'Support & Maintenance'],
    },
  ];

  return (
    <SmoothScroll>

      <Scene />

      <div className="relative z-10">
        <Header />

        <main className="min-h-screen px-6 md:px-12 lg:px-20 py-32">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Page Header */}
          <div className="max-w-4xl mb-20">
            <span className="mono text-muted-foreground mb-4 block">PROCESS</span>
            <h1 className="section-heading mb-8">{processPageHeading}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {processPageSubtext}
            </p>
          </div>

          {/* Process Steps */}
          <div className="max-w-6xl space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 border-b border-border pb-20 last:border-0"
                >
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">
                        {step.number}
                      </div>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold">
                        {step.title}
                      </h2>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    <div>
                      <h3 className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-4">
                        Deliverables
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {step.deliverables.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-neon" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Section */}
          <div className="mt-32 pt-20 border-t border-border max-w-6xl">
            <h2 className="font-heading text-3xl font-bold mb-12">Typical Timeline</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="font-heading text-4xl font-bold">2-4</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Weeks</div>
                <p className="text-sm text-muted-foreground">Small to medium projects with standard features</p>
              </div>
              <div className="space-y-3">
                <div className="font-heading text-4xl font-bold">1-3</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Months</div>
                <p className="text-sm text-muted-foreground">Complex projects with custom 3D elements</p>
              </div>
              <div className="space-y-3">
                <div className="font-heading text-4xl font-bold">3+</div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Months</div>
                <p className="text-sm text-muted-foreground">Large-scale applications and platforms</p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Process;

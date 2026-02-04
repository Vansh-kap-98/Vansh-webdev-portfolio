import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scene from '@/components/canvas/Scene';
import { useContentStore } from '@/stores/contentStore';
import { ArrowLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();
  const { 
    aboutPageHeading, 
    aboutPageSubtext, 
    aboutBackgroundText, 
    aboutApproachText,
    aboutExpertise,
    aboutTechnologies
  } = useContentStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SmoothScroll>
      <CustomCursor />
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
            <span className="mono text-muted-foreground mb-4 block">ABOUT</span>
            <h1 className="section-heading mb-8">{aboutPageHeading}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {aboutPageSubtext}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl">
            {/* Column 1 */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-2xl font-bold mb-4">Background</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutBackgroundText}
                </p>
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold mb-4">Expertise</h2>
                <ul className="space-y-3 text-muted-foreground">
                  {aboutExpertise.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span 
                        className="w-1.5 h-1.5 rounded-full mt-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-2xl font-bold mb-4">Approach</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutApproachText}
                </p>
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold mb-4">Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {aboutTechnologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 border border-border rounded-full font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-20 border-t border-border max-w-6xl">
            <div>
              <div className="font-heading text-4xl font-bold mb-2">50+</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Projects Completed</div>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold mb-2">5+</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Years Experience</div>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold mb-2">30+</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Happy Clients</div>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold mb-2">100%</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Dedication</div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default About;

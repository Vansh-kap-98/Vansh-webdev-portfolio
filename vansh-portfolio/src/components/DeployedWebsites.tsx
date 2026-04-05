import { useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';

interface DeployedSite {
  id: string;
  name: string;
  url: string;
  description: string;
  technicalDetails: string[];
}

const deployedSites: DeployedSite[] = [
  {
    id: 'another-sky-explore',
    name: 'Another Sky Explore',
    url: 'https://www.anotherskyexplore.com',
    description:
      'Top rated tourism experience platform for Pushkar and Rajasthan with curated local tours and bookings.',
    technicalDetails: [
      'SEO-focused landing and category architecture',
      'Media-heavy hero and destination showcase',
      'Conversion-oriented inquiry and booking paths',
      'Google review and trust-signal integration',
    ],
  },
  {
    id: 'iccaiml',
    name: "ICCAIML'26",
    url: 'https://www.iccaiml.com',
    description:
      'Conference website for the 2nd International Conference on Computation of Artificial Intelligence and Machine Learning.',
    technicalDetails: [
      'Academic conference information architecture',
      'Structured sections for CFP, committees, and timeline',
      'Clarity-first content hierarchy for researchers',
      'Registration and publication workflow guidance',
    ],
  },
  {
    id: 'icaicc',
    name: "ICAICC'26",
    url: 'https://www.icaic2.com',
    description:
      'International conference portal for AI, communication, and computing with complete event details and updates.',
    technicalDetails: [
      'Event-centric UX optimized for quick scanning',
      'Venue, date, and submission flow prioritization',
      'Formal academic branding and tone consistency',
      'Static-page reliability for high-traffic periods',
    ],
  },
];

const buildPreviewUrl = (url: string) =>
  `https://image.thum.io/get/width/1200/crop/675/noanimate/${url}`;

const buildGoogleFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?sz=128&domain_url=${url}`;

const DeployedWebsites = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="relative py-section pb-8 md:pb-10 lg:pb-12 px-6 md:px-12 lg:px-20">
      <div className="mb-12 md:mb-14 flex items-end justify-between border-b border-border pb-8">
        <div>
          <span className="mono text-muted-foreground mb-2 block">02 / LIVE DEPLOYMENTS</span>
          <h2 className="section-heading">Deployed Working Websites</h2>
        </div>
        <div className="hidden md:block font-mono text-[10px] text-muted-foreground text-right">
          <div>SITES: 03</div>
          <div>STATUS: LIVE</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {deployedSites.map((site) => {
          const isFlipped = !!flippedCards[site.id];

          return (
            <article key={site.id} className="deployed-flip-card group">
              <div className={`deployed-flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="deployed-flip-face deployed-flip-front">
                  <div className="relative aspect-[16/10] overflow-hidden border border-border bg-card/60">
                    <img
                      src={buildPreviewUrl(site.url)}
                      alt={`${site.name} homepage preview`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    <img
                      src={buildGoogleFaviconUrl(site.url)}
                      alt="Site favicon"
                      className="absolute top-3 left-3 h-6 w-6 rounded-sm border border-border/70 bg-background/80 p-0.5"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="p-5 border-x border-b border-border bg-card/35">
                    <h3 className="font-heading text-xl font-bold tracking-tight mb-2">{site.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed min-h-16">{site.description}</p>

                    <div className="mt-5 flex items-center gap-3">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                      >
                        Visit Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleCard(site.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase tracking-widest hover:bg-card transition-colors"
                      >
                        Flip for Tech
                      </button>
                    </div>
                  </div>
                </div>

                <div className="deployed-flip-face deployed-flip-back">
                  <div className="h-full border border-border bg-card/45 p-6 flex flex-col">
                    <div className="mb-4">
                      <span className="mono text-muted-foreground block mb-2">Technical Highlights</span>
                      <h3 className="font-heading text-xl font-bold tracking-tight">{site.name}</h3>
                    </div>

                    <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                      {site.technicalDetails.map((detail) => (
                        <li key={detail} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/60" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center gap-3">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                      >
                        Visit Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleCard(site.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase tracking-widest hover:bg-card transition-colors"
                      >
                        Flip Back
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DeployedWebsites;
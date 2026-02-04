import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Scene from '@/components/canvas/Scene';
import { useContentStore } from '@/stores/contentStore';
import { ArrowLeft, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact = () => {
  const navigate = useNavigate();
  const { contactPageHeading, contactPageSubtext, contactEmail, contactLocation, contactResponseTime } = useContentStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! I will get back to you soon.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
            <span className="mono text-muted-foreground mb-4 block">CONTACT</span>
            <h1 className="section-heading mb-8">{contactPageHeading}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {contactPageSubtext}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-[1fr_400px] gap-12 md:gap-20 max-w-6xl">
            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                    Company / Organization
                  </label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                    Project Details *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project..."
                    rows={8}
                    className="bg-background/50 backdrop-blur-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto px-8 font-mono text-[10px] tracking-widest uppercase"
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-12">
              {/* Info Cards */}
              <div className="space-y-6">
                <div className="p-6 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-accent-teal" />
                    </div>
                    <div>
                      <h3 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                        Email
                      </h3>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-foreground hover:text-accent-teal transition-colors"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent-orange" />
                    </div>
                    <div>
                      <h3 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                        Location
                      </h3>
                      <p className="text-foreground whitespace-pre-line">
                        {contactLocation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-neon/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-accent-neon" />
                    </div>
                    <div>
                      <h3 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                        Response Time
                      </h3>
                      <p className="text-foreground">
                        {contactResponseTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">
                  Follow Me
                </h3>
                <div className="flex gap-4">
                  {['Twitter', 'LinkedIn', 'Dribbble', 'GitHub'].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-12 h-12 rounded-full border border-border hover:border-foreground hover:bg-foreground/5 transition-all flex items-center justify-center font-mono text-[10px]"
                    >
                      {social.charAt(0)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Contact;

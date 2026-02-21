import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Shield, Stethoscope, Clock, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import heroBg from '@/assets/hero-bg.jpg';
import logo from '@/assets/logo.png';

const features = [
  { icon: Stethoscope, title: 'Expert Doctors', description: 'Board-certified physicians across all specialties' },
  { icon: Calendar, title: 'Easy Booking', description: 'Book appointments online in just a few clicks' },
  { icon: Shield, title: 'Secure Records', description: 'Your medical data is encrypted and protected' },
  { icon: Clock, title: '24/7 Support', description: 'Round-the-clock emergency and support services' },
];

const stats = [
  { value: '50+', label: 'Expert Doctors' },
  { value: '10K+', label: 'Patients Served' },
  { value: '15+', label: 'Departments' },
  { value: '24/7', label: 'Emergency Care' },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user, role } = useAuth();
  const bookLink = user && role === 'patient' ? '/patient-dashboard/book' : '/register';
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="absolute inset-0 gradient-hero opacity-80 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <img src={logo} alt="LifeCare" className="h-10 w-10 object-contain" />
              <span className="text-primary font-semibold">LifeCare Hospital</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Your Health, Our <span className="text-gradient">Priority</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg animate-fade-in" style={{ animationDelay: '0.35s' }}>
              Experience world-class healthcare with compassionate doctors and modern facilities. Book your appointment today.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Link to={bookLink}>
                <Button size="lg" className="text-base hover-scale">Book Appointment</Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="secondary" className="text-base hover-scale">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Why Choose LifeCare?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">We combine expertise with compassion to deliver exceptional healthcare</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 120}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <f.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <AnimatedSection>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Register today and book your first appointment with our expert doctors.</p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-base hover-scale">Register Now</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-base bg-primary-foreground/10 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/20 hover-scale">
                  <Phone className="mr-2 h-4 w-4" /> Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}

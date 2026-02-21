import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Calendar, Users, Shield, Stethoscope, Clock, Phone } from 'lucide-react';

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

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-8 w-8 fill-primary text-primary" />
              <span className="text-primary font-semibold">LifeCare Hospital</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Health, Our <span className="text-gradient">Priority</span>
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8 max-w-lg">
              Experience world-class healthcare with compassionate doctors and modern facilities. Book your appointment today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="text-base">Book Appointment</Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
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
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose LifeCare?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">We combine expertise with compassion to deliver exceptional healthcare</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Register today and book your first appointment with our expert doctors.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-base">Register Now</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Phone className="mr-2 h-4 w-4" /> Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

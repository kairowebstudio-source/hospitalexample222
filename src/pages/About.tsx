import { Heart, Award, Users, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About LifeCare Hospital</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For over 20 years, LifeCare Hospital has been at the forefront of medical excellence, 
            providing comprehensive healthcare services with a patient-first approach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              To deliver compassionate, accessible, and world-class healthcare to every individual. 
              We believe in treating the whole person, not just the symptoms.
            </p>
            <p className="text-muted-foreground">
              Our team of dedicated professionals works tirelessly to ensure that every patient 
              receives personalized care tailored to their unique needs.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground mb-4">
              To be the most trusted healthcare provider, recognized for clinical excellence, 
              innovation, and patient satisfaction.
            </p>
            <p className="text-muted-foreground">
              We continuously invest in the latest medical technologies and training to stay 
              ahead in delivering the best possible outcomes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Award, title: 'Excellence', desc: 'Award-winning care recognized nationally' },
            { icon: Users, title: 'Compassion', desc: 'Patient-centered approach in everything we do' },
            { icon: Building, title: 'Innovation', desc: 'State-of-the-art facilities and technology' },
          ].map((v) => (
            <Card key={v.title} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <v.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope } from 'lucide-react';

interface Doctor {
  id: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  status: string;
  image_url?: string;
  profiles: { full_name: string; email: string } | null;
  departments: { name: string } | null;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('doctors')
        .select('*, profiles!doctors_user_id_profiles_fkey(full_name, email), departments(name)')
        .eq('status', 'active');
      setDoctors((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Doctors</h1>
          <p className="text-muted-foreground">Meet our team of experienced healthcare professionals</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No doctors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {doc.image_url ? (
                        <img src={doc.image_url} alt={`Dr. ${doc.profiles?.full_name}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full gradient-primary flex items-center justify-center">
                          <Stethoscope className="h-7 w-7 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">Dr. {doc.profiles?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">{doc.qualification}</p>
                      {doc.departments?.name && (
                        <Badge variant="secondary" className="mt-1">{doc.departments.name}</Badge>
                      )}
                      <div className="mt-3 text-sm text-muted-foreground space-y-1">
                        <p>{doc.experience_years} years experience</p>
                        <p>Fee: ${doc.consultation_fee}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

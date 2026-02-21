import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('departments').select('*').then(({ data }) => {
      setDepartments(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Departments</h1>
          <p className="text-muted-foreground">Comprehensive care across all medical specialties</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No departments listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{dept.description || 'Specialized medical care and treatment.'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

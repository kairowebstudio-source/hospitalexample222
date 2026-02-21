import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Stethoscope, Calendar, Building, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminOverview() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, departments: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, d, a, dept] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('doctors').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id, status, appointment_date', { count: 'exact' }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ patients: p.count || 0, doctors: d.count || 0, appointments: a.count || 0, departments: dept.count || 0 });

      // Status chart
      const appts = a.data || [];
      const statusMap: Record<string, number> = {};
      appts.forEach((ap: any) => { statusMap[ap.status] = (statusMap[ap.status] || 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

      // Monthly chart
      const monthMap: Record<string, number> = {};
      appts.forEach((ap: any) => {
        const month = ap.appointment_date?.substring(0, 7) || 'Unknown';
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      setChartData(Object.entries(monthMap).map(([month, count]) => ({ month, count })));
    };
    load();
  }, []);

  const COLORS = ['hsl(199,89%,48%)', 'hsl(172,66%,50%)', 'hsl(142,71%,45%)', 'hsl(0,72%,51%)'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="pt-6 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.patients}</p><p className="text-sm text-muted-foreground">Patients</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><Stethoscope className="h-8 w-8 text-accent" /><div><p className="text-2xl font-bold">{stats.doctors}</p><p className="text-sm text-muted-foreground">Doctors</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><Calendar className="h-8 w-8 text-warning" /><div><p className="text-2xl font-bold">{stats.appointments}</p><p className="text-sm text-muted-foreground">Appointments</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><Building className="h-8 w-8 text-success" /><div><p className="text-2xl font-bold">{stats.departments}</p><p className="text-sm text-muted-foreground">Departments</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Appointments by Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Appointment Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminDoctors() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', department_id: '', qualification: '', experience_years: 0, consultation_fee: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('doctors').select('*, profiles!doctors_user_id_profiles_fkey(full_name, email), departments(name)');
    setDoctors(data || []);
    const { data: depts } = await supabase.from('departments').select('*');
    setDepartments(depts || []);
  };

  useEffect(() => { load(); }, []);

  const addDoctor = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          department_id: form.department_id || null,
          qualification: form.qualification,
          experience_years: form.experience_years,
          consultation_fee: form.consultation_fee,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create doctor');
      toast({ title: 'Doctor added!' });
      setDialogOpen(false);
      setForm({ email: '', password: '', full_name: '', department_id: '', qualification: '', experience_years: 0, consultation_fee: 0 });
      load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const deleteDoctor = async (doctorId: string, userId: string) => {
    await supabase.from('doctors').delete().eq('id', doctorId);
    await supabase.from('user_roles').delete().eq('user_id', userId);
    toast({ title: 'Doctor removed' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button>Add Doctor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div>
                <Label>Department</Label>
                <Select value={form.department_id} onValueChange={v => setForm({ ...form, department_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Experience (yrs)</Label><Input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: +e.target.value })} /></div>
                <div><Label>Fee ($)</Label><Input type="number" value={form.consultation_fee} onChange={e => setForm({ ...form, consultation_fee: +e.target.value })} /></div>
              </div>
              <Button className="w-full" onClick={addDoctor} disabled={loading}>{loading ? 'Adding...' : 'Add Doctor'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {doctors.map(d => (
          <Card key={d.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Dr. {d.profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">{d.departments?.name} • {d.qualification} • {d.experience_years}yr exp</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={d.status === 'active' ? 'default' : 'secondary'}>{d.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => deleteDoctor(d.id, d.user_id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminPatients() {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('patients').select('*, profiles!patients_user_id_profiles_fkey(full_name, email, phone)').then(({ data }) => setPatients(data || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Patients</h1>
      <div className="space-y-3">
        {patients.map(p => (
          <Card key={p.id}>
            <CardContent className="py-4">
              <p className="font-medium">{p.profiles?.full_name || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">{p.profiles?.email} • {p.gender} • {p.blood_group}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from('appointments').select('*, patients(profiles!patients_user_id_profiles_fkey(full_name)), doctors(profiles!doctors_user_id_profiles_fkey(full_name)), departments(name)').order('appointment_date', { ascending: false });
    setAppointments(data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const channel = supabase.channel('admin-appointments').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const statusColor: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-info/10 text-info',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Appointments</h1>
      <div className="space-y-3">
        {appointments.map(a => (
          <Card key={a.id}>
            <CardContent className="py-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">{a.patients?.profiles?.full_name} → Dr. {a.doctors?.profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">{a.departments?.name} • {a.appointment_date} at {a.appointment_time}</p>
              </div>
              <Badge className={statusColor[a.status] || ''}>{a.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminDepartments() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    const { data } = await supabase.from('departments').select('*');
    setDepartments(data || []);
  };

  useEffect(() => { load(); }, []);

  const addDepartment = async () => {
    if (!name) return;
    const { error } = await supabase.from('departments').insert({ name, description });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Department added!' }); setName(''); setDescription(''); load(); }
  };

  const deleteDepartment = async (id: string) => {
    await supabase.from('departments').delete().eq('id', id);
    toast({ title: 'Department deleted' });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Departments</h1>
      <Card className="mb-6 max-w-lg">
        <CardContent className="pt-6 space-y-3">
          <div><Label>Department Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
          <Button onClick={addDepartment}>Add Department</Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {departments.map(d => (
          <Card key={d.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-muted-foreground">{d.description}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => deleteDepartment(d.id)}><Trash2 className="h-3 w-3" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

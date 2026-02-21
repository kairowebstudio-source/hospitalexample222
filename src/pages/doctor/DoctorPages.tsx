import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function DoctorOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).maybeSingle();
      if (doc) {
        const { data } = await supabase.from('appointments').select('status').eq('doctor_id', doc.id);
        const appts = data || [];
        setStats({
          total: appts.length,
          pending: appts.filter(a => a.status === 'pending').length,
          completed: appts.filter(a => a.status === 'completed').length,
        });
      }
    };
    load();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-3"><Calendar className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Appointments</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><Clock className="h-8 w-8 text-warning" /><div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-success" /><div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></div></CardContent></Card>
      </div>
    </div>
  );
}

export function DoctorAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionDialog, setPrescriptionDialog] = useState<string | null>(null);
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '' }]);
  const [notes, setNotes] = useState('');

  const load = async () => {
    if (!user) return;
    const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).maybeSingle();
    if (doc) {
      const { data } = await supabase.from('appointments').select('*, patients(profiles!patients_user_id_profiles_fkey(full_name)), departments(name)').eq('doctor_id', doc.id).order('appointment_date', { ascending: false });
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    const channel = supabase.channel('doctor-appointments').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status: status as any }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: `Appointment ${status}` }); load(); }
  };

  const addPrescription = async (appointmentId: string) => {
    if (!user) return;
    const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).maybeSingle();
    const appt = appointments.find(a => a.id === appointmentId);
    if (!doc || !appt) return;

    const { error } = await supabase.from('prescriptions').insert({
      appointment_id: appointmentId,
      doctor_id: doc.id,
      patient_id: appt.patient_id,
      medications: medications as any,
      notes,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Prescription added!' });
      setPrescriptionDialog(null);
      setMedications([{ name: '', dosage: '', frequency: '' }]);
      setNotes('');
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-info/10 text-info',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      {appointments.length === 0 ? (
        <p className="text-muted-foreground">No appointments assigned.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-medium">{a.patients?.profiles?.full_name || 'Unknown Patient'}</p>
                    <p className="text-sm text-muted-foreground">{a.departments?.name} • {a.appointment_date} at {a.appointment_time}</p>
                    {a.reason && <p className="text-sm text-muted-foreground">Reason: {a.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={statusColor[a.status] || ''}>{a.status}</Badge>
                    {a.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(a.id, 'confirmed')}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')}>Reject</Button>
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <Button size="sm" onClick={() => updateStatus(a.id, 'completed')}>Complete</Button>
                    )}
                    {(a.status === 'confirmed' || a.status === 'completed') && (
                      <Dialog open={prescriptionDialog === a.id} onOpenChange={(open) => setPrescriptionDialog(open ? a.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary">Add Prescription</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Prescription</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            {medications.map((med, i) => (
                              <div key={i} className="grid grid-cols-3 gap-2">
                                <Input placeholder="Medicine" value={med.name} onChange={e => { const m = [...medications]; m[i].name = e.target.value; setMedications(m); }} />
                                <Input placeholder="Dosage" value={med.dosage} onChange={e => { const m = [...medications]; m[i].dosage = e.target.value; setMedications(m); }} />
                                <Input placeholder="Frequency" value={med.frequency} onChange={e => { const m = [...medications]; m[i].frequency = e.target.value; setMedications(m); }} />
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => setMedications([...medications, { name: '', dosage: '', frequency: '' }])}>+ Add Medicine</Button>
                            <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></div>
                            <Button className="w-full" onClick={() => addPrescription(a.id)}>Save Prescription</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function DoctorAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('doctors').select('availability_schedule').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.availability_schedule) setSchedule(data.availability_schedule as any);
    });
  }, [user]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('doctors').update({ availability_schedule: schedule as any }).eq('user_id', user!.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Schedule updated!' });
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Availability</h1>
      <Card className="max-w-lg">
        <CardContent className="pt-6 space-y-4">
          {days.map(day => (
            <div key={day} className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">{day}</Label>
              <Input type="time" value={schedule[day]?.start || ''} onChange={e => setSchedule({ ...schedule, [day]: { ...schedule[day], start: e.target.value } })} placeholder="Start" />
              <Input type="time" value={schedule[day]?.end || ''} onChange={e => setSchedule({ ...schedule, [day]: { ...schedule[day], end: e.target.value } })} placeholder="End" />
            </div>
          ))}
          <Button className="w-full" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Schedule'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

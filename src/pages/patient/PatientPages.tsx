import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, FileText, User, X, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function PatientOverview() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
      if (patient) {
        const { data: appts } = await supabase.from('appointments').select('*, doctors(profiles!doctors_user_id_profiles_fkey(full_name)), departments(name)').eq('patient_id', patient.id).order('appointment_date', { ascending: false }).limit(5);
        setAppointments(appts || []);
        const { data: presc } = await supabase.from('prescriptions').select('*, doctors(profiles!doctors_user_id_profiles_fkey(full_name))').eq('patient_id', patient.id).order('created_at', { ascending: false }).limit(5);
        setPrescriptions(presc || []);
      }
    };
    load();
  }, [user]);

  const statusColor: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-info/10 text-info',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-sm text-muted-foreground">Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{prescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-sm text-muted-foreground">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <h2 className="text-lg font-semibold mb-3">Recent Appointments</h2>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No appointments yet.</p>
        ) : appointments.map((a) => (
          <Card key={a.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Dr. {a.doctors?.profiles?.full_name || 'Unknown'}</p>
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

export function PatientBookAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({ doctor_id: '', department_id: '', date: '', time: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    supabase.from('doctors').select('*, profiles!doctors_user_id_profiles_fkey(full_name, email), departments(name)').eq('status', 'active').then(({ data }) => setAllDoctors(data || []));
    supabase.from('departments').select('*').then(({ data }) => setDepartments(data || []));
  }, []);

  // Filter doctors when department changes
  const handleDepartmentSelect = (deptId: string) => {
    setForm(f => ({ ...f, department_id: deptId, doctor_id: '' }));
    setSelectedDoctor(null);
    const filtered = allDoctors.filter(d => d.department_id === deptId);
    setFilteredDoctors(filtered);
  };

  const handleDoctorSelect = (doctorId: string) => {
    setForm(f => ({ ...f, doctor_id: doctorId }));
    const doc = allDoctors.find(d => d.id === doctorId);
    setSelectedDoctor(doc || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
    if (!patient) { toast({ title: 'Error', description: 'Patient profile not found.', variant: 'destructive' }); setLoading(false); return; }

    const { error } = await supabase.from('appointments').insert({
      patient_id: patient.id,
      doctor_id: form.doctor_id,
      department_id: form.department_id || null,
      appointment_date: form.date,
      appointment_time: form.time,
      reason: form.reason,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Appointment booked!', description: 'Your appointment has been scheduled.' });
      setForm({ doctor_id: '', department_id: '', date: '', time: '', reason: '' });
      setSelectedDoctor(null);
      setFilteredDoctors([]);
    }
    setLoading(false);
  };

  const getDoctorImage = (doc: any) => doc?.image_url || null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Select Department */}
              <div>
                <Label>1. Select Department</Label>
                <Select value={form.department_id} onValueChange={handleDepartmentSelect}>
                  <SelectTrigger><SelectValue placeholder="Choose a department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Select Doctor (filtered by department) */}
              <div>
                <Label>2. Select Doctor</Label>
                {!form.department_id ? (
                  <p className="text-sm text-muted-foreground mt-1">Please select a department first</p>
                ) : filteredDoctors.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">No doctors available in this department</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {filteredDoctors.map(d => (
                      <Card
                        key={d.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${form.doctor_id === d.id ? 'ring-2 ring-primary border-primary' : ''}`}
                        onClick={() => handleDoctorSelect(d.id)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {getDoctorImage(d) ? (
                              <img src={getDoctorImage(d)} alt="Doctor" className="w-full h-full object-cover" />
                            ) : (
                              <Stethoscope className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">Dr. {d.profiles?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{d.qualification || 'General'}</p>
                            <p className="text-xs text-primary font-medium">${d.consultation_fee || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>3. Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
                </div>
              </div>

              {/* Step 4: Reason */}
              <div>
                <Label>4. Reason for Visit</Label>
                <Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Describe your symptoms or reason for visit" />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !form.doctor_id || !form.department_id}>
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Doctor Details Panel */}
        <Card className={selectedDoctor ? 'animate-fade-in' : 'opacity-50'}>
          <CardHeader>
            <CardTitle className="text-base">Doctor Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDoctor ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {getDoctorImage(selectedDoctor) ? (
                      <img src={getDoctorImage(selectedDoctor)} alt="Doctor" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Dr. {selectedDoctor.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.profiles?.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <Badge variant="secondary">{selectedDoctor.departments?.name || 'General'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qualification</span>
                    <span className="font-medium">{selectedDoctor.qualification || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{selectedDoctor.experience_years || 0} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span className="font-medium text-primary">${selectedDoctor.consultation_fee || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a doctor to view their details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PatientAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
    if (patient) {
      const { data } = await supabase.from('appointments').select('*, doctors(profiles!doctors_user_id_profiles_fkey(full_name)), departments(name)').eq('patient_id', patient.id).order('appointment_date', { ascending: false });
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    const channel = supabase.channel('patient-appointments').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => { load(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' as any }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Appointment cancelled' }); load(); }
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
        <p className="text-muted-foreground">No appointments found.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium">Dr. {a.doctors?.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{a.departments?.name} • {a.appointment_date} at {a.appointment_time}</p>
                    {a.reason && <p className="text-sm text-muted-foreground mt-1">Reason: {a.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor[a.status] || ''}>{a.status}</Badge>
                    {a.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => cancelAppointment(a.id)}><X className="h-3 w-3 mr-1" />Cancel</Button>
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

export function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
      if (patient) {
        const { data } = await supabase.from('prescriptions').select('*, doctors(profiles!doctors_user_id_profiles_fkey(full_name))').eq('patient_id', patient.id).order('created_at', { ascending: false });
        setPrescriptions(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Prescriptions</h1>
      {prescriptions.length === 0 ? (
        <p className="text-muted-foreground">No prescriptions found.</p>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">Dr. {p.doctors?.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {p.medications && Array.isArray(p.medications) && (
                  <div className="mb-2">
                    <p className="text-sm font-medium mb-1">Medications:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {p.medications.map((m: any, i: number) => (
                        <li key={i}>{m.name} - {m.dosage} ({m.frequency})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.notes && <p className="text-sm text-muted-foreground">Notes: {p.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function PatientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from('patients').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => setPatient(data));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('user_id', user!.id);
    await supabase.from('patients').update({
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      blood_group: patient.blood_group,
      address: patient.address,
      emergency_contact: patient.emergency_contact,
    }).eq('user_id', user!.id);
    toast({ title: 'Profile updated!' });
    setLoading(false);
  };

  if (!profile) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile.email || ''} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={patient?.date_of_birth || ''} onChange={e => setPatient({ ...patient, date_of_birth: e.target.value })} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={patient?.gender || ''} onValueChange={v => setPatient({ ...patient, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select value={patient?.blood_group || ''} onValueChange={v => setPatient({ ...patient, blood_group: v })}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={patient?.address || ''} onChange={e => setPatient({ ...patient, address: e.target.value })} />
            </div>
            <div>
              <Label>Emergency Contact</Label>
              <Input value={patient?.emergency_contact || ''} onChange={e => setPatient({ ...patient, emergency_contact: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if admin already exists
    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingRoles && existingRoles.length > 0) {
      return new Response(JSON.stringify({ message: "Demo data already seeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create departments first
    const deptData = [
      { name: "Cardiology", description: "Heart and cardiovascular system care" },
      { name: "Neurology", description: "Brain and nervous system disorders" },
      { name: "Orthopedics", description: "Bone, joint, and muscle treatment" },
      { name: "Pediatrics", description: "Medical care for infants and children" },
      { name: "Dermatology", description: "Skin, hair, and nail conditions" },
    ];
    const { data: departments } = await supabaseAdmin.from("departments").insert(deptData).select();

    // Create admin user
    const { data: adminAuth } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@lifecare.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: { full_name: "Admin User" },
    });
    if (adminAuth.user) {
      await supabaseAdmin.from("user_roles").insert({ user_id: adminAuth.user.id, role: "admin" });
    }

    // Create doctor users
    const doctorInfos = [
      { email: "dr.smith@lifecare.com", name: "John Smith", dept: 0, qual: "MD Cardiology", exp: 15, fee: 200 },
      { email: "dr.jones@lifecare.com", name: "Sarah Jones", dept: 1, qual: "MD Neurology", exp: 10, fee: 180 },
    ];

    const doctorIds: string[] = [];
    for (const doc of doctorInfos) {
      const { data: docAuth } = await supabaseAdmin.auth.admin.createUser({
        email: doc.email,
        password: "doctor123",
        email_confirm: true,
        user_metadata: { full_name: doc.name },
      });
      if (docAuth.user) {
        await supabaseAdmin.from("user_roles").insert({ user_id: docAuth.user.id, role: "doctor" });
        const { data: docRow } = await supabaseAdmin.from("doctors").insert({
          user_id: docAuth.user.id,
          department_id: departments![doc.dept].id,
          qualification: doc.qual,
          experience_years: doc.exp,
          consultation_fee: doc.fee,
          availability_schedule: { Monday: { start: "09:00", end: "17:00" }, Tuesday: { start: "09:00", end: "17:00" }, Wednesday: { start: "09:00", end: "17:00" }, Thursday: { start: "09:00", end: "17:00" }, Friday: { start: "09:00", end: "15:00" } },
        }).select().single();
        if (docRow) doctorIds.push(docRow.id);
      }
    }

    // Create patient users
    const patientInfos = [
      { email: "patient1@test.com", name: "Alice Brown", gender: "female", blood: "A+", dob: "1990-05-15" },
      { email: "patient2@test.com", name: "Bob Wilson", gender: "male", blood: "O+", dob: "1985-08-22" },
      { email: "patient3@test.com", name: "Carol Davis", gender: "female", blood: "B-", dob: "1995-03-10" },
    ];

    const patientIds: string[] = [];
    for (const pat of patientInfos) {
      const { data: patAuth } = await supabaseAdmin.auth.admin.createUser({
        email: pat.email,
        password: "patient123",
        email_confirm: true,
        user_metadata: { full_name: pat.name },
      });
      if (patAuth.user) {
        await supabaseAdmin.from("user_roles").insert({ user_id: patAuth.user.id, role: "patient" });
        const { data: patRow } = await supabaseAdmin.from("patients").insert({
          user_id: patAuth.user.id,
          date_of_birth: pat.dob,
          gender: pat.gender,
          blood_group: pat.blood,
          address: "123 Main St",
          emergency_contact: "+1-555-0100",
        }).select().single();
        if (patRow) patientIds.push(patRow.id);
      }
    }

    // Create appointments
    if (patientIds.length >= 3 && doctorIds.length >= 2 && departments) {
      const appointments = [
        { patient_id: patientIds[0], doctor_id: doctorIds[0], department_id: departments[0].id, appointment_date: "2026-03-01", appointment_time: "10:00", status: "confirmed", reason: "Chest pain" },
        { patient_id: patientIds[0], doctor_id: doctorIds[1], department_id: departments[1].id, appointment_date: "2026-03-05", appointment_time: "14:00", status: "pending", reason: "Headaches" },
        { patient_id: patientIds[1], doctor_id: doctorIds[0], department_id: departments[0].id, appointment_date: "2026-02-28", appointment_time: "11:00", status: "completed", reason: "Heart checkup" },
        { patient_id: patientIds[1], doctor_id: doctorIds[1], department_id: departments[1].id, appointment_date: "2026-03-10", appointment_time: "09:00", status: "pending", reason: "Dizziness" },
        { patient_id: patientIds[2], doctor_id: doctorIds[0], department_id: departments[0].id, appointment_date: "2026-03-15", appointment_time: "15:00", status: "confirmed", reason: "Blood pressure" },
      ];
      const { data: appts } = await supabaseAdmin.from("appointments").insert(appointments).select();

      // Create prescriptions
      if (appts) {
        const completedAppt = appts.find(a => a.status === "completed");
        const confirmedAppts = appts.filter(a => a.status === "confirmed");
        
        const prescriptions = [];
        if (completedAppt) {
          prescriptions.push({
            appointment_id: completedAppt.id,
            doctor_id: completedAppt.doctor_id,
            patient_id: completedAppt.patient_id,
            medications: [{ name: "Aspirin", dosage: "100mg", frequency: "Once daily" }, { name: "Metoprolol", dosage: "50mg", frequency: "Twice daily" }],
            notes: "Follow up in 2 weeks. Monitor blood pressure daily.",
          });
        }
        if (confirmedAppts[0]) {
          prescriptions.push({
            appointment_id: confirmedAppts[0].id,
            doctor_id: confirmedAppts[0].doctor_id,
            patient_id: confirmedAppts[0].patient_id,
            medications: [{ name: "Lisinopril", dosage: "10mg", frequency: "Once daily" }],
            notes: "Start medication immediately. Avoid salt.",
          });
        }
        if (confirmedAppts[1]) {
          prescriptions.push({
            appointment_id: confirmedAppts[1].id,
            doctor_id: confirmedAppts[1].doctor_id,
            patient_id: confirmedAppts[1].patient_id,
            medications: [{ name: "Amlodipine", dosage: "5mg", frequency: "Once daily" }, { name: "Vitamin D", dosage: "1000IU", frequency: "Once daily" }],
            notes: "Regular exercise recommended.",
          });
        }
        if (prescriptions.length > 0) {
          await supabaseAdmin.from("prescriptions").insert(prescriptions);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Demo data seeded successfully!",
        credentials: {
          admin: { email: "admin@lifecare.com", password: "admin123" },
          doctors: [
            { email: "dr.smith@lifecare.com", password: "doctor123" },
            { email: "dr.jones@lifecare.com", password: "doctor123" },
          ],
          patients: [
            { email: "patient1@test.com", password: "patient123" },
            { email: "patient2@test.com", password: "patient123" },
            { email: "patient3@test.com", password: "patient123" },
          ],
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

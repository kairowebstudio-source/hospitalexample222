import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) throw new Error("Admin access required");

    const { email, password, full_name, department_id, qualification, experience_years, consultation_fee } = await req.json();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user");
    }

    await supabaseAdmin.from("user_roles").insert({ user_id: authData.user.id, role: "doctor" });

    await supabaseAdmin.from("doctors").insert({
      user_id: authData.user.id,
      department_id: department_id || null,
      qualification: qualification || "",
      experience_years: experience_years || 0,
      consultation_fee: consultation_fee || 0,
    });

    // Send welcome email to doctor
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "LifeCare Hospital <onboarding@resend.dev>",
          to: [email],
          subject: "Welcome to LifeCare Hospital - Your Doctor Account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0891b2; margin: 0;">LifeCare Hospital</h1>
                <p style="color: #6b7280; font-size: 14px;">Healthcare Management System</p>
              </div>
              <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin-top: 0;">Welcome, Dr. ${full_name}!</h2>
                <p style="color: #475569; line-height: 1.6;">
                  You have been registered as a doctor at LifeCare Hospital. You can now log in to your dashboard to manage appointments, view patient details, and write prescriptions.
                </p>
                <div style="background: #ffffff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                  <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">Your Login Credentials</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Password:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${password}</td>
                    </tr>
                  </table>
                </div>
                <p style="color: #ef4444; font-size: 13px; margin-bottom: 20px;">
                  ⚠️ Please change your password after your first login for security.
                </p>
                <p style="color: #475569; font-size: 14px; margin-bottom: 0;">
                  Best regards,<br>
                  <strong>LifeCare Hospital Admin Team</strong>
                </p>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                This is an automated message from LifeCare Hospital Management System.
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the doctor creation if email fails
    }

    return new Response(JSON.stringify({ success: true, user_id: authData.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
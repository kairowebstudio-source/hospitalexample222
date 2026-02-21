import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import DoctorsPage from "@/pages/DoctorsPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import LoginRedirect from "@/pages/LoginRedirect";
import NotFound from "./pages/NotFound";

import { PatientOverview, PatientBookAppointment, PatientAppointments, PatientPrescriptions, PatientProfile } from "@/pages/patient/PatientPages";
import { DoctorOverview, DoctorAppointments, DoctorAvailability } from "@/pages/doctor/DoctorPages";
import { AdminOverview, AdminDoctors, AdminPatients, AdminAppointments, AdminDepartments } from "@/pages/admin/AdminPages";

import { Calendar, FileText, User, LayoutDashboard, PlusCircle, Stethoscope, Clock, Users, Building, BarChart3 } from "lucide-react";

const queryClient = new QueryClient();

const patientNav = [
  { title: "Overview", url: "/patient-dashboard", icon: LayoutDashboard },
  { title: "Book Appointment", url: "/patient-dashboard/book", icon: PlusCircle },
  { title: "My Appointments", url: "/patient-dashboard/appointments", icon: Calendar },
  { title: "Prescriptions", url: "/patient-dashboard/prescriptions", icon: FileText },
  { title: "Profile", url: "/patient-dashboard/profile", icon: User },
];

const doctorNav = [
  { title: "Overview", url: "/doctor-dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/doctor-dashboard/appointments", icon: Calendar },
  { title: "Availability", url: "/doctor-dashboard/availability", icon: Clock },
];

const adminNav = [
  { title: "Overview", url: "/admin-dashboard", icon: BarChart3 },
  { title: "Doctors", url: "/admin-dashboard/doctors", icon: Stethoscope },
  { title: "Patients", url: "/admin-dashboard/patients", icon: Users },
  { title: "Appointments", url: "/admin-dashboard/appointments", icon: Calendar },
  { title: "Departments", url: "/admin-dashboard/departments", icon: Building },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/login-redirect" element={<LoginRedirect />} />

            {/* Patient Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={["patient"]}><DashboardLayout navItems={patientNav} title="Patient" /></ProtectedRoute>}>
              <Route path="/patient-dashboard" element={<PatientOverview />} />
              <Route path="/patient-dashboard/book" element={<PatientBookAppointment />} />
              <Route path="/patient-dashboard/appointments" element={<PatientAppointments />} />
              <Route path="/patient-dashboard/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient-dashboard/profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={["doctor"]}><DashboardLayout navItems={doctorNav} title="Doctor" /></ProtectedRoute>}>
              <Route path="/doctor-dashboard" element={<DoctorOverview />} />
              <Route path="/doctor-dashboard/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor-dashboard/availability" element={<DoctorAvailability />} />
            </Route>

            {/* Admin Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout navItems={adminNav} title="Admin" /></ProtectedRoute>}>
              <Route path="/admin-dashboard" element={<AdminOverview />} />
              <Route path="/admin-dashboard/doctors" element={<AdminDoctors />} />
              <Route path="/admin-dashboard/patients" element={<AdminPatients />} />
              <Route path="/admin-dashboard/appointments" element={<AdminAppointments />} />
              <Route path="/admin-dashboard/departments" element={<AdminDepartments />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

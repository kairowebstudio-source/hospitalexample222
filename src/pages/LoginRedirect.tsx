import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function LoginRedirect() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (role === 'admin') navigate('/admin-dashboard', { replace: true });
    else if (role === 'doctor') navigate('/doctor-dashboard', { replace: true });
    else if (role === 'patient') navigate('/patient-dashboard', { replace: true });
    else navigate('/', { replace: true });
  }, [role, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

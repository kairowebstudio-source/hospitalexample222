import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'register' | 'admin-login';

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset form on mode switch
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
  }, [mode]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'register') {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Account created!', description: 'Welcome to LifeCare Hospital.' });
        navigate('/patient-dashboard');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      } else {
        setTimeout(() => navigate('/login-redirect'), 500);
      }
    }
    setLoading(false);
  };

  const titles: Record<AuthMode, { icon: React.ReactNode; title: string; desc: string }> = {
    login: {
      icon: <Heart className="h-8 w-8 text-primary fill-primary" />,
      title: 'Welcome Back',
      desc: 'Sign in to your LifeCare account',
    },
    register: {
      icon: <Heart className="h-8 w-8 text-primary fill-primary" />,
      title: 'Patient Registration',
      desc: 'Create your LifeCare account',
    },
    'admin-login': {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Admin Login',
      desc: 'Authorized personnel only',
    },
  };

  const t = titles[mode];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm ${closing ? 'animate-fade-out' : 'animate-overlay-in'}`}
        onClick={handleClose}
      />

      {/* Card */}
      <Card className={`w-full max-w-sm relative z-10 shadow-2xl border-0 ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="text-center pb-2 pt-5 px-6">
          <div className="flex justify-center mb-1">{t.icon}</div>
          <CardTitle className="text-xl">{t.title}</CardTitle>
          <CardDescription className="text-xs">{t.desc}</CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="animate-fade-in">
                <Label htmlFor="name" className="text-xs">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-9" placeholder="Enter your full name" />
              </div>
            )}
            <div className="animate-fade-in" style={{ animationDelay: mode === 'register' ? '0.05s' : '0s' }}>
              <Label htmlFor="email" className="text-xs">{mode === 'admin-login' ? 'Admin Email' : 'Email'}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9" placeholder="your@email.com" />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: mode === 'register' ? '0.1s' : '0.05s' }}>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-9" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-9 animate-fade-in" style={{ animationDelay: '0.15s' }} disabled={loading}>
              {loading
                ? (mode === 'register' ? 'Creating account...' : 'Signing in...')
                : (mode === 'register' ? 'Register as Patient' : 'Sign In')
              }
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-3 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button onClick={() => onSwitchMode('register')} className="text-primary hover:underline font-medium">Register</button>
              </p>
              <button onClick={() => onSwitchMode('admin-login')} className="text-[10px] text-muted-foreground hover:text-primary mt-1 block mx-auto">
                Admin Login
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-3 text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Already have an account?{' '}
              <button onClick={() => onSwitchMode('login')} className="text-primary hover:underline font-medium">Sign in</button>
            </div>
          )}

          {mode === 'admin-login' && (
            <div className="mt-3 text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => onSwitchMode('login')} className="text-primary hover:underline font-medium">← Back to Login</button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

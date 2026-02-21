import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import authBg from '@/assets/auth-bg.jpg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      setTimeout(() => navigate('/login-redirect'), 500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${authBg})` }}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]" />
      <Card className="w-full max-w-sm relative z-10 shadow-2xl border-0">
        <Link to="/" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </Link>
        <CardHeader className="text-center pb-2 pt-5 px-6">
          <div className="flex justify-center mb-1">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription className="text-xs">Authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-xs">Admin Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-9" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="h-9" />
            </div>
            <Button type="submit" className="w-full h-9" disabled={loading}>
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

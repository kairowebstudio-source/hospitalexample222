import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import authBg from '@/assets/auth-bg.jpg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: 'Welcome to LifeCare Hospital.' });
      navigate('/patient-dashboard');
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
            <Heart className="h-8 w-8 text-primary fill-primary" />
          </div>
          <CardTitle className="text-xl">Patient Registration</CardTitle>
          <CardDescription className="text-xs">Create your LifeCare account</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-9" />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-9" />
            </div>
            <Button type="submit" className="w-full h-9" disabled={loading}>
              {loading ? 'Creating account...' : 'Register as Patient'}
            </Button>
          </form>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

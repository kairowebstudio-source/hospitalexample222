import { Link, Outlet, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/departments', label: 'Departments' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, role } = useAuth();

  const dashboardPath = role === 'admin' ? '/admin-dashboard' : role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="text-xl font-bold text-foreground">LifeCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.to ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to={dashboardPath}>
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/register"><Button size="sm">Register</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex gap-2">
              {user ? (
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)}><Button size="sm">Dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" size="sm">Login</Button></Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}><Button size="sm">Register</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="text-lg font-bold">LifeCare Hospital</span>
              </div>
              <p className="text-sm opacity-70">Providing quality healthcare services with compassion and excellence.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm opacity-70">
                {navLinks.map(l => <Link key={l.to} to={l.to} className="block hover:opacity-100">{l.label}</Link>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm opacity-70">
                <p>123 Healthcare Ave, Medical City</p>
                <p>+1 (555) 123-4567</p>
                <p>info@lifecare.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm opacity-50">
            © 2026 LifeCare Hospital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

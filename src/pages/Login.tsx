import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isAdminRole } from '@/contexts/AuthContext';
import { Eye, EyeOff, Coffee } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      const stored = { 'admin@cafeflow.com': 'SUPER_ADMIN', 'manager@cafeflow.com': 'MANAGER', 'accountant@cafeflow.com': 'ACCOUNTANT', 'staff@cafeflow.com': 'STAFF' };
      const role = stored[email as keyof typeof stored];
      if (role === 'STAFF') navigate('/staff');
      else navigate('/admin');
    } else {
      setError('Invalid credentials. Try admin@cafeflow.com / admin123');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Gradient Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 10}%`,
                background: `radial-gradient(circle, hsla(0, 0%, 100%, ${0.15 - i * 0.02}), transparent)`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-[48px]">
          <div className="flex items-center justify-center gap-[16px] mb-[32px]">
            <div className="w-[48px] h-[48px] rounded-lg bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <Coffee className="w-[24px] h-[24px] text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">CAFÉFLOW</h1>
          </div>
          <p className="text-xl text-primary-foreground/80 font-medium mb-[16px]">Enterprise Cafeteria Operating System</p>
          <p className="text-sm text-primary-foreground/60 max-w-md mx-auto leading-relaxed">
            Streamline your cafeteria operations with intelligent billing, real-time inventory, 
            and powerful analytics — all in one unified platform.
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-[48px] bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-[8px] mb-[40px]">
            <div className="w-[40px] h-[40px] rounded-lg gradient-primary flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CAFÉFLOW</span>
          </div>

          <div className="glass-card rounded-lg p-[40px] shadow-card">
            <h2 className="text-2xl font-bold text-foreground mb-[8px]">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-[32px]">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-[24px]">
              <div>
                <label className="block text-sm font-medium text-foreground mb-[8px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@cafeflow.com"
                  className="w-full px-[16px] py-[12px] rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-[8px]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-[16px] py-[12px] rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-all pr-[40px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary font-medium hover:underline">Forgot password?</a>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-[16px] py-[12px] rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-[12px] rounded-md gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>

            <div className="mt-[24px] pt-[24px] border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Access will redirect based on your assigned role
              </p>
            </div>

            <div className="mt-[24px] p-[16px] rounded-md bg-accent">
              <p className="text-xs font-medium text-accent-foreground mb-[8px]">Demo Accounts</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Admin: admin@cafeflow.com / admin123</p>
                <p>Staff: staff@cafeflow.com / staff123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

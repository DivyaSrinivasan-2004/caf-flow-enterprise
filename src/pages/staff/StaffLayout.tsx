import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Coffee, Bell, LogOut, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const staffTabs = [
  { label: 'Dashboard', path: '/staff' },
  { label: 'POS', path: '/staff/pos' },
  { label: 'Tables', path: '/staff/tables' },
  { label: 'Kitchen', path: '/staff/kitchen' },
  { label: 'Orders', path: '/staff/orders' },
  { label: 'Shift', path: '/staff/shift' },
];

const StaffLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-[24px] h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <div className="w-[32px] h-[32px] rounded-md gradient-primary flex items-center justify-center">
                <Coffee className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CAFÉFLOW</span>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-[8px] py-[4px] rounded-md font-medium">ORD-2848</span>
          </div>

          <div className="flex items-center gap-[16px]">
            <div className="flex items-center gap-[8px] text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{time.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              <span className="text-xs text-muted-foreground font-medium">On Shift</span>
            </div>
            <button className="relative p-[8px] rounded-md hover:bg-accent transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-[8px]">
              <div className="w-[28px] h-[28px] rounded-full gradient-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="p-[8px] rounded-md hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>

        <div className="px-[24px] flex gap-0 overflow-x-auto border-t border-border">
          {staffTabs.map(tab => {
            const isActive = tab.path === '/staff'
              ? location.pathname === '/staff'
              : location.pathname.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-[16px] py-[12px] text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="p-[24px]">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;

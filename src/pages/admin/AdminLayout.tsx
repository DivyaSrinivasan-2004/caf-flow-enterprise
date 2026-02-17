import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Coffee, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';

const adminTabs = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Invoices', path: '/admin/invoices' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Customers', path: '/admin/customers' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Inventory', path: '/admin/inventory' },
  { label: 'Settings', path: '/admin/settings' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-[24px] h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <div className="w-[32px] h-[32px] rounded-md gradient-primary flex items-center justify-center">
              <Coffee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CAFÉFLOW</span>
          </div>

          <div className="flex items-center gap-[16px]">
            <button className="relative p-[8px] rounded-md hover:bg-accent transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-[6px] right-[6px] w-2 h-2 rounded-full bg-destructive" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-md hover:bg-accent transition-colors"
              >
                <div className="w-[28px] h-[28px] rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-foreground">{user?.name?.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-[8px] w-48 bg-card rounded-md shadow-card border border-border py-[8px] z-50">
                  <div className="px-[16px] py-[8px] border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                  <button className="w-full text-left px-[16px] py-[8px] text-sm text-muted-foreground hover:bg-accent flex items-center gap-[8px]">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-[16px] py-[8px] text-sm text-destructive hover:bg-destructive/10 flex items-center gap-[8px]"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-[24px] flex gap-0 overflow-x-auto border-t border-border">
          {adminTabs.map(tab => {
            const isActive = tab.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-[16px] py-[12px] text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="p-[24px]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

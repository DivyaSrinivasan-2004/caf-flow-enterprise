import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Bell, LogOut, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
  
interface NavItem {
  label: string;
  path: string;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin" },
  { label: "Invoices", path: "/admin/invoices" },
  { label: "Products", path: "/admin/products" },
  { label: "Customers", path: "/admin/customers" },
  { label: "Payments", path: "/admin/payments" },
  { label: "Reports", path: "/admin/reports" },
  { label: "Inventory", path: "/admin/inventory" },
  { label: "Settings", path: "/admin/settings" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* PREMIUM GLASS HEADER */}
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-10xl px-4 pt-4">
          <nav className="glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg backdrop-blur-xl">

            {/* LOGO */}
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Coffee className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold gradient-primary-text hidden sm:block">
                CAFÉFLOW
              </span>
            </Link>

            {/* CENTER NAVIGATION */}
            <div className="flex items-center gap-1">
              {adminNav.map((item) => {
                const isActive =
                  item.path === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-3">
              
              {/* Notifications */}
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 gradient-primary rounded-full" />
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 glass rounded-xl shadow-xl border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Admin
                      </p>
                    </div>

                    <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-secondary flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="w-full px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
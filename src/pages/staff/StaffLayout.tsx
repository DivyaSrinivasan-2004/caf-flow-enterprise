import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, LogOut, ChevronDown, User } from "lucide-react";
import { useState } from "react";
  
interface NavItem {
  label: string;
  path: string;
}

const staffNav: NavItem[] = [
  { label: 'Dashboard', path: '/staff' },
  { label: 'POS', path: '/staff/pos' },
  { label: 'Tables', path: '/staff/tables' },
  { label: 'Kitchen', path: '/staff/kitchen' },
  { label: 'Orders', path: '/staff/orders' },
  
];

const StaffLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = user?.name || user?.username || user?.email || "Staff User";

  const handleLogout = async () => {
  const token = localStorage.getItem("access");

  if (token) {
    try {
      await fetch("http://192.168.1.3:8000/api/accounts/logout/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error("Logout API failed:", e);
    }
  }

  logout();       // clear local auth
  navigate("/");
};

  return (
    <div className="min-h-screen bg-white">
      
      {/* FIXED SOLID HEADER */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-10xl px-4 py-1">
          <nav className="rounded-2xl bg-white px-4 py-2 flex items-center justify-between">

            {/* LOGO */}
            <Link to="/staff" className="flex items-center gap-1.5">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Coffee className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold gradient-primary-text hidden sm:block">
                CAFÉFLOW
              </span>
            </Link>

            {/* CENTER NAVIGATION */}
            <div className="flex items-center gap-1">
              {staffNav.map((item) => {
                const isActive =
                  item.path === "/staff"
                    ? location.pathname === "/staff"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
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
            <div className="flex items-center gap-1.5">
              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-slate-100"
                >
                  <span className="max-w-[140px] truncate text-xs font-medium text-slate-700">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 rounded-xl shadow-xl border border-slate-200 bg-white py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-medium text-foreground">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {String(user?.role ?? "STAFF").replaceAll("_", " ")}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/staff/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:bg-secondary flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2"
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
      <main className="w-full px-6 py-8 pt-20 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;

import { createContext, useContext, useState, useEffect } from "react";

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'STAFF';

interface User {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; name: string; role: Role }> = {
  'admin@cafeflow.com': { password: 'admin123', name: 'Sarah Mitchell', role: 'SUPER_ADMIN' },
  'manager@cafeflow.com': { password: 'manager123', name: 'James Cooper', role: 'MANAGER' },
  'staff@cafeflow.com': { password: 'staff123', name: 'Alex Rivera', role: 'STAFF' },
  'accountant@cafeflow.com': { password: 'acc123', name: 'Priya Shah', role: 'ACCOUNTANT' },
};
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const isAdminRole = (role: Role) => ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(role);

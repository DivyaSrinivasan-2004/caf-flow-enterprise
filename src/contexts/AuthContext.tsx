import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'STAFF';

interface User {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, { password: string; name: string; role: Role }> = {
  'admin@cafeflow.com': { password: 'admin123', name: 'Sarah Mitchell', role: 'SUPER_ADMIN' },
  'manager@cafeflow.com': { password: 'manager123', name: 'James Cooper', role: 'MANAGER' },
  'staff@cafeflow.com': { password: 'staff123', name: 'Alex Rivera', role: 'STAFF' },
  'accountant@cafeflow.com': { password: 'acc123', name: 'Priya Shah', role: 'ACCOUNTANT' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const found = DEMO_USERS[email];
    if (found && found.password === password) {
      setUser({ email, name: found.name, role: found.role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const isAdminRole = (role: Role) => ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(role);

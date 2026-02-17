import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, isAdminRole } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Invoices from "./pages/admin/Invoices";
import Products from "./pages/admin/Products";
import Customers from "./pages/admin/Customers";
import Payments from "./pages/admin/Payments";
import Reports from "./pages/admin/Reports";
import Inventory from "./pages/admin/Inventory";
import Settings from "./pages/admin/Settings";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import POS from "./pages/staff/POS";
import Tables from "./pages/staff/Tables";
import Kitchen from "./pages/staff/Kitchen";
import Orders from "./pages/staff/Orders";
import Shift from "./pages/staff/Shift";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: 'admin' | 'staff' }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles === 'admin' && !isAdminRole(user.role)) return <Navigate to="/staff" replace />;
  if (allowedRoles === 'staff' && isAdminRole(user.role)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? (isAdminRole(user.role) ? <Navigate to="/admin" /> : <Navigate to="/staff" />) : <Login />} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/staff" element={<ProtectedRoute allowedRoles="staff"><StaffLayout /></ProtectedRoute>}>
        <Route index element={<StaffDashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="tables" element={<Tables />} />
        <Route path="kitchen" element={<Kitchen />} />
        <Route path="orders" element={<Orders />} />
        <Route path="shift" element={<Shift />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

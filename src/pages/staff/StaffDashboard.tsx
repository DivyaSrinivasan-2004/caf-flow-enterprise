import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import { ShoppingCart, Users, Clock, DollarSign, ChefHat, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const hourlyData = [
  { hour: '8AM', orders: 12 }, { hour: '9AM', orders: 28 }, { hour: '10AM', orders: 35 },
  { hour: '11AM', orders: 42 }, { hour: '12PM', orders: 58 }, { hour: '1PM', orders: 51 },
  { hour: '2PM', orders: 38 }, { hour: '3PM', orders: 29 }, { hour: '4PM', orders: 22 },
];

const recentOrders = [
  { id: '#2847', table: 'T-5', items: 3, total: '$42.50', status: 'ready' as const },
  { id: '#2846', table: 'T-2', items: 1, total: '$15.00', status: 'cooking' as const },
  { id: '#2845', table: 'T-8', items: 5, total: '$78.30', status: 'served' as const },
  { id: '#2844', table: 'T-1', items: 2, total: '$28.00', status: 'pending' as const },
];

const StaffDashboard = () => (
  <div className="space-y-[24px] animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[16px]">
      <KPICard title="Active Orders" value="12" icon={<ShoppingCart className="w-5 h-5" />} />
      <KPICard title="Tables Occupied" value="8/15" icon={<Users className="w-5 h-5" />} />
      <KPICard title="Pending" value="4" icon={<Clock className="w-5 h-5" />} trend={{ value: '2', positive: false }} />
      <KPICard title="Ready" value="3" icon={<CheckCircle className="w-5 h-5" />} />
      <KPICard title="Today's Sales" value="$1,280" icon={<DollarSign className="w-5 h-5" />} trend={{ value: '8%', positive: true }} />
      <KPICard title="Shift Sales" value="$640" icon={<DollarSign className="w-5 h-5" />} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
      <div className="bg-card rounded-lg p-[24px] shadow-soft border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-[16px]">Live Sales Today</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 15%, 91%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 12, fill: 'hsl(240, 8%, 55%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(240, 8%, 55%)' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(250, 15%, 91%)' }} />
            <Bar dataKey="orders" fill="hsl(252, 75%, 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.map(o => (
            <div key={o.id} className="px-[24px] py-[12px] flex items-center justify-between hover:bg-accent/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{o.id} · {o.table}</p>
                <p className="text-xs text-muted-foreground">{o.items} items</p>
              </div>
              <div className="flex items-center gap-[12px]">
                <span className="text-sm font-semibold text-foreground">{o.total}</span>
                <StatusBadge variant={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default StaffDashboard;

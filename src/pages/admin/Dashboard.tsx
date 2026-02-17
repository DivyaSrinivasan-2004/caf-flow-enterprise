import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import { DollarSign, ShoppingCart, Users, FileText, TrendingUp, Package } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 42000 }, { month: 'Feb', revenue: 48000 }, { month: 'Mar', revenue: 55000 },
  { month: 'Apr', revenue: 51000 }, { month: 'May', revenue: 62000 }, { month: 'Jun', revenue: 58000 },
  { month: 'Jul', revenue: 71000 }, { month: 'Aug', revenue: 68000 }, { month: 'Sep', revenue: 74000 },
  { month: 'Oct', revenue: 80000 }, { month: 'Nov', revenue: 76000 }, { month: 'Dec', revenue: 85000 },
];

const salesData = [
  { day: 'Mon', sales: 320 }, { day: 'Tue', sales: 280 }, { day: 'Wed', sales: 410 },
  { day: 'Thu', sales: 370 }, { day: 'Fri', sales: 490 }, { day: 'Sat', sales: 520 }, { day: 'Sun', sales: 390 },
];

const paymentData = [
  { name: 'Cash', value: 35 }, { name: 'Card', value: 30 }, { name: 'UPI', value: 25 }, { name: 'Wallet', value: 10 },
];

const COLORS = ['hsl(252, 75%, 60%)', 'hsl(252, 100%, 74%)', 'hsl(200, 80%, 55%)', 'hsl(142, 71%, 45%)'];

const recentOrders = [
  { id: '#ORD-2847', customer: 'John Smith', items: 3, total: '$42.50', status: 'paid' as const, time: '2 min ago' },
  { id: '#ORD-2846', customer: 'Emily Davis', items: 1, total: '$15.00', status: 'pending' as const, time: '8 min ago' },
  { id: '#ORD-2845', customer: 'Mike Wilson', items: 5, total: '$78.30', status: 'paid' as const, time: '15 min ago' },
  { id: '#ORD-2844', customer: 'Lisa Chen', items: 2, total: '$28.00', status: 'paid' as const, time: '22 min ago' },
  { id: '#ORD-2843', customer: 'Robert Brown', items: 4, total: '$55.20', status: 'overdue' as const, time: '30 min ago' },
];

const lowStockItems = [
  { name: 'Coffee Beans (Arabica)', stock: 2, unit: 'kg' },
  { name: 'Whole Milk', stock: 5, unit: 'L' },
  { name: 'Croissants', stock: 3, unit: 'pcs' },
  { name: 'Chocolate Syrup', stock: 1, unit: 'bottle' },
];

const AdminDashboard = () => (
  <div className="space-y-[24px] animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Welcome back! Here's your business overview.</p>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[16px]">
      <KPICard title="Today's Sales" value="$4,280" icon={<DollarSign className="w-5 h-5" />} trend={{ value: '12%', positive: true }} />
      <KPICard title="Monthly Revenue" value="$85,400" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: '8%', positive: true }} />
      <KPICard title="Yearly Revenue" value="$770K" icon={<DollarSign className="w-5 h-5" />} trend={{ value: '15%', positive: true }} />
      <KPICard title="Total Orders" value="1,247" icon={<ShoppingCart className="w-5 h-5" />} trend={{ value: '5%', positive: true }} />
      <KPICard title="Customers" value="842" icon={<Users className="w-5 h-5" />} trend={{ value: '3%', positive: true }} />
      <KPICard title="Unpaid Invoices" value="23" icon={<FileText className="w-5 h-5" />} trend={{ value: '2%', positive: false }} />
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
      {/* Revenue Chart */}
      <div className="lg:col-span-2 bg-card rounded-lg p-[24px] shadow-soft border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-[16px]">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 15%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(240, 8%, 55%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(240, 8%, 55%)' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(250, 15%, 91%)', boxShadow: '0 4px 12px hsla(252, 30%, 30%, 0.08)' }} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(252, 75%, 60%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(252, 75%, 60%)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Donut */}
      <div className="bg-card rounded-lg p-[24px] shadow-soft border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-[16px]">Payment Methods</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
              {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-[12px] mt-[16px] justify-center">
          {paymentData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-[6px]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Sales Bar Chart */}
    <div className="bg-card rounded-lg p-[24px] shadow-soft border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-[16px]">Weekly Sales</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 15%, 91%)" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(240, 8%, 55%)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(240, 8%, 55%)' }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(250, 15%, 91%)' }} />
          <Bar dataKey="sales" fill="hsl(252, 75%, 60%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Bottom widgets */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
      {/* Recent Orders */}
      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.map(order => (
            <div key={order.id} className="px-[24px] py-[12px] flex items-center justify-between hover:bg-accent/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.customer} · {order.items} items</p>
              </div>
              <div className="text-right flex items-center gap-[12px]">
                <span className="text-sm font-semibold text-foreground">{order.total}</span>
                <StatusBadge variant={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Low Stock Alerts</h3>
          <Package className="w-4 h-4 text-warning" />
        </div>
        <div className="divide-y divide-border">
          {lowStockItems.map(item => (
            <div key={item.name} className="px-[24px] py-[12px] flex items-center justify-between hover:bg-accent/50 transition-colors">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <div className="flex items-center gap-[8px]">
                <span className="text-sm text-destructive font-semibold">{item.stock} {item.unit}</span>
                <StatusBadge variant="low-stock" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;

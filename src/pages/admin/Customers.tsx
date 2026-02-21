import StatusBadge from '@/components/StatusBadge';
import { Search, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

const customers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1 234 567 890', orders: 47, spent: '$2,340' as const },
  { id: 2, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 234 567 891', orders: 23, spent: '$1,150' as const },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', phone: '+1 234 567 892', orders: 8, spent: '$420' as const },
  { id: 4, name: 'Lisa Chen', email: 'lisa@example.com', phone: '+1 234 567 893', orders: 52, spent: '$3,100' as const },
  { id: 5, name: 'Robert Brown', email: 'robert@example.com', phone: '+1 234 567 894', orders: 3, spent: '$180' as const },
  { id: 6, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 234 567 895', orders: 31, spent: '$1,890' as const },
];

// 🔥 Top Frequent Customers
const frequentCustomers = [
  { name: "Lisa Chen", orders: 52 },
  { name: "John Smith", orders: 47 },
  { name: "Sarah Johnson", orders: 31 },
  { name: "Emily Davis", orders: 23 },
  { name: "Mike Wilson", orders: 8 },
];

// 🔥 Customer Growth Trend
const customerGrowth = [
  { month: "Sep", customers: 120 },
  { month: "Oct", customers: 150 },
  { month: "Nov", customers: 180 },
  { month: "Dec", customers: 210 },
  { month: "Jan", customers: 260 },
  { month: "Feb", customers: 310 },
];

const Customers = () => {
  const [search, setSearch] = useState('');
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-[24px] animate-fade-in">{/* 🔥 CUSTOMER ANALYTICS */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] mb-[24px]">

  {/* FREQUENT CUSTOMERS */}
  <div className="bg-card border border-border rounded-xl p-[20px] shadow-soft">
    <h3 className="text-sm font-semibold mb-[16px]">
      Most Frequent Customers
    </h3>

    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={frequentCustomers}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="orders"
            fill="#8b5cf6"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* CUSTOMER GROWTH */}
  <div className="bg-card border border-border rounded-xl p-[20px] shadow-soft">
    <h3 className="text-sm font-semibold mb-[16px]">
      Customer Growth Trend
    </h3>

    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={customerGrowth}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="customers"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#growthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>
      <div className="flex items-center justify-between">
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} total customers</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-secondary/50">
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Customer</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Contact</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Orders</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Total Spent</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-accent/30 transition-colors cursor-pointer">
                <td className="px-[24px] py-[14px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[32px] h-[32px] rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-foreground">{c.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                  </div>
                </td>
                <td className="px-[24px] py-[14px] text-sm text-foreground">{c.phone}</td>
                <td className="px-[24px] py-[14px] text-sm text-foreground">{c.orders}</td>
                <td className="px-[24px] py-[14px] text-sm font-semibold text-foreground">{c.spent}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;

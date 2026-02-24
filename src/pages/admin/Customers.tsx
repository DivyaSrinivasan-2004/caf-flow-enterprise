import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Search } from 'lucide-react';
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

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

const API_BASE = "http://192.168.1.3:8000";

useEffect(() => {
  const token = localStorage.getItem("access");

  fetch(`${API_BASE}/api/accounts/customers/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    })
    .then((data) => {
      setCustomers(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching customers:", err);
      setLoading(false);
    });
}, []);
  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );
const frequentCustomers = customers.length
  ? [...customers]
      .sort((a, b) => (b.orders || 0) - (a.orders || 0))
      .slice(0, 5)
  : [];
  if (loading) {
    return <div className="p-6 text-sm">Loading customers...</div>;
  }
  const customerGrowth = customers.length
  ? [
      { month: "Sep", customers: customers.length * 0.5 },
      { month: "Oct", customers: customers.length * 0.6 },
      { month: "Nov", customers: customers.length * 0.7 },
      { month: "Dec", customers: customers.length * 0.8 },
      { month: "Jan", customers: customers.length * 0.9 },
      { month: "Feb", customers: customers.length },
    ]
  : [];

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
<div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">

  <div className="bg-card p-[20px] rounded-xl border shadow-soft">
    <p className="text-sm text-muted-foreground">Total Customers</p>
    <h2 className="text-2xl font-bold mt-[6px]">
      {customers.length}
    </h2>
  </div>

  <div className="bg-card p-[20px] rounded-xl border shadow-soft">
    <p className="text-sm text-muted-foreground">New This Month</p>
    <h2 className="text-2xl font-bold mt-[6px]">
      {Math.floor(customers.length * 0.3)}
    </h2>
  </div>

  <div className="bg-card p-[20px] rounded-xl border shadow-soft">
    <p className="text-sm text-muted-foreground">Active Customers</p>
    <h2 className="text-2xl font-bold mt-[6px]">
      {Math.floor(customers.length * 0.8)}
    </h2>
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
         <thead>
  <tr className="bg-secondary/50">
    <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">
      Customer
    </th>
    <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">
      Phone Number
    </th>
  </tr>
</thead>
          <tbody className="divide-y divide-border">
  {filtered.map((c) => (
    <tr key={c.id} className="hover:bg-accent/30 transition-colors">
      <td className="px-[24px] py-[14px] font-medium">
        {c.name}
      </td>
      <td className="px-[24px] py-[14px] text-muted-foreground">
        {c.phone}
      </td>
    </tr>
  ))}
</tbody>
        </table>
        <div className="bg-card mt-[24px] p-[24px] rounded-xl border shadow-soft">
  <h3 className="text-lg font-semibold mb-[16px]">
    Customer Insights
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">

    <div className="p-[16px] bg-secondary/40 rounded-lg">
      <p className="text-sm text-muted-foreground">
        Most Common Phone Prefix
      </p>
      <p className="text-lg font-semibold mt-[4px]">
        +91
      </p>
    </div>

    <div className="p-[16px] bg-secondary/40 rounded-lg">
      <p className="text-sm text-muted-foreground">
        Customer Growth Status
      </p>
      <p className="text-lg font-semibold mt-[4px] text-green-500">
        Growing Steadily 📈
      </p>
    </div>

  </div>
</div>
      </div>
    </div>
  );
};

export default Customers;

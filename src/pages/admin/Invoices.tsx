import StatusBadge from '@/components/StatusBadge';
import {  Filter, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { AreaChart, Area } from "recharts";

const invoices = [
  { id: 'INV-001', customer: 'John Smith', date: '2026-02-15', due: '2026-03-15', amount: '$1,250.00', status: 'paid' as const },
  { id: 'INV-002', customer: 'Emily Davis', date: '2026-02-14', due: '2026-03-14', amount: '$840.00', status: 'pending' as const },
  { id: 'INV-003', customer: 'Mike Wilson', date: '2026-02-13', due: '2026-02-28', amount: '$2,100.00', status: 'overdue' as const },
  { id: 'INV-004', customer: 'Lisa Chen', date: '2026-02-12', due: '2026-03-12', amount: '$560.00', status: 'paid' as const },
  { id: 'INV-005', customer: 'Robert Brown', date: '2026-02-11', due: '2026-03-11', amount: '$1,890.00', status: 'cancelled' as const },
  { id: 'INV-006', customer: 'Sarah Johnson', date: '2026-02-10', due: '2026-03-10', amount: '$420.00', status: 'pending' as const },
  { id: 'INV-007', customer: 'David Lee', date: '2026-02-09', due: '2026-03-09', amount: '$3,200.00', status: 'paid' as const },
  { id: 'INV-008', customer: 'Anna Park', date: '2026-02-08', due: '2026-03-08', amount: '$780.00', status: 'pending' as const },
];

const Invoices = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState("30");
  const filtered = invoices.filter(inv => {
  const matchSearch =
    inv.customer.toLowerCase().includes(search.toLowerCase()) ||
    inv.id.toLowerCase().includes(search.toLowerCase());

  const matchStatus =
    statusFilter === "all" || inv.status === statusFilter;

  // 🔥 DATE FILTER LOGIC
  const invoiceDate = new Date(inv.date);
  const today = new Date();
  const pastDate = new Date();

  pastDate.setDate(today.getDate() - Number(daysFilter));

  const matchDate = invoiceDate >= pastDate;

  return matchSearch && matchStatus && matchDate;
});
  // 🔥 SUMMARY CALCULATIONS
const totalRevenue = invoices
  .filter(inv => inv.status === 'paid')
  .reduce((acc, inv) => acc + Number(inv.amount.replace(/[$,]/g, '')), 0);

const pendingAmount = invoices
  .filter(inv => inv.status === 'pending')
  .reduce((acc, inv) => acc + Number(inv.amount.replace(/[$,]/g, '')), 0);

const overdueAmount = invoices
  .filter(inv => inv.status === 'overdue')
  .reduce((acc, inv) => acc + Number(inv.amount.replace(/[$,]/g, '')), 0);

const totalInvoices = invoices.length;
// 🔥 Sparkline dummy data
const sparkData = [
  { value: 400 },
  { value: 600 },
  { value: 500 },
  { value: 800 },
  { value: 700 },
  { value: 900 },
];

// 🔥 Payment breakdown
const paymentData = [
  { name: "Cash", value: 35 },
  { name: "Card", value: 45 },
  { name: "UPI", value: 20 },
];

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

  return (
    
    <div className="space-y-[24px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage and track all invoices</p>
        </div>
        
      </div>
      {/* 🔥 FINANCIAL SUMMARY */}
{/* 🔥 PREMIUM FINANCIAL SUMMARY */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">

  {[ 
    { title: "Total Revenue", value: totalRevenue, color: "text-primary" },
    { title: "Pending Amount", value: pendingAmount, color: "text-yellow-500" },
    { title: "Overdue", value: overdueAmount, color: "text-red-500" },
    { title: "Total Invoices", value: totalInvoices, color: "text-primary" },
  ].map((card, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="relative bg-card border border-border rounded-xl p-[18px] shadow-soft overflow-hidden group"
    >
      {/* Gradient Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {card.title}
      </p>

      {/* Animated Counter */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-2xl font-bold mt-[6px] ${card.color}`}
      >
        {typeof card.value === "number"
          ? `$${card.value.toLocaleString()}`
          : card.value}
      </motion.h3>

      {/* Mini Sparkline */}
      <div className="mt-[12px] h-[50px]">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={sparkData}>
      <defs>
        <linearGradient id="colorSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
        </linearGradient>
      </defs>

      <Area
        type="monotone"
        dataKey="value"
        stroke="#8b5cf6"
        strokeWidth={2}
        fill="url(#colorSpark)"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
    </motion.div>
  ))}

</div>
{/* 🔥 PAYMENT BREAKDOWN */}
<div className="bg-card border border-border rounded-xl p-[24px] shadow-soft mt-[20px]">
  <div className="flex items-center justify-between mb-[20px]">
    <h3 className="text-sm font-semibold text-foreground">
      Payment Method Breakdown
    </h3>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px] items-center">

    {/* DONUT */}
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={paymentData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            dataKey="value"
            paddingAngle={5}
          >
            {paymentData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* RIGHT SIDE STATS */}
    <div className="space-y-[18px]">
      {paymentData.map((p, i) => (
        <div key={i} className="flex items-center justify-between bg-secondary/40 px-[16px] py-[12px] rounded-lg">
          <div className="flex items-center gap-[10px]">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i] }}
            />
            <span className="text-sm font-medium">{p.name}</span>
          </div>
          <span className="text-sm font-semibold">
            {p.value}%
          </span>
        </div>
      ))}
    </div>

  </div>
</div>
      {/* Filters */}
   {/* Filters */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">

  {/* LEFT SIDE — SEARCH */}
  <div className="flex items-center gap-[12px] w-full sm:max-w-xl">

  {/* SEARCH */}
  <div className="relative flex-1">
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search invoices..."
      className="w-full pl-[16px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>

  {/* DAYS FILTER */}
  <select
    value={daysFilter}
    onChange={(e) => setDaysFilter(e.target.value)}
    className="px-[12px] py-[10px] rounded-md border border-input bg-background text-sm"
  >
    <option value="7">Last 7 Days</option>
    <option value="30">Last 30 Days</option>
    <option value="90">Last 90 Days</option>
    <option value="365">Last 1 Year</option>
  </select>

</div>

  {/* RIGHT SIDE — FILTERS + EXPORT */}
  <div className="flex flex-wrap items-center gap-[8px]">

    {['all', 'paid', 'pending', 'overdue', 'cancelled'].map(s => (
      <button
        key={s}
        onClick={() => setStatusFilter(s)}
        className={`px-[12px] py-[8px] rounded-md text-xs font-medium capitalize transition-all ${
          statusFilter === s
            ? 'gradient-primary text-primary-foreground shadow-glow'
            : 'bg-secondary text-secondary-foreground hover:bg-accent'
        }`}
      >
        {s}
      </button>
    ))}

    <button className="px-[12px] py-[8px] rounded-md border border-input text-sm text-muted-foreground hover:bg-accent flex items-center gap-[6px]">
      <Download className="w-4 h-4" /> Export
    </button>

  </div>

</div>
      {/* Table */}
      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50">
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-[24px] py-[14px] text-sm font-semibold text-primary">{inv.id}</td>
                  <td className="px-[24px] py-[14px] text-sm text-foreground">{inv.customer}</td>
                  <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{inv.date}</td>
                  <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{inv.due}</td>
                  <td className="px-[24px] py-[14px] text-sm font-semibold text-foreground">{inv.amount}</td>
                  <td className="px-[24px] py-[14px]"><StatusBadge variant={inv.status} /></td>
                  <td className="px-[24px] py-[14px]">
                    <button className="text-xs text-primary font-medium hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-[24px] py-[12px] border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {invoices.length} invoices</p>
          <div className="flex items-center gap-[8px]">
            <button className="p-[6px] rounded-md border border-input hover:bg-accent"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs text-muted-foreground">Page 1 of 1</span>
            <button className="p-[6px] rounded-md border border-input hover:bg-accent"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;

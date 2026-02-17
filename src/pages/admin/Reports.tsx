import { BarChart3, Download, Calendar } from 'lucide-react';

const reportCategories = [
  { name: 'Daily Sales', desc: 'Revenue breakdown by day', icon: '📊' },
  { name: 'Product Wise Sales', desc: 'Performance by menu item', icon: '🍕' },
  { name: 'GST Report', desc: 'Tax collection summary', icon: '📋' },
  { name: 'Stock Consumption', desc: 'Ingredient usage tracking', icon: '📦' },
  { name: 'Staff Attendance', desc: 'Employee login hours', icon: '👥' },
  { name: 'Expense Report', desc: 'Operational costs breakdown', icon: '💰' },
  { name: 'Discount Report', desc: 'Discounts applied overview', icon: '🏷️' },
  { name: 'Wastage Report', desc: 'Spoilage and waste tracking', icon: '🗑️' },
  { name: 'Peak Sales Time', desc: 'Busiest hours analysis', icon: '⏰' },
  { name: 'Delivery Report', desc: 'Delivery order analytics', icon: '🚚' },
  { name: 'Dine-in Report', desc: 'In-house dining analytics', icon: '🍽️' },
  { name: 'Combo Sales', desc: 'Bundle deal performance', icon: '🎯' },
];

const Reports = () => (
  <div className="space-y-[24px] animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Advanced analytics and business intelligence</p>
      </div>
      <div className="flex gap-[8px]">
        <button className="px-[12px] py-[8px] rounded-md border border-input text-sm text-muted-foreground hover:bg-accent flex items-center gap-[6px]">
          <Calendar className="w-4 h-4" /> Date Range
        </button>
        <button className="px-[12px] py-[8px] rounded-md border border-input text-sm text-muted-foreground hover:bg-accent flex items-center gap-[6px]">
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
      {reportCategories.map(r => (
        <button
          key={r.name}
          className="bg-card rounded-lg border border-border shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all p-[24px] text-left group"
        >
          <span className="text-2xl mb-[12px] block">{r.icon}</span>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{r.name}</h3>
          <p className="text-xs text-muted-foreground mt-[4px]">{r.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

export default Reports;

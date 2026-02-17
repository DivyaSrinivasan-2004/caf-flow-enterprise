import StatusBadge from '@/components/StatusBadge';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.customer.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-[24px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage and track all invoices</p>
        </div>
        <button className="px-[16px] py-[10px] rounded-md gradient-primary text-primary-foreground text-sm font-semibold flex items-center gap-[8px] shadow-glow hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-[12px] items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-[8px]">
          {['all', 'paid', 'pending', 'overdue', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-[12px] py-[8px] rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="px-[12px] py-[8px] rounded-md border border-input text-sm text-muted-foreground hover:bg-accent flex items-center gap-[6px]">
          <Download className="w-4 h-4" /> Export
        </button>
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

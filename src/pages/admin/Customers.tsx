import StatusBadge from '@/components/StatusBadge';
import { Search, Plus, Users } from 'lucide-react';
import { useState } from 'react';

const customers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1 234 567 890', orders: 47, spent: '$2,340', balance: '$0', status: 'active' as const },
  { id: 2, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 234 567 891', orders: 23, spent: '$1,150', balance: '$120', status: 'active' as const },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', phone: '+1 234 567 892', orders: 8, spent: '$420', balance: '$200', status: 'active' as const },
  { id: 4, name: 'Lisa Chen', email: 'lisa@example.com', phone: '+1 234 567 893', orders: 52, spent: '$3,100', balance: '$0', status: 'active' as const },
  { id: 5, name: 'Robert Brown', email: 'robert@example.com', phone: '+1 234 567 894', orders: 3, spent: '$180', balance: '$50', status: 'inactive' as const },
  { id: 6, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 234 567 895', orders: 31, spent: '$1,890', balance: '$0', status: 'active' as const },
];

const Customers = () => {
  const [search, setSearch] = useState('');
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-[24px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} total customers</p>
        </div>
        <button className="px-[16px] py-[10px] rounded-md gradient-primary text-primary-foreground text-sm font-semibold flex items-center gap-[8px] shadow-glow">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-secondary/50">
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Customer</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Contact</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Orders</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Total Spent</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Balance</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Status</th>
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
                <td className="px-[24px] py-[14px]">
                  <p className="text-sm text-foreground">{c.email}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </td>
                <td className="px-[24px] py-[14px] text-sm text-foreground">{c.orders}</td>
                <td className="px-[24px] py-[14px] text-sm font-semibold text-foreground">{c.spent}</td>
                <td className="px-[24px] py-[14px] text-sm text-foreground">{c.balance}</td>
                <td className="px-[24px] py-[14px]"><StatusBadge variant={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;

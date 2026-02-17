import StatusBadge from '@/components/StatusBadge';
import { Search } from 'lucide-react';
import { useState } from 'react';

const ordersList = [
  { id: '#2847', table: 'T-5', customer: 'Walk-in', items: 3, total: '$42.50', status: 'ready' as const, time: '12:30 PM' },
  { id: '#2846', table: 'T-2', customer: 'Emily Davis', items: 1, total: '$15.00', status: 'cooking' as const, time: '12:25 PM' },
  { id: '#2845', table: 'T-8', customer: 'Walk-in', items: 5, total: '$78.30', status: 'served' as const, time: '12:15 PM' },
  { id: '#2844', table: 'T-1', customer: 'John Smith', items: 2, total: '$28.00', status: 'pending' as const, time: '12:10 PM' },
  { id: '#2843', table: 'T-12', customer: 'Walk-in', items: 2, total: '$18.50', status: 'cooking' as const, time: '12:05 PM' },
  { id: '#2842', table: 'T-5', customer: 'Lisa Chen', items: 2, total: '$12.00', status: 'served' as const, time: '11:55 AM' },
];

const Orders = () => {
  const [search, setSearch] = useState('');
  const filtered = ordersList.filter(o => o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-[24px] animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-secondary/50">
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Order</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Table</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Customer</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Items</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Total</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Status</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Time</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-[24px] py-[14px] text-sm font-semibold text-primary">{o.id}</td>
                <td className="px-[24px] py-[14px] text-sm text-foreground">{o.table}</td>
                <td className="px-[24px] py-[14px] text-sm text-foreground">{o.customer}</td>
                <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{o.items}</td>
                <td className="px-[24px] py-[14px] text-sm font-semibold text-foreground">{o.total}</td>
                <td className="px-[24px] py-[14px]"><StatusBadge variant={o.status} /></td>
                <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;

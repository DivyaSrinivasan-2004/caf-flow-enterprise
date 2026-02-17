import StatusBadge from '@/components/StatusBadge';
import KPICard from '@/components/KPICard';
import { Package, AlertTriangle, TrendingDown, Search } from 'lucide-react';
import { useState } from 'react';

const inventory = [
  { id: 1, name: 'Coffee Beans (Arabica)', category: 'Raw Material', stock: 2, unit: 'kg', min: 10, status: 'out-of-stock' as const },
  { id: 2, name: 'Whole Milk', category: 'Dairy', stock: 5, unit: 'L', min: 20, status: 'low-stock' as const },
  { id: 3, name: 'Sugar', category: 'Supplies', stock: 25, unit: 'kg', min: 10, status: 'in-stock' as const },
  { id: 4, name: 'Croissants', category: 'Bakery', stock: 3, unit: 'pcs', min: 15, status: 'low-stock' as const },
  { id: 5, name: 'Chocolate Syrup', category: 'Supplies', stock: 1, unit: 'bottle', min: 5, status: 'out-of-stock' as const },
  { id: 6, name: 'Paper Cups (L)', category: 'Packaging', stock: 200, unit: 'pcs', min: 100, status: 'in-stock' as const },
  { id: 7, name: 'Napkins', category: 'Packaging', stock: 500, unit: 'pcs', min: 200, status: 'in-stock' as const },
  { id: 8, name: 'Tomatoes', category: 'Vegetables', stock: 4, unit: 'kg', min: 10, status: 'low-stock' as const },
];

const Inventory = () => {
  const [search, setSearch] = useState('');
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowCount = inventory.filter(i => i.status === 'low-stock').length;
  const outCount = inventory.filter(i => i.status === 'out-of-stock').length;

  return (
    <div className="space-y-[24px] animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Inventory</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <KPICard title="Total Items" value={inventory.length} icon={<Package className="w-5 h-5" />} />
        <KPICard title="Low Stock" value={lowCount} icon={<AlertTriangle className="w-5 h-5" />} trend={{ value: `${lowCount}`, positive: false }} />
        <KPICard title="Out of Stock" value={outCount} icon={<TrendingDown className="w-5 h-5" />} trend={{ value: `${outCount}`, positive: false }} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-secondary/50">
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Item</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Category</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Stock</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Min Level</th>
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(i => (
              <tr key={i.id} className={`hover:bg-accent/30 transition-colors ${i.status === 'out-of-stock' ? 'bg-destructive/5' : ''}`}>
                <td className="px-[24px] py-[14px] text-sm font-medium text-foreground">{i.name}</td>
                <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{i.category}</td>
                <td className="px-[24px] py-[14px] text-sm font-semibold text-foreground">{i.stock} {i.unit}</td>
                <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{i.min} {i.unit}</td>
                <td className="px-[24px] py-[14px]"><StatusBadge variant={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;

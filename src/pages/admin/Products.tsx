import StatusBadge from '@/components/StatusBadge';
import { Search, Plus, Grid, List } from 'lucide-react';
import { useState } from 'react';

const products = [
  { id: 1, name: 'Espresso', category: 'Coffee', price: '$3.50', tax: '5%', stock: 150, status: 'in-stock' as const },
  { id: 2, name: 'Cappuccino', category: 'Coffee', price: '$4.50', tax: '5%', stock: 120, status: 'in-stock' as const },
  { id: 3, name: 'Croissant', category: 'Bakery', price: '$3.00', tax: '5%', stock: 3, status: 'low-stock' as const },
  { id: 4, name: 'Caesar Salad', category: 'Food', price: '$8.50', tax: '5%', stock: 45, status: 'in-stock' as const },
  { id: 5, name: 'Matcha Latte', category: 'Coffee', price: '$5.00', tax: '5%', stock: 0, status: 'out-of-stock' as const },
  { id: 6, name: 'Blueberry Muffin', category: 'Bakery', price: '$3.50', tax: '5%', stock: 28, status: 'in-stock' as const },
  { id: 7, name: 'Club Sandwich', category: 'Food', price: '$9.00', tax: '5%', stock: 5, status: 'low-stock' as const },
  { id: 8, name: 'Fresh Juice', category: 'Beverages', price: '$4.00', tax: '5%', stock: 60, status: 'in-stock' as const },
];

const categories = ['All', 'Coffee', 'Bakery', 'Food', 'Beverages'];

const Products = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-[24px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your menu items and inventory</p>
        </div>
        <button className="px-[16px] py-[10px] rounded-md gradient-primary text-primary-foreground text-sm font-semibold flex items-center gap-[8px] shadow-glow">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-[12px] items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-[8px]">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-[12px] py-[8px] rounded-md text-xs font-medium transition-colors ${category === c ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-[4px] bg-secondary rounded-md p-[4px]">
          <button onClick={() => setView('grid')} className={`p-[6px] rounded ${view === 'grid' ? 'bg-card shadow-soft' : ''}`}><Grid className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={() => setView('table')} className={`p-[6px] rounded ${view === 'table' ? 'bg-card shadow-soft' : ''}`}><List className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
          {filtered.map(p => (
            <div key={p.id} className="bg-card rounded-lg border border-border shadow-soft hover:shadow-card-hover transition-all p-[16px] group">
              <div className="w-full h-[100px] rounded-md bg-accent mb-[12px] flex items-center justify-center">
                <span className="text-2xl">☕</span>
              </div>
              <div className="flex items-center justify-between mb-[8px]">
                <span className="text-xs text-muted-foreground font-medium">{p.category}</span>
                <StatusBadge variant={p.status} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
              <div className="flex items-center justify-between mt-[8px]">
                <span className="text-lg font-bold text-primary">{p.price}</span>
                <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-secondary/50">
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Product</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Category</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Price</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Stock</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-[24px] py-[14px] text-sm font-medium text-foreground">{p.name}</td>
                  <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-[24px] py-[14px] text-sm font-semibold text-foreground">{p.price}</td>
                  <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{p.stock}</td>
                  <td className="px-[24px] py-[14px]"><StatusBadge variant={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;

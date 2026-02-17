import StatusBadge from '@/components/StatusBadge';
import { Volume2 } from 'lucide-react';

interface KitchenOrder {
  id: string;
  table: string;
  items: string[];
  notes?: string;
  timer: string;
  priority: boolean;
  status: 'pending' | 'cooking' | 'ready' | 'served';
}

const orders: KitchenOrder[] = [
  { id: '#2847', table: 'T-5', items: ['2x Cappuccino', '1x Croissant'], timer: '3m', priority: false, status: 'pending' },
  { id: '#2848', table: 'T-1', items: ['1x Caesar Salad', '1x Fresh Juice'], notes: 'No croutons', timer: '1m', priority: true, status: 'pending' },
  { id: '#2845', table: 'T-8', items: ['3x Espresso', '2x Muffin'], timer: '8m', priority: false, status: 'cooking' },
  { id: '#2844', table: 'T-2', items: ['1x Club Sandwich'], timer: '12m', priority: false, status: 'cooking' },
  { id: '#2843', table: 'T-12', items: ['1x Pasta', '1x Latte'], timer: '15m', priority: false, status: 'cooking' },
  { id: '#2842', table: 'T-5', items: ['2x Cheesecake'], timer: '18m', priority: false, status: 'ready' },
  { id: '#2841', table: 'T-1', items: ['1x Americano'], timer: '22m', priority: false, status: 'ready' },
  { id: '#2840', table: 'T-8', items: ['1x Green Tea', '1x Bagel'], timer: '30m', priority: false, status: 'served' },
];

const columns: { label: string; status: KitchenOrder['status']; color: string }[] = [
  { label: 'Pending', status: 'pending', color: 'border-t-warning' },
  { label: 'Cooking', status: 'cooking', color: 'border-t-primary' },
  { label: 'Ready', status: 'ready', color: 'border-t-success' },
  { label: 'Served', status: 'served', color: 'border-t-muted-foreground' },
];

const Kitchen = () => (
  <div className="space-y-[24px] animate-fade-in">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-foreground">Kitchen Display</h1>
      <button className="p-[8px] rounded-md hover:bg-accent transition-colors">
        <Volume2 className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>

    <div className="grid grid-cols-4 gap-[16px] h-[calc(100vh-200px)]">
      {columns.map(col => {
        const colOrders = orders.filter(o => o.status === col.status);
        return (
          <div key={col.status} className={`bg-card rounded-lg border border-border shadow-soft overflow-hidden flex flex-col border-t-4 ${col.color}`}>
            <div className="px-[16px] py-[12px] border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-[8px] py-[2px] rounded-full">{colOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-[12px] space-y-[12px]">
              {colOrders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-md border p-[16px] transition-all hover:shadow-soft ${
                    order.priority ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="text-sm font-bold text-foreground">{order.id}</span>
                    <span className="text-xs text-muted-foreground">{order.timer}</span>
                  </div>
                  <p className="text-xs font-medium text-primary mb-[8px]">{order.table}</p>
                  <ul className="space-y-[4px]">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-xs text-foreground">{item}</li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="text-xs text-warning mt-[8px] italic">⚠ {order.notes}</p>
                  )}
                  {order.priority && (
                    <span className="inline-block mt-[8px] text-[10px] font-bold text-destructive uppercase">Priority</span>
                  )}
                  {col.status !== 'served' && (
                    <button className="w-full mt-[12px] py-[8px] rounded-md text-xs font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-all">
                      {col.status === 'pending' ? 'Start Cooking' : col.status === 'cooking' ? 'Mark Ready' : 'Mark Served'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default Kitchen;

import { useState } from 'react';
import { Search, Minus, Plus, X, Trash2 } from 'lucide-react';

const categories = ['All', 'Coffee', 'Tea', 'Bakery', 'Food', 'Beverages', 'Desserts'];

const menuItems = [
  { id: 1, name: 'Espresso', price: 3.50, category: 'Coffee', emoji: '☕' },
  { id: 2, name: 'Cappuccino', price: 4.50, category: 'Coffee', emoji: '☕' },
  { id: 3, name: 'Latte', price: 4.00, category: 'Coffee', emoji: '☕' },
  { id: 4, name: 'Americano', price: 3.00, category: 'Coffee', emoji: '☕' },
  { id: 5, name: 'Green Tea', price: 3.00, category: 'Tea', emoji: '🍵' },
  { id: 6, name: 'Croissant', price: 3.00, category: 'Bakery', emoji: '🥐' },
  { id: 7, name: 'Muffin', price: 3.50, category: 'Bakery', emoji: '🧁' },
  { id: 8, name: 'Caesar Salad', price: 8.50, category: 'Food', emoji: '🥗' },
  { id: 9, name: 'Club Sandwich', price: 9.00, category: 'Food', emoji: '🥪' },
  { id: 10, name: 'Fresh Juice', price: 4.00, category: 'Beverages', emoji: '🧃' },
  { id: 11, name: 'Smoothie', price: 5.50, category: 'Beverages', emoji: '🥤' },
  { id: 12, name: 'Cheesecake', price: 6.00, category: 'Desserts', emoji: '🍰' },
  { id: 13, name: 'Mocha', price: 5.00, category: 'Coffee', emoji: '☕' },
  { id: 14, name: 'Bagel', price: 3.50, category: 'Bakery', emoji: '🥯' },
  { id: 15, name: 'Pasta', price: 10.00, category: 'Food', emoji: '🍝' },
  { id: 16, name: 'Chai Latte', price: 4.50, category: 'Tea', emoji: '🍵' },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const POS = () => {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const filtered = menuItems.filter(i => {
    const matchCat = category === 'All' || i.category === category;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const removeItem = (id: number) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax - discount;

  return (
    <div className="flex gap-[16px] h-[calc(100vh-140px)] animate-fade-in">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex gap-[12px] mb-[16px] items-center">
          <div className="relative flex-1">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search or scan barcode..." className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="flex gap-[8px] mb-[16px] overflow-x-auto pb-[4px]">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-[12px] py-[8px] rounded-md text-xs font-medium whitespace-nowrap transition-colors ${category === c ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>{c}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] content-start">
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-card rounded-lg border border-border shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all p-[16px] text-left active:scale-95"
            >
              <div className="w-full h-[60px] rounded-md bg-accent mb-[8px] flex items-center justify-center text-2xl">
                {item.emoji}
              </div>
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-[360px] bg-card rounded-lg border border-border shadow-soft flex flex-col">
        <div className="px-[20px] py-[16px] border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Current Order</h3>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-destructive hover:underline">Clear</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-[20px] py-[12px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground text-sm">No items yet</p>
              <p className="text-xs text-muted-foreground mt-[4px]">Tap products to add</p>
            </div>
          ) : (
            <div className="space-y-[12px]">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-[12px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <button onClick={() => updateQty(item.id, -1)} className="w-[28px] h-[28px] rounded-md border border-input flex items-center justify-center hover:bg-accent">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-[20px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-[28px] h-[28px] rounded-md border border-input flex items-center justify-center hover:bg-accent">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-foreground w-[60px] text-right">${(item.price * item.qty).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border px-[20px] py-[16px] space-y-[8px]">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-success">Discount</span>
              <span className="text-success font-medium">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-[8px] border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-[20px] pb-[20px] space-y-[8px]">
          <button className="w-full py-[14px] rounded-md gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-all active:scale-[0.98]">
            Charge ${total.toFixed(2)}
          </button>
          <div className="grid grid-cols-2 gap-[8px]">
            <button className="py-[10px] rounded-md border border-input text-sm text-muted-foreground hover:bg-accent transition-colors font-medium">Hold Order</button>
            <button className="py-[10px] rounded-md border border-input text-sm text-muted-foreground hover:bg-accent transition-colors font-medium">Split Bill</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;

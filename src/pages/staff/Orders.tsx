import StatusBadge from '@/components/StatusBadge';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const BASE_URL = "http://192.168.1.3:8000";

const Orders = () => {
  const token = localStorage.getItem("access");

  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentInput, setPaymentInput] = useState("");
const [invoiceData, setInvoiceData] = useState<any>(null);
  // LOAD ORDERS
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
     const res = await fetch(`${BASE_URL}/api/orders/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

 const formatted = data.map((order: any) => ({

  id: order.id,

  table: order.table_name || "N/A",

  customer: order.customer_name || "Walk-in",

  items: order.items_count || 0,

  total: `₹${order.total_amount}`,

  status: order.payment_status === "PAID"
    ? "paid"
    : order.status.toLowerCase(),

  time: new Date(order.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }),

  bill: order.bill_number,
}));

      setOrders(formatted);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  // OPEN MODAL
  const openPaymentModal = (orderId: string) => {
    setSelectedOrder(orderId);
    setPaymentMethod("CASH");
    setPaymentInput("");
  };

  // CLOSE MODAL
  const closeModal = () => {
    setSelectedOrder(null);
  };

  // CONFIRM PAYMENT
  const confirmPayment = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/pay/${selectedOrder}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            method: paymentMethod,
            reference: paymentInput || null,
          }),
        }
      );

      if (res.ok) {
  closeModal();

  setOrders(prev =>
    prev.map(o =>
      o.id === selectedOrder
        ? { ...o, status: "paid" }
        : o
    )
  );

  loadOrders();
}else {
        alert("Payment failed");
      }
    } catch (err) {
      console.error("Payment error", err);
    }
  };

  const filtered = orders.filter(
    o =>
      o.id.includes(search) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );
const openInvoiceModal = async (orderId: string) => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/orders/invoice/${orderId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setInvoiceData(data);

  } catch (err) {
    console.error("Invoice load failed", err);
  }
};
const sendToWhatsApp = (data: any) => {
  let message = `🧾 *CAFÉFLOW Invoice*\n\n`;
  message += `Bill: ${data.bill_number}\n`;
  message += `Customer: ${data.customer_name}\n\n`;

  data.items.forEach((item: any) => {
    message += `${item.quantity}x ${item.name} - ₹${item.total}\n`;
  });

  message += `\nTotal: ₹${data.final_amount}`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};
  return (
    <div className="space-y-[24px] animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Order</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Table</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Customer</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Items</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Total</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Time</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-[24px] py-[14px] text-sm font-semibold text-primary">
                  #{o.id.slice(0, 6)}
                </td>
                <td className="px-[24px] py-[14px] text-sm">{o.table}</td>
                <td className="px-[24px] py-[14px] text-sm">{o.customer}</td>
                <td className="px-[24px] py-[14px] text-sm text-muted-foreground">{o.items}</td>
                <td className="px-[24px] py-[14px] text-sm font-semibold">{o.total}</td>

              
<td className="px-[24px] py-[14px]">
  <div className="flex items-center gap-3">

    <StatusBadge variant={o.status} />

    {o.status !== "paid" ? (
      <button
        onClick={() => openPaymentModal(o.id)}
        className="text-xs px-4 py-1.5 rounded-md bg-primary text-white whitespace-nowrap"
      >
        Pay
      </button>
    ) : (
      <>
        <button
          disabled
          className="text-xs px-4 py-1.5 rounded-md bg-green-100 text-green-700"
        >
          Paid
        </button>

        <button
          onClick={() => openInvoiceModal(o.id)}
          className="text-xs px-4 py-1.5 rounded-md bg-gray-800 text-white"
        >
          Invoice
        </button>
      </>
    )}
  </div>
</td>
{invoiceData && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[420px] rounded-xl p-6 shadow-2xl space-y-4">

      {/* COMPANY HEADER */}
      <div className="text-center space-y-1">
        <img
          src="/logo.jpeg"
          alt="Company Logo"
          className="h-12 mx-auto"
        />
        <h2 className="text-lg font-bold">DIP & DASH</h2>
        <p className="text-xs text-muted-foreground">
          Enterprise Cafeteria
        </p>
      </div>

      <div className="border-t border-dashed border-gray-400" />

      {/* BILL DETAILS */}
      <div className="text-sm space-y-1">
        <p><strong>Bill:</strong> {invoiceData.bill_number}</p>
        <p><strong>Date:</strong> {new Date(invoiceData.date).toLocaleString()}</p>
        <p><strong>Customer:</strong> {invoiceData.customer_name}</p>
        <p><strong>Payment:</strong> {invoiceData.payment_method}</p>
      </div>

      <div className="border-t border-dashed border-gray-400" />

      {/* ITEMS */}
      {/* ITEMS TABLE */}
<div className="space-y-2 max-h-[220px] overflow-y-auto text-sm">

  <div className="flex justify-between font-semibold text-xs border-b pb-1">
    <span>Item</span>
    <span>GST</span>
    <span>Total</span>
  </div>

  {invoiceData.items.map((item: any, index: number) => (
    <div key={index} className="flex justify-between text-xs">

      <div className="flex-1">
        {item.quantity}x {item.name}
        <div className="text-[10px] text-gray-500">
          ₹{item.base_price} + {item.gst_percent}% GST
        </div>
      </div>

      <span>₹{item.line_gst}</span>

      <span>{item.line_total.toFixed(2)}</span>
    </div>
  ))}
</div>

<div className="border-t border-dashed border-gray-400 my-2" />

{/* SUMMARY */}
<div className="space-y-1 text-sm">

  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₹{invoiceData.subtotal}</span>
  </div>

  <div className="flex justify-between">
    <span>Total GST</span>
    <span>₹{invoiceData.total_gst}</span>
  </div>

  {invoiceData.discount > 0 && (
    <div className="flex justify-between text-red-600">
      <span>Discount</span>
      <span>- ₹{invoiceData.discount}</span>
    </div>
  )}

</div>

<div className="border-t border-dashed border-gray-400 my-2" />

<div className="flex justify-between font-bold text-base">
  <span>Grand Total</span>
  <span>₹{invoiceData.grand_total.toFixed(2)}</span>
</div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between gap-3 pt-3">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-primary text-white py-2 rounded-md"
        >
          Print
        </button>

        <button
          onClick={() => sendToWhatsApp(invoiceData)}
          className="flex-1 bg-green-600 text-white py-2 rounded-md"
        >
          WhatsApp
        </button>
      </div>

      <button
        onClick={() => setInvoiceData(null)}
        className="w-full text-sm text-gray-500 mt-2"
      >
        Close
      </button>

    </div>
  </div>
)}
                <td className="px-[24px] py-[14px] text-sm text-muted-foreground">
                  {o.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAYMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold">Complete Payment</h2>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>

            {paymentMethod !== "CASH" && (
              <input
                type="text"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                placeholder={
                  paymentMethod === "UPI"
                    ? "Enter UPI ID"
                    : "Enter Card Number"
                }
                className="w-full border rounded-md px-3 py-2"
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="px-4 py-2 rounded-md bg-primary text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
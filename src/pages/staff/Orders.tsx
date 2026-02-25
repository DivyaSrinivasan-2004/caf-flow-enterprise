import StatusBadge from "@/components/StatusBadge";
import {
  BadgeIndianRupee,
  CheckCircle2,
  FileText,
  
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const BASE_URL = "http://192.168.1.3:8000";

interface OrderRow {
  id: string;
  table: string;
  customer: string;
  items: number;
  total: string;
  status: string;
  time: string;
  bill: string;
}

interface InvoiceItem {
  quantity: number;
  name: string;
  total: number | string;
  base_price: number | string;
  gst_percent: number;
  line_gst: number | string;
  line_total: number;
}

interface InvoiceData {
  bill_number: string;
  date: string;
  customer_name: string;
  payment_method: string;
  items: InvoiceItem[];
  line_items?: Array<{
    name: string;
    quantity: number;
    base_price: number;
    line_total: number;
  }>;
  order_type?: string;
  staff?: string;
  payment_status?: string;
  subtotal: number | string;
  total_gst: number | string;
  discount: number;
  grand_total: number;
  final_amount: number | string;
}

const Orders = () => {
  const token = localStorage.getItem("access");

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentInput, setPaymentInput] = useState("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await res.json()) as Array<Record<string, unknown>>;

      const formatted = data.map((order) => ({
        id: String(order.id),
        table: (order.table_name as string) || "TakeAway",
        customer: (order.customer_name as string) || "Walk-in",
        items: Number(order.items_count || 0),
        total: `Rs ${order.total_amount}`,
        status:
          order.payment_status === "PAID"
            ? "paid"
            : String(order.status).toLowerCase(),
        time: new Date(String(order.created_at)).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        bill: String(order.bill_number || ""),
      }));

      setOrders(formatted);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openPaymentModal = (orderId: string) => {
    setSelectedOrder(orderId);
    setPaymentMethod("CASH");
    setPaymentInput("");
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const confirmPayment = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`${BASE_URL}/api/orders/pay/${selectedOrder}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method: paymentMethod,
          reference: paymentInput || null,
        }),
      });

      if (res.ok) {
        closeModal();

        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder ? { ...o, status: "paid" } : o))
        );

        loadOrders();
      } else {
        alert("Payment failed");
      }
    } catch (err) {
      console.error("Payment error", err);
    }
  };

  const filtered = orders.filter(
    (o) =>
      String(o.id).includes(search) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const openInvoiceModal = async (orderId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/invoice/${orderId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setInvoiceData(data);
    } catch (err) {
      console.error("Invoice load failed", err);
    }
  };

  const sendToWhatsApp = (data: InvoiceData) => {
    let message = `CAFEFLOW Invoice\n\n`;
    message += `Bill: ${data.bill_number}\n`;
    message += `Customer: ${data.customer_name}\n\n`;

    data.items.forEach((item) => {
      message += `${item.quantity}x ${item.name} - Rs ${item.total}\n`;
    });

    message += `\nTotal: Rs ${data.final_amount}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const paid = orders.filter((o) => o.status === "paid").length;
    const pending = totalOrders - paid;
    const revenue = orders.reduce((sum, o) => {
      const value = Number(String(o.total).replace(/[^0-9.]/g, ""));
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);

    return { totalOrders, paid, pending, revenue };
  }, [orders]);

  const invoiceLineItems = useMemo(() => {
    if (!invoiceData) return [];
    if (invoiceData.line_items && invoiceData.line_items.length > 0) {
      return invoiceData.line_items;
    }

    return (invoiceData.items || []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      base_price: Number(item.base_price || 0),
      line_total: Number(item.line_total || 0),
    }));
  }, [invoiceData]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#f6f1ff_0%,#fcfbff_48%,#efe7ff_100%)] p-4 md:p-6">
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body * {
            visibility: hidden !important;
          }

          .thermal-print-root,
          .thermal-print-root * {
            visibility: visible !important;
          }

          .thermal-print-root {
            position: fixed;
            inset: 0 auto auto 0;
            width: 80mm;
            background: #fff;
            color: #000;
            margin: 0;
            padding: 8px;
            font-family: "Courier New", monospace;
            font-size: 11px;
            line-height: 1.25;
            box-shadow: none !important;
            border: 0 !important;
            border-radius: 0 !important;
          }

          .thermal-no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1500px] space-y-6 animate-fade-in">
        <div className="rounded-3xl border border-purple-200/70 bg-white/85 p-5 shadow-[0_20px_52px_rgba(109,40,217,0.12)] backdrop-blur-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
                <ShoppingBag className="h-3.5 w-3.5" />
                Service Control
              </p>
              <h1 className="mt-2 text-2xl font-bold text-purple-950 md:text-3xl">
                Orders Command
              </h1>
              <p className="mt-1 text-sm text-purple-700/80">
                Track billing, payments, and invoice dispatch in one workspace.
              </p>
            </div>

            <div className="relative w-full max-w-sm">
             
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order id or customer..."
                className="w-full rounded-xl border border-purple-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-purple-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-300/35"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<ShoppingBag className="h-4 w-4" />}
              label="Total Orders"
              value={stats.totalOrders}
              tone="purple"
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Paid"
              value={stats.paid}
              tone="green"
            />
            <StatCard
              icon={<Wallet className="h-4 w-4" />}
              label="Pending"
              value={stats.pending}
              tone="amber"
            />
            <StatCard
              icon={<BadgeIndianRupee className="h-4 w-4" />}
              label="Revenue"
              value={`Rs ${stats.revenue.toFixed(0)}`}
              tone="purple"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-purple-200/70 bg-white shadow-[0_18px_45px_rgba(91,33,182,0.12)]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr className="bg-[linear-gradient(120deg,#f5eeff_0%,#fbf8ff_100%)] text-left">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Order
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Table
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Items
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-100">
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="transition hover:bg-purple-50/60"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-purple-900">
                      #{String(o.id).slice(0, 6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-800">{o.table}</td>
                    <td className="px-6 py-4 text-sm text-purple-900">{o.customer}</td>
                    <td className="px-6 py-4 text-sm text-purple-700/80">{o.items}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-purple-900">
                      {o.total}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge variant={o.status} />

                        {o.status !== "paid" ? (
                          <button
                            onClick={() => openPaymentModal(o.id)}
                            className="rounded-lg bg-[linear-gradient(135deg,#7c3aed_0%,#5b21b6_100%)] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(91,33,182,0.28)] transition hover:opacity-95"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openInvoiceModal(o.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-200"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Invoice
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-700/80">{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {invoiceData && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6 flex items-center justify-center">
          <div className="thermal-print-root w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border shadow-soft">
            <div className="thermal-no-print px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Bill Preview</p>
              <button
                onClick={() => setInvoiceData(null)}
                className="px-3 py-1.5 text-xs rounded-md border border-input hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="p-4 bg-white text-slate-900">
              <div className="mx-auto w-full max-w-md rounded-md border border-dashed border-slate-300 p-4 font-mono text-xs">
                <div className="text-center border-b border-dashed border-slate-300 pb-3">
                  <img
                    src="/logo.jpeg"
                    alt="Dip and Dash Logo"
                    className="mx-auto mb-2 h-12 w-12 rounded object-cover"
                  />
                  <h3 className="text-sm font-bold tracking-wide">CAFE INVOICE</h3>
                  <p className="mt-1">Bill No: {invoiceData.bill_number}</p>
                  <p>{new Date(invoiceData.date).toLocaleString()}</p>
                </div>

                <div className="py-3 space-y-1 border-b border-dashed border-slate-300">
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span className="font-semibold">{invoiceData.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Type</span>
                    <span>{invoiceData.order_type || "DINE_IN"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff</span>
                    <span>{invoiceData.staff || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span>{invoiceData.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span>{invoiceData.payment_status || "PAID"}</span>
                  </div>
                </div>

                <div className="py-3 border-b border-dashed border-slate-300">
                  <p className="mb-2 font-semibold">Items List</p>
                  <div className="grid grid-cols-12 gap-2 font-semibold mb-2">
                    <p className="col-span-5">Item</p>
                    <p className="col-span-2 text-right">Qty</p>
                    <p className="col-span-2 text-right">Price</p>
                    <p className="col-span-3 text-right">Total</p>
                  </div>
                  <div className="space-y-1.5">
                    {invoiceLineItems.length > 0 ? (
                      invoiceLineItems.map((li, idx) => (
                        <div key={`${li.name}-${idx}`} className="grid grid-cols-12 gap-2">
                          <p className="col-span-5 truncate">{li.name}</p>
                          <p className="col-span-2 text-right">{li.quantity}</p>
                          <p className="col-span-2 text-right">{Number(li.base_price).toFixed(0)}</p>
                          <p className="col-span-3 text-right">{Number(li.line_total).toFixed(0)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500">No items available in invoice payload.</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs.{Number(invoiceData.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total GST</span>
                    <span>Rs.{Number(invoiceData.total_gst).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>Rs.{Number(invoiceData.discount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-2 text-sm">
                    <span>Final Amount</span>
                    <span>Rs.{Number(invoiceData.final_amount).toLocaleString()}</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-[11px] text-slate-500">Thank you. Visit again.</p>
              </div>

              <div className="thermal-no-print mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  Thermal Print
                </button>
                <button
                  onClick={() => sendToWhatsApp(invoiceData)}
                  className="rounded-md bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0220]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-2xl border border-purple-200 bg-white p-6 shadow-[0_26px_70px_rgba(49,17,98,0.38)]">
            <h2 className="text-lg font-semibold text-purple-950">Complete Payment</h2>
            <p className="mt-1 text-sm text-purple-700/80">
              Choose payment mode and confirm transaction.
            </p>

            <div className="mt-4 space-y-3">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-300/35"
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
                    paymentMethod === "UPI" ? "Enter UPI ID" : "Enter Card Number"
                  }
                  className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-300/35"
                />
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#5b21b6_100%)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: JSX.Element;
  label: string;
  value: number | string;
  tone: "purple" | "green" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-purple-200 bg-purple-50 text-purple-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

export default Orders;

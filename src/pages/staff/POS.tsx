import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Tag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE_URL = "http://192.168.1.3:8000";

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  category_name: string;
  image: string;
  gst_percent: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface OrderDetails {
  id: string;
  order_type: string;
  customer_name: string;
  phone?: string;
  table_number?: string;
  token_number?: string;
  session?: string;
}

/* ================= COMPONENT ================= */

export default function SalesTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const sessionIdParam = searchParams.get("session");
  const tableNumberParam = searchParams.get("table_number");
  const tokenNumberParam = searchParams.get("token_number");
  const customerNameParam = searchParams.get("customer_name");
  const token = localStorage.getItem("access");

  /* ================= STATE ================= */

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [runtimeOrderId, setRuntimeOrderId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const queryOrderContext = useMemo<OrderDetails | null>(() => {
    if (!tableNumberParam && !tokenNumberParam && !customerNameParam) return null;
    return {
      id: "",
      order_type: "DINE_IN",
      customer_name: customerNameParam ?? "",
      table_number: tableNumberParam ?? "",
      token_number: tokenNumberParam ?? "",
      session: sessionIdParam ?? "",
    };
  }, [customerNameParam, sessionIdParam, tableNumberParam, tokenNumberParam]);
  const effectiveOrderId = runtimeOrderId ?? orderId;

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    if (!token) return;

    fetch(`${BASE_URL}/api/products/categories/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setCategories([{ id: "all", name: "All" }, ...d]));

    fetch(`${BASE_URL}/api/products/products/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setProducts(d));
  }, [token]);

  /* ================= LOAD ORDER DETAILS ================= */

  useEffect(() => {
    if (!effectiveOrderId || !token) return;

    fetch(`${BASE_URL}/api/orders/${effectiveOrderId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        console.log("ORDER DETAILS:", data);
        setOrderDetails(data);
      })
      .catch(err => console.error(err));
  }, [effectiveOrderId, token]);

  /* ================= FILTER ================= */

  const filteredProducts = products.filter(p =>
    (activeCategory === "All" || p.category_name === activeCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= CART ================= */

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) {
        return prev.map(i =>
          i.id === p.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        { id: p.id, name: p.name, price: parseFloat(p.price), qty: 1 },
      ];
    });
  };

  const updateQty = (id: string, diff: number) => {
    setCart(prev =>
      prev
        .map(i =>
          i.id === id ? { ...i, qty: i.qty + diff } : i
        )
        .filter(i => i.qty > 0)
    );
  };

  const resetCart = () => setCart([]);

  /* ================= TOTAL ================= */

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const gst = cart.reduce((s, i) => {
    const product = products.find(p => p.id === i.id);
    const rate = Number(product?.gst_percent || 0);
    return s + (i.price * i.qty * rate) / 100;
  }, 0);

  const total = subtotal + gst;

  /* ================= SEND ================= */

  const handleSend = async () => {
    if (cart.length === 0 || !token || sending) return;

    setSending(true);
    try {
      let resolvedOrderId = effectiveOrderId;

      // Dine-in flow: create order only at send-time when order id doesn't exist yet.
      if (!resolvedOrderId) {
        if (!queryOrderContext) throw new Error("Missing order context for dine-in order creation.");
        if (!queryOrderContext.session) throw new Error("Missing session id for dine-in order creation.");

        const createRes = await fetch(`${BASE_URL}/api/orders/create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_type: "DINE_IN",
            session: queryOrderContext.session,
          }),
        });

        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}));
          throw new Error(String(err?.error ?? err?.detail ?? "Unable to create dine-in order."));
        }

        const created = await createRes.json();
        const createdId = String(created?.id ?? created?.order_id ?? created?.order?.id ?? "");
        if (!createdId) throw new Error("Order created but id was not returned by API.");

        resolvedOrderId = createdId;
        setRuntimeOrderId(createdId);
        navigate(
          `/staff/pos?order=${encodeURIComponent(createdId)}&session=${encodeURIComponent(queryOrderContext.session ?? "")}&table_number=${encodeURIComponent(queryOrderContext.table_number ?? "")}&token_number=${encodeURIComponent(queryOrderContext.token_number ?? "")}&customer_name=${encodeURIComponent(queryOrderContext.customer_name ?? "")}`,
          { replace: true }
        );
      }

      await fetch(`${BASE_URL}/api/orders/add-items/${resolvedOrderId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map(c => ({
            product: c.id,
            quantity: c.qty,
          })),
        }),
      });

      await fetch(`${BASE_URL}/api/orders/status/${resolvedOrderId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      window.location.href = "/staff/kitchen";
    } catch (error) {
      console.error(error);
      alert("Failed to send order to kitchen.");
    } finally {
      setSending(false);
    }
  };

  /* ================= UI ================= */

  const displayOrder = orderDetails ?? queryOrderContext;

  const isTakeaway =
    displayOrder?.order_type === "TAKEAWAY" ||
    displayOrder?.order_type === "TAKE_AWAY";

  const isDineIn =
    displayOrder?.order_type === "DINE_IN";

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f6f0ff_0%,#f9f7ff_45%,#efe6ff_100%)] p-4 md:p-6">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-8">
          <div className="max-w-md">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-12 rounded-2xl border-purple-200 bg-white px-4 text-sm text-purple-950 placeholder:text-purple-400 focus-visible:ring-purple-300"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.name ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.name)}
                className={
                  activeCategory === cat.name
                    ? "rounded-full bg-[linear-gradient(135deg,#7c3aed_0%,#5b21b6_100%)] px-5 text-white shadow-md hover:opacity-95"
                    : "rounded-full border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
                }
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                onClick={() => addToCart(product)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-purple-100 bg-white/95 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(109,40,217,0.2)]"
              >
                <img
                  src={product.image}
                  className="h-40 w-full object-cover"
                />
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-purple-950">
                      {product.name}
                    </h3>
                    <span className="rounded-md bg-purple-100 px-2 py-1 text-[10px] font-semibold text-purple-700">
                      {product.category_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-800">
                      Rs {product.price}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white transition group-hover:bg-purple-700">
                      <Tag className="h-3 w-3" />
                      Add
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-purple-600/80">GST {product.gst_percent}%</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4">
          <Card className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-3xl border border-purple-200/70 bg-white shadow-[0_22px_55px_rgba(91,33,182,0.18)]">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-purple-100 bg-[linear-gradient(120deg,#f4ecff_0%,#ffffff_100%)] p-4">
              <h2 className="inline-flex items-center gap-2 text-base font-semibold text-purple-950">
                <ShoppingCart className="h-4 w-4 text-purple-700" />
                Your Cart
              </h2>
              <Button variant="ghost" size="sm" onClick={resetCart} className="text-purple-700 hover:bg-purple-100 hover:text-purple-800">
                Reset
              </Button>
            </div>

            {/* ORDER INFO */}
            {displayOrder && (
              <div className="space-y-1 border-b border-purple-100 bg-purple-50/70 px-4 py-3 text-sm">
                {isTakeaway && (
                  <>
                    <p><b>Type:</b> Takeaway</p>
                    <p><b>Customer:</b> {displayOrder.customer_name}</p>
                    {displayOrder.phone && (
                      <p className="text-xs text-purple-700/70">
                        {displayOrder.phone}
                      </p>
                    )}
                  </>
                )}

                {isDineIn && (
                  <>
                    <p><b>Table:</b> {displayOrder.table_number || "-"}</p>
                    <p><b>Token:</b> {displayOrder.token_number || "-"}</p>
                    <p><b>Customer:</b> {displayOrder.customer_name || "-"}</p>
                  </>
                )}
              </div>
            )}

            {/* BODY */}
            <div className="flex-1 overflow-auto p-3">
              <div className="mb-2 grid grid-cols-12 border-b border-purple-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                <div className="col-span-5">Item</div>
                <div className="col-span-3 text-center">Qty</div>
                <div className="col-span-2 text-center">GST</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {cart.length === 0 && (
                <div className="py-10 text-center text-sm text-purple-400">
                  Your cart is empty
                </div>
              )}

              {cart.map(item => {
                const product = products.find(p => p.id === item.id);
                const rate = Number(product?.gst_percent || 0);
                const base = item.price * item.qty;
                const final = base + (base * rate) / 100;

                return (
                  <div
                    key={item.id}
                    className="mb-2 grid grid-cols-12 items-center rounded-xl border border-purple-100 bg-purple-50/40 px-2 py-2 text-[12px]"
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <img
                        src={product?.image}
                        className="h-9 w-9 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-purple-950">{item.name}</p>
                        <p className="text-[11px] text-purple-600/75">
                          Rs {item.price} x {item.qty}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-6 w-6 rounded-md bg-white text-sm font-bold text-purple-700 shadow-sm hover:bg-purple-100"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-semibold text-purple-900">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-6 w-6 rounded-md bg-white text-sm font-bold text-purple-700 shadow-sm hover:bg-purple-100"
                      >
                        +
                      </button>
                    </div>
                    <div className="col-span-2 text-center font-medium text-purple-800">{rate}%</div>
                    <div className="col-span-2 text-right font-semibold text-purple-900">
                      Rs {final.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="space-y-2 border-t border-purple-100 bg-white p-4">
              <div className="flex justify-between text-sm text-purple-800">
                <span>Subtotal</span>
                <span>Rs {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-purple-800">
                <span>GST</span>
                <span>Rs {gst.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-purple-950">
                <span>Total</span>
                <span className="text-purple-700">
                  Rs {total.toFixed(0)}
                </span>
              </div>

              <Button
                className="mt-2 h-11 w-full rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#5b21b6_100%)] font-semibold text-white hover:opacity-95"
                onClick={handleSend}
                disabled={cart.length === 0 || !token || (!effectiveOrderId && !queryOrderContext?.session) || sending}
              >
                {sending ? "Sending..." : "Send to Kitchen"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

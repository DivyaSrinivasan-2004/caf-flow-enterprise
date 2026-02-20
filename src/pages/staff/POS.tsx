import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";

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
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface OrderInfo {
  order_type: "DINE_IN" | "TAKEAWAY";
  customer_name: string | null;
  table: string | null;
  token: string | null;
}

/* ================= COMPONENT ================= */

export default function POS() {

  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order");

  const token = localStorage.getItem("access");

  /* ORDER INFO */
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  /* PRODUCTS */
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ================= LOAD CATEGORIES ================= */

  useEffect(() => {
    fetch(`${BASE_URL}/api/products/categories/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data =>
        setCategories([{ id: "all", name: "All" }, ...data])
      );
  }, []);

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    fetch(`${BASE_URL}/api/products/products/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  /* ================= LOAD ORDER INFO ================= */

useEffect(() => {

  if (!orderId) return;

  fetch(`${BASE_URL}/api/orders/${orderId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {

      setOrderInfo({
        order_type: data.order_type,
        customer_name: data.customer_name,

        // ✅ FIXED NAMES
        table: data.table_number || null,
        token: data.token_number || null,
      });

    });

}, [orderId]);

  /* ================= FILTER ================= */

  const filtered = products.filter((p) => {

    const matchCat =
      category === "All" || p.category_name === category;

    const matchSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  /* ================= CART ================= */

  const addToCart = (item: Product) => {

    setCart((prev) => {

      const existing = prev.find(c => c.id === item.id);

      if (existing) {

        return prev.map(c =>
          c.id === item.id
            ? { ...c, qty: c.qty + 1 }
            : c
        );
      }

      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {

    setCart((prev) =>
      prev
        .map(c =>
          c.id === id
            ? { ...c, qty: Math.max(0, c.qty + delta) }
            : c
        )
        .filter(c => c.qty > 0)
    );
  };

  const total = cart.reduce(
    (sum, c) => sum + c.price * c.qty,
    0
  );

  /* ================= SEND TO KITCHEN ================= */

  const handleSendToKitchen = async () => {

    if (!orderId || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    /* Save Items */
    const itemsRes = await fetch(
      `${BASE_URL}/api/orders/add-items/${orderId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((c) => ({
            product: c.id,
            quantity: c.qty,
          })),
        }),
      }
    );

    if (!itemsRes.ok) {
      alert("Failed to save items");
      return;
    }

    /* Update Status */
    const statusRes = await fetch(
      `${BASE_URL}/api/orders/status/${orderId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "IN_PROGRESS",
        }),
      }
    );

    if (statusRes.ok) {
      alert("Sent to Kitchen");
      window.location.href = "/staff/kitchen";
    } else {
      alert("Failed to send");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">

      {/* SIDEBAR */}
      <div className="w-[200px] bg-card rounded-lg border p-4 flex flex-col">

        {orderInfo && (
          <div className="mb-3 text-center">

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold
              ${
                orderInfo.order_type === "DINE_IN"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {orderInfo.order_type}
            </span>

          </div>
        )}

        <h3 className="text-sm font-semibold mb-3">Categories</h3>

        <div className="flex-1 overflow-y-auto space-y-2">

          {categories.map((c) => (

            <button
              key={c.id}
              onClick={() => setCategory(c.name)}
              className={`w-full px-3 py-2 rounded text-sm
              ${
                category === c.name
                  ? "bg-purple-600 text-white"
                  : "hover:bg-accent"
              }`}
            >
              {c.name}
            </button>

          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="flex-1 flex flex-col">

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 overflow-y-auto">

          {filtered.map((item) => (

            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-lg border p-4 text-left"
            >

              <div className="h-[120px] mb-3 overflow-hidden rounded-md">

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

              </div>

              <p className="text-sm font-medium">{item.name}</p>

              <p className="text-lg font-bold text-purple-600">
                ₹{parseFloat(item.price).toFixed(2)}
              </p>

            </button>

          ))}
        </div>
      </div>

      {/* CART */}
      <div className="w-[360px] bg-white rounded-xl border flex flex-col">

        {/* HEADER */}
        <div className="p-5 border-b">

          <div className="font-semibold">Current Order</div>

          {orderInfo?.order_type === "DINE_IN" && (
            <>
              <div className="text-xs mt-1">
                Table: {orderInfo.table}
              </div>

              <div className="text-xs">
                Token: {orderInfo.token}
              </div>
            </>
          )}

          <div className="text-xs mt-1">
            Customer: {orderInfo?.customer_name || "Walk-in"}
          </div>

        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {cart.map((item) => (

            <div key={item.id} className="flex items-center gap-3">

              <div className="flex-1">

                <p className="text-sm font-medium">{item.name}</p>

                <p className="text-xs">₹{item.price}</p>

              </div>

              <div className="flex items-center gap-2">

                <button onClick={() => updateQty(item.id, -1)}>
                  <Minus size={14} />
                </button>

                <span>{item.qty}</span>

                <button onClick={() => updateQty(item.id, 1)}>
                  <Plus size={14} />
                </button>

              </div>

              <span className="w-16 text-right font-semibold">
                ₹{(item.price * item.qty).toFixed(2)}
              </span>

              <button
                onClick={() =>
                  setCart(cart.filter(c => c.id !== item.id))
                }
              >
                <X size={14} />
              </button>

            </div>

          ))}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t space-y-3">

          <div className="flex justify-between text-sm">

            <span>Total</span>

            <span className="font-bold text-purple-600">
              ₹{total.toFixed(2)}
            </span>

          </div>

          <button
            onClick={handleSendToKitchen}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold"
          >
            Send To Kitchen
          </button>

        </div>

      </div>
    </div>
  );
}
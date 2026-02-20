import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Volume2 } from "lucide-react";

const BASE_URL = "http://192.168.1.3:8000";

interface KitchenOrder {
  id: string;
  table: string;
  items: string[];
  notes?: string;
  timer: string;
  priority: boolean;
  status: "NEW" | "IN_PROGRESS" | "READY" | "SERVED";
}

const columns = [
  { label: "Pending", status: "NEW", color: "border-t-warning" },
  { label: "Cooking", status: "IN_PROGRESS", color: "border-t-primary" },
  { label: "Ready", status: "READY", color: "border-t-success" },
  { label: "Served", status: "SERVED", color: "border-t-muted-foreground" },
];

const Kitchen = () => {
  const token = localStorage.getItem("access");

  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  // 🔥 LOAD ORDERS
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // auto refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/today/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

   const formatted = data.map((order: any) => ({
  id: order.id,
  table: order.table_name,
  customer: order.customer_name, // ✅ NEW
  items: order.items.map(
    (i: any) => `${i.quantity}x ${i.product_name}`
  ),
  status: order.status,
}));

      setOrders(formatted);
    } catch (err) {
      console.error("Failed to load kitchen orders", err);
    }
  };

  // 🔥 UPDATE STATUS
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/status/${orderId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        loadOrders();
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  return (
    <div className="space-y-[24px] animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Kitchen Display
        </h1>
        <button className="p-[8px] rounded-md hover:bg-accent transition-colors">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-[16px] h-[calc(100vh-200px)]">
        {columns.map((col) => {
          const colOrders = orders.filter(
            (o) => o.status === col.status
          );

          return (
            <div
              key={col.status}
              className={`bg-card rounded-lg border border-border shadow-soft overflow-hidden flex flex-col border-t-4 ${col.color}`}
            >
              <div className="px-[16px] py-[12px] border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {col.label}
                </h3>
                <span className="text-xs font-bold text-muted-foreground bg-secondary px-[8px] py-[2px] rounded-full">
                  {colOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-[12px] space-y-[12px]">
                {colOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-md border p-[16px] transition-all hover:shadow-soft border-border bg-background"
                  >
                    <div className="flex items-center justify-between mb-[8px]">
                      <span className="text-sm font-bold text-foreground">
                        #{order.id.slice(0, 6)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.timer}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-primary mb-[8px]">
                      {order.table}
                    </p>
                    <p className="text-xs font-medium text-primary mb-[8px]">
                      {order.customer}
                    </p>

                    <ul className="space-y-[4px]">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs text-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>

                    {col.status !== "COMPLETED" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            order.id,
                            col.status === "NEW"
                              ? "IN_PROGRESS"
                              : col.status === "IN_PROGRESS"
                              ? "READY"
                              : "COMPLETED"
                          )
                        }
                        className="w-full mt-[12px] py-[8px] rounded-md text-xs font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-all"
                      >
                        {col.status === "NEW"
                          ? "Start Cooking"
                          : col.status === "IN_PROGRESS"
                          ? "Mark Ready"
                          : "Mark Served"}
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
};

export default Kitchen; 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import {
  ShoppingCart,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
const BASE_URL = "http://192.168.1.3:8000";
const hourlyData = [
  { hour: '8AM', orders: 12 },
  { hour: '9AM', orders: 28 },
  { hour: '10AM', orders: 35 },
  { hour: '11AM', orders: 42 },
  { hour: '12PM', orders: 58 },
  { hour: '1PM', orders: 51 },
  { hour: '2PM', orders: 38 },
  { hour: '3PM', orders: 29 },
  { hour: '4PM', orders: 22 },
];

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTakeawayModal, setShowTakeawayModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-[24px] animate-fade-in">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow"
          >
            + Create Order
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/staff/tables");
                }}
                className="w-full text-left px-4 py-2 hover:bg-accent"
              >
                🍽️ Dine In
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowTakeawayModal(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-accent"
              >
                🛍️ Take Away
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[16px]">
        <KPICard title="Active Orders" value="12" icon={<ShoppingCart className="w-5 h-5" />} />
        <KPICard title="Tables Occupied" value="8/15" icon={<Users className="w-5 h-5" />} />
        <KPICard title="Pending" value="4" icon={<Clock className="w-5 h-5" />} />
        <KPICard title="Ready" value="3" icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="Today's Sales" value="$1,280" icon={<DollarSign className="w-5 h-5" />} />
        <KPICard title="Shift Sales" value="$640" icon={<DollarSign className="w-5 h-5" />} />
      </div>

      {/* CHART + RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">

        <div className="bg-card rounded-lg p-[24px] shadow-soft border border-border">
          <h3 className="text-sm font-semibold mb-[16px]">Live Sales Today</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="hsl(252, 75%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg shadow-soft border border-border">
          <div className="px-[24px] py-[16px] border-b border-border">
            <h3 className="text-sm font-semibold">Recent Orders</h3>
          </div>
        </div>
      </div>

      {/* TAKEAWAY MODAL */}
      {showTakeawayModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="font-semibold text-lg mb-4">Take Away Order</h2>

            <input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded-lg"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTakeawayModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

             <button
  onClick={async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/orders/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`, 
          },
          body: JSON.stringify({
            order_type: "TAKEAWAY",
            customer_name: customerName,
            customer_phone: phone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Order creation failed");
      }

      const data = await response.json();

      const orderId = data.id; // UUID string

navigate(`/staff/pos?order=${orderId}`);

    } catch (error) {
      console.error(error);
      alert("Error creating order");
    }
  }}
  className="px-4 py-2 bg-primary text-white rounded-lg"
>
  Continue
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
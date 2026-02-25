import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import KPICard from "@/components/KPICard";
import StatusBadge from "@/components/StatusBadge";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Megaphone,
  ReceiptText,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BASE_URL = "http://192.168.1.3:8000";

const revenueTrend = [
  { slot: "08:00", revenue: 380, bills: 9 },
  { slot: "09:00", revenue: 740, bills: 18 },
  { slot: "10:00", revenue: 980, bills: 27 },
  { slot: "11:00", revenue: 1240, bills: 31 },
  { slot: "12:00", revenue: 1820, bills: 45 },
  { slot: "13:00", revenue: 1530, bills: 38 },
  { slot: "14:00", revenue: 1210, bills: 30 },
  { slot: "15:00", revenue: 980, bills: 24 },
  { slot: "16:00", revenue: 640, bills: 16 },
];

const paymentMix = [
  { name: "Card", value: 42, color: "#2563eb" },
  { name: "UPI", value: 33, color: "#0f766e" },
  { name: "Cash", value: 20, color: "#ca8a04" },
  { name: "Wallet", value: 5, color: "#9333ea" },
];

const marketingCards = [
  { campaign: "Lunch Combo", channel: "In-store", roi: "+18%", status: "active" as const },
  { campaign: "Evening Brew", channel: "WhatsApp", roi: "+12%", status: "active" as const },
  { campaign: "Bulk Office Plan", channel: "B2B", roi: "+24%", status: "pending" as const },
];

const queueBoard = [
  { label: "Pending", count: 5, variant: "pending" as const },
  { label: "Cooking", count: 6, variant: "cooking" as const },
  { label: "Ready", count: 4, variant: "ready" as const },
  { label: "Served", count: 28, variant: "served" as const },
];

const quickActions = [
  { label: "Open Tables", path: "/staff/tables" },
  { label: "Kitchen Board", path: "/staff/kitchen" },
  { label: "Orders List", path: "/staff/orders" },
  { label: "Shift Summary", path: "/staff/shift" },
];

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [showTakeawayModal, setShowTakeawayModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const summary = useMemo(() => {
    const revenue = revenueTrend.reduce((sum, row) => sum + row.revenue, 0);
    const bills = revenueTrend.reduce((sum, row) => sum + row.bills, 0);
    const activeQueue = queueBoard[0].count + queueBoard[1].count;
    const avgBill = Math.round(revenue / bills);
    const target = 12000;
    const targetProgress = Math.min(Math.round((revenue / target) * 100), 100);

    return {
      revenue,
      bills,
      activeQueue,
      avgBill,
      target,
      targetProgress,
      conversion: 34,
      repeatCustomers: 41,
      collectionRate: 96,
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-[length:100%_100%]"
          style={{
            backgroundImage:
              "linear-gradient(160deg,rgba(2,6,23,0.46),rgba(30,41,59,0.42)), url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2200&q=80')",
          }}
        />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/90">
                <CalendarDays className="h-3.5 w-3.5" />
                Business and Marketing View
              </p>
              <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">Staff Business Command Center</h1>
              <p className="mt-1 text-sm text-white/75">
                Billing performance, customer growth, and live service execution in one dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/staff/tables")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg"
              >
                Dine In
              </button>
              <button
                onClick={() => setShowTakeawayModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg"
              >
                Take Away
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-white md:grid-cols-4">
            <div>
              <p className="text-xs text-white/70">Gross Revenue</p>
              <p className="text-xl font-semibold">${summary.revenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-white/70">Bills Processed</p>
              <p className="text-xl font-semibold">{summary.bills}</p>
            </div>
            <div>
              <p className="text-xs text-white/70">Collection Rate</p>
              <p className="text-xl font-semibold">{summary.collectionRate}%</p>
            </div>
            <div>
              <p className="text-xs text-white/70">Avg Bill Value</p>
              <p className="text-xl font-semibold">${summary.avgBill}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${summary.revenue.toLocaleString()}`}
          subtitle="Compared to yesterday"
          icon={<CircleDollarSign className="h-4 w-4" />}
          trend={{ value: "14.2%", positive: true }}
        />
        <KPICard
          title="Total Bills"
          value={summary.bills}
          subtitle="All billing channels"
          icon={<ReceiptText className="h-4 w-4" />}
          trend={{ value: "8.1%", positive: true }}
        />
        <KPICard
          title="Customer Conversion"
          value={`${summary.conversion}%`}
          subtitle="Walk-in to paid bills"
          icon={<Target className="h-4 w-4" />}
          trend={{ value: "3.6%", positive: true }}
        />
        <KPICard
          title="Repeat Customers"
          value={`${summary.repeatCustomers}%`}
          subtitle="Retention this week"
          icon={<UserPlus className="h-4 w-4" />}
          trend={{ value: "2.3%", positive: true }}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Revenue and Billing Trend</h3>
              <p className="text-xs text-muted-foreground">Monitor billing momentum through business hours.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              On track
            </span>
          </div>

          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="slot" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Revenue target: ${summary.target.toLocaleString()}</span>
              <span className="font-semibold text-foreground">{summary.targetProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${summary.targetProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="text-base font-semibold text-foreground">Payment Mix</h3>
          <p className="mt-1 text-xs text-muted-foreground">Channel-wise billing contribution</p>

          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={paymentMix} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                {paymentMix.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {paymentMix.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Marketing Performance</h3>
            <Megaphone className="h-4 w-4 text-primary" />
          </div>

          <div className="space-y-3">
            {marketingCards.map((item) => (
              <div key={item.campaign} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{item.campaign}</p>
                  <StatusBadge variant={item.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.channel}</p>
                <p className="mt-2 text-sm font-semibold text-success">ROI {item.roi}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="text-base font-semibold text-foreground">Queue Health</h3>
          <p className="mt-1 text-xs text-muted-foreground">Live service execution board</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {queueBoard.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <StatusBadge variant={item.variant} />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{item.count}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background p-3">
            <span className="text-sm text-muted-foreground">Active floor staff</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4" />
              7
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="text-base font-semibold text-foreground">Quick Operations</h3>
          <p className="mt-1 text-xs text-muted-foreground">Move between billing workflows faster</p>

          <div className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition hover:bg-accent"
              >
                <span>{action.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/staff/orders")}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <CreditCard className="h-4 w-4" />
            Go to Billing Desk
          </button>
        </div>
      </section>

      {showTakeawayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="mb-1 text-xl font-semibold text-foreground">Take Away Order</h2>
            <p className="mb-5 text-sm text-muted-foreground">Add customer details before opening POS.</p>

            <input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mb-3 w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-5 w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTakeawayModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${BASE_URL}/api/orders/create/`, {
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
                    });

                    if (!response.ok) {
                      throw new Error("Order creation failed");
                    }

                    const data = await response.json();
                    navigate(`/staff/pos?order=${data.id}`);
                  } catch (error) {
                    console.error(error);
                    alert("Error creating order");
                  }
                }}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
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

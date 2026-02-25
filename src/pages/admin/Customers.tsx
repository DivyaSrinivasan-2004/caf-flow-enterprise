import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Activity,
  Wallet,
  Trophy,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

/* ================= CONFIG ================= */

const API_BASE = "http://192.168.1.3:8000";

/* ================= TYPES ================= */

interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  visit_count?: number;
  order_count?: number;
  total_spent?: number;
  last_visit_at?: string;
  avg_order_value?: number;
  favorite_order_type?: string;
}

/* ================= HELPERS ================= */

const formatDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

const money = (v?: number) => `₹${(v ?? 0).toLocaleString()}`;

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" });

/* ================= MAIN ================= */

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Customer | null>(null);

  /* ================= AUTH ================= */

  const headers = () => {
    const token = localStorage.getItem("access");
    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  /* ================= LOAD ================= */

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/accounts/customers/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...headers(),
          },
        }
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    const t = search.toLowerCase();

    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(t) ||
        c.phone?.includes(t) ||
        c.id?.includes(t)
    );
  }, [customers, search]);

  /* ================= ANALYTICS ================= */

  const active = useMemo(
    () =>
      customers.filter(
        (c) =>
          (c.order_count ?? 0) > 0 ||
          (c.visit_count ?? 0) > 0
      ).length,
    [customers]
  );

  const revenue = useMemo(
    () =>
      customers.reduce(
        (s, c) => s + (c.total_spent ?? 0),
        0
      ),
    [customers]
  );

  const avgValue = useMemo(
    () =>
      customers.length
        ? revenue / customers.length
        : 0,
    [customers, revenue]
  );

  const frequent = useMemo(
    () =>
      [...customers]
        .sort(
          (a, b) =>
            (b.order_count ?? 0) -
            (a.order_count ?? 0)
        )
        .slice(0, 6)
        .map((c) => ({
          name: c.name,
          orders: c.order_count ?? 0,
        })),
    [customers]
  );

  const growth = useMemo(() => {
    const now = new Date();
    const res: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const count = customers.filter((c) => {
        const cd = new Date(c.created_at);
        return (
          cd.getMonth() === d.getMonth() &&
          cd.getFullYear() === d.getFullYear()
        );
      }).length;

      res.push({
        month: monthLabel(d),
        customers: count,
      });
    }

    return res;
  }, [customers]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-10 text-sm text-slate-600">
        Loading customers...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">

      {/* ================= HEADER ================= */}

      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-7 text-white shadow-xl">

        <h1 className="text-2xl font-bold">
          Customer Management
        </h1>

        <p className="mt-1 text-sm opacity-90">
          Loyalty • Spending • Analytics
        </p>

        <div className="mt-4 flex flex-wrap gap-2">

          <Badge>{customers.length} Customers</Badge>
          <Badge>{active} Active</Badge>
          <Badge>{money(revenue)} Revenue</Badge>
          <Badge>Avg {money(avgValue)}</Badge>

        </div>
      </div>

      {/* ================= KPI ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <KPI
          label="Customers"
          value={customers.length}
          icon={<Users />}
        />

        <KPI
          label="Active"
          value={active}
          icon={<Activity />}
        />

        <KPI
          label="Revenue"
          value={money(revenue)}
          icon={<Wallet />}
        />

        <KPI
          label="Avg Value"
          value={money(avgValue)}
          icon={<Trophy />}
        />

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Top Customers">

          <ResponsiveContainer>
            <BarChart data={frequent}>
              <CartesianGrid opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="orders"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </ChartCard>

        <ChartCard title="Customer Growth">

          <ResponsiveContainer>
            <AreaChart data={growth}>

              <defs>
                <linearGradient
                  id="grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#6366f1"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="#6366f1"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Area
                dataKey="customers"
                stroke="#6366f1"
                fill="url(#grad)"
                strokeWidth={2}
              />

            </AreaChart>
          </ResponsiveContainer>

        </ChartCard>

      </div>

      {/* ================= TABLE ================= */}

      <div className="rounded-2xl bg-white shadow border overflow-hidden">

        {/* TABLE HEADER */}

        <div className="p-4 border-b flex justify-between items-center bg-slate-100">

          <h2 className="font-semibold text-slate-800">
            Customers List
          </h2>

          <div className="relative w-64">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customer..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />

          </div>

        </div>

        {/* TABLE */}

        <table className="w-full text-sm">

          <thead className="bg-purple-600 text-white">

            <tr>

              {[
                "Customer Name",
                "Phone",
                "Joined",
                "Orders",
                "Visits",
                "Total Spent",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}

            </tr>

          </thead>

          <tbody className="divide-y">

            {filtered.map((c) => (

              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                className="hover:bg-purple-50 cursor-pointer transition"
              >

                <td className="px-4 py-3 font-medium text-slate-800">
                  {c.name || "Unknown"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {c.phone}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {formatDate(c.created_at)}
                </td>

                <td className="px-4 py-3">
                  {c.order_count ?? 0}
                </td>

                <td className="px-4 py-3">
                  {c.visit_count ?? 0}
                </td>

                <td className="px-4 py-3 font-semibold text-purple-700">
                  {money(c.total_spent)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ================= MODAL ================= */}

      {selected && (
        <CustomerModal
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  );
};

export default Customers;

/* ================= COMPONENTS ================= */

const Badge = ({ children }: any) => (
  <span className="px-3 py-1 rounded-full text-xs bg-white/20 border border-white/30">
    {children}
  </span>
);

const KPI = ({ label, value, icon }: any) => (
  <div className="rounded-2xl bg-white border shadow-sm p-4">

    <div className="flex justify-between items-center">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <div className="text-purple-600">
        {icon}
      </div>

    </div>

    <p className="mt-2 text-2xl font-bold text-slate-800">
      {value}
    </p>

  </div>
);

const ChartCard = ({
  title,
  children,
}: any) => (
  <div className="rounded-2xl bg-white border shadow p-5">

    <p className="text-sm font-semibold text-slate-700 mb-3">
      {title}
    </p>

    <div className="h-[260px]">
      {children}
    </div>

  </div>
);

/* ================= MODAL ================= */

const CustomerModal = ({ data, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 p-6 text-white relative">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30"
          >
            <X size={18} />
          </button>

          <h2 className="text-xl font-bold">
            {data.name}
          </h2>

          <p className="text-xs opacity-90">
            Customer Profile
          </p>

        </div>

        {/* BODY */}

        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">

          {/* STATS */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <Stat label="Orders" value={data.order_count} />
            <Stat label="Visits" value={data.visit_count} />
            <Stat label="Spent" value={money(data.total_spent)} />
            <Stat
              label="Avg"
              value={money(data.avg_order_value)}
            />

          </div>

          {/* INFO */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Info label="Phone" value={data.phone} />
            <Info label="Joined" value={formatDate(data.created_at)} />
            <Info label="Last Visit" value={formatDate(data.last_visit_at)} />
            <Info
              label="Favorite"
              value={data.favorite_order_type}
            />

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t p-4 flex justify-end bg-slate-50">

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

const Stat = ({ label, value }: any) => (
  <div className="rounded-xl border bg-purple-50 p-4">

    <p className="text-xs text-purple-600">
      {label}
    </p>

    <p className="text-xl font-bold text-slate-800">
      {value ?? 0}
    </p>

  </div>
);

const Info = ({ label, value }: any) => (
  <div className="rounded-xl border bg-white p-4">

    <p className="text-xs text-slate-500">
      {label}
    </p>

    <p className="font-semibold text-slate-800 mt-1">
      {value || "-"}
    </p>

  </div>
);
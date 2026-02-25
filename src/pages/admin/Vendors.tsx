import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Mail,
  MapPin,
  Phone,
  Search,
  Truck,
} from "lucide-react";

type VendorStatus = "active" | "on_hold" | "new";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  lastDelivery: string;
  monthlySpend: number;
  score: number;
  status: VendorStatus;
}

const vendorSeed: Vendor[] = [
  {
    id: "V-1021",
    name: "BeanCraft Roasters",
    category: "Coffee Beans",
    contact: "Arjun Menon",
    phone: "+91 98 1100 2233",
    email: "orders@beancraft.in",
    city: "Bengaluru",
    lastDelivery: "2026-02-22",
    monthlySpend: 128000,
    score: 96,
    status: "active",
  },
  {
    id: "V-1094",
    name: "MilkNest Dairies",
    category: "Dairy",
    contact: "Nisha Roy",
    phone: "+91 98 2211 6677",
    email: "supply@milknest.com",
    city: "Mysuru",
    lastDelivery: "2026-02-24",
    monthlySpend: 84500,
    score: 91,
    status: "active",
  },
  {
    id: "V-1130",
    name: "BakeMills Essentials",
    category: "Bakery Inputs",
    contact: "Rahul Sethi",
    phone: "+91 97 5543 8822",
    email: "vendor@bakemills.in",
    city: "Chennai",
    lastDelivery: "2026-02-20",
    monthlySpend: 69200,
    score: 84,
    status: "on_hold",
  },
  {
    id: "V-1188",
    name: "GreenCrate Produce",
    category: "Fresh Produce",
    contact: "Mina Paul",
    phone: "+91 96 3300 1990",
    email: "fresh@greencrate.in",
    city: "Coimbatore",
    lastDelivery: "2026-02-23",
    monthlySpend: 56200,
    score: 88,
    status: "new",
  },
  {
    id: "V-1204",
    name: "PackRight Supplies",
    category: "Packaging",
    contact: "Karan Shah",
    phone: "+91 95 7788 4400",
    email: "ops@packright.co",
    city: "Pune",
    lastDelivery: "2026-02-18",
    monthlySpend: 43600,
    score: 81,
    status: "active",
  },
];

const Vendors = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | VendorStatus>("all");

  const filtered = useMemo(() => {
    return vendorSeed.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase()) ||
        v.category.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || v.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const kpis = useMemo(() => {
    const active = vendorSeed.filter((v) => v.status === "active").length;
    const spend = vendorSeed.reduce((sum, v) => sum + v.monthlySpend, 0);
    const avgScore = Math.round(vendorSeed.reduce((sum, v) => sum + v.score, 0) / vendorSeed.length);
    return { active, spend, avgScore, total: vendorSeed.length };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#0f2f2e_0%,#124f4c_42%,#227f7a_100%)] p-6 text-white shadow-[0_16px_36px_rgba(9,44,43,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_88%_30%,rgba(255,255,255,0.14),transparent_28%)]" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/90">Supply Command</p>
            <h1 className="mt-2 text-3xl font-bold">Vendors Hub</h1>
            <p className="mt-1 text-sm text-emerald-100/95">
              Track supplier health, spend, and last-mile supply performance.
            </p>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium">
            Procurement Window: Week 9
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Vendors" value={kpis.total} icon={<Building2 className="h-4 w-4" />} />
        <KpiCard label="Active Vendors" value={kpis.active} icon={<BadgeCheck className="h-4 w-4" />} />
        <KpiCard label="Monthly Spend" value={`Rs.${kpis.spend.toLocaleString()}`} icon={<CircleDollarSign className="h-4 w-4" />} />
        <KpiCard label="Avg Reliability" value={`${kpis.avgScore}%`} icon={<Truck className="h-4 w-4" />} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor, id, or category"
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "active", "on_hold", "new"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  status === s
                    ? "bg-emerald-600 text-white shadow-[0_8px_16px_rgba(5,150,105,0.3)]"
                    : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {s === "on_hold" ? "On Hold" : s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {filtered.map((vendor, idx) => (
          <motion.article
            key={vendor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_10px_26px_rgba(18,79,76,0.09)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-500">{vendor.id}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{vendor.name}</h3>
                <p className="text-sm text-muted-foreground">{vendor.category}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  vendor.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : vendor.status === "on_hold"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {vendor.status === "on_hold" ? "On Hold" : vendor.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                {vendor.contact}
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                {vendor.phone}
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                {vendor.email}
              </p>
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                {vendor.city}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs">
              <div>
                <p className="text-muted-foreground">Last Delivery</p>
                <p className="mt-0.5 font-semibold text-slate-900">{vendor.lastDelivery}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Spend</p>
                <p className="mt-0.5 font-semibold text-slate-900">Rs.{vendor.monthlySpend.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Reliability Score</p>
                <div className="mt-1 h-2 w-full rounded-full bg-emerald-100">
                  <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${vendor.score}%` }} />
                </div>
                <p className="mt-1 text-right font-semibold text-emerald-700">{vendor.score}%</p>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
};

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: JSX.Element }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_20px_rgba(16,72,70,0.08)]">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-emerald-600">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default Vendors;

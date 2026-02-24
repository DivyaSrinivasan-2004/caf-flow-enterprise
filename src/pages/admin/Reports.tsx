// Reports.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ArrowLeft } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart3, Pizza, FileText } from "lucide-react";

const userRole = "admin";
const API_BASE = "http://192.168.1.3:8000";

const reportCategories = [
  { name: "Daily Sales", desc: "Revenue breakdown by day", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
  { name: "Product Wise Sales", desc: "Performance by menu item", icon: <Pizza size={32} />, roles: ["admin", "manager"] },
  { name: "GST Report", desc: "Tax collection summary", icon: <FileText size={32} />, roles: ["admin"] },
  { name: "Stock Consumption", desc: "Ingredient usage tracking", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
  { name: "Staff Attendance", desc: "Employee login hours", icon: <BarChart3 size={32} />, roles: ["admin"] },
  { name: "Expense Report", desc: "Operational costs breakdown", icon: <BarChart3 size={32} />, roles: ["admin"] },
  { name: "Discount Report", desc: "Discounts applied overview", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
  { name: "Wastage Report", desc: "Spoilage and waste tracking", icon: <BarChart3 size={32} />, roles: ["admin"] },
  { name: "Peak Sales Time", desc: "Busiest hours analysis", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
  { name: "Delivery Report", desc: "Delivery order analytics", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
  { name: "Dine-in Report", desc: "In-house dining analytics", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
  { name: "Combo Sales", desc: "Bundle deal performance", icon: <BarChart3 size={32} />, roles: ["admin", "manager"] },
];

export default function Reports() {
  const token = localStorage.getItem("access");

  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async (type: string) => {
    setLoading(true);

    const endpointMap: Record<string, string> = {
      "Daily Sales": "sales/daily/",
      "Product Wise Sales": "sales/product/",
      "GST Report": "gst/",
      "Stock Consumption": "stock/consumption/",
      "Staff Attendance": "staff/performance/",
      "Expense Report": "purchase/daily/",
      "Discount Report": "discount/abuse/",
      "Wastage Report": "wastage/",
      "Peak Sales Time": "sales/peak-time/",
      "Delivery Report": "payments/method/",
      "Dine-in Report": "sales/daily/",
      "Combo Sales": "combo/performance/",
    };

    const endpoint = endpointMap[type];
    if (!endpoint) return;

    try {
      const res = await fetch(`${API_BASE}/api/reports/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${activeReport}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(activeReport || "Report", 14, 15);

    autoTable(doc, {
      head: [Object.keys(reportData[0] || {})],
      body: reportData.map((row) => Object.values(row)),
      startY: 20,
    });

    doc.save(`${activeReport}.pdf`);
  };

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Enterprise Analytics Dashboard</p>
        </div>

        {activeReport && (
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)} className="px-4 py-2 rounded-xl border bg-white flex gap-2 items-center">
              <Download size={16} /> Export
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-xl w-40 z-50">
                <button onClick={exportExcel} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                  Export Excel
                </button>
                <button onClick={exportPDF} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                  Export PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeReport ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {reportCategories
              .filter(r => r.roles.includes(userRole))
              .map((r) => (
                <motion.button key={r.name}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveReport(r.name);
                    loadReport(r.name);
                  }}
                className="relative rounded-2xl p-8 text-left overflow-hidden group
bg-gradient-to-br from-purple-100/60 via-white/80 to-indigo-100/60
backdrop-blur-xl
shadow-[0_20px_50px_rgba(0,0,0,0.08)]
hover:shadow-[0_30px_70px_rgba(124,58,237,0.18)]
transition-all duration-500"
                >
                  {/* Glow Background */}
<div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-white/30 to-indigo-100/40 opacity-0 group-hover:opacity-100 transition duration-500"></div>

{/* Shine Animation */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute inset-0 
    bg-gradient-to-r from-transparent via-white/50 to-transparent
    translate-x-[-100%] group-hover:translate-x-[100%]
    transition-transform duration-1000 ease-in-out">
  </div>
</div>
                  <div className="relative z-10">
<div className="relative p-3 rounded-xl w-fit 
bg-purple-100 text-purple-600
group-hover:bg-purple-600 group-hover:text-white
transition-all duration-500 shadow-md group-hover:shadow-xl">
                      {r.icon}
                    </div>
                    <h3 className="mt-4 font-semibold text-lg">{r.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                  </div>
                </motion.button>
              ))}
          </motion.div>
        ) : (
          <motion.div key="details" className="space-y-8">

            <button onClick={() => setActiveReport(null)}
              className="text-sm flex gap-2 items-center text-muted-foreground">
              <ArrowLeft size={16} /> Back
            </button>

            <h2 className="text-2xl font-bold">{activeReport}</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <ChartCard title={activeReport}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={Object.keys(reportData[0] || {})[0]} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(reportData[0] || {}).slice(1).map((key) => (
                      <Bar key={key} dataKey={key} fill="#7C3AED" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ================= DYNAMIC REPORT RENDERER ================= */

function ReportRenderer({ name, data, loading }: any) {

  switch (name) {

    case "Daily Sales":
      return <SalesReport data={data} loading={loading} />;

    case "Product Wise Sales":
      return <ProductReport data={data} loading={loading} />;

    case "GST Report":
      return <GSTReport data={data} loading={loading} />;

    case "Stock Consumption":
      return <SimpleLine title="Stock Usage Trend" data={data} loading={loading} />;

    case "Staff Attendance":
      return <SimpleLine title="Staff Login Hours" data={data} loading={loading} />;

    case "Expense Report":
      return <SimpleLine title="Expense Analysis" data={data} loading={loading} />;

    case "Discount Report":
      return <SimpleLine title="Discount Trend" data={data} loading={loading} />;

    case "Wastage Report":
      return <SimpleLine title="Wastage Monitoring" data={data} loading={loading} />;

    case "Peak Sales Time":
      return <SimpleLine title="Peak Hour Trend" data={data} loading={loading} />;

    case "Delivery Report":
      return <SimpleLine title="Delivery Performance" data={data} loading={loading} />;

    case "Dine-in Report":
      return <SimpleLine title="Dine-In Analysis" data={data} loading={loading} />;

    case "Combo Sales":
      return <SimpleLine title="Combo Sales Performance" data={data} loading={loading} />;

    default:
      return null;
  }
}


/* ================= INDIVIDUAL REPORT COMPONENTS ================= */

function SalesReport({ data, loading }: any) {
  if (loading) return <p>Loading...</p>;

  return (
    <ChartCard title="Outlet Wise Comparison">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="outletA" fill="#7C3AED" />
          <Bar dataKey="outletB" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ProductReport({ data, loading }: any) {
  if (loading) return <p>Loading...</p>;

  return (
    <ChartCard title="Top Products Performance">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#7C3AED" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function GSTReport({ data, loading }: any) {
  if (loading) return <p>Loading...</p>;

  return (
    <ChartCard title="GST Collection Trend">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="sales" fill="#7C3AED" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function SimpleLine({ title, data, loading }: any) {
  if (loading) return <p>Loading...</p>;

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#7C3AED" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}


/* ================= CHART CARD ================= */
function ChartCard({ title, children }: any) {
  return (
    <div className="relative rounded-2xl p-6 border overflow-hidden
      bg-white/80 backdrop-blur-xl
      shadow-[0_10px_40px_rgba(124,58,237,0.08)]
      hover:shadow-[0_20px_60px_rgba(124,58,237,0.18)]
      transition-all duration-500">

      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 to-indigo-50/40 opacity-50"></div>

      <div className="relative z-10">
        <h3 className="font-semibold mb-4 text-lg">{title}</h3>
        {children}
      </div>
    </div>
  );
}
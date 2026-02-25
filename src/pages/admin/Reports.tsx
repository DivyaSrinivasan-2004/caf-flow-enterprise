// Reports.tsx

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CalendarCheck2, Clock3, FileDown, FileSpreadsheet, UserCheck, UserX } from "lucide-react";

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
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async (type: string) => {
    setLoading(true);

    const endpointMap: Record<string, string> = {
      "Daily Sales": "sales/daily/",
      "Product Wise Sales": "sales/product/",
      "GST Report": "gst/",
      "Stock Consumption": "stock/consumption/",
      "Staff Attendance": "staff/login-logout/",
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
      const rows = Array.isArray(data)
        ? data
        : Array.isArray((data as { results?: unknown[] }).results)
          ? (data as { results: unknown[] }).results
          : Array.isArray((data as { data?: unknown[] }).data)
            ? (data as { data: unknown[] }).data
            : [];
      setReportData(rows);
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

  const formatDateTime = (value?: unknown) => {
    if (!value) return "-";
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString();
  };

  const getDateTimeMs = (dateValue?: unknown, timeValue?: unknown) => {
    if (!timeValue) return null;
    const rawTime = String(timeValue);
    if (rawTime.includes("T")) {
      const ts = new Date(rawTime).getTime();
      return Number.isNaN(ts) ? null : ts;
    }
    const rawDate = dateValue ? String(dateValue) : "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate) && /^\d{2}:\d{2}/.test(rawTime)) {
      const ts = new Date(`${rawDate}T${rawTime}`).getTime();
      return Number.isNaN(ts) ? null : ts;
    }
    const ts = new Date(rawTime).getTime();
    return Number.isNaN(ts) ? null : ts;
  };

  const groupedAttendanceRows = useMemo(() => {
    if (activeReport !== "Staff Attendance") return [];

    type AttendanceRow = {
      name: string;
      day: string;
      role: string;
      login?: unknown;
      logout?: unknown;
    };

    const grouped: Record<string, AttendanceRow> = {};
    for (const row of reportData) {
      const name = String(row.staff ?? row.name ?? row.staff_name ?? row.user_name ?? row.username ?? row.email ?? "Unknown");
      const day = String(row.date ?? row.login_date ?? row.day ?? "-");
      const role = String(row.role ?? row.designation ?? row.user_role ?? "STAFF");
      const login = row.last_login ?? row.login_time ?? row.check_in ?? row.clock_in ?? row.punch_in;
      const logout = row.last_logout ?? row.logout_time ?? row.check_out ?? row.clock_out ?? row.punch_out;
      const key = `${name.toLowerCase()}|${day}`;

      const existing = grouped[key];
      if (!existing) {
        grouped[key] = { name, day, role, login, logout };
        continue;
      }

      const existingLoginTs = getDateTimeMs(existing.day, existing.login);
      const nextLoginTs = getDateTimeMs(day, login);
      if (nextLoginTs !== null && (existingLoginTs === null || nextLoginTs < existingLoginTs)) {
        existing.login = login;
      }

      const existingLogoutTs = getDateTimeMs(existing.day, existing.logout);
      const nextLogoutTs = getDateTimeMs(day, logout);
      if (nextLogoutTs !== null && (existingLogoutTs === null || nextLogoutTs > existingLogoutTs)) {
        existing.logout = logout;
      }

      if ((!existing.role || existing.role === "STAFF") && role) {
        existing.role = role;
      }
    }

    return Object.values(grouped).sort((a, b) => {
      const aTs = getDateTimeMs(a.day, a.login) ?? 0;
      const bTs = getDateTimeMs(b.day, b.login) ?? 0;
      return bTs - aTs;
    });
  }, [activeReport, reportData]);

  const attendanceStats = (() => {
    if (activeReport !== "Staff Attendance") return null;
    const total = groupedAttendanceRows.length;
    const present = groupedAttendanceRows.filter((row) => Boolean(row.login)).length;
    const late = groupedAttendanceRows.filter((row) => {
      const ms = getDateTimeMs(row.day, row.login);
      if (ms === null) return false;
      const d = new Date(ms);
      return d.getHours() >= 10;
    }).length;
    const activeSessions = groupedAttendanceRows.filter((row) => Boolean(row.login) && !row.logout).length;
    const absent = Math.max(total - present, 0);
    return { total, present, late, absent, activeSessions };
  })();

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-purple-100 via-white to-purple-50 p-4 md:p-6">
      <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-[0_10px_35px_rgba(124,58,237,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Admin Intelligence Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-purple-950">Reports Center</h1>
            <p className="mt-1 text-sm text-purple-700/70">Advanced list view with export-ready analytics.</p>
          </div>

          {activeReport && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportPDF}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-800 transition hover:bg-purple-50"
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={exportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeReport ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-[0_14px_40px_rgba(124,58,237,0.1)]"
          >
            <div className="grid grid-cols-12 border-b border-purple-100 bg-purple-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-purple-700">
              <div className="col-span-7 md:col-span-8">Report</div>
              <div className="col-span-3 md:col-span-2 text-center">Access</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {reportCategories
              .filter((r) => r.roles.includes(userRole))
              .map((r) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 items-center border-b border-purple-100 px-5 py-4 transition hover:bg-purple-50/60"
                >
                  <div className="col-span-7 flex items-center gap-3 md:col-span-8">
                    <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700">
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-950 md:text-base">{r.name}</h3>
                      <p className="text-xs text-purple-700/70 md:text-sm">{r.desc}</p>
                    </div>
                  </div>

                  <div className="col-span-3 text-center md:col-span-2">
                    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                      {r.roles.includes("admin") ? "Admin" : "Manager"}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => {
                        setActiveReport(r.name);
                        loadReport(r.name);
                      }}
                      className="rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-800 md:text-sm"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        ) : (
          <motion.div key="details" className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            <button
              onClick={() => setActiveReport(null)}
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 transition hover:text-purple-900"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-[0_8px_30px_rgba(124,58,237,0.1)]">
              <h2 className="text-2xl font-bold text-purple-950">{activeReport}</h2>
              <p className="mt-1 text-sm text-purple-700/70">Structured report list output with export options.</p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-purple-200 bg-white p-6 text-sm font-medium text-purple-700">
                Loading report data...
              </div>
            ) : (
              <div className="space-y-4">
                {activeReport === "Staff Attendance" && attendanceStats ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-[0_8px_20px_rgba(124,58,237,0.08)]">
                      <p className="flex items-center gap-2 text-xs font-medium text-purple-700">
                        <CalendarCheck2 className="h-4 w-4" />
                        Total Staff Rows
                      </p>
                      <p className="mt-2 text-2xl font-bold text-purple-950">{attendanceStats.total}</p>
                    </div>
                    <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-[0_8px_20px_rgba(124,58,237,0.08)]">
                      <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                        <UserCheck className="h-4 w-4" />
                        Present
                      </p>
                      <p className="mt-2 text-2xl font-bold text-emerald-700">{attendanceStats.present}</p>
                    </div>
                    <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-[0_8px_20px_rgba(124,58,237,0.08)]">
                      <p className="flex items-center gap-2 text-xs font-medium text-amber-700">
                        <Clock3 className="h-4 w-4" />
                        Late (After 10:00)
                      </p>
                      <p className="mt-2 text-2xl font-bold text-amber-700">{attendanceStats.late}</p>
                    </div>
                    <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-[0_8px_20px_rgba(124,58,237,0.08)]">
                      <p className="flex items-center gap-2 text-xs font-medium text-rose-700">
                        <UserX className="h-4 w-4" />
                        Open Sessions
                      </p>
                      <p className="mt-2 text-2xl font-bold text-rose-700">{attendanceStats.activeSessions}</p>
                    </div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-[0_8px_30px_rgba(124,58,237,0.08)]">
                  <div className="border-b border-purple-100 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-800">
                    {activeReport === "Staff Attendance" ? "Staff Attendance List View" : "Report List View"}
                  </div>

                  {reportData.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-purple-700/70">No rows available for this report.</p>
                  ) : activeReport === "Staff Attendance" ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-purple-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">Staff</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">Login Time</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">Logout Time</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedAttendanceRows.map((row, idx) => {
                            const name = row.name;
                            const day = row.day;
                            const role = row.role;
                            const login = row.login;
                            const logout = row.logout;
                            const present = Boolean(login);
                            return (
                              <tr key={idx} className="border-b border-purple-50 hover:bg-purple-50/50">
                                <td className="px-4 py-3 text-sm font-medium text-purple-950">{String(name)}</td>
                                <td className="px-4 py-3 text-sm text-purple-900">{String(day)}</td>
                                <td className="px-4 py-3 text-sm text-purple-900">{String(role)}</td>
                                <td className="px-4 py-3 text-sm text-purple-900">{formatDateTime(login)}</td>
                                <td className="px-4 py-3 text-sm text-purple-900">{formatDateTime(logout)}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      present ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {present ? "Present" : "Absent"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-purple-100">
                            {Object.keys(reportData[0] || {}).map((key) => (
                              <th key={key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-700">
                                {key.replace(/_/g, " ")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.map((row, idx) => (
                            <tr key={idx} className="border-b border-purple-50 hover:bg-purple-50/50">
                              {Object.keys(reportData[0] || {}).map((key) => (
                                <td key={key} className="px-4 py-3 text-sm text-purple-900">
                                  {String(row[key] ?? "-")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

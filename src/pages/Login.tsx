import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Coffee,
  Eye,
  EyeOff,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

const Login = () => {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const loginResponse = await fetch("http://192.168.1.3:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.detail || "Invalid credentials");
      }

      const tokenResponse = await fetch("http://192.168.1.3:8000/api/accounts/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error("Token generation failed");
      }

      const storage = remember ? localStorage : sessionStorage;

      localStorage.setItem("access", tokenData.access);
      localStorage.setItem("refresh", tokenData.refresh);
      localStorage.setItem("user", JSON.stringify(loginData));

      setUser(loginData);

      const role = loginData.role?.toUpperCase().trim();
      if (role === "STAFF") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f2ea]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(120,53,15,0.18),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(15,118,110,0.14),transparent_30%),linear-gradient(145deg,#f6f2ea,#efe7da,#f8f5ef)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#78350f]/20 blur-[90px]" />
      <div className="absolute -right-12 bottom-12 h-80 w-80 rounded-full bg-[#0f766e]/15 blur-[95px]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7c2d12]/20 bg-white/70 px-4 py-2 text-xs font-semibold text-[#7c2d12] backdrop-blur">
              <Coffee className="h-4 w-4" />
              CAFE BILLING ENTERPRISE
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight text-[#1c1917] xl:text-5xl">
              Real-time Cafe Billing Platform for Revenue, Operations, and Growth
            </h1>
            <p className="mt-4 max-w-lg text-sm text-[#57534e]">
              Unified dashboard for live billing, kitchen workflow, shift productivity, and customer conversion tracking.
            </p>
          </div>

          <div className="grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#a8a29e]/30 bg-white/75 p-4 shadow-soft backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-[#78350f]/10 p-2 text-[#78350f]">
                <BadgeDollarSign className="h-4 w-4" />
              </div>
              <p className="text-xs text-[#78716c]">Today Revenue</p>
              <p className="mt-1 text-xl font-semibold text-[#1c1917]">$4,820</p>
              <p className="mt-1 text-xs text-emerald-700">+14.8% vs yesterday</p>
            </div>

            <div className="rounded-2xl border border-[#a8a29e]/30 bg-white/75 p-4 shadow-soft backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-[#0f766e]/10 p-2 text-[#0f766e]">
                <Receipt className="h-4 w-4" />
              </div>
              <p className="text-xs text-[#78716c]">Bills Processed</p>
              <p className="mt-1 text-xl font-semibold text-[#1c1917]">186</p>
              <p className="mt-1 text-xs text-[#57534e]">Across dine-in and takeaway</p>
            </div>

            <div className="rounded-2xl border border-[#a8a29e]/30 bg-white/75 p-4 shadow-soft backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-[#a16207]/10 p-2 text-[#a16207]">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-xs text-[#78716c]">Active Staff</p>
              <p className="mt-1 text-xl font-semibold text-[#1c1917]">12</p>
              <p className="mt-1 text-xs text-[#57534e]">Shift coverage optimized</p>
            </div>

            <div className="rounded-2xl border border-[#a8a29e]/30 bg-white/75 p-4 shadow-soft backdrop-blur">
              <div className="mb-3 inline-flex rounded-lg bg-[#1d4ed8]/10 p-2 text-[#1d4ed8]">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-xs text-[#78716c]">Conversion Rate</p>
              <p className="mt-1 text-xl font-semibold text-[#1c1917]">34%</p>
              <p className="mt-1 text-xs text-emerald-700">Growth campaign active</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-3xl border border-[#d6d3d1] bg-white/85 p-8 shadow-[0_30px_70px_rgba(41,37,36,0.15)] backdrop-blur-xl sm:p-9">
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#78350f] to-[#0f766e] text-white shadow-lg">
                  <Coffee className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1c1917]">CafeFlow</h2>
                  <p className="text-xs text-[#78716c]">Business Billing Suite</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-[#1c1917]">Sign in to your workspace</h3>
            <p className="mt-2 text-sm text-[#78716c]">Access billing, staff operations, and marketing insights.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#44403c]">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-[#d6d3d1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#44403c]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#d6d3d1] bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#0f766e]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#57534e]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d6d3d1] accent-[#0f766e]"
                  />
                  Remember me
                </label>

                <span className="inline-flex items-center gap-1 text-xs text-[#78716c]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Login
                </span>
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#78350f] to-[#0f766e] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

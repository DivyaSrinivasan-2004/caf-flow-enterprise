import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import dashboardBanner from "@/assets/dashboard-banner.jpg";
import dishCappuccino from "@/assets/dish-cappuccino.jpg";
import dishLatte from "@/assets/dish-latte.jpg";
import dishCroissant from "@/assets/dish-croissant.jpg";
import dishChocolateCake from "@/assets/dish-chocolate-cake.jpg";

const revenueData = [
  { name: "Mon", revenue: 4200, orders: 85 },
  { name: "Tue", revenue: 5100, orders: 102 },
  { name: "Wed", revenue: 4800, orders: 96 },
  { name: "Thu", revenue: 6200, orders: 124 },
  { name: "Fri", revenue: 7500, orders: 150 },
  { name: "Sat", revenue: 8900, orders: 178 },
  { name: "Sun", revenue: 6700, orders: 134 },
];

const paymentData = [
  { name: "Cash", value: 35, color: "hsl(252, 75%, 60%)" },
  { name: "Card", value: 40, color: "hsl(252, 65%, 75%)" },
  { name: "UPI", value: 25, color: "hsl(200, 80%, 55%)" },
];

const categoryData = [
  { name: "Coffee", sales: 4500 },
  { name: "Tea", sales: 2800 },
  { name: "Snacks", sales: 3200 },
  { name: "Desserts", sales: 1900 },
  { name: "Juice", sales: 2100 },
];

const stats = [
  { label: "Today's Revenue", value: "₹43,250", change: "+12.5%", icon: DollarSign, trend: "up" },
  { label: "Total Orders", value: "178", change: "+8.2%", icon: ShoppingBag, trend: "up" },
  { label: "Active Staff", value: "12", change: "On Duty", icon: Users, trend: "neutral" },
  { label: "Avg. Order Value", value: "₹243", change: "+3.1%", icon: TrendingUp, trend: "up" },
];

const topDishes = [
  { name: "Cappuccino", sold: 42, image: dishCappuccino },
  { name: "Latte", sold: 38, image: dishLatte },
  { name: "Croissant", sold: 27, image: dishCroissant },
  { name: "Chocolate Cake", sold: 19, image: dishChocolateCake },
];

const recentOrders = [
  { id: "#BF1234", customer: "Walk-in", items: 3, amount: "₹520", type: "Dine-In", status: "Served" },
  { id: "#BF1235", customer: "Rahul K.", items: 2, amount: "₹340", type: "Takeaway", status: "Ready" },
  { id: "#BF1236", customer: "Table 5", items: 5, amount: "₹890", type: "Dine-In", status: "Cooking" },
  { id: "#BF1237", customer: "Priya M.", items: 1, amount: "₹180", type: "Takeaway", status: "Served" },
  { id: "#BF1238", customer: "Table 2", items: 4, amount: "₹720", type: "Dine-In", status: "Pending" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AdminDashboard = () => {
  return (
    <div className="w-full py-8">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-8 h-48"
      >
        <img src={dashboardBanner} alt="Café overview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Good Morning! ☕</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">Here's what's happening at your café today</p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-xs text-primary-foreground/60">Revenue</p>
                <p className="text-lg font-bold text-primary-foreground">₹43,250</p>
              </div>
              <div>
                <p className="text-xs text-primary-foreground/60">Orders</p>
                <p className="text-lg font-bold text-primary-foreground">178</p>
              </div>
              <div>
                <p className="text-xs text-primary-foreground/60">Staff</p>
                <p className="text-lg font-bold text-primary-foreground">12</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item} className="glass-card p-5 hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <span className={`text-xs font-medium mt-1 inline-block ${stat.trend === "up" ? "text-success" : "text-muted-foreground"}`}>
                  {stat.change}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow opacity-80 group-hover:opacity-100 transition-opacity">
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts + Top Dishes Row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Revenue Chart */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">This week's earnings</p>
            </div>
            <div className="flex gap-1 p-1 bg-secondary rounded-full">
              <button className="px-3 py-1 text-xs font-medium gradient-primary text-primary-foreground rounded-full">Weekly</button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground rounded-full hover:text-foreground">Monthly</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252, 20%, 92%)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(250, 10%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(250, 10%, 50%)" }} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "1px solid hsl(252, 20%, 90%)", borderRadius: "12px", boxShadow: "0 4px 24px hsl(252 75% 60% / 0.1)" }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(252, 75%, 60%)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Split Pie */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">Payment Split</h3>
          <p className="text-xs text-muted-foreground mb-4">By payment mode</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                {paymentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {paymentData.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="text-muted-foreground">{p.name}</span>
                <span className="font-semibold text-foreground ml-auto">{p.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Dishes */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">Top Dishes</h3>
          <p className="text-xs text-muted-foreground mb-4">Best sellers today</p>
          <div className="space-y-3">
            {topDishes.map((dish, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={dish.image} alt={dish.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{dish.name}</p>
                  <p className="text-xs text-muted-foreground">{dish.sold} sold</p>
                </div>
                <span className="text-xs font-semibold gradient-primary-text">#{i + 1}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Sales */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">Category Sales</h3>
          <p className="text-xs text-muted-foreground mb-4">Today's breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(252, 20%, 92%)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(250, 10%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(250, 10%, 50%)" }} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`]} />
              <Bar dataKey="sales" fill="hsl(252, 75%, 60%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Orders</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
            </div>
            <button className="text-xs font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-semibold text-foreground">{order.id}</td>
                    <td className="py-3 text-muted-foreground">{order.customer}</td>
                    <td className="py-3 text-muted-foreground">{order.items}</td>
                    <td className="py-3 font-semibold text-foreground">{order.amount}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.type === "Dine-In" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>{order.type}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "Served" ? "bg-success/10 text-success" :
                        order.status === "Ready" ? "bg-info/10 text-info" :
                        order.status === "Cooking" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, BarChart2, Star, RefreshCw } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { supabase, useStore } from "../../store";

function fmt(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const COLORS = ["#e8849a", "#FFB6C1", "#FADADD", "#f7a3b5", "#d4607a", "#fca5a5", "#f9a8d4"];

export default function DashboardPage() {
  const user = useStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Helper to get Philippines date from UTC timestamp
  const getPhilippinesDate = (utcTimestamp: string) => {
    return new Date(utcTimestamp).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).split(",")[0].split("/").reverse().join("-"); // Convert MM/DD/YYYY to YYYY-MM-DD
  };

  // Get current date in Philippines timezone
  const getTodayInPhilippines = () => {
    const now = new Date();
    return now.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).split(",")[0].split("/").reverse().join("-");
  };

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const now = new Date();

      const [
        { data: products },
        { data: allSales },
      ] = await Promise.all([
        supabase.from("products").select("*").eq("user_id", user.id),
        supabase.from("sales").select("*, sale_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      const totalInventoryValue = (products ?? []).reduce(
        (sum: number, p: any) => sum + p.price * p.stock_quantity, 0
      );
      const lowStockList = (products ?? []).filter((p: any) => p.stock_quantity <= 5);

      // Calculate sales using Philippines timezone dates
      const todayPH = getTodayInPhilippines();
      const todaySales = (allSales ?? [])
        .filter((s: any) => getPhilippinesDate(s.created_at) === todayPH)
        .reduce((sum: number, s: any) => sum + s.total_amount, 0);

      const now = new Date();
      const weekAgoPH = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekAgoDateStr = weekAgoPH.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).split(",")[0].split("/").reverse().join("-");

      const weeklySales = (allSales ?? [])
        .filter((s: any) => getPhilippinesDate(s.created_at) >= weekAgoDateStr)
        .reduce((sum: number, s: any) => sum + s.total_amount, 0);

      const monthStartPH = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartDateStr = monthStartPH.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).split(",")[0].split("/").reverse().join("-");

      const monthlySales = (allSales ?? [])
        .filter((s: any) => getPhilippinesDate(s.created_at) >= monthStartDateStr)
        .reduce((sum: number, s: any) => sum + s.total_amount, 0);

      // Best selling products
      const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
      for (const sale of allSales ?? []) {
        for (const item of (sale as any).sale_items ?? []) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { name: item.name, count: 0, revenue: 0 };
          }
          productSales[item.product_id].count += item.quantity;
          productSales[item.product_id].revenue += item.price * item.quantity;
        }
      }
      const bestSelling = Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 5);

      // Daily chart last 7 days - use Philippines timezone dates
      const dailyChart = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).split(",")[0].split("/").reverse().join("-");

        const amount = (allSales ?? [])
          .filter((s: any) => getPhilippinesDate(s.created_at) === dateStr)
          .reduce((sum: number, s: any) => sum + s.total_amount, 0);

        dailyChart.push({ date: dateStr, amount });
      }

      // Category chart
      const catSales: Record<string, number> = {};
      for (const sale of allSales ?? []) {
        for (const item of (sale as any).sale_items ?? []) {
          const cat = item.category ?? "Other";
          catSales[cat] = (catSales[cat] ?? 0) + item.price * item.quantity;
        }
      }
      const categoryChart = Object.entries(catSales).map(([category, amount]) => ({ category, amount }));

      setStats({
        totalProducts: (products ?? []).length,
        totalInventoryValue,
        todaySales,
        weeklySales,
        monthlySales,
        totalTransactions: (allSales ?? []).length,
        lowStockProducts: lowStockList.length,
        lowStockList: lowStockList.slice(0, 5),
        bestSelling,
        dailyChart,
        categoryChart,
        recentTransactions: (allSales ?? []).slice(0, 5).map((s: any) => ({
          ...s,
          items: s.sale_items ?? [],
        })),
      });
    } catch (e) {
      console.log("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  const metricCards = [
    { label: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, color: "from-pink-400 to-pink-500", format: (v: number) => v.toString() },
    { label: "Inventory Value", value: stats?.totalInventoryValue ?? 0, icon: DollarSign, color: "from-rose-400 to-rose-500", format: fmt },
    { label: "Today's Sales", value: stats?.todaySales ?? 0, icon: TrendingUp, color: "from-pink-300 to-pink-400", format: fmt },
    { label: "Weekly Sales", value: stats?.weeklySales ?? 0, icon: BarChart2, color: "from-pink-500 to-rose-500", format: fmt },
    { label: "Monthly Sales", value: stats?.monthlySales ?? 0, icon: ShoppingCart, color: "from-rose-300 to-pink-400", format: fmt },
    { label: "Total Transactions", value: stats?.totalTransactions ?? 0, icon: RefreshCw, color: "from-pink-400 to-rose-400", format: (v: number) => v.toString() },
    { label: "Low Stock Items", value: stats?.lowStockProducts ?? 0, icon: AlertTriangle, color: "from-orange-400 to-red-400", format: (v: number) => v.toString() },
    { label: "Best Products", value: stats?.bestSelling?.length ?? 0, icon: Star, color: "from-yellow-400 to-orange-400", format: (v: number) => v.toString() },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's your business overview.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 rounded-xl text-pink-500 hover:bg-pink-50 transition-all text-sm font-medium">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {metricCards.map(({ label, value, icon: Icon, color, format }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50 hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${color} mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{format(value)}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Sales (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.dailyChart ?? []}>
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8849a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e8849a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
              <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={(l) => `Date: ${l}`} />
              <Area type="monotone" dataKey="amount" stroke="#e8849a" strokeWidth={2} fill="url(#pinkGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
          <h3 className="font-semibold text-gray-800 mb-4">Sales by Category</h3>
          {stats?.categoryChart?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.categoryChart} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={({ category }) => category.split(" ")[0]}>
                  {stats.categoryChart.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>
      </div>

      {/* Best Selling + Low Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Best Selling Products
          </h3>
          {stats?.bestSelling?.length ? (
            <div className="space-y-2">
              {stats.bestSelling.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.count} sold · {fmt(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No sales recorded yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" /> Low Stock Alerts
          </h3>
          {stats?.lowStockList?.length ? (
            <div className="space-y-2">
              {stats.lowStockList.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.stock_quantity === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                    {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">All products well-stocked! 🎉</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        {stats?.recentTransactions?.length ? (
          <div className="space-y-2">
            {stats.recentTransactions.map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{txn.transaction_number}</p>
                  <p className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })} · {txn.payment_method}</p>
                </div>
                <span className="font-bold text-pink-600">{fmt(txn.total_amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No transactions yet. Make your first sale!</p>
        )}
      </div>
    </div>
  );
}

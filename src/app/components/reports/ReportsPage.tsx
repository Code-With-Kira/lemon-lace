import { useEffect, useState } from "react";
import { useStore } from "../../store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FileText, Download, TrendingUp, Package, AlertTriangle } from "lucide-react";

function fmt(n: number) { return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }

type ReportType = "daily" | "weekly" | "monthly" | "inventory" | "low-stock" | "best-selling";

export default function ReportsPage() {
  const { sales, products, loadSales, loadProducts } = useStore();
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => { loadSales(); loadProducts(); }, []);

  const filteredSales = sales.filter((s) => {
    const d = s.created_at.split("T")[0];
    return d >= dateFrom && d <= dateTo;
  });

  // Group sales by day for charts
  const dailyData: { date: string; amount: number; count: number }[] = [];
  const dayMap: Record<string, { amount: number; count: number }> = {};
  for (const s of filteredSales) {
    const d = s.created_at.split("T")[0];
    if (!dayMap[d]) dayMap[d] = { amount: 0, count: 0 };
    dayMap[d].amount += s.total_amount;
    dayMap[d].count++;
  }
  for (const [date, v] of Object.entries(dayMap).sort()) {
    dailyData.push({ date: date.slice(5), ...v });
  }

  // Product sales
  const productSales: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  for (const s of filteredSales) {
    for (const item of s.items ?? []) {
      if (!productSales[item.product_id]) productSales[item.product_id] = { name: item.name, category: item.category, qty: 0, revenue: 0 };
      productSales[item.product_id].qty += item.quantity;
      productSales[item.product_id].revenue += item.price * item.quantity;
    }
  }
  const productList = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = filteredSales.reduce((s, t) => s + t.total_amount, 0);
  const totalTransactions = filteredSales.length;
  const avgTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;

  const lowStock = products.filter((p) => p.stock_quantity <= 5);
  const totalInventoryValue = products.reduce((s, p) => s + p.price * p.stock_quantity, 0);

  const handleExport = () => {
    const rows = reportType === "inventory"
      ? [["Name", "Category", "Price", "Stock", "Value", "Status"],
         ...products.map(p => [p.name, p.category, p.price, p.stock_quantity, p.price * p.stock_quantity, p.status])]
      : reportType === "low-stock"
      ? [["Name", "Category", "Price", "Stock"],
         ...lowStock.map(p => [p.name, p.category, p.price, p.stock_quantity])]
      : reportType === "best-selling"
      ? [["Product", "Category", "Qty Sold", "Revenue"],
         ...productList.map(p => [p.name, p.category, p.qty, p.revenue])]
      : [["Transaction #", "Date", "Payment", "Total"],
         ...filteredSales.map(s => [s.transaction_number, s.created_at.split("T")[0], s.payment_method, s.total_amount])];

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${reportType}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const reportTypes: { key: ReportType; label: string; icon: any }[] = [
    { key: "daily", label: "Sales Report", icon: TrendingUp },
    { key: "best-selling", label: "Best Selling", icon: FileText },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "low-stock", label: "Low Stock", icon: AlertTriangle },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm">Business analytics & reports</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-pink-200 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 transition-all min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {reportTypes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setReportType(key)}
            className={`flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              reportType === key ? "bg-pink-500 text-white" : "bg-white border border-pink-200 text-gray-600 hover:bg-pink-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Date Range (for sales reports) */}
      {(reportType === "daily" || reportType === "best-selling") && (
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-pink-50">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[44px]" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2.5 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[44px]" />
          </div>
        </div>
      )}

      {/* Sales Report */}
      {reportType === "daily" && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Revenue", value: fmt(totalRevenue), color: "text-pink-600" },
              { label: "Transactions", value: totalTransactions.toString(), color: "text-gray-800" },
              { label: "Avg. Sale", value: fmt(avgTransaction), color: "text-gray-800" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-pink-50 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
            <h3 className="font-semibold text-gray-800 mb-4">Daily Sales Chart</h3>
            {dailyData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Bar dataKey="amount" fill="#e8849a" radius={[6, 6, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No sales in selected period</div>
            )}
          </div>

          {/* Transactions table */}
          <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-pink-50">
              <h3 className="font-semibold text-gray-800">Transactions ({filteredSales.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pink-50">
                  <tr>
                    {["Transaction #", "Date", "Items", "Payment", "Total"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(s => (
                    <tr key={s.id} className="border-b border-pink-50 hover:bg-pink-50/30">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{s.transaction_number}</td>
                      <td className="px-4 py-2.5 text-gray-600">{s.created_at.split("T")[0]}</td>
                      <td className="px-4 py-2.5 text-gray-600">{s.items?.length ?? 0}</td>
                      <td className="px-4 py-2.5 text-gray-600">{s.payment_method}</td>
                      <td className="px-4 py-2.5 font-semibold text-pink-600">{fmt(s.total_amount)}</td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Best Selling */}
      {reportType === "best-selling" && (
        <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-pink-50">
            <h3 className="font-semibold text-gray-800">Best Selling Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50">
                <tr>
                  {["#", "Product", "Category", "Qty Sold", "Revenue"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productList.map((p, i) => (
                  <tr key={i} className="border-b border-pink-50 hover:bg-pink-50/30">
                    <td className="px-4 py-2.5 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-lg text-xs">{p.category}</span></td>
                    <td className="px-4 py-2.5 text-gray-600">{p.qty}</td>
                    <td className="px-4 py-2.5 font-semibold text-pink-600">{fmt(p.revenue)}</td>
                  </tr>
                ))}
                {productList.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No sales data in period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === "inventory" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Products", value: products.length.toString() },
              { label: "Active", value: products.filter(p => p.status === "active").length.toString() },
              { label: "Total Value", value: fmt(totalInventoryValue) },
              { label: "Low Stock", value: lowStock.length.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-pink-50 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pink-50">
                  <tr>
                    {["Product", "Category", "Price", "Stock", "Value", "Status"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-pink-50 hover:bg-pink-50/30">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-lg text-xs">{p.category}</span></td>
                      <td className="px-4 py-2.5">{fmt(p.price)}</td>
                      <td className={`px-4 py-2.5 font-semibold ${p.stock_quantity <= 5 ? "text-red-500" : "text-green-600"}`}>{p.stock_quantity}</td>
                      <td className="px-4 py-2.5 text-pink-600 font-semibold">{fmt(p.price * p.stock_quantity)}</td>
                      <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock */}
      {reportType === "low-stock" && (
        <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-pink-50 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h3 className="font-semibold text-gray-800">Low Stock Products ({lowStock.length})</h3>
          </div>
          {lowStock.length === 0 ? (
            <div className="py-12 text-center text-gray-400">All products are well-stocked! 🎉</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pink-50">
                  <tr>
                    {["Product", "Category", "Price", "Stock"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id} className="border-b border-pink-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-lg text-xs">{p.category}</span></td>
                      <td className="px-4 py-2.5">{fmt(p.price)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.stock_quantity === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                          {p.stock_quantity === 0 ? "Out of Stock" : `${p.stock_quantity} left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

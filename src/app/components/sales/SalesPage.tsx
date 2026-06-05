import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, ShoppingCart, Search, Receipt } from "lucide-react";
import { useStore, Sale } from "../../store";
import ReceiptModal from "./ReceiptModal";

function fmt(n: number) { return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }

const paymentColor: Record<string, string> = {
  Cash: "bg-green-100 text-green-700",
  GCash: "bg-blue-100 text-blue-700",
  Maya: "bg-purple-100 text-purple-700",
};

export default function SalesPage() {
  const { sales, loadSales, loading } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  useEffect(() => { loadSales(); }, []);

  const filtered = sales.filter((s) =>
    s.transaction_number.toLowerCase().includes(search.toLowerCase()) ||
    s.payment_method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-500 text-sm">{sales.length} transactions</p>
        </div>
        <button
          onClick={() => navigate("/sales/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-xl shadow-md hover:from-pink-500 hover:to-pink-600 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[44px]"
        />
      </div>

      {/* Loading */}
      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 text-pink-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm">Start your first sale!</p>
          <button onClick={() => navigate("/sales/new")} className="mt-4 px-6 py-2.5 bg-pink-500 text-white rounded-xl font-semibold">
            New Sale
          </button>
        </div>
      )}

      {/* Transactions */}
      {!loading && filtered.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-pink-50 border-b border-pink-100">
                <tr>
                  {["Transaction #", "Date & Time", "Items", "Payment", "Total", "Receipt"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-pink-50 hover:bg-pink-50/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{s.transaction_number}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{s.items?.length ?? 0} item(s)</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${paymentColor[s.payment_method] ?? "bg-gray-100 text-gray-600"}`}>
                        {s.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-pink-600">{fmt(s.total_amount)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewSale(s)} className="p-2 rounded-lg hover:bg-pink-100 text-pink-500 transition-colors">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{s.transaction_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setViewSale(s)} className="p-2 rounded-xl hover:bg-pink-100 text-pink-500 min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-50">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${paymentColor[s.payment_method] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.payment_method}
                    </span>
                    <span className="text-xs text-gray-500">{s.items?.length ?? 0} items</span>
                  </div>
                  <span className="font-bold text-pink-600">{fmt(s.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {viewSale && <ReceiptModal sale={viewSale} onClose={() => setViewSale(null)} />}
    </div>
  );
}

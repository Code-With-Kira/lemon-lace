import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Package, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { useStore, Product, CATEGORIES } from "../../store";
import ProductForm from "./ProductForm";

function fmt(n: number) { return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }

type SortKey = "name" | "category" | "price" | "stock_quantity" | "created_at";

export default function InventoryPage() {
  const { products, loadProducts, deleteProduct, loading } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, []);

  const filtered = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      if (typeof av === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-xl shadow-md hover:from-pink-500 hover:to-pink-600 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[44px]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-3 bg-white border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[44px] appearance-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Category chips - mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              categoryFilter === cat ? "bg-pink-500 text-white" : "bg-white border border-pink-200 text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-pink-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm">Add your first product to get started</p>
          <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="mt-4 px-6 py-2.5 bg-pink-500 text-white rounded-xl font-semibold">
            Add Product
          </button>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pink-50 border-b border-pink-100">
                  <tr>
                    {[
                      { label: "Product", key: "name" as SortKey },
                      { label: "Category", key: "category" as SortKey },
                      { label: "Price", key: "price" as SortKey },
                      { label: "Stock", key: "stock_quantity" as SortKey },
                      { label: "Status", key: null },
                      { label: "Actions", key: null },
                    ].map(({ label, key }) => (
                      <th key={label}
                        className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide ${key ? "cursor-pointer select-none hover:text-pink-600" : ""}`}
                        onClick={() => key && handleSort(key)}
                      >
                        <div className="flex items-center gap-1">{label}{key && <SortIcon k={key} />}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-pink-50 hover:bg-pink-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-medium">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{fmt(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${p.stock_quantity <= 5 ? "text-red-500" : p.stock_quantity <= 20 ? "text-orange-500" : "text-green-600"}`}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="p-2 rounded-lg hover:bg-pink-100 text-pink-500 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                    <span className="inline-block px-2 py-0.5 bg-pink-100 text-pink-700 rounded-lg text-xs font-medium mt-1">{p.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="p-2 rounded-xl hover:bg-pink-100 text-pink-500 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-xl hover:bg-red-100 text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-50">
                  <span className="font-bold text-pink-600">{fmt(p.price)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${p.stock_quantity <= 5 ? "text-red-500" : "text-green-600"}`}>
                      {p.stock_quantity} in stock
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); loadProducts(); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

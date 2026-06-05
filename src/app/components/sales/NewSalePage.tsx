import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { useStore, Product, CATEGORIES } from "../../store";
import ReceiptModal from "./ReceiptModal";

function fmt(n: number) { return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }

interface CartItem { product: Product; quantity: number; }

export default function NewSalePage() {
  const navigate = useNavigate();
  const { products, loadProducts, createSale } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "GCash" | "Maya">("Cash");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, []);

  const activeProducts = products.filter((p) => p.status === "active");
  const filtered = activeProducts
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      if (product.stock_quantity === 0) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === id ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.product.stock_quantity)) } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const sale = await createSale({
        items: cart.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          category: i.product.category,
          price: i.product.price,
          quantity: i.quantity,
        })),
        total_amount: total,
        payment_method: paymentMethod,
        discount,
      });
      setCompletedSale(sale);
      setCart([]);
    } catch (e: any) {
      setError(e.message ?? "Failed to complete sale");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedSale) {
    return <ReceiptModal sale={completedSale} onClose={() => navigate("/sales")} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] md:h-screen overflow-hidden">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col overflow-hidden bg-pink-50">
        {/* Topbar */}
        <div className="bg-white border-b border-pink-100 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/sales")} className="p-2 rounded-xl hover:bg-pink-50 text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">New Sale</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
          </div>
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
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
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No products found</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((p) => {
                const inCart = cart.find((i) => i.product.id === p.id);
                const outOfStock = p.stock_quantity === 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => !outOfStock && addToCart(p)}
                    disabled={outOfStock}
                    className={`relative bg-white rounded-2xl p-3 text-left shadow-sm border transition-all min-h-[100px] ${
                      outOfStock ? "opacity-50 cursor-not-allowed border-gray-100" :
                      inCart ? "border-pink-400 ring-2 ring-pink-100" : "border-pink-50 hover:border-pink-300 hover:shadow-md"
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {inCart.quantity}
                      </span>
                    )}
                    <p className="font-semibold text-gray-800 text-sm leading-tight mb-1 pr-6">{p.name}</p>
                    <span className="inline-block px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded text-xs mb-2">{p.category}</span>
                    <p className="font-bold text-pink-600">{fmt(p.price)}</p>
                    <p className={`text-xs ${outOfStock ? "text-red-500" : "text-gray-400"}`}>
                      {outOfStock ? "Out of stock" : `${p.stock_quantity} available`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart / Order Summary */}
      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-pink-100 flex flex-col max-h-[50vh] md:max-h-none">
        <div className="p-4 border-b border-pink-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-pink-500" />
            Cart ({cart.length} items)
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-pink-200" />
              Add products to cart
            </div>
          )}
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center gap-2 p-2 rounded-xl bg-pink-50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500">{fmt(item.product.price)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-pink-200 flex items-center justify-center hover:bg-pink-100">
                  <Minus className="w-3 h-3 text-pink-500" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-pink-200 flex items-center justify-center hover:bg-pink-100">
                  <Plus className="w-3 h-3 text-pink-500" />
                </button>
                <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center ml-1">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
              <div className="text-right w-20 flex-shrink-0">
                <p className="text-sm font-bold text-pink-600">{fmt(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 border-t border-pink-100 space-y-3">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Discount (₱)</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Cash", "GCash", "Maya"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                    paymentMethod === m ? "bg-pink-500 text-white" : "bg-pink-50 border border-pink-200 text-gray-700 hover:bg-pink-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span>Discount</span>
              <span>- {fmt(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-t border-pink-100">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-pink-600">{fmt(total)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-xl hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px] text-lg shadow-md transition-all"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}

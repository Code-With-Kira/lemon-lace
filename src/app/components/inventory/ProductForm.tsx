import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import { useStore, Product, CATEGORIES } from "../../store";
import { useState } from "react";

interface Props {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

type FormData = {
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  status: "active" | "inactive";
};

export default function ProductForm({ product, onClose, onSave }: Props) {
  const { addProduct, updateProduct } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: product
      ? { name: product.name, category: product.category, price: product.price, stock_quantity: product.stock_quantity, status: product.status }
      : { status: "active", category: CATEGORIES[0] },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      if (product) {
        await updateProduct(product.id, { ...data, price: Number(data.price), stock_quantity: Number(data.stock_quantity) });
      } else {
        await addProduct({ ...data, price: Number(data.price), stock_quantity: Number(data.stock_quantity) } as any);
      }
      onSave();
    } catch (e: any) {
      setError(e.message ?? "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-pink-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-pink-50 text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
            <input
              {...register("name", { required: "Product name is required" })}
              className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
              placeholder="e.g. Fresh Lemonade Classic"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
            <select
              {...register("category", { required: true })}
              className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[48px]"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₱) *</label>
              <input
                {...register("price", { required: "Price is required", min: { value: 0, message: "Must be ≥ 0" } })}
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Qty *</label>
              <input
                {...register("stock_quantity", { required: "Stock is required", min: { value: 0, message: "Must be ≥ 0" } })}
                type="number"
                className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
                placeholder="0"
              />
              {errors.stock_quantity && <p className="text-red-500 text-xs mt-1">{errors.stock_quantity.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select
              {...register("status")}
              className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[48px]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sticky footer */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 min-h-[48px]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-xl hover:from-pink-500 hover:to-pink-600 disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

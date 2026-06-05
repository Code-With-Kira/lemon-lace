import { create } from "zustand";
import { createClient, Session, User } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", SUPABASE_URL); // check browser console

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  transaction_number: string;
  items: SaleItem[];
  total_amount: number;
  payment_method: "Cash" | "GCash" | "Maya";
  discount?: number;
  created_at: string;
}

export const CATEGORIES = [
  "Add-Ons",
  "Buy 1 Take 1",
  "Choco Series",
  "Fresh Lemonade",
  "Fruit Soda",
  "Fruity Milk",
  "Ice Coffee",
  "Juice Drinks",
  "Milktea Series",
  "Siomai",
  "Siopao",
  "Snacks",
  "Solo",
  "Street Foods",
];

interface AppState {
  session: Session | null;
  user: User | null;
  products: Product[];
  sales: Sale[];
  loading: boolean;
  syncStatus: "online" | "offline" | "syncing" | "synced" | "error";
  setSession: (session: Session | null) => void;
  loadProducts: () => Promise<void>;
  addProduct: (p: Omit<Product, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loadSales: () => Promise<void>;
  createSale: (s: Omit<Sale, "id" | "transaction_number" | "created_at">) => Promise<Sale>;
}

export const useStore = create<AppState>((set, get) => ({
  session: null,
  user: null,
  products: [],
  sales: [],
  loading: false,
  syncStatus: "online",

  setSession: (session) => set({ session, user: session?.user ?? null }),

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────

  loadProducts: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true });
      if (error) throw error;
      set({ products: data ?? [] });
    } catch (e) {
      console.log("Load products error:", e);
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("products")
      .insert({ ...product, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    set((s) => ({ products: [...s.products, data].sort((a, b) => a.name.localeCompare(b.name)) }));
  },

  updateProduct: async (id, product) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    set((s) => ({ products: s.products.map((p) => (p.id === id ? data : p)) }));
  },

  deleteProduct: async (id) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  // ─── SALES ─────────────────────────────────────────────────────────────────

  loadSales: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*, sale_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const sales = (data ?? []).map((s: any) => ({ ...s, items: s.sale_items ?? [] }));
      set({ sales });
    } catch (e) {
      console.log("Load sales error:", e);
    } finally {
      set({ loading: false });
    }
  },

  createSale: async (sale) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Not authenticated");

    // Generate transaction number
    const { count } = await supabase
      .from("sales")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    const txnNum = `TXN-${String((count ?? 0) + 1).padStart(5, "0")}`;

    // Insert sale
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert({
        user_id: userId,
        transaction_number: txnNum,
        total_amount: sale.total_amount,
        discount: sale.discount ?? 0,
        payment_method: sale.payment_method,
      })
      .select()
      .single();
    if (saleError) throw new Error(saleError.message);

    // Insert sale items
    const items = sale.items.map((item) => ({
      sale_id: newSale.id,
      product_id: item.product_id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
    }));
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("sale_items").insert(items);
      if (itemsError) throw new Error(itemsError.message);
    }

    // Deduct stock for each item
    for (const item of sale.items) {
      const { data: prod } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();
      if (prod) {
        await supabase
          .from("products")
          .update({ stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) })
          .eq("id", item.product_id)
          .eq("user_id", userId);
      }
    }

    const completedSale = { ...newSale, items };
    set((s) => ({ sales: [completedSale, ...s.sales] }));
    get().loadProducts(); // refresh stock counts
    return completedSale;
  },
}));

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();
app.use("*", cors());
app.use("*", logger(console.log));

const getSupabaseAdmin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

async function requireAuth(c: any): Promise<string | null> {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return null;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post("/make-server-e55a1522/auth/signup", async (c) => {
  try {
    const { email, password, full_name } = await c.req.json();
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true,
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ user: data.user });
  } catch (e) {
    console.log("Signup error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

app.get("/make-server-e55a1522/products", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ products: data });
  } catch (e) {
    console.log("Get products error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

app.post("/make-server-e55a1522/products", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const body = await c.req.json();
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("products")
      .insert({
        user_id: userId,
        name: body.name,
        category: body.category,
        price: body.price,
        stock_quantity: body.stock_quantity,
        image_url: body.image_url ?? null,
        status: body.status ?? "active",
      })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ product: data });
  } catch (e) {
    console.log("Create product error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

app.put("/make-server-e55a1522/products/:id", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    const body = await c.req.json();
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("products")
      .update({
        name: body.name,
        category: body.category,
        price: body.price,
        stock_quantity: body.stock_quantity,
        image_url: body.image_url ?? null,
        status: body.status,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ product: data });
  } catch (e) {
    console.log("Update product error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

app.delete("/make-server-e55a1522/products/:id", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const id = c.req.param("id");
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (e) {
    console.log("Delete product error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// ─── SALES ───────────────────────────────────────────────────────────────────

app.get("/make-server-e55a1522/sales", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("sales")
      .select("*, sale_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 400);
    const sales = (data ?? []).map((s: any) => ({ ...s, items: s.sale_items ?? [] }));
    return c.json({ sales });
  } catch (e) {
    console.log("Get sales error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

app.post("/make-server-e55a1522/sales", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const body = await c.req.json();
    const sb = getSupabaseAdmin();

    // Generate transaction number
    const { count } = await sb
      .from("sales")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    const txnNum = `TXN-${String((count ?? 0) + 1).padStart(5, "0")}`;

    // Create sale record
    const { data: sale, error: saleError } = await sb
      .from("sales")
      .insert({
        user_id: userId,
        transaction_number: txnNum,
        total_amount: body.total_amount,
        discount: body.discount ?? 0,
        payment_method: body.payment_method,
      })
      .select()
      .single();
    if (saleError) return c.json({ error: saleError.message }, 400);

    // Insert sale items
    const items = (body.items ?? []).map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
    }));
    if (items.length > 0) {
      const { error: itemsError } = await sb.from("sale_items").insert(items);
      if (itemsError) return c.json({ error: itemsError.message }, 400);
    }

    // Deduct stock for each item
    for (const item of body.items ?? []) {
      await sb
        .from("products")
        .update({
          stock_quantity: sb.rpc("greatest", { a: 0, b: 0 }), // fallback handled below
        })
        .eq("id", item.product_id)
        .eq("user_id", userId);

      // Fetch current stock then subtract
      const { data: prod } = await sb
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();
      if (prod) {
        await sb
          .from("products")
          .update({ stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) })
          .eq("id", item.product_id)
          .eq("user_id", userId);
      }
    }

    return c.json({ sale: { ...sale, items } });
  } catch (e) {
    console.log("Create sale error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

app.get("/make-server-e55a1522/dashboard", async (c) => {
  try {
    const userId = await requireAuth(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const sb = getSupabaseAdmin();

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { data: products },
      { data: allSales },
      { data: todaySalesData },
      { data: weeklySalesData },
      { data: monthlySalesData },
    ] = await Promise.all([
      sb.from("products").select("*").eq("user_id", userId),
      sb.from("sales").select("*, sale_items(*)").eq("user_id", userId).order("created_at", { ascending: false }),
      sb.from("sales").select("total_amount").eq("user_id", userId).gte("created_at", `${todayStr}T00:00:00`),
      sb.from("sales").select("total_amount").eq("user_id", userId).gte("created_at", weekAgo),
      sb.from("sales").select("total_amount").eq("user_id", userId).gte("created_at", monthStart),
    ]);

    const totalInventoryValue = (products ?? []).reduce(
      (sum: number, p: any) => sum + p.price * p.stock_quantity, 0
    );
    const lowStockList = (products ?? []).filter((p: any) => p.stock_quantity <= 5);
    const todaySales = (todaySalesData ?? []).reduce((s: number, t: any) => s + t.total_amount, 0);
    const weeklySales = (weeklySalesData ?? []).reduce((s: number, t: any) => s + t.total_amount, 0);
    const monthlySales = (monthlySalesData ?? []).reduce((s: number, t: any) => s + t.total_amount, 0);

    // Best selling
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

    // Daily chart last 7 days
    const dailyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const ds = d.toISOString().split("T")[0];
      const amount = (allSales ?? [])
        .filter((s: any) => s.created_at.startsWith(ds))
        .reduce((sum: number, s: any) => sum + s.total_amount, 0);
      dailyChart.push({ date: ds, amount });
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

    return c.json({
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
    console.log("Dashboard error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

Deno.serve(app.fetch);

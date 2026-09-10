import { supabaseServer, isSupabaseConfigured } from "./supabase";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import type { Category, Product } from "./types";

function mapRow(row: Record<string, unknown>, cats: Category[]): Product {
  const cat = cats.find((c) => c.id === row.category_id) ?? null;
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    sale_price: row.sale_price != null ? Number(row.sale_price) : null,
    category_id: row.category_id ? String(row.category_id) : null,
    category: cat,
    stock: Number(row.stock ?? 0),
    colors: Array.isArray(row.colors) ? (row.colors as string[]) : [],
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    featured: Boolean(row.featured),
    active: Boolean(row.active ?? true),
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return DEMO_CATEGORIES;
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from("categories").select("*").order("name");
    if (error || !data) return DEMO_CATEGORIES;
    return data.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      description: (r.description as string) ?? null,
      image_url: (r.image_url as string) ?? null,
    }));
  } catch {
    return DEMO_CATEGORIES;
  }
}

export async function getProducts(opts: { onlyActive?: boolean } = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return opts.onlyActive ? DEMO_PRODUCTS.filter((x) => x.active) : DEMO_PRODUCTS;
  }
  try {
    const sb = supabaseServer();
    let q = sb.from("products").select("*").order("created_at", { ascending: false });
    if (opts.onlyActive) q = q.eq("active", true);
    const { data, error } = await q;
    if (error || !data) return DEMO_PRODUCTS;
    const cats = await getCategories();
    return (data as Record<string, unknown>[]).map((r) => mapRow(r, cats));
  } catch {
    return DEMO_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((x) => x.slug === slug) ?? null;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

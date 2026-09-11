"use client";

import { supabaseBrowser } from "@/lib/supabase";
import type { Category, Product } from "@/lib/types";

/**
 * Lectura pública en vivo (navegador → Supabase con clave anon + RLS).
 * El catálogo se pinta primero con los datos del build y luego se
 * refresca solo: cambios del admin aparecen al instante, sin rebuild.
 * Si Supabase no responde, se conservan los datos iniciales.
 */
export async function fetchLiveProducts(): Promise<Product[] | null> {
  try {
    const sb = supabaseBrowser();
    const { data: prods, error } = await sb
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error || !prods) return null;
    const cats = await fetchLiveCategories();
    const map = new Map((cats ?? []).map((c) => [c.id, c]));
    return (prods as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      description: String(row.description ?? ""),
      price: Number(row.price ?? 0),
      sale_price: row.sale_price != null ? Number(row.sale_price) : null,
      category_id: row.category_id ? String(row.category_id) : null,
      category: row.category_id ? (map.get(String(row.category_id)) ?? null) : null,
      stock: Number(row.stock ?? 0),
      colors: Array.isArray(row.colors) ? (row.colors as string[]) : [],
      images: Array.isArray(row.images) ? (row.images as string[]) : [],
      featured: Boolean(row.featured),
      active: Boolean(row.active ?? true),
    }));
  } catch {
    return null;
  }
}

export async function fetchLiveCategories(): Promise<Category[] | null> {
  try {
    const sb = supabaseBrowser();
    const { data, error } = await sb.from("categories").select("*").order("name");
    if (error || !data) return null;
    return (data as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      description: (r.description as string) ?? null,
      image_url: (r.image_url as string) ?? null,
    }));
  } catch {
    return null;
  }
}

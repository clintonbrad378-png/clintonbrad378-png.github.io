"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/Product";

export function CatalogClient({
  products,
  categories,
  initialCat,
  initialOnlyOffer = false,
}: {
  products: Product[];
  categories: Category[];
  initialCat: string;
  initialOnlyOffer?: boolean;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialCat);
  const [sort, setSort] = useState<"dest" | "asc" | "desc">("dest");
  const [onlyOffer, setOnlyOffer] = useState(initialOnlyOffer);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat !== "todos") {
      const c = categories.find((x) => x.slug === cat);
      list = list.filter((p) => p.category_id === c?.id || p.category?.slug === cat);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) => (p.name + " " + p.description).toLowerCase().includes(s));
    }
    if (onlyOffer) list = list.filter((p) => p.sale_price != null && p.sale_price < p.price);
    if (sort === "asc") list.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    if (sort === "desc") list.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    if (sort === "dest") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, categories, q, cat, sort, onlyOffer]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-gold-500/25 bg-noir-900 p-4 md:flex-row md:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: box, cúpula, rojas..."
          className="w-full rounded-full border border-white/10 bg-noir-950 px-5 py-2.5 text-sm outline-none placeholder:text-cream-100/30 focus:border-gold-500/60"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-full border border-white/10 bg-noir-950 px-4 py-2.5 text-sm"
        >
          <option value="dest">Destacados</option>
          <option value="asc">Menor precio</option>
          <option value="desc">Mayor precio</option>
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-cream-100/70">
          <input type="checkbox" checked={onlyOffer} onChange={(e) => setOnlyOffer(e.target.checked)} className="accent-[#C9A86A]" />
          Solo ofertas
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCat("todos")}
          className={`rounded-full px-4 py-1.5 text-sm border ${cat === "todos" ? "bg-gold-500 text-noir-950 border-gold-500 font-semibold" : "border-gold-500/30 text-gold-300"}`}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.slug)}
            className={`rounded-full px-4 py-1.5 text-sm border ${cat === c.slug ? "bg-gold-500 text-noir-950 border-gold-500 font-semibold" : "border-gold-500/30 text-gold-300"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-cream-100/50">{filtered.length} piezas</p>
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gold-500/40 p-10 text-center text-cream-100/60">
          Sin resultados. Prueba con otra búsqueda o categoría.
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}

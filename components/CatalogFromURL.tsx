"use client";

import { useSearchParams } from "next/navigation";
import { CatalogClient } from "@/components/CatalogClient";
import type { Category, Product } from "@/lib/types";

/**
 * Lee ?cat y ?ofertas de la URL en el navegador (estático-compatible)
 * y reinicia el catálogo con esos filtros.
 */
export function CatalogFromURL({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const sp = useSearchParams();
  const cat = sp.get("cat") ?? "todos";
  const ofertas = sp.get("ofertas") === "1";
  return (
    <CatalogClient
      key={`${cat}-${ofertas ? "1" : "0"}`}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialCat={cat}
      initialOnlyOffer={ofertas}
    />
  );
}

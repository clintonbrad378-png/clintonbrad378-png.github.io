import type { Category, Product } from "./types";

export const DEMO_CATEGORIES: Category[] = [
  { id: "ramo", name: "Ramos", slug: "ramo", description: "Ramos artesanales de rosas y girasoles" },
  { id: "girasoles", name: "Girasoles", slug: "girasoles", description: "Arreglos con girasoles" },
  { id: "detalles", name: "Detalles y Regalos", slug: "detalles", description: "Detalles individuales y con dulces" },
];

function p(
  id: string,
  slug: string,
  name: string,
  price: number,
  category_id: string,
  description: string,
  opts: Partial<Product> = {}
): Product {
  return {
    id,
    slug,
    name,
    price,
    description,
    category_id,
    category: DEMO_CATEGORIES.find((c) => c.id === category_id) ?? null,
    stock: 10,
    colors: ["Amarillo", "Blanco", "Azul", "Morado"],
    images: [],
    featured: false,
    active: true,
    ...opts,
  };
}

// Ofertas con fotos reales — public/ofertas/
export const DEMO_PRODUCTS: Product[] = [
  p("1", "ramo-girasol-corona", "Ramo Girasol Real con Corona", 899, "ramo",
    "Ramo artesanal con girasol central rodeado de rosas amarillas y blancas, corona dorada y mariposas. Envoltura premium blanco y dorado.",
    { sale_price: 749, featured: true, colors: ["Amarillo + Blanco"], stock: 6, images: ["/ofertas/ramo-girasol-corona.jpg"] }),
  p("2", "ramo-azul-corona", "Ramo Azul Real con Corona", 799, "ramo",
    "Ramo de rosas azules con rosa blanca central y coronita dorada, en envoltura blanca con moño azul. Ideal para sorprender.",
    { sale_price: 649, featured: true, colors: ["Azul + Blanco"], stock: 5, images: ["/ofertas/ramo-azul-corona.jpg"] }),
  p("3", "ramo-girasol-dorado", "Ramo Girasol Dorado", 849, "girasoles",
    "Girasol artesanal rodeado de rosas amarillas en envoltura café con moños crema. Un detalle radiante que dura.",
    { sale_price: 699, featured: true, colors: ["Amarillo"], stock: 6, images: ["/ofertas/ramo-girasol-dorado.jpg"] }),
  p("4", "mini-ramo-girasoles", "Mini Ramo de Girasoles", 499, "girasoles",
    "Mini ramo de girasoles artesanales en papel decorado. Perfecto para un detalle espontáneo.",
    { sale_price: 399, featured: true, colors: ["Amarillo"], stock: 8, images: ["/ofertas/mini-ramo-girasoles.jpg"] }),
  p("5", "detalle-morado-chocolates", "Detalle Morado con Chocolates", 349, "detalles",
    "Rosa morada artesanal acompañada de chocolates en cajita decorada con moño lila. Dulce y elegante.",
    { sale_price: 279, featured: true, colors: ["Morado"], stock: 10, images: ["/ofertas/detalle-morado-chocolates.jpg"] }),
  p("6", "rosa-individual-amarilla", "Rosa Individual Amarilla", 199, "detalles",
    "Rosa amarilla individual en presentación de regalo con mariposa dorada. El detalle perfecto para cualquier día.",
    { sale_price: 149, featured: false, colors: ["Amarillo"], stock: 12, images: ["/ofertas/rosa-individual-amarilla.jpg"] }),
];

export function formatCUP(n: number) {
  return new Intl.NumberFormat("es-CU", {
    style: "currency",
    currency: "CUP",
    maximumFractionDigits: 0,
  }).format(n);
}

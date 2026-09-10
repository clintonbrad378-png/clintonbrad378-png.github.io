import { formatMXN } from "@/lib/demo-data";
import type { Product } from "@/lib/types";
import { whatsappLinkForProduct } from "@/lib/whatsapp";
import Link from "next/link";

export function RosePlaceholder({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className={`rose-placeholder flex items-center justify-center ${size === "lg" ? "aspect-[4/3]" : "aspect-square"}`}>
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/50 bg-noir-950/60">
          <span className="font-display text-4xl gold-text-gradient">{initial}</span>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-bordeaux-700" />
          <span className="h-2 w-2 rounded-full bg-gold-500" />
          <span className="h-2 w-2 rounded-full bg-cream-200" />
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-gold-500/70">Foto pronto</p>
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const price = product.sale_price ?? product.price;
  const hasOffer = product.sale_price != null && product.sale_price < product.price;
  const img = product.images?.[0];

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="card-hover gold-border-gradient overflow-hidden rounded-2xl"
    >
      <div className="relative">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} className="aspect-square w-full object-cover" />
        ) : (
          <RosePlaceholder name={product.name} />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {product.featured && (
            <span className="rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-noir-950">
              Destacado
            </span>
          )}
          {hasOffer && (
            <span className="rounded-full bg-bordeaux-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Oferta
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-500">
          {product.category?.name ?? "Colección"}
        </p>
        <h3 className="font-display mt-1 text-xl leading-tight text-cream-100">{product.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gold-300">{formatMXN(price)}</span>
          {hasOffer && (
            <span className="text-sm text-cream-100/40 line-through">{formatMXN(product.price)}</span>
          )}
        </div>
        <span className="mt-3 block rounded-full border border-gold-500/40 py-2 text-center text-sm text-gold-300">
          Ver + pedir por WhatsApp
        </span>
      </div>
    </Link>
  );
}

export function BuyWhatsApp({ product, whatsappNumber }: { product: Product; whatsappNumber?: string }) {
  return (
    <a
      href={whatsappLinkForProduct(product, product.colors[0], whatsappNumber)}
      target="_blank"
      className="block rounded-full bg-[#25D366] px-6 py-3.5 text-center font-semibold text-white hover:brightness-110"
    >
      Pedir por WhatsApp
    </a>
  );
}

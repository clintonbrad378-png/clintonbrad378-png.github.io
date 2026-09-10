"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatMXN } from "@/lib/demo-data";
import { RosePlaceholder } from "@/components/Product";
import { whatsappLinkForProduct } from "@/lib/whatsapp";
import { DEFAULT_SETTINGS } from "@/lib/settings";

/** Vuelve al historial; si se abrió directo (sin historial), va al catálogo. */
export function BackButton({ fallback = "/#catalogo" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-5 py-2 text-sm font-semibold text-gold-300 hover:bg-gold-500/10"
    >
      ← Volver
    </button>
  );
}

export function ProductDetailClient({
  product,
  whatsappNumber = DEFAULT_SETTINGS.whatsappNumber,
}: {
  product: Product;
  whatsappNumber?: string;
}) {
  const [color, setColor] = useState(product.colors[0] ?? "Clásico");
  const price = product.sale_price ?? product.price;
  const hasOffer = product.sale_price != null && product.sale_price < product.price;
  const orderLink = whatsappLinkForProduct(product, color, whatsappNumber);
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/#catalogo");
    }
  }

  return (
    <>
      {/* Migas de pan: siempre muestran dónde estás y cómo salir */}
      <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <BackButton />
        <span className="ml-1 hidden text-cream-100/30 sm:inline">|</span>
        <Link href="/" className="text-cream-100/50 hover:text-gold-300">
          Inicio
        </Link>
        <span className="text-cream-100/30">›</span>
        <Link href="/#catalogo" className="text-cream-100/50 hover:text-gold-300">
          Catálogo
        </Link>
        {hasOffer && (
          <>
            <span className="text-cream-100/30">›</span>
            <Link href="/?ofertas=1#catalogo" className="text-gold-300 hover:text-gold-200">
              Ofertas
            </Link>
          </>
        )}
        <span className="text-cream-100/30">›</span>
        <span className="max-w-[40vw] truncate text-cream-100/80">{product.name}</span>
      </nav>

      <div className="grid gap-8 pb-24 md:grid-cols-2 md:pb-0">
        <div className="overflow-hidden rounded-2xl border border-gold-500/25">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <RosePlaceholder name={product.name} size="lg" />
          )}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 bg-noir-900 p-3">
              {product.images.slice(1, 5).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
            {product.category?.name ?? "Colección"}
          </p>
        <h1 className="font-display mt-2 text-4xl leading-tight">{product.name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gold-300">{formatMXN(price)}</span>
          {hasOffer && <span className="text-cream-100/40 line-through">{formatMXN(product.price)}</span>}
        </div>
        <p className="mt-4 leading-7 text-cream-100/70">{product.description}</p>

        <p className="mt-6 text-sm font-semibold text-cream-100">Color / variante</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(product.colors.length ? product.colors : ["Clásico"]).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`rounded-full border px-4 py-1.5 text-sm ${color === c ? "bg-gold-500 border-gold-500 text-noir-950 font-semibold" : "border-gold-500/30 text-gold-300"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className={`mt-4 text-sm ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
          {product.stock > 0 ? `Disponible · ${product.stock} piezas` : "Agotado temporalmente — pregunta por encargo"}
        </p>

        <div className="mt-5 hidden flex-col gap-3 md:flex">
          <a
            href={orderLink}
            target="_blank"
            className="rounded-full bg-[#25D366] px-6 py-3.5 text-center font-semibold text-white hover:brightness-110"
          >
            Pedir “{product.name}” por WhatsApp
          </a>
          <p className="text-center text-xs text-cream-100/50">
            Se abrirá WhatsApp con el mensaje listo. Solo envíalo y te confirmamos entrega.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-noir-900 p-5 text-sm leading-6 text-cream-100/60">
          <b className="text-cream-100">Incluye:</b> caja premium, tarjeta personalizada y guía de cuidados.
          Entrega local y envíos nacionales. Personalización de colores sin costo extra en MVP.
        </div>

        <div className="mt-6 hidden md:block">
          <BackButton />
        </div>
        </div>
      </div>

      {/* Barra fija en móvil: precio + pedir + volver siempre visibles */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/25 bg-noir-950/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            onClick={goBack}
            aria-label="Volver"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/40 text-lg text-gold-300"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-cream-100/60">{product.name}</p>
            <p className="text-base font-bold text-gold-300">{formatMXN(price)}</p>
          </div>
          <a
            href={orderLink}
            target="_blank"
            className="shrink-0 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white"
          >
            Pedir
          </a>
        </div>
      </div>
    </>
  );
}

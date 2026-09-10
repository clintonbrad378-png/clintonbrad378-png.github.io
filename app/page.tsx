import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/data";
import { CatalogFromURL } from "@/components/CatalogFromURL";
import { getSiteSettings } from "@/lib/settings";
import { whatsappLinkGeneral } from "@/lib/whatsapp";

export const metadata = { title: "Catálogo · Rosas LS" };

export default async function Home() {
  // Prerender en build; el catálogo se refresca solo en el navegador.
  const [products, categories, settings] = await Promise.all([
    getProducts({ onlyActive: true }),
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero con logo oficial */}
      <section className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logo.jpeg"
          alt="Rosas LS — Ramos y Arreglos"
          className="h-44 w-44 rounded-full border-2 border-gold-500/70 object-cover shadow-[0_0_60px_-15px_rgba(212,175,55,0.5)] md:h-56 md:w-56"
        />
        <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-gold-500">
          Ramos y Arreglos
        </p>
        <h1 className="font-display gold-text-gradient mt-2 text-center text-5xl md:text-6xl">
          ROSAS LS
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-cream-100/60">
          Rosas eternas y arreglos artesanales. Elige tu favorita y pide por WhatsApp.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="#catalogo"
            className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-noir-950 hover:bg-gold-400"
          >
            Ver catálogo
          </a>
          <a
            href={whatsappLinkGeneral(undefined, settings.whatsappNumber)}
            target="_blank"
            className="rounded-full border border-gold-500/40 px-6 py-2.5 text-sm text-gold-300 hover:bg-gold-500/10"
          >
            Pedir por WhatsApp
          </a>
        </div>
        <div className="gold-divider mt-8 w-full max-w-2xl" />
      </section>

      <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-gold-500">
        Catálogo
      </p>
      <h2 className="font-display mt-2 text-center text-4xl md:text-5xl">
        Nuestras piezas
      </h2>
      <div id="catalogo" className="mt-6 scroll-mt-24">
        <Suspense
          fallback={
            <p className="mt-6 text-center text-sm text-cream-100/50">
              Cargando catálogo...
            </p>
          }
        >
          <CatalogFromURL
            initialProducts={products}
            initialCategories={categories}
          />
        </Suspense>
      </div>
    </main>
  );
}

import { getCategories, getProducts } from "@/lib/data";
import { CatalogClient } from "@/components/CatalogClient";
import { getSiteSettings } from "@/lib/settings";
import { whatsappLinkGeneral } from "@/lib/whatsapp";

export const metadata = { title: "Catálogo · Rosas LS" };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; ofertas?: string }>;
}) {
  const sp = await searchParams;
  const [products, categories, settings] = await Promise.all([
    getProducts({ onlyActive: true }),
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero con logo oficial */}
      <section className="flex flex-col items-center text-center">
        {/* Logo oficial completo, sin recortes */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logo.jpeg"
          alt="Rosas LS — Ramos y Arreglos · rosaseternaslidia · 5015-04-48"
          className="w-64 rounded-3xl border-2 border-gold-500/70 object-contain shadow-[0_0_60px_-15px_rgba(212,175,55,0.5)] md:w-80"
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
        {/* key: al cambiar ?cat / ?ofertas se reinicia el filtro con la URL */}
        <CatalogClient
          key={`${sp.cat ?? "todos"}-${sp.ofertas ?? "0"}`}
          products={products}
          categories={categories}
          initialCat={sp.cat ?? "todos"}
          initialOnlyOffer={sp.ofertas === "1"}
        />
      </div>
    </main>
  );
}

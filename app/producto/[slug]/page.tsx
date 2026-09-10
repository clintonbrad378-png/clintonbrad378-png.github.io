import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductCard } from "@/components/Product";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts({ onlyActive: true });
  const settings = await getSiteSettings();
  const related = all.filter((x) => x.id !== product.id && x.category_id === product.category_id).slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ProductDetailClient product={product} whatsappNumber={settings.whatsappNumber} />
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-3xl">También te puede gustar</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

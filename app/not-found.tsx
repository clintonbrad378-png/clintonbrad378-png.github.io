import Link from "next/link";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/logo.jpeg"
        alt="Rosas LS"
        className="h-24 w-24 rounded-full border border-gold-500/60 object-cover"
      />
      <h1 className="font-display mt-6 text-5xl">404</h1>
      <p className="mt-2 text-sm text-cream-100/60">
        Esta página se marchitó. Vuelve al catálogo y elige tus flores.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gold-500 px-7 py-2.5 text-sm font-semibold text-noir-950 hover:bg-gold-400"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

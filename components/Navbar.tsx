import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-noir-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo oficial — public/logo/logo.jpeg */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo.jpeg"
            alt="Rosas LS — Ramos y Arreglos"
            className="h-11 w-11 rounded-full border border-gold-500/60 object-cover"
          />
          <span className="leading-tight">
            <span className="font-display block text-lg tracking-wide text-cream-100">
              ROSAS LS
            </span>
            <span className="block text-[11px] uppercase tracking-[0.25em] text-gold-500">
              Ramos y Arreglos
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm">
          <Link
            href="/#catalogo"
            className="hidden rounded-full px-4 py-1.5 text-cream-100/70 hover:text-gold-300 sm:block"
          >
            Catálogo
          </Link>
          <Link
            href="/?ofertas=1#catalogo"
            className="rounded-full bg-gold-500/15 px-3 py-1.5 font-semibold text-gold-300 hover:bg-gold-500/25 sm:px-4"
          >
            Ofertas
          </Link>
          <Link
            href="/admin"
            className="ml-1 rounded-full border border-gold-500/40 px-3 py-1.5 text-gold-300 hover:bg-gold-500/10 sm:px-4"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

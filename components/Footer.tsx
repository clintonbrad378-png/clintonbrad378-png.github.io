import { whatsappLinkGeneral } from "@/lib/whatsapp";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export function Footer({
  whatsappNumber = DEFAULT_SETTINGS.whatsappNumber,
  whatsappDisplay = DEFAULT_SETTINGS.whatsappDisplay,
  instagram = DEFAULT_SETTINGS.instagram,
}: {
  whatsappNumber?: string;
  whatsappDisplay?: string;
  instagram?: string;
}) {
  return (
    <footer className="border-t border-gold-500/20 bg-noir-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-8 text-sm sm:flex-row">
        <div className="flex items-center gap-4">
          {/* Logo oficial — public/logo/logo.jpeg */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo.jpeg"
            alt="Rosas LS — Ramos y Arreglos"
            className="h-16 w-16 rounded-full border border-gold-500/60 object-cover"
          />
          <div>
            <p className="font-display text-xl text-cream-100">Rosas LS</p>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold-500">
              Ramos y Arreglos
            </p>
            <p className="mt-1 text-xs text-cream-100/50">
              Instagram: {instagram} · WhatsApp: {whatsappDisplay}
            </p>
          </div>
        </div>
        <a
          href={whatsappLinkGeneral(undefined, whatsappNumber)}
          target="_blank"
          className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-noir-950 hover:bg-gold-400"
        >
          Pedir por WhatsApp
        </a>
      </div>
      <div className="border-t border-white/5 py-3 text-center text-xs text-cream-100/40">
        © {new Date().getFullYear()} Rosas LS · Ramos y Arreglos
      </div>
    </footer>
  );
}

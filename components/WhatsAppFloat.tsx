"use client";

import { usePathname } from "next/navigation";
import { whatsappLinkGeneral } from "@/lib/whatsapp";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export function WhatsAppFloat({
  whatsappNumber = DEFAULT_SETTINGS.whatsappNumber,
}: {
  whatsappNumber?: string;
}) {
  const pathname = usePathname();
  // En la ficha de producto la barra inferior ya trae Volver + Pedir:
  // el flotante la taparía en móvil, así que ahí se oculta.
  if (pathname?.startsWith("/producto")) return null;
  return (
    <a
      href={whatsappLinkGeneral(undefined, whatsappNumber)}
      target="_blank"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl font-bold text-white shadow-2xl hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.6.8-.4 1.1.6 1.1 1.4 1.9 2.5 2.4.3.2.5 0 .7-.2l.7-.8c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .6-.2 1.5Z" />
      </svg>
    </a>
  );
}

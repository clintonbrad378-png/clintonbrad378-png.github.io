import { isSupabaseConfigured, supabaseServer } from "./supabase";

export type SiteSettings = {
  /** Número en formato wa.me: código país + número, solo dígitos. */
  whatsappNumber: string;
  /** Número legible para mostrar (ej. 5015-04-48). */
  whatsappDisplay: string;
  /** Usuario de Instagram sin @. */
  instagram: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50250150448",
  whatsappDisplay: "5015-04-48",
  instagram: "rosaseternaslidia",
};

/** Limpia un número de teléfono a solo dígitos. */
export function sanitizePhone(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

/** Valida formato wa.me: 8–15 dígitos. */
export function isValidPhone(digits: string): boolean {
  return /^[0-9]{8,15}$/.test(digits);
}

/**
 * Lee la configuración del sitio (server-side).
 * Fuente: tabla `settings` de Supabase → fallback a env/defaults.
 * Ver `supabase/schema.sql` para crear la tabla.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from("settings").select("key, value");
    if (error || !data) return DEFAULT_SETTINGS;
    const map = new Map(
      (data as { key: string; value: string }[]).map((r) => [r.key, r.value])
    );
    const num = sanitizePhone(map.get("whatsapp_number") ?? "");
    return {
      whatsappNumber: isValidPhone(num)
        ? num
        : DEFAULT_SETTINGS.whatsappNumber,
      whatsappDisplay:
        map.get("whatsapp_display")?.trim() || DEFAULT_SETTINGS.whatsappDisplay,
      instagram:
        map.get("instagram")?.trim().replace(/^@/, "") ||
        DEFAULT_SETTINGS.instagram,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

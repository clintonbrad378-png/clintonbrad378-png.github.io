import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase server-side con cookies (lee la sesión del usuario).
 * Úsalo en Server Components / Route Handlers para verificar identidad.
 * IMPORTANTE: para proteger rutas usa siempre `auth.getUser()` (revalida
 * el token contra el servidor Auth). Nunca confíes en `getSession()`.
 */
export async function supabaseServerAuth() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // En Server Components las cookies son de solo lectura;
          // el proxy (`proxy.ts`) se encarga de refrescarlas.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* ignorado a propósito en Server Components */
          }
        },
      },
    }
  );
}

/** Devuelve el usuario autenticado o `null` (verificado contra Auth server). */
export async function getSessionUser() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  try {
    const sb = await supabaseServerAuth();
    const { data } = await sb.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

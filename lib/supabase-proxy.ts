import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca los tokens de Auth en cookies en cada request.
 * Sin esto, las sesiones expiran y los Server Components / guards
 * dejan de reconocer al usuario (cierre de sesión fantasma).
 * Si Supabase no está configurado (modo demo), pasa de largo.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // No poner lógica entre createServerClient y getUser: debe ejecutarse
  // siempre para no romper el refresco de sesión.
  await supabase.auth.getUser();

  // Blindaje extra: /admin y /api/admin exigen sesión verificada.
  // (La verificación real con getUser ocurre en cada página/ruta;
  // aquí redirigimos temprano por UX, sin confiar solo en cookies.)
  const { pathname } = request.nextUrl;
  const isAdminRoute =
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    !pathname.startsWith("/admin/login");

  if (isAdminRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

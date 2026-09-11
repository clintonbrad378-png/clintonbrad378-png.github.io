import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto estáticos, imágenes optimizadas,
     * favicon y archivos públicos (logo, fotos).
     */
    "/((?!_next/static|_next/image|favicon.ico|logo|ofertas|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

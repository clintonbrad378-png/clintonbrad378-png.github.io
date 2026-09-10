import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseServerAuth } from "@/lib/supabase-server";

/**
 * POST /api/admin/revalidate — invalida el caché del layout raíz
 * para que cambios del admin (productos, ofertas, WhatsApp) se vean
 * al instante en las páginas estáticas. Solo usuarios autenticados.
 */
export async function POST() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });
  }
  try {
    const sb = await supabaseServerAuth();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

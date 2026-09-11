"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase";
import { DEMO_CATEGORIES, DEMO_PRODUCTS, formatMXN } from "@/lib/demo-data";
import { DEFAULT_SETTINGS, isValidPhone, sanitizePhone } from "@/lib/settings";
import { slugify } from "@/lib/data";
import { SiteQr } from "@/components/admin/SiteQr";
import type { Category, Product } from "@/lib/types";

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  category_id: string;
  stock: string;
  colors: string;
  images: string[];
  featured: boolean;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  sale_price: "",
  category_id: "",
  stock: "10",
  colors: "Amarillo, Blanco, Azul, Morado",
  images: [],
  featured: false,
  active: true,
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [newCat, setNewCat] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Contacto / WhatsApp editable
  const [waNumber, setWaNumber] = useState(DEFAULT_SETTINGS.whatsappNumber);
  const [waDisplay, setWaDisplay] = useState(DEFAULT_SETTINGS.whatsappDisplay);
  const [instagram, setInstagram] = useState(DEFAULT_SETTINGS.instagram);
  const [savingSettings, setSavingSettings] = useState(false);

  const configured = isSupabaseConfigured();

  /**
   * Sitio estático: el catálogo se refresca solo en el navegador al instante.
   * Las páginas de producto y el número de WhatsApp del encabezado/pie
   * se regeneran solas cada hora (GitHub Action).
   */
  async function revalidateSite() {
    /* sin servidor: no hay nada que invalidar */
  }

  useEffect(() => {
    async function init() {
      if (!configured) {
        setProducts(DEMO_PRODUCTS);
        setCategories(DEMO_CATEGORIES);
        setLoading(false);
        return;
      }
      const sb = supabaseBrowser();
      const { data: session } = await sb.auth.getSession();
      if (!session.session) {
        router.push("/admin/login");
        return;
      }
      setUserEmail(session.session.user.email ?? "");
      await refresh(sb);
      setLoading(false);
    }
    init();
    // Defensa en profundidad: si la sesión muere en otra pestaña, salir.
    const sb = configured ? supabaseBrowser() : null;
    const { data: listener } = sb
      ? sb.auth.onAuthStateChange((_event, session) => {
          if (!session) router.push("/admin/login");
        })
      : { data: { subscription: { unsubscribe() {} } } };
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function refresh(sb?: any) {
    const client = sb ?? supabaseBrowser();
    const [{ data: cats }, { data: prods }, { data: settings }] = await Promise.all([
      client.from("categories").select("*").order("name"),
      client.from("products").select("*").order("created_at", { ascending: false }),
      client.from("settings").select("key, value"),
    ]);
    if (cats) {
      setCategories(
        cats.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r.name),
          slug: String(r.slug),
          description: (r.description as string) ?? null,
        }))
      );
    }
    if (prods) {
      setProducts(
        prods.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r.name),
          slug: String(r.slug),
          description: String(r.description ?? ""),
          price: Number(r.price ?? 0),
          sale_price: r.sale_price != null ? Number(r.sale_price) : null,
          category_id: r.category_id ? String(r.category_id) : null,
          category: null,
          stock: Number(r.stock ?? 0),
          colors: Array.isArray(r.colors) ? (r.colors as string[]) : [],
          images: Array.isArray(r.images) ? (r.images as string[]) : [],
          featured: Boolean(r.featured),
          active: Boolean(r.active ?? true),
        }))
      );
    }
    if (settings) {
      const map = new Map(
        (settings as { key: string; value: string }[]).map((r) => [r.key, r.value])
      );
      const num = sanitizePhone(map.get("whatsapp_number") ?? "");
      if (isValidPhone(num)) setWaNumber(num);
      if (map.get("whatsapp_display")?.trim()) setWaDisplay(map.get("whatsapp_display")!.trim());
      if (map.get("instagram")?.trim()) setInstagram(map.get("instagram")!.trim().replace(/^@/, ""));
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!configured) {
      setMsg("Conecta Supabase para guardar (ver README). Estás en modo demo.");
      return;
    }
    const digits = sanitizePhone(waNumber);
    if (!isValidPhone(digits)) {
      setMsg("Número inválido: usa código país + número, solo dígitos (8–15). Ej. 50250150448.");
      return;
    }
    if (!instagram.trim()) {
      setMsg("Escribe tu usuario de Instagram (sin @).");
      return;
    }
    setSavingSettings(true);
    try {
      const sb = supabaseBrowser();
      const rows = [
        { key: "whatsapp_number", value: digits },
        { key: "whatsapp_display", value: waDisplay.trim() || digits },
        { key: "instagram", value: instagram.trim().replace(/^@/, "") },
      ];
      const { error } = await sb.from("settings").upsert(rows, { onConflict: "key" });
      if (error) setMsg("Error guardando contacto: " + error.message);
      else {
        setWaNumber(digits);
        setMsg("Contacto actualizado. El número nuevo aparece en la web en la próxima actualización automática (máx. 1 h).");
        await revalidateSite();
      }
    } finally {
      setSavingSettings(false);
    }
  }

  function startEdit(p: Product) {
    setEditing(true);
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      sale_price: p.sale_price != null ? String(p.sale_price) : "",
      category_id: p.category_id ?? "",
      stock: String(p.stock),
      colors: p.colors.join(", "),
      images: [...p.images],
      featured: p.featured,
      active: p.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!configured) {
      setMsg("Conecta Supabase para guardar (ver README). Estás en modo demo.");
      return;
    }
    setSaving(true);
    try {
      const sb = supabaseBrowser();
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        category_id: form.category_id || null,
        stock: Number(form.stock) || 0,
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        images: form.images,
        featured: form.featured,
        active: form.active,
      };
      let error;
      if (editing && form.id) {
        const res = await sb.from("products").update(payload).eq("id", form.id);
        error = res.error;
      } else {
        const res = await sb.from("products").insert(payload);
        error = res.error;
      }
      if (error) setMsg("Error: " + error.message);
      else {
        setMsg(editing ? "Producto actualizado." : "Producto creado.");
        setForm(emptyForm);
        setEditing(false);
        await refresh();
        await revalidateSite();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(p: Product, field: "active" | "featured") {
    if (!configured) return;
    const sb = supabaseBrowser();
    await sb.from("products").update({ [field]: !p[field] }).eq("id", p.id);
    await refresh();
    await revalidateSite();
  }

  async function handleDelete(id: string) {
    if (!configured) return;
    const sb = supabaseBrowser();
    const { error } = await sb.from("products").delete().eq("id", id);
    setConfirmDeleteId(null);
    if (error) setMsg("Error eliminando: " + error.message);
    else {
      setMsg("Producto eliminado.");
      await refresh();
      await revalidateSite();
    }
  }

  /** Sube una o varias fotos al Storage y las agrega a la vista previa. */
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!configured) {
      setMsg("Conecta Supabase para subir fotos (ver README). Estás en modo demo.");
      return;
    }
    const list = Array.from(files);
    const valid: File[] = [];
    for (const file of list) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setMsg(`"${file.name}" no es JPG, PNG ni WEBP. En iPhone elige la foto desde la galería (se convierte sola) o usa JPG.`);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setMsg(`"${file.name}" supera 5 MB. Elige una más liviana.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;
    setUploading(true);
    try {
      const sb = supabaseBrowser();
      const urls: string[] = [];
      let n = 0;
      for (const file of valid) {
        n += 1;
        setUploadProgress(`Subiendo ${n} de ${valid.length}...`);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${Date.now()}-${n}-${slugify(file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "foto")}.${ext}`;
        const { error } = await sb.storage.from("productos").upload(path, file, { upsert: true });
        if (error) {
          setMsg("Error subiendo: " + error.message + " (¿ejecutaste las políticas de Storage del schema.sql?)");
          continue;
        }
        const { data } = sb.storage.from("productos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      if (urls.length > 0) {
        setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
        setMsg(
          urls.length === 1
            ? "Foto agregada. Guarda el producto para aplicar."
            : `${urls.length} fotos agregadas. Guarda el producto para aplicar.`
        );
      }
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function setAsMain(idx: number) {
    setForm((f) => ({ ...f, images: [f.images[idx], ...f.images.filter((_, i) => i !== idx)] }));
  }

  function addImageUrl(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    const url = imageUrl.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageUrl("");
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.trim() || !configured) return;
    const sb = supabaseBrowser();
    const { error } = await sb.from("categories").insert({ name: newCat.trim(), slug: slugify(newCat) });
    if (!error) {
      setNewCat("");
      await refresh();
      await revalidateSite();
    } else setMsg("Error categoría: " + error.message);
  }

  async function logout() {
    if (!configured) return;
    await supabaseBrowser().auth.signOut();
    router.push("/admin/login");
  }

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-16 text-cream-100/60">Cargando panel...</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500">Panel admin</p>
          <h1 className="font-display mt-1 text-4xl">Gestionar catálogo</h1>
          {userEmail && <p className="mt-1 text-sm text-cream-100/50">{userEmail}</p>}
        </div>
        {configured && (
          <button onClick={logout} className="rounded-full border border-white/15 px-5 py-2 text-sm hover:border-gold-500/50">
            Cerrar sesión
          </button>
        )}
      </div>

      {!configured && (
        <div className="mt-6 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5 text-sm leading-6">
          <b className="text-gold-300">Modo demo (sin Supabase).</b> Ves 6 productos de ejemplo.
          Para activar guardado real: crea proyecto en supabase.com → ejecuta <code>supabase/schema.sql</code> →
          crea bucket público <code>productos</code> → crea usuario en Authentication → copia claves a <code>.env.local</code>.
          Detalle en README.
        </div>
      )}

      {msg && <p className="mt-4 rounded-xl border border-gold-500/30 bg-noir-900 p-3 text-sm text-gold-300">{msg}</p>}

      {/* CONTACTO / WHATSAPP */}
      <form onSubmit={handleSaveSettings} className="mt-6 rounded-2xl border border-gold-500/25 bg-noir-900 p-6">
        <h2 className="font-display text-2xl">Contacto / WhatsApp</h2>
        <p className="mt-1 text-sm text-cream-100/50">
          Este número se usa en todos los botones de WhatsApp y en el pie de página.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-cream-100/70">Número WhatsApp (código país + número) *</label>
            <input
              required value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="50250150448" inputMode="tel" autoComplete="tel"
              className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 font-mono outline-none focus:border-gold-500/60" />
            <p className="mt-1 text-xs text-cream-100/40">Solo dígitos, 8–15. Ej. Guatemala: 502 + 50150448.</p>
          </div>
          <div>
            <label className="text-sm text-cream-100/70">Número visible (bonito)</label>
            <input
              value={waDisplay} onChange={(e) => setWaDisplay(e.target.value)}
              placeholder="5015-04-48"
              className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none focus:border-gold-500/60" />
          </div>
          <div>
            <label className="text-sm text-cream-100/70">Instagram (sin @)</label>
            <input
              value={instagram} onChange={(e) => setInstagram(e.target.value)}
              placeholder="rosaseternaslidia"
              className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none focus:border-gold-500/60" />
          </div>
        </div>
        <button
          disabled={savingSettings}
          className="mt-4 rounded-full bg-gold-500 px-7 py-2.5 text-sm font-semibold text-noir-950 hover:bg-gold-400 disabled:opacity-50"
        >
          {savingSettings ? "Guardando..." : "Guardar contacto"}
        </button>
      </form>

      <SiteQr />

      {/* FORM */}
      <form onSubmit={handleSave} className="mt-6 grid gap-4 rounded-2xl border border-gold-500/25 bg-noir-900 p-6 md:grid-cols-2">
        <h2 className="md:col-span-2 font-display text-2xl">{editing ? "Editar producto" : "Nuevo producto"}</h2>
        <div className="md:col-span-2">
          <label className="text-sm text-cream-100/70">Nombre *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ramo Girasol Real con Corona"
            className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none focus:border-gold-500/60" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-cream-100/70">Descripción</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ramo artesanal, materiales, medidas, qué incluye..."
            className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none focus:border-gold-500/60" />
        </div>
        <div>
          <label className="text-sm text-cream-100/70">Precio MXN *</label>
          <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="1299" className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none" />
        </div>
        <div>
          <label className="text-sm text-cream-100/70">Precio oferta (opcional)</label>
          <input type="number" min={0} value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
            placeholder="1099" className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none" />
        </div>
        <div>
          <label className="text-sm text-cream-100/70">Categoría</label>
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none">
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-cream-100/70">Stock</label>
          <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none" />
        </div>
        <div>
          <label className="text-sm text-cream-100/70">Colores (separados por coma)</label>
          <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-cream-100/70">
            Fotos del producto ({form.images.length})
          </label>

          {/* Vista previa */}
          {form.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {form.images.map((src, i) => (
                <div key={`${src}-${i}`} className="group relative overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase text-noir-950">
                      Principal
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/70 p-1">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsMain(i)}
                        className="flex-1 rounded-md bg-gold-500/20 px-1 py-1 text-[11px] text-gold-300"
                      >
                        Principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Quitar foto ${i + 1}`}
                      className="flex-1 rounded-md bg-red-500/20 px-1 py-1 text-[11px] text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botones: galería y cámara */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={uploading}
              onClick={() => galleryRef.current?.click()}
              className="flex-1 rounded-full border border-gold-500/50 px-5 py-3 text-sm font-semibold text-gold-300 hover:bg-gold-500/10 disabled:opacity-50"
            >
              🖼️ Elegir de galería / archivos
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => cameraRef.current?.click()}
              className="flex-1 rounded-full border border-gold-500/50 px-5 py-3 text-sm font-semibold text-gold-300 hover:bg-gold-500/10 disabled:opacity-50"
            >
              📷 Tomar foto
            </button>
          </div>
          {/* En celular abre galería/archivos; en PC el explorador. Acepta varias a la vez. */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {/* En celular abre directo la cámara; en PC funciona igual que galería. */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            hidden
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {uploading && <p className="mt-2 text-sm text-gold-300">{uploadProgress || "Subiendo..."}</p>}
          <p className="mt-1 text-xs text-cream-100/40">
            JPG, PNG o WEBP de hasta 5 MB cada una. La primera es la foto principal del catálogo.
          </p>

          {/* Agregar por enlace (opcional, ej. /ofertas/foto.jpg) */}
          <div className="mt-3 flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addImageUrl(e);
              }}
              placeholder="...o pega un enlace: /ofertas/foto.jpg"
              className="flex-1 rounded-full border border-white/10 bg-noir-950 px-5 py-2 font-mono text-xs outline-none placeholder:text-cream-100/30"
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-full border border-white/15 px-5 py-2 text-xs text-cream-100/70"
            >
              Agregar
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#C9A86A]" />
          Destacado en home
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-[#C9A86A]" />
          Visible en catálogo
        </label>
        <div className="flex gap-3 md:col-span-2">
          <button disabled={saving} className="rounded-full bg-gold-500 px-7 py-2.5 font-semibold text-noir-950 hover:bg-gold-400 disabled:opacity-50">
            {saving ? "Guardando..." : editing ? "Actualizar" : "Crear producto"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(false); setForm(emptyForm); }}
              className="rounded-full border border-white/15 px-6 py-2.5">Cancelar</button>
          )}
        </div>
      </form>

      {/* CATEGORIAS */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-noir-900 p-6">
        <h3 className="font-display text-xl">Categorías ({categories.length})</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="rounded-full border border-gold-500/30 px-4 py-1 text-sm text-gold-300">{c.name}</span>
          ))}
        </div>
        <form onSubmit={handleCreateCategory} className="mt-4 flex gap-2">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nueva categoría: Ej. Cumpleaños"
            className="flex-1 rounded-full border border-white/10 bg-noir-950 px-5 py-2 text-sm outline-none" />
          <button className="rounded-full border border-gold-500/50 px-5 py-2 text-sm text-gold-300">Agregar</button>
        </form>
      </div>

      {/* TABLA */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-noir-900 text-left text-xs uppercase tracking-wider text-gold-500">
              <th className="p-4">Producto</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-4">
                  <b className="text-cream-100">{p.name}</b>
                  <span className="block text-xs text-cream-100/40">{p.slug}</span>
                </td>
                <td className="p-4 text-gold-300 font-semibold">{formatMXN(p.sale_price ?? p.price)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => toggleField(p, "active")}
                      className={`rounded-full px-3 py-1 text-xs ${p.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-cream-100/50"}`}>
                      {p.active ? "Visible" : "Oculto"}
                    </button>
                    <button onClick={() => toggleField(p, "featured")}
                      className={`rounded-full px-3 py-1 text-xs ${p.featured ? "bg-gold-500 text-noir-950 font-bold" : "bg-white/10 text-cream-100/50"}`}>
                      ★ Dest
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="rounded-full border border-gold-500/40 px-4 py-1 text-gold-300">Editar</button>
                    {confirmDeleteId === p.id ? (
                      <>
                        <button onClick={() => handleDelete(p.id)} className="rounded-full bg-red-500 px-4 py-1 font-semibold text-white">Sí, borrar</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="rounded-full border border-white/15 px-4 py-1 text-cream-100/70">No</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(p.id)} className="rounded-full border border-red-500/40 px-4 py-1 text-red-400">Borrar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

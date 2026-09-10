# Rosas Eternas · Catálogo + Panel Admin (MVP)

Web catálogo para florestería artesanal, paleta negro + dorado. Pedidos por WhatsApp, sin pagos online en MVP.

Stack: Next.js 16 (App Router) + Tailwind v4 + Supabase (Postgres + Auth + Storage).

## Estructura

```
app/
  page.tsx              → Home (hero, colecciones, destacados, cuidados, FAQ)
  catalogo/page.tsx     → Catálogo con buscador, filtros, orden, ofertas
  producto/[slug]/page.tsx → Detalle + selector color + botón WhatsApp
  admin/login/page.tsx  → Login (Supabase Auth)
  admin/page.tsx        → Dashboard: CRUD productos, categorías, fotos, visible/destacado
components/
  Navbar, Footer, WhatsAppFloat
  Product.tsx (Card + placeholder elegante sin fotos)
  CatalogClient.tsx, ProductDetailClient.tsx
  admin/LoginForm.tsx, admin/AdminDashboard.tsx
lib/
  types.ts, demo-data.ts (6 productos demo), data.ts (Supabase con fallback demo),
  supabase.ts, whatsapp.ts
supabase/schema.sql     → Tablas + RLS + seed. Ejecutar en SQL Editor
```

## Correr en local (modo demo, sin Supabase)

```bash
npm install
npm run dev
# abre http://localhost:3000
```

Funciona sin `.env`: usa datos demo y placeholders dorados.

## Activar Supabase (5 min, para guardar real)

1. Crea proyecto gratis en supabase.com
2. SQL Editor → pega y ejecuta `supabase/schema.sql`
3. Storage → New bucket `productos` → Public ON
   - Policies bucket: SELECT público `true`; INSERT/UPDATE/DELETE `auth.role() = 'authenticated'`
4. Authentication → Add user → tu email + password (solo tú)
5. Copia `.env.example` a `.env.local` y llena:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_WHATSAPP_NUMBER=5215500000000
   ```
6. `npm run dev` → entra a `/admin/login` → crea/edita productos con fotos.

## Uso diario admin

- `/admin`: nuevo producto (nombre, precio, oferta, categoría, stock, colores, fotos), toggle Visible / ★ Dest, editar, borrar.
- Fotos: botón subir (va a Storage) o pega URLs (una por línea).
- Categorías: agregar desde el panel (box-redonda, coffret, cúpula, ramo por defecto).
- Todo cambio se refleja al instante en Home, Catálogo y Detalle.

## Deploy sugerido

- Frontend: Vercel (import repo, agrega env vars) o Cloudflare Pages.
- DB/Auth/Storage: Supabase free tier.

## Paleta

Negro `#0A0A0A/#141414/#1E1E1E`, dorado `#C9A86A/#D4AF37/#E8D5A3`, crema `#F5EFE6`, burdeos `#5C1A24`.
Fonts: Cormorant Garamond (display) + Inter (body).

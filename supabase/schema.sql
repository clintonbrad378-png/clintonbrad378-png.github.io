-- Rosas Eternas · MVP Schema para Supabase (Postgres)
-- Ejecuta esto en Supabase Dashboard > SQL Editor

-- 1) Tablas
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text default '',
  price numeric not null check (price >= 0),
  sale_price numeric check (sale_price is null or sale_price >= 0),
  category_id uuid references categories(id) on delete set null,
  stock int default 0,
  colors text[] default '{}',
  images text[] default '{}',
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- 2) RLS
alter table categories enable row level security;
alter table products enable row level security;

-- Lectura pública solo de activos
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

drop policy if exists "public read active products" on products;
create policy "public read active products" on products for select using (active = true);

-- Escritura solo usuarios autenticados (tu admin)
drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories for all using (auth.role() = 'authenticated');

drop policy if exists "admin write products" on products;
create policy "admin write products" on products for all using (auth.role() = 'authenticated');

-- 3) Storage bucket para fotos (crearlo en Dashboard > Storage > New bucket: productos, Public ON)
-- Ejecuta estas políticas DESPUÉS de crear el bucket:
--
-- -- Lectura pública de fotos
-- drop policy if exists "public read fotos" on storage.objects;
-- create policy "public read fotos" on storage.objects
--   for select using (bucket_id = 'productos');
--
-- -- Subida solo autenticados (admin), solo imágenes, máx 5 MB
-- drop policy if exists "admin upload fotos" on storage.objects;
-- create policy "admin upload fotos" on storage.objects
--   for insert with check (
--     bucket_id = 'productos'
--     and auth.role() = 'authenticated'
--     and (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp'))
--   );
--
-- drop policy if exists "admin update fotos" on storage.objects;
-- create policy "admin update fotos" on storage.objects
--   for update using (bucket_id = 'productos' and auth.role() = 'authenticated');
--
-- drop policy if exists "admin delete fotos" on storage.objects;
-- create policy "admin delete fotos" on storage.objects
--   for delete using (bucket_id = 'productos' and auth.role() = 'authenticated');

-- 4) Configuración del sitio (número WhatsApp editable desde /admin)
create table if not exists settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz default now()
);

alter table settings enable row level security;

drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);

drop policy if exists "admin write settings" on settings;
create policy "admin write settings" on settings for all using (auth.role() = 'authenticated');

-- Valores iniciales (número del logo: 5015-04-48, Guatemala = 502)
insert into settings (key, value) values
  ('whatsapp_number', '50250150448'),
  ('whatsapp_display', '5015-04-48'),
  ('instagram', 'rosaseternaslidia')
on conflict (key) do nothing;

-- 5) Seed demo
insert into categories (name, slug, description) values
  ('Box Redonda', 'box-redonda', 'Cajas circulares signature'),
  ('Coffret', 'coffret', 'Cajas cuadradas premium'),
  ('Cúpula de Cristal', 'cupula', 'Rosa bajo cúpula'),
  ('Ramos', 'ramo', 'Ramos artesanales'),
  ('Girasoles', 'girasoles', 'Arreglos con girasoles'),
  ('Detalles y Regalos', 'detalles', 'Detalles individuales y con dulces')
on conflict (slug) do nothing;

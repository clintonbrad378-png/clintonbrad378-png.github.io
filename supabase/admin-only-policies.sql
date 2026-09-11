-- Rosas LS · RLS endurecido: SOLO el email admin puede escribir
-- Ejecuta esto en Supabase Dashboard > SQL Editor > New query > Run
-- DESPUÉS de haber ejecutado schema.sql y storage-policies.sql. Solo una vez.
--
-- Por qué: las políticas base permiten escribir a "cualquier autenticado".
-- Con este archivo, aunque alguien logre crearse una cuenta (registro
-- público abierto por descuido, sesión robada de otra app, etc.), la base
-- de datos le niega TODA escritura. Solo rosaseternas@negocio.com manda.
--
-- Si cambias de email admin, reemplázalo abajo y vuelve a ejecutar.

-- 1) Productos: escritura solo admin (lectura pública de activos intacta)
drop policy if exists "admin write products" on products;
create policy "admin only write products" on products for all
  using ((auth.jwt() ->> 'email') = 'rosaseternas@negocio.com')
  with check ((auth.jwt() ->> 'email') = 'rosaseternas@negocio.com');

-- 2) Categorías: escritura solo admin
drop policy if exists "admin write categories" on categories;
create policy "admin only write categories" on categories for all
  using ((auth.jwt() ->> 'email') = 'rosaseternas@negocio.com')
  with check ((auth.jwt() ->> 'email') = 'rosaseternas@negocio.com');

-- 3) Settings (número WhatsApp): escritura solo admin
drop policy if exists "admin write settings" on settings;
create policy "admin only write settings" on settings for all
  using ((auth.jwt() ->> 'email') = 'rosaseternas@negocio.com')
  with check ((auth.jwt() ->> 'email') = 'rosaseternas@negocio.com');

-- 4) Fotos: subir solo admin
drop policy if exists "admin upload fotos" on storage.objects;
create policy "admin only upload fotos" on storage.objects
  for insert with check (
    bucket_id = 'productos'
    and (auth.jwt() ->> 'email') = 'rosaseternas@negocio.com'
  );

-- 5) Fotos: actualizar solo admin
drop policy if exists "admin update fotos" on storage.objects;
create policy "admin only update fotos" on storage.objects
  for update using (
    bucket_id = 'productos'
    and (auth.jwt() ->> 'email') = 'rosaseternas@negocio.com'
  );

-- 6) Fotos: borrar solo admin
drop policy if exists "admin delete fotos" on storage.objects;
create policy "admin only delete fotos" on storage.objects
  for delete using (
    bucket_id = 'productos'
    and (auth.jwt() ->> 'email') = 'rosaseternas@negocio.com'
  );

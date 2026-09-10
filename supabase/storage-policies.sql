-- Rosas LS · Políticas del almacén de fotos (bucket "productos")
-- Ejecuta esto en Supabase Dashboard > SQL Editor > New query > Run
-- Solo necesitas hacerlo UNA vez. Sin esto, el panel admin no puede subir fotos.
--
-- Requisito previo: el bucket "productos" debe existir como público
-- (Dashboard > Storage > New bucket > nombre "productos" > Public ON).
-- Si ya lo creaste desde el panel, solo ejecuta este archivo.

-- Lectura pública: los clientes ven las fotos del catálogo sin login
drop policy if exists "public read fotos" on storage.objects;
create policy "public read fotos" on storage.objects
  for select using (bucket_id = 'productos');

-- Subida solo con sesión de admin
drop policy if exists "admin upload fotos" on storage.objects;
create policy "admin upload fotos" on storage.objects
  for insert with check (
    bucket_id = 'productos'
    and auth.role() = 'authenticated'
  );

-- Actualizar solo con sesión de admin
drop policy if exists "admin update fotos" on storage.objects;
create policy "admin update fotos" on storage.objects
  for update using (bucket_id = 'productos' and auth.role() = 'authenticated');

-- Borrar solo con sesión de admin
drop policy if exists "admin delete fotos" on storage.objects;
create policy "admin delete fotos" on storage.objects
  for delete using (bucket_id = 'productos' and auth.role() = 'authenticated');

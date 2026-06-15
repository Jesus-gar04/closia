-- ============================================================
-- CLOSIA — Modo personal (identidad fija, sin login)
-- Pega TODO esto en: Supabase Dashboard → SQL Editor → New query → Run.
-- Se ejecuta una sola vez. Es idempotente (puedes correrlo de nuevo sin romper).
--
-- Qué hace:
--   1) Quita el vínculo a auth.users para poder usar un user_id fijo sin login.
--   2) Reemplaza las políticas RLS (que exigían sesión) por acceso para anon.
--   3) Crea el bucket público "closia" y sus políticas de Storage.
-- Tras correrlo, la app guarda y lee todo desde Supabase en cualquier dispositivo.
-- ============================================================

-- 1) Quitar FK a auth.users (permite user_id fijo sin sesión) ---------------
alter table clothing_items  drop constraint if exists clothing_items_user_id_fkey;
alter table categories      drop constraint if exists categories_user_id_fkey;
alter table outfits         drop constraint if exists outfits_user_id_fkey;
alter table outfit_calendar drop constraint if exists outfit_calendar_user_id_fkey;
alter table user_settings   drop constraint if exists user_settings_user_id_fkey;

-- 2) Políticas RLS abiertas para el rol anon (app personal sin login) --------
drop policy if exists "Usuario ve solo su ropa"        on clothing_items;
drop policy if exists "Usuario ve solo sus categorias" on categories;
drop policy if exists "Usuario ve solo sus outfits"    on outfits;
drop policy if exists "Usuario ve solo su calendario"  on outfit_calendar;
drop policy if exists "Usuario ve solo sus settings"   on user_settings;

drop policy if exists "closia_personal" on clothing_items;
drop policy if exists "closia_personal" on categories;
drop policy if exists "closia_personal" on outfits;
drop policy if exists "closia_personal" on outfit_calendar;
drop policy if exists "closia_personal" on user_settings;

create policy "closia_personal" on clothing_items  for all to anon, authenticated using (true) with check (true);
create policy "closia_personal" on categories      for all to anon, authenticated using (true) with check (true);
create policy "closia_personal" on outfits         for all to anon, authenticated using (true) with check (true);
create policy "closia_personal" on outfit_calendar for all to anon, authenticated using (true) with check (true);
create policy "closia_personal" on user_settings   for all to anon, authenticated using (true) with check (true);

-- 3) Bucket público + políticas de Storage ----------------------------------
insert into storage.buckets (id, name, public)
values ('closia', 'closia', true)
on conflict (id) do update set public = true;

drop policy if exists "closia_storage_read"   on storage.objects;
drop policy if exists "closia_storage_write"  on storage.objects;
drop policy if exists "closia_storage_update" on storage.objects;
drop policy if exists "closia_storage_delete" on storage.objects;

create policy "closia_storage_read"   on storage.objects for select to anon, authenticated using (bucket_id = 'closia');
create policy "closia_storage_write"  on storage.objects for insert to anon, authenticated with check (bucket_id = 'closia');
create policy "closia_storage_update" on storage.objects for update to anon, authenticated using (bucket_id = 'closia');
create policy "closia_storage_delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'closia');

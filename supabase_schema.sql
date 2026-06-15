-- ============================================================
-- CLOSIA — Schema completo de Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── TABLA: clothing_items ────────────────────────────────────
create table if not exists clothing_items (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  name                text not null,

  body_zone           text not null check (body_zone in (
                        'head', 'neck', 'torso', 'wrist', 'legs',
                        'dress', 'outer', 'feet', 'accessory'
                      )),
  silhouette_type     text not null,

  category            text not null,
  styles              text[] default '{}',

  image_original_url  text not null,
  image_processed_url text not null,
  thumbnail_url       text not null,

  dominant_color      text,
  size                text,
  brand               text,
  notes               text,
  favorite            boolean default false,

  -- Ajuste fino del render 3D por prenda (escala/desplazamiento sobre el preset
  -- de su silueta). NULL = usar el preset tal cual.
  fit_scale_x         real,
  fit_scale_y         real,
  fit_offset_x        real,
  fit_offset_y        real,

  times_worn          integer default 0,
  last_worn           timestamptz,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Migración para instalaciones previas (las columnas fit_* se añadieron después).
alter table clothing_items add column if not exists fit_scale_x  real;
alter table clothing_items add column if not exists fit_scale_y  real;
alter table clothing_items add column if not exists fit_offset_x real;
alter table clothing_items add column if not exists fit_offset_y real;

alter table clothing_items enable row level security;

create policy "Usuario ve solo su ropa"
  on clothing_items for all
  using (auth.uid() = user_id);

-- ── TABLA: categories ────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  color       text default '#C9956A',
  icon        text default 'hanger',
  body_zone   text,
  created_at  timestamptz default now()
);

alter table categories enable row level security;

create policy "Usuario ve solo sus categorias"
  on categories for all
  using (auth.uid() = user_id);

-- ── TABLA: outfits ───────────────────────────────────────────
create table if not exists outfits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  name            text not null,
  clothing_ids    uuid[] not null,
  screenshot_url  text,
  tags            text[] default '{}',
  rating          integer default 0 check (rating between 0 and 5),
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table outfits enable row level security;

create policy "Usuario ve solo sus outfits"
  on outfits for all
  using (auth.uid() = user_id);

-- ── TABLA: outfit_calendar ───────────────────────────────────
create table if not exists outfit_calendar (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  outfit_id     uuid references outfits(id) on delete cascade,
  planned_date  date not null,
  worn          boolean default false,
  created_at    timestamptz default now(),
  unique(user_id, planned_date)
);

alter table outfit_calendar enable row level security;

create policy "Usuario ve solo su calendario"
  on outfit_calendar for all
  using (auth.uid() = user_id);

-- ── TABLA: user_settings ─────────────────────────────────────
create table if not exists user_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  avatar_url    text,
  display_name  text default 'Carolina',
  accent_color  text default '#C9956A',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table user_settings enable row level security;

create policy "Usuario ve solo sus settings"
  on user_settings for all
  using (auth.uid() = user_id);

-- ============================================================
-- STORAGE — Ejecutar después de crear los buckets manualmente
-- Buckets a crear en Storage > New bucket (public: ON):
--   closia-originals | closia-processed | closia-thumbnails
--   closia-outfits   | closia-avatars
-- ============================================================

-- Política de escritura en closia-originals
create policy "Solo el propietario puede subir originales"
  on storage.objects for insert
  with check (bucket_id = 'closia-originals' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Solo el propietario puede subir procesadas"
  on storage.objects for insert
  with check (bucket_id = 'closia-processed' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Solo el propietario puede subir thumbnails"
  on storage.objects for insert
  with check (bucket_id = 'closia-thumbnails' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Solo el propietario puede subir outfits"
  on storage.objects for insert
  with check (bucket_id = 'closia-outfits' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Solo el propietario puede subir avatares"
  on storage.objects for insert
  with check (bucket_id = 'closia-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

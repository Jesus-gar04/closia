import { supabase } from './supabase'

/* ─────────────────────────────────────────────────────────────
   Capa de datos CLOSIA — modo personal (identidad fija, sin login).
   Todos los dispositivos comparten el mismo user_id, así Carolina
   ve su armario, looks y agenda en celular y PC.
   Requiere ejecutar supabase_setup_personal.sql una vez.

   Diseño tolerante a fallos: si la nube no está configurada o falla
   (RLS sin aplicar, sin red), las funciones lanzan y los stores caen
   a su caché de localStorage, de modo que la app nunca se rompe.
   ───────────────────────────────────────────────────────────── */

export const CLOSIA_USER_ID = '00000000-0000-0000-0000-000000000001'

export const cloudHabilitado = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

const BUCKET = 'closia'

function uid() {
  return crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// ── Storage ────────────────────────────────────────────────────
function blobDesdeDataUrl(dataUrl) {
  const [cabecera, base64] = dataUrl.split(',')
  const mime = cabecera.match(/:(.*?);/)?.[1] ?? 'image/png'
  const bin = atob(base64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

async function subir(carpeta, nombre, blob, contentType) {
  const ruta = `${CLOSIA_USER_ID}/${carpeta}/${nombre}`
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, blob, { contentType, upsert: true })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl
}

/* Sube las imágenes de una prenda y devuelve URLs públicas. Acepta blobs o
   data URLs. Devuelve { image_processed_url, thumbnail_url, image_original_url }. */
export async function subirImagenesPrenda({ procesada, thumbnail }) {
  const blobProc = procesada instanceof Blob ? procesada : blobDesdeDataUrl(procesada)
  const blobThumb = thumbnail instanceof Blob ? thumbnail : blobDesdeDataUrl(thumbnail)
  const base = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const [urlProc, urlThumb] = await Promise.all([
    subir('prendas', `${base}.png`, blobProc, 'image/png'),
    subir('thumbs', `${base}.jpg`, blobThumb, 'image/jpeg'),
  ])
  return { image_processed_url: urlProc, image_original_url: urlProc, thumbnail_url: urlThumb }
}

export async function subirScreenshotOutfit(dataUrl) {
  const blob = dataUrl instanceof Blob ? dataUrl : blobDesdeDataUrl(dataUrl)
  return subir('outfits', `${Date.now()}.jpg`, blob, 'image/jpeg')
}

// ── Prendas ────────────────────────────────────────────────────
const COLS_PRENDA = [
  'id', 'name', 'body_zone', 'silhouette_type', 'category', 'styles',
  'image_original_url', 'image_processed_url', 'thumbnail_url',
  'dominant_color', 'size', 'brand', 'notes', 'favorite', 'times_worn', 'created_at',
  'fit_scale_x', 'fit_scale_y', 'fit_offset_x', 'fit_offset_y',
]

function filaPrenda(item) {
  const fila = { user_id: CLOSIA_USER_ID }
  for (const c of COLS_PRENDA) if (item[c] !== undefined) fila[c] = item[c]
  fila.silhouette_type = fila.silhouette_type || '' // columna NOT NULL
  fila.styles = fila.styles ?? []
  return fila
}

export async function dbListarPrendas() {
  const { data, error } = await supabase
    .from('clothing_items').select('*')
    .eq('user_id', CLOSIA_USER_ID).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function dbCrearPrenda(item) {
  const { data, error } = await supabase
    .from('clothing_items').insert(filaPrenda(item)).select().single()
  if (error) throw error
  return data
}

export async function dbActualizarPrenda(id, updates) {
  const { error } = await supabase.from('clothing_items').update(updates).eq('id', id)
  if (error) throw error
}

export async function dbEliminarPrenda(id) {
  const { error } = await supabase.from('clothing_items').delete().eq('id', id)
  if (error) throw error
}

// ── Outfits ────────────────────────────────────────────────────
export async function dbListarOutfits() {
  const { data, error } = await supabase
    .from('outfits').select('*')
    .eq('user_id', CLOSIA_USER_ID).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function dbCrearOutfit(o) {
  const fila = {
    id: o.id, user_id: CLOSIA_USER_ID, name: o.name,
    clothing_ids: o.clothing_ids ?? [], screenshot_url: o.screenshot_url ?? null,
    tags: o.tags ?? [], rating: o.rating ?? 0, notes: o.notes ?? '', created_at: o.created_at,
  }
  const { data, error } = await supabase.from('outfits').insert(fila).select().single()
  if (error) throw error
  return data
}

export async function dbEliminarOutfit(id) {
  const { error } = await supabase.from('outfits').delete().eq('id', id)
  if (error) throw error
}

export async function dbActualizarOutfit(id, updates) {
  const { error } = await supabase.from('outfits').update(updates).eq('id', id)
  if (error) throw error
}

export async function dbCalificarOutfit(id, rating) {
  const { error } = await supabase.from('outfits').update({ rating }).eq('id', id)
  if (error) throw error
}

// ── Calendario ─────────────────────────────────────────────────
export async function dbListarCalendario() {
  const { data, error } = await supabase
    .from('outfit_calendar').select('planned_date, outfit_id')
    .eq('user_id', CLOSIA_USER_ID)
  if (error) throw error
  const plan = {}
  for (const row of data ?? []) plan[row.planned_date] = row.outfit_id
  return plan
}

export async function dbAsignarDia(fecha, outfitId) {
  const { error } = await supabase.from('outfit_calendar')
    .upsert({ user_id: CLOSIA_USER_ID, planned_date: fecha, outfit_id: outfitId }, { onConflict: 'user_id,planned_date' })
  if (error) throw error
}

export async function dbQuitarDia(fecha) {
  const { error } = await supabase.from('outfit_calendar')
    .delete().eq('user_id', CLOSIA_USER_ID).eq('planned_date', fecha)
  if (error) throw error
}

// ── Categorías ─────────────────────────────────────────────────
export async function dbListarCategorias() {
  const { data, error } = await supabase
    .from('categories').select('name').eq('user_id', CLOSIA_USER_ID)
  if (error) throw error
  return (data ?? []).map((c) => c.name)
}

export async function dbCrearCategoria(name) {
  const { error } = await supabase.from('categories').insert({ id: uid(), user_id: CLOSIA_USER_ID, name })
  if (error) throw error
}

export async function dbEliminarCategoria(name) {
  const { error } = await supabase.from('categories').delete().eq('user_id', CLOSIA_USER_ID).eq('name', name)
  if (error) throw error
}

// ── Ajustes ────────────────────────────────────────────────────
export async function dbObtenerNombre() {
  const { data, error } = await supabase
    .from('user_settings').select('display_name').eq('user_id', CLOSIA_USER_ID).maybeSingle()
  if (error) throw error
  return data?.display_name ?? null
}

export async function dbGuardarNombre(display_name) {
  const { error } = await supabase.from('user_settings')
    .upsert({ user_id: CLOSIA_USER_ID, display_name }, { onConflict: 'user_id' })
  if (error) throw error
}

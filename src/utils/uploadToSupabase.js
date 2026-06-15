import { supabase } from '../lib/supabase'

export async function subirImagenesPrenda(userId, { original, procesada, thumbnail }) {
  if (!original || !procesada || !thumbnail) {
    throw new Error('Faltan imágenes para subir la prenda')
  }

  const base = `${userId}/${Date.now()}`

  const [resOrig, resProc, resThumb] = await Promise.all([
    supabase.storage.from('closia-originals')
      .upload(`${base}_original.jpg`, original, { contentType: 'image/jpeg', upsert: false }),
    supabase.storage.from('closia-processed')
      .upload(`${base}_procesada.png`, procesada, { contentType: 'image/png', upsert: false }),
    supabase.storage.from('closia-thumbnails')
      .upload(`${base}_thumb.jpg`, thumbnail, { contentType: 'image/jpeg', upsert: false }),
  ])

  if (resOrig.error || resProc.error || resThumb.error) {
    const detalle = resOrig.error?.message || resProc.error?.message || resThumb.error?.message
    throw new Error(detalle ? `Error subiendo imágenes: ${detalle}` : 'Error subiendo imágenes a Supabase Storage')
  }

  const obtenerUrl = (bucket, ruta) =>
    supabase.storage.from(bucket).getPublicUrl(ruta).data.publicUrl

  return {
    image_original_url: obtenerUrl('closia-originals', resOrig.data.path),
    image_processed_url: obtenerUrl('closia-processed', resProc.data.path),
    thumbnail_url: obtenerUrl('closia-thumbnails', resThumb.data.path),
  }
}

export async function subirScreenshotOutfit(userId, dataUrl) {
  const blob = dataUrlABlob(dataUrl)
  const ruta = `${userId}/${Date.now()}_outfit.jpg`
  const { data, error } = await supabase.storage
    .from('closia-outfits')
    .upload(ruta, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return supabase.storage.from('closia-outfits').getPublicUrl(data.path).data.publicUrl
}

export async function subirAvatarGlb(userId, archivoGlb) {
  const ruta = `${userId}/avatar.glb`
  const { data, error } = await supabase.storage
    .from('closia-avatars')
    .upload(ruta, archivoGlb, { contentType: 'model/gltf-binary', upsert: true })
  if (error) throw error
  return supabase.storage.from('closia-avatars').getPublicUrl(data.path).data.publicUrl
}

function dataUrlABlob(dataUrl) {
  const [cabecera, base64] = dataUrl.split(',')
  const tipoMime = cabecera.match(/:(.*?);/)[1]
  const binario = atob(base64)
  const array = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) array[i] = binario.charCodeAt(i)
  return new Blob([array], { type: tipoMime })
}

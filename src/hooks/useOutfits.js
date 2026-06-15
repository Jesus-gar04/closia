import { useCallback } from 'react'
import { useOutfitsStore } from '../store/outfitsStore'
import { cloudHabilitado, subirScreenshotOutfit } from '../lib/db'

/* Looks en Supabase (screenshot en Storage como URL) + caché localStorage. */
export function useOutfits() {
  const { outfits, addOutfit, updateOutfit, removeOutfit, rateOutfit } = useOutfitsStore()

  // La hidratación inicial la hace el store (useHydrateCloud); aquí es no-op.
  const cargarOutfits = useCallback(() => {}, [])

  const guardarOutfit = useCallback(async ({ nombre, clothingIds, screenshotUrl, tags, notas }) => {
    let screenshot = screenshotUrl ?? null
    if (cloudHabilitado && screenshot && screenshot.startsWith('data:')) {
      try { screenshot = await subirScreenshotOutfit(screenshot) }
      catch (e) { console.warn('[CLOSIA] Subida de screenshot falló:', e?.message ?? e) }
    }
    return addOutfit({
      name: nombre,
      clothing_ids: clothingIds ?? [],
      screenshot_url: screenshot,
      tags: tags ?? [],
      notes: notas ?? '',
    })
  }, [addOutfit])

  /* Actualiza un look existente (prendas, nombre, tags, miniatura). Solo reemplaza
     la miniatura si se capturó una nueva; si falla la captura, conserva la previa. */
  const actualizarOutfit = useCallback(async (id, { nombre, clothingIds, screenshotUrl, tags, notas }) => {
    const data = {
      name: nombre,
      clothing_ids: clothingIds ?? [],
      tags: tags ?? [],
      notes: notas ?? '',
    }
    let screenshot = screenshotUrl ?? null
    if (cloudHabilitado && screenshot && screenshot.startsWith('data:')) {
      try { screenshot = await subirScreenshotOutfit(screenshot) }
      catch (e) { console.warn('[CLOSIA] Subida de screenshot falló:', e?.message ?? e) }
    }
    if (screenshot != null) data.screenshot_url = screenshot
    updateOutfit(id, data)
  }, [updateOutfit])

  const eliminarOutfit = useCallback((id) => removeOutfit(id), [removeOutfit])
  const calificarOutfit = useCallback((id, rating) => rateOutfit(id, rating), [rateOutfit])

  return { outfits, cargando: false, cargarOutfits, guardarOutfit, actualizarOutfit, eliminarOutfit, calificarOutfit }
}

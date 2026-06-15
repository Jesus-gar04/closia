import { useCallback } from 'react'
import { useOutfitsStore } from '../store/outfitsStore'
import { cloudHabilitado, subirScreenshotOutfit } from '../lib/db'

/* Looks en Supabase (screenshot en Storage como URL) + caché localStorage. */
export function useOutfits() {
  const { outfits, addOutfit, removeOutfit, rateOutfit } = useOutfitsStore()

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

  const eliminarOutfit = useCallback((id) => removeOutfit(id), [removeOutfit])
  const calificarOutfit = useCallback((id, rating) => rateOutfit(id, rating), [rateOutfit])

  return { outfits, cargando: false, cargarOutfits, guardarOutfit, eliminarOutfit, calificarOutfit }
}

import { useCallback } from 'react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { cloudHabilitado, subirImagenesPrenda } from '../lib/db'

/* Guarda prendas en Supabase (imágenes en Storage como URL pública) con respaldo
   en localStorage. Si la nube no está disponible, conserva las imágenes como data
   URL para que la app siga funcionando offline. */

function uid() {
  return crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useWardrobe() {
  const { addItem, updateItem, removeItem, addCategory } = useWardrobeStore()

  const guardarPrenda = useCallback(async (datos) => {
    // Por defecto, usar las imágenes tal cual llegan (data URLs).
    let imgs = {
      image_processed_url: datos.image_processed_url,
      image_original_url: datos.image_original_url ?? datos.image_processed_url,
      thumbnail_url: datos.thumbnail_url,
    }
    // Si hay nube, subirlas a Storage y quedarnos con URLs públicas (ligeras,
    // disponibles en cualquier dispositivo).
    if (cloudHabilitado) {
      try {
        imgs = await subirImagenesPrenda({
          procesada: datos.image_processed_url,
          thumbnail: datos.thumbnail_url,
        })
      } catch (e) {
        console.warn('[CLOSIA] Subida de imágenes falló, uso data URLs locales:', e?.message ?? e)
      }
    }

    const item = {
      id: uid(),
      created_at: new Date().toISOString(),
      times_worn: 0,
      favorite: false,
      ...datos,
      ...imgs,
    }
    if (datos.category) addCategory(datos.category)
    addItem(item)
    return item
  }, [addItem, addCategory])

  const eliminarPrenda = useCallback(async (id) => { removeItem(id) }, [removeItem])

  const toggleFavorita = useCallback(async (id, estadoActual) => {
    updateItem(id, { favorite: !estadoActual })
  }, [updateItem])

  return { guardarPrenda, eliminarPrenda, toggleFavorita }
}

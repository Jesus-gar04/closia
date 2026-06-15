import { create } from 'zustand'
import {
  cloudHabilitado, dbListarPrendas, dbCrearPrenda, dbActualizarPrenda, dbEliminarPrenda,
  dbListarCategorias, dbCrearCategoria, dbEliminarCategoria,
} from '../lib/db'

/* Persistencia: Supabase es la fuente de verdad (sincroniza entre dispositivos).
   localStorage actúa como caché para arranque instantáneo y respaldo offline.
   Las escrituras son optimistas (UI primero) y se replican a la nube en segundo
   plano; si la nube falla, la app sigue funcionando con la caché local. */

const LS_KEY = 'closia.categories.v1'
const LS_ITEMS = 'closia.items.v1'

const CATEGORIAS_SEMILLA = ['Diario', 'Trabajo', 'Salir', 'Fin de semana', 'Especial']

function leerLS(clave, fallback) {
  try { const r = localStorage.getItem(clave); if (r) return JSON.parse(r) } catch { /* noop */ }
  return fallback
}
function escribirLS(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* noop (cuota) */ }
}

// Replica en la nube sin bloquear la UI; registra fallos sin romper la app.
function nube(promesa) {
  if (!cloudHabilitado) return
  Promise.resolve(promesa).catch((e) => console.warn('[CLOSIA] Sync nube falló:', e?.message ?? e))
}

export const useWardrobeStore = create((set, get) => ({
  items: leerLS(LS_ITEMS, []),
  categories: leerLS(LS_KEY, CATEGORIAS_SEMILLA),
  hidratado: false,
  filters: {
    bodyZone: 'all', category: 'all', style: 'all',
    search: '', sort: 'newest', favoritesOnly: false,
  },

  /* Carga inicial desde la nube (reemplaza la caché si hay datos). */
  hidratar: async () => {
    if (!cloudHabilitado) { set({ hidratado: true }); return }
    try {
      const [items, cats] = await Promise.all([dbListarPrendas(), dbListarCategorias()])
      // La nube viene vacía pero hay datos locales → primera sincronización:
      // migramos lo local a la nube en vez de borrarlo (evita pérdida de datos).
      const locales = get().items
      if (items.length === 0 && locales.length > 0) {
        for (const it of locales) nube(dbCrearPrenda(it))
        set({ hidratado: true })
        return
      }
      escribirLS(LS_ITEMS, items)
      const fusionadas = Array.from(new Set([...(cats ?? []), ...items.map((i) => i.category).filter(Boolean)]))
      const categories = fusionadas.length ? fusionadas : get().categories
      escribirLS(LS_KEY, categories)
      set({ items, categories, hidratado: true })
    } catch (e) {
      console.warn('[CLOSIA] No se pudo cargar el armario desde la nube:', e?.message ?? e)
      set({ hidratado: true })
    }
  },

  setItems: (items) => { escribirLS(LS_ITEMS, items); set({ items }) },

  addItem: (item) => {
    set((s) => { const next = [item, ...s.items]; escribirLS(LS_ITEMS, next); return { items: next } })
    nube(dbCrearPrenda(item))
  },

  updateItem: (id, updates) => {
    set((s) => {
      const next = s.items.map((i) => (i.id === id ? { ...i, ...updates } : i))
      escribirLS(LS_ITEMS, next); return { items: next }
    })
    nube(dbActualizarPrenda(id, updates))
  },

  removeItem: (id) => {
    set((s) => { const next = s.items.filter((i) => i.id !== id); escribirLS(LS_ITEMS, next); return { items: next } })
    nube(dbEliminarPrenda(id))
  },

  /* Vacía todo el armario (local + nube). */
  vaciarPrendas: async () => {
    const ids = get().items.map((i) => i.id)
    escribirLS(LS_ITEMS, []); set({ items: [] })
    for (const id of ids) nube(dbEliminarPrenda(id))
  },

  /* ── Categorías ── */
  getCategories: () => {
    const { categories, items } = get()
    const deItems = items.map((i) => i.category).filter(Boolean)
    return Array.from(new Set([...categories, ...deItems]))
  },

  addCategory: (nombre) => {
    const limpio = (nombre ?? '').trim()
    if (!limpio) return
    let creada = false
    set((s) => {
      if (s.categories.some((c) => c.toLowerCase() === limpio.toLowerCase())) return s
      creada = true
      const next = [...s.categories, limpio]; escribirLS(LS_KEY, next); return { categories: next }
    })
    if (creada) nube(dbCrearCategoria(limpio))
  },

  removeCategory: (nombre) => {
    set((s) => { const next = s.categories.filter((c) => c !== nombre); escribirLS(LS_KEY, next); return { categories: next } })
    nube(dbEliminarCategoria(nombre))
  },

  /* ── Filtros ── */
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({
    filters: { bodyZone: 'all', category: 'all', style: 'all', search: '', sort: 'newest', favoritesOnly: false },
  }),

  getFilteredItems: () => {
    const { items, filters } = get()
    return items
      .filter((item) => {
        if (filters.bodyZone !== 'all' && item.body_zone !== filters.bodyZone) return false
        if (filters.category !== 'all' && item.category !== filters.category) return false
        if (filters.style !== 'all' && !(item.styles ?? []).includes(filters.style)) return false
        if (filters.favoritesOnly && !item.favorite) return false
        if (filters.search) {
          const q = filters.search.toLowerCase()
          return item.name.toLowerCase().includes(q) ||
                 item.brand?.toLowerCase().includes(q) ||
                 item.notes?.toLowerCase().includes(q)
        }
        return true
      })
      .sort((a, b) => {
        if (filters.sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
        if (filters.sort === 'most_worn') return (b.times_worn ?? 0) - (a.times_worn ?? 0)
        if (filters.sort === 'name') return a.name.localeCompare(b.name)
        return 0
      })
  },
}))

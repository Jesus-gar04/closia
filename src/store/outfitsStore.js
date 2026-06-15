import { create } from 'zustand'
import { cloudHabilitado, dbListarOutfits, dbCrearOutfit, dbEliminarOutfit, dbCalificarOutfit, dbActualizarOutfit } from '../lib/db'

/* Supabase como fuente de verdad + caché localStorage (ver wardrobeStore). */
const LS = 'closia.outfits.v1'

function leer() { try { const r = localStorage.getItem(LS); if (r) return JSON.parse(r) } catch { /* noop */ } return [] }
function escribir(o) { try { localStorage.setItem(LS, JSON.stringify(o)) } catch { /* noop */ } }
function uid() { return crypto?.randomUUID?.() ?? `o-${Date.now()}-${Math.random().toString(36).slice(2)}` }
function nube(p) { if (cloudHabilitado) Promise.resolve(p).catch((e) => console.warn('[CLOSIA] Sync outfits:', e?.message ?? e)) }

export const useOutfitsStore = create((set) => ({
  outfits: leer(),
  hidratado: false,

  hidratar: async () => {
    if (!cloudHabilitado) { set({ hidratado: true }); return }
    try {
      const outfits = await dbListarOutfits()
      // No borrar caché local si la nube viene vacía (migrar lo local).
      const locales = useOutfitsStore.getState().outfits
      if (outfits.length === 0 && locales.length > 0) {
        for (const o of locales) nube(dbCrearOutfit(o))
        set({ hidratado: true })
        return
      }
      escribir(outfits); set({ outfits, hidratado: true })
    } catch (e) {
      console.warn('[CLOSIA] No se pudieron cargar los looks:', e?.message ?? e)
      set({ hidratado: true })
    }
  },

  addOutfit: (data) => {
    const o = { id: uid(), created_at: new Date().toISOString(), rating: 0, ...data }
    set((s) => { const next = [o, ...s.outfits]; escribir(next); return { outfits: next } })
    nube(dbCrearOutfit(o))
    return o
  },

  updateOutfit: (id, data) => {
    set((s) => { const next = s.outfits.map((o) => (o.id === id ? { ...o, ...data } : o)); escribir(next); return { outfits: next } })
    nube(dbActualizarOutfit(id, data))
  },

  removeOutfit: (id) => {
    set((s) => { const next = s.outfits.filter((o) => o.id !== id); escribir(next); return { outfits: next } })
    nube(dbEliminarOutfit(id))
  },

  rateOutfit: (id, rating) => {
    set((s) => { const next = s.outfits.map((o) => (o.id === id ? { ...o, rating } : o)); escribir(next); return { outfits: next } })
    nube(dbCalificarOutfit(id, rating))
  },
}))

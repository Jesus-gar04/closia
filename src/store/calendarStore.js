import { create } from 'zustand'
import { cloudHabilitado, dbListarCalendario, dbAsignarDia, dbQuitarDia } from '../lib/db'

/* Supabase como fuente de verdad + caché localStorage. plan = { 'YYYY-MM-DD': outfitId } */
const LS = 'closia.calendar.v1'
function leer() { try { const r = localStorage.getItem(LS); if (r) return JSON.parse(r) } catch { /* noop */ } return {} }
function escribir(p) { try { localStorage.setItem(LS, JSON.stringify(p)) } catch { /* noop */ } }
function nube(p) { if (cloudHabilitado) Promise.resolve(p).catch((e) => console.warn('[CLOSIA] Sync agenda:', e?.message ?? e)) }

export const useCalendarStore = create((set) => ({
  plan: leer(),
  hidratado: false,

  hidratar: async () => {
    if (!cloudHabilitado) { set({ hidratado: true }); return }
    try {
      const plan = await dbListarCalendario()
      escribir(plan); set({ plan, hidratado: true })
    } catch (e) {
      console.warn('[CLOSIA] No se pudo cargar la agenda:', e?.message ?? e)
      set({ hidratado: true })
    }
  },

  asignar: (fechaStr, outfitId) => {
    set((s) => { const next = { ...s.plan, [fechaStr]: outfitId }; escribir(next); return { plan: next } })
    nube(dbAsignarDia(fechaStr, outfitId))
  },

  quitar: (fechaStr) => {
    set((s) => { const next = { ...s.plan }; delete next[fechaStr]; escribir(next); return { plan: next } })
    nube(dbQuitarDia(fechaStr))
  },
}))

import { create } from 'zustand'

/* Mapa zona del cuerpo (body_zone de la prenda) → slot del outfit */
export const ZONE_TO_SLOT = {
  torso: 'top',
  legs: 'bottom',
  dress: 'dress',
  outer: 'outer',
  feet: 'shoes',
  head: 'head',
  neck: 'neck',
  wrist: 'wrist',
  accessory: 'bag',
}

export const BODY_ZONES = {
  head:      { label: 'Cabeza',  slot: 'head' },
  neck:      { label: 'Cuello',  slot: 'neck' },
  torso:     { label: 'Torso',   slot: 'top' },
  wrist:     { label: 'Muñeca',  slot: 'wrist' },
  legs:      { label: 'Piernas', slot: 'bottom' },
  dress:     { label: 'Vestido', slot: 'dress' },
  outer:     { label: 'Abrigo',  slot: 'outer' },
  feet:      { label: 'Calzado', slot: 'shoes' },
  accessory: { label: 'Bolso',   slot: 'bag' },
}

const OUTFIT_VACIO = {
  head: null, neck: null, top: null, wrist: null,
  bottom: null, dress: null, outer: null, shoes: null, bag: null,
}

export const useAvatarStore = create((set, get) => ({
  currentOutfit: { ...OUTFIT_VACIO },
  pose: 'idle',

  setSlot: (slot, item) => set((s) => ({ currentOutfit: { ...s.currentOutfit, [slot]: item } })),
  clearSlot: (slot) => set((s) => ({ currentOutfit: { ...s.currentOutfit, [slot]: null } })),
  clearAll: () => set({ currentOutfit: { ...OUTFIT_VACIO } }),

  /* Pone/quita una prenda gestionando la exclusión vestido ↔ top/bottom */
  togglePrenda: (item) => {
    const slot = ZONE_TO_SLOT[item.body_zone]
    if (!slot) return
    const { currentOutfit } = get()
    const yaPuesta = currentOutfit[slot]?.id === item.id

    set((s) => {
      const next = { ...s.currentOutfit }
      if (yaPuesta) {
        next[slot] = null
        return { currentOutfit: next }
      }
      next[slot] = item
      if (slot === 'dress') { next.top = null; next.bottom = null }
      if (slot === 'top' || slot === 'bottom') { next.dress = null }
      return { currentOutfit: next }
    })
  },

  /* Ajuste fino del render 3D de una prenda puesta (escala/offset por prenda).
     Muta la copia en currentOutfit para que el avatar se re-renderice en vivo;
     la persistencia (local + nube) la hace el editor vía wardrobeStore.updateItem. */
  ajustarPrendaPuesta: (itemId, updates) => set((s) => {
    const next = { ...s.currentOutfit }
    for (const slot of Object.keys(next)) {
      if (next[slot]?.id === itemId) next[slot] = { ...next[slot], ...updates }
    }
    return { currentOutfit: next }
  }),

  setPose: (pose) => set({ pose }),
}))

import { create } from 'zustand'

export const useUIStore = create((set) => ({
  uploadModalOpen: false,
  saveOutfitModalOpen: false,
  selectedItem: null,
  // Look que se está editando (objeto outfit) o null si se está creando uno nuevo.
  editingOutfit: null,

  openUpload: () => set({ uploadModalOpen: true }),
  closeUpload: () => set({ uploadModalOpen: false }),
  openSaveOutfit: () => set({ saveOutfitModalOpen: true }),
  closeSaveOutfit: () => set({ saveOutfitModalOpen: false }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  // Entra/sale del modo edición de un look.
  startEditOutfit: (outfit) => set({ editingOutfit: outfit }),
  cancelEditOutfit: () => set({ editingOutfit: null }),
}))

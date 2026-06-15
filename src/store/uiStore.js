import { create } from 'zustand'

export const useUIStore = create((set) => ({
  uploadModalOpen: false,
  saveOutfitModalOpen: false,
  selectedItem: null,

  openUpload: () => set({ uploadModalOpen: true }),
  closeUpload: () => set({ uploadModalOpen: false }),
  openSaveOutfit: () => set({ saveOutfitModalOpen: true }),
  closeSaveOutfit: () => set({ saveOutfitModalOpen: false }),
  setSelectedItem: (item) => set({ selectedItem: item }),
}))

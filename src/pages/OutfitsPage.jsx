import { OutfitGallery } from '../components/outfits/OutfitGallery'

export function OutfitsPage() {
  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="px-6 md:px-10 pt-8 pb-4">
        <p className="eyebrow">Tus combinaciones</p>
        <h1 className="title-xl text-ink mt-1.5">Mis looks</h1>
        <p className="text-[12.5px] text-muted mt-2">Guardados, calificados y favoritos</p>
      </div>
      <OutfitGallery />
    </div>
  )
}

import { WardrobeGrid } from '../components/wardrobe/WardrobeGrid'
import { useWardrobeStore } from '../store/wardrobeStore'

export function WardrobePage() {
  const { items } = useWardrobeStore()

  return (
    <div className="h-full flex flex-col overflow-hidden bg-canvas">
      <div className="px-6 md:px-10 pt-8 pb-4 flex-shrink-0">
        <p className="eyebrow">Tu colección</p>
        <div className="flex items-end justify-between flex-wrap gap-3 mt-1.5">
          <h1 className="title-xl text-ink">Guardarropa</h1>
          <p className="text-[12.5px] text-muted">
            {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
          </p>
        </div>
      </div>
      <WardrobeGrid cargando={false} />
    </div>
  )
}

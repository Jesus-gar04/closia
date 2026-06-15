import { useWardrobeStore } from '../../store/wardrobeStore'
import { ClothingCard } from './ClothingCard'
import { FilterBar } from './FilterBar'
import { EmptyWardrobe } from './EmptyWardrobe'
import { SkeletonTarjeta } from '../ui/Skeleton'

export function WardrobeGrid({ cargando }) {
  const { getFilteredItems, items } = useWardrobeStore()
  const prendas = getFilteredItems()

  if (cargando) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <FilterBar />
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 content-start auto-rows-min">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonTarjeta key={i} />)}
        </div>
      </div>
    )
  }

  if (items.length === 0) return <EmptyWardrobe />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterBar />
      {prendas.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <p className="text-ink-soft text-[14px] font-medium">No encontramos nada</p>
            <p className="text-muted text-[12.5px] mt-1">Prueba con otros filtros</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start auto-rows-min">
          {prendas.map((prenda) => (
            <ClothingCard key={prenda.id} prenda={prenda} />
          ))}
        </div>
      )}
    </div>
  )
}

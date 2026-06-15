import { useEffect } from 'react'
import { useOutfits } from '../../hooks/useOutfits'
import { OutfitCard } from './OutfitCard'
import { SkeletonTarjeta } from '../ui/Skeleton'

export function OutfitGallery() {
  const { outfits, cargando, cargarOutfits } = useOutfits()
  useEffect(() => { cargarOutfits() }, [cargarOutfits])

  if (cargando) {
    return (
      <div className="px-6 md:px-10 pb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonTarjeta key={i} />)}
      </div>
    )
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-8">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full bg-accent-soft" />
          <div className="absolute inset-3 rounded-full bg-danger-soft" />
          <div className="absolute inset-6 rounded-full bg-accent-soft flex items-center justify-center text-accent-deep text-[26px]">★</div>
        </div>
        <h3 className="text-[22px] font-bold text-ink tracking-tight mb-2">Aún no hay looks</h3>
        <p className="text-muted text-[13.5px] max-w-xs">Crea un outfit en el avatar y guárdalo para verlo aquí.</p>
      </div>
    )
  }

  return (
    <div className="px-6 md:px-10 pb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
    </div>
  )
}

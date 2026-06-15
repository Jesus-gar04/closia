import { useState } from 'react'
import { useOutfits } from '../../hooks/useOutfits'
import clsx from 'clsx'

export function OutfitCard({ outfit }) {
  const { calificarOutfit, eliminarOutfit } = useOutfits()
  const [confirmar, setConfirmar] = useState(false)

  return (
    <div className="bg-surface rounded-md border border-hairline overflow-hidden hover:shadow-card hover:border-accent/30 group">
      <div className="aspect-[3/4] bg-tinted relative overflow-hidden">
        {outfit.screenshot_url ? (
          <img src={outfit.screenshot_url} alt={outfit.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-accent-deep text-[22px]">★</div>
          </div>
        )}
        <button
          onClick={() => setConfirmar(true)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-canvas/95 flex items-center justify-center text-[13px] text-muted hover:text-danger opacity-0 group-hover:opacity-100"
        >
          ✕
        </button>
      </div>

      <div className="p-3.5 space-y-2">
        <p className="text-[13px] font-medium text-ink truncate">{outfit.name}</p>

        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((e) => (
            <button
              key={e}
              onClick={() => calificarOutfit(outfit.id, e === outfit.rating ? 0 : e)}
              className={clsx(
                'text-[15px]',
                e <= outfit.rating ? 'text-accent' : 'text-hairline hover:text-accent/60'
              )}
            >
              ★
            </button>
          ))}
        </div>

        {outfit.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {outfit.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-tinted text-muted text-[10.5px] rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {confirmar && (
        <div className="px-3.5 pb-3.5 flex gap-2">
          <button onClick={() => eliminarOutfit(outfit.id)} className="flex-1 py-1.5 bg-danger text-canvas text-[11.5px] rounded-sm font-medium">
            Eliminar
          </button>
          <button onClick={() => setConfirmar(false)} className="flex-1 py-1.5 bg-tinted hover:bg-deep text-ink-soft text-[11.5px] rounded-sm">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

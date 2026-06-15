import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useOutfits } from '../../hooks/useOutfits'
import { useAvatarStore } from '../../store/avatarStore'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { useUIStore } from '../../store/uiStore'
import clsx from 'clsx'

export function OutfitCard({ outfit }) {
  const { calificarOutfit, eliminarOutfit } = useOutfits()
  const vestirOutfit = useAvatarStore((s) => s.vestirOutfit)
  const startEditOutfit = useUIStore((s) => s.startEditOutfit)
  const cancelEditOutfit = useUIStore((s) => s.cancelEditOutfit)
  const navigate = useNavigate()
  const [confirmar, setConfirmar] = useState(false)

  // Resuelve las clothing_ids del look a prendas del armario (omite las borradas).
  const resolverPrendas = () => {
    const ids = outfit.clothing_ids ?? []
    const items = useWardrobeStore.getState().items
    const prendas = ids.map((id) => items.find((i) => i.id === id)).filter(Boolean)
    return { ids, prendas }
  }

  // Viste el avatar con las prendas del look y navega a la vista del avatar.
  const probarLook = () => {
    const { ids, prendas } = resolverPrendas()
    if (prendas.length === 0) {
      toast.error('Las prendas de este look ya no están en tu armario')
      return
    }
    vestirOutfit(prendas)
    cancelEditOutfit() // probar es solo "vestir", no editar: sale de cualquier edición previa
    if (prendas.length < ids.length) toast('Algunas prendas ya no están disponibles', { icon: '⚠️' })
    navigate('/avatar')
  }

  // Igual que probar, pero entra en modo edición: al guardar se actualiza este look.
  const editarLook = (e) => {
    e.stopPropagation()
    const { prendas } = resolverPrendas()
    vestirOutfit(prendas)
    startEditOutfit(outfit)
    navigate('/avatar')
  }

  return (
    <div className="bg-surface rounded-md border border-hairline overflow-hidden hover:shadow-card hover:border-accent/30 group">
      <button
        type="button"
        onClick={probarLook}
        title="Probar este look en el avatar"
        className="aspect-[3/4] w-full bg-tinted relative overflow-hidden block cursor-pointer"
      >
        {outfit.screenshot_url ? (
          <img src={outfit.screenshot_url} alt={outfit.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-accent-deep text-[22px]">★</div>
          </div>
        )}

        {/* Overlay "Probar look" al pasar el cursor */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/95 text-ink text-[12px] font-medium shadow-card">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6a2 2 0 0 1 2 2c0 1-1 1.6-1 2.4L21 15H3l8-4.6c0-.8-1-1.4-1-2.4a2 2 0 0 1 2-2z" />
            </svg>
            Probar look
          </span>
        </div>

        <span className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100">
          <span
            role="button"
            tabIndex={0}
            title="Editar este look"
            onClick={editarLook}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') editarLook(e) }}
            className="w-8 h-8 rounded-full bg-canvas/95 flex items-center justify-center text-muted hover:text-accent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </span>
          <span
            role="button"
            tabIndex={0}
            title="Eliminar este look"
            onClick={(e) => { e.stopPropagation(); setConfirmar(true) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setConfirmar(true) } }}
            className="w-8 h-8 rounded-full bg-canvas/95 flex items-center justify-center text-[13px] text-muted hover:text-danger"
          >
            ✕
          </span>
        </span>
      </button>

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

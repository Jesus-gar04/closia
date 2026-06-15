import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAvatarStore, BODY_ZONES } from '../../store/avatarStore'
import { useWardrobe } from '../../hooks/useWardrobe'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export function ClothingCard({ prenda }) {
  const navigate = useNavigate()
  const { setSlot } = useAvatarStore()
  const { toggleFavorita, eliminarPrenda } = useWardrobe()
  const [hover, setHover] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  const vestir = (e) => {
    e.stopPropagation()
    const zona = BODY_ZONES[prenda.body_zone]
    if (zona) {
      setSlot(zona.slot, prenda)
      toast.success(`${prenda.name} puesta`)
      navigate('/avatar')
    }
  }

  const eliminar = async (e) => {
    e.stopPropagation()
    try { await eliminarPrenda(prenda.id); toast.success('Prenda eliminada') }
    catch { toast.error('No se pudo eliminar') }
  }

  return (
    <div
      className="group bg-surface rounded-[16px] border border-hairline shadow-[var(--shadow-xs)] overflow-hidden transition-all hover:shadow-[var(--shadow-md)] hover:border-accent/30 hover:-translate-y-0.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmar(false) }}
    >
      <div className="relative aspect-square bg-tinted">
        <img
          src={prenda.thumbnail_url}
          alt={prenda.name}
          loading="lazy"
          className="w-full h-full object-cover mix-blend-multiply"
        />
        {prenda.dominant_color && (
          <div
            className="absolute bottom-2.5 right-2.5 w-5 h-5 rounded-full border-2 border-surface shadow-soft"
            style={{ backgroundColor: prenda.dominant_color }}
          />
        )}

        {prenda.favorite && (
          <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-canvas/95 flex items-center justify-center text-danger text-[12px]">★</div>
        )}

        <div className={clsx(
          'absolute inset-0 bg-ink/40 flex flex-col items-center justify-center gap-2.5',
          hover ? 'opacity-100' : 'opacity-0'
        )} style={{ transition: 'opacity .15s' }}>
          <button
            onClick={vestir}
            className="px-4 py-2 bg-canvas text-ink rounded-md text-[12px] font-medium shadow-card hover:bg-accent-soft"
          >
            Vestir avatar
          </button>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorita(prenda.id, prenda.favorite) }}
              className="w-8 h-8 rounded-full bg-canvas/95 hover:bg-canvas flex items-center justify-center text-[14px] text-danger"
            >
              {prenda.favorite ? '★' : '☆'}
            </button>
            {!confirmar ? (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmar(true) }}
                className="w-8 h-8 rounded-full bg-canvas/95 hover:bg-danger-soft flex items-center justify-center text-muted hover:text-danger"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" />
                </svg>
              </button>
            ) : (
              <button
                onClick={eliminar}
                className="px-2 h-8 rounded-full bg-danger text-canvas text-[11px] font-medium"
              >
                Confirmar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-[13.5px] font-semibold text-ink truncate">{prenda.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11.5px] text-faint truncate flex-1">{prenda.category}</p>
          {prenda.times_worn > 0 && (
            <span className="text-[10.5px] text-accent-deep tabular-nums font-medium">{prenda.times_worn}×</span>
          )}
        </div>
      </div>
    </div>
  )
}

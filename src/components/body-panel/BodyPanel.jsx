import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAvatarStore, ZONE_TO_SLOT } from '../../store/avatarStore'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { useUIStore } from '../../store/uiStore'
import clsx from 'clsx'

/* Estudio Vestir — constructor de look.
   Fichas de cada parte del cuerpo (llenas o vacías) = resumen + selector.
   Debajo, las prendas disponibles para la parte elegida. */

function Icono({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  )
}

const PARTES = [
  {
    id: 'torso', label: 'Torso', verSlots: ['top'], zonas: ['torso'],
    icon: <Icono d={<path d="M8 4l-4 3 1.5 3L7 9v11h10V9l1.5 1L20 7l-4-3-2 2h-4z" />} />,
  },
  {
    id: 'legs', label: 'Inferior', verSlots: ['dress', 'bottom'], zonas: ['legs', 'dress'],
    icon: <Icono d={<path d="M8 3h8l-.5 8L14 21h-2l-1-9-1 9H8l-.5-10z" />} />,
  },
  {
    id: 'outer', label: 'Abrigo', verSlots: ['outer'], zonas: ['outer'],
    icon: <Icono d={<path d="M9 3L4 6v14h5V11M15 3l5 3v14h-5V11M9 3l3 3 3-3" />} />,
  },
  {
    id: 'feet', label: 'Calzado', verSlots: ['shoes'], zonas: ['feet'],
    icon: <Icono d={<path d="M4 7h4l1 6 6 2v3H4zM15 7h2v6" />} />,
  },
  {
    id: 'acc', label: 'Extras', verSlots: ['bag', 'neck', 'wrist', 'head'], zonas: ['accessory', 'neck', 'wrist', 'head'],
    icon: <Icono d={<path d="M5 9h14l-1 11H6zM9 9V7a3 3 0 0 1 6 0v2" />} />,
  },
]

export function BodyPanel({ onClose }) {
  const { currentOutfit, togglePrenda, clearAll } = useAvatarStore()
  const { items } = useWardrobeStore()
  const { openUpload } = useUIStore()
  const [activa, setActiva] = useState('torso')

  const parte = PARTES.find((p) => p.id === activa) ?? PARTES[0]
  const prendas = useMemo(() => items.filter((i) => parte.zonas.includes(i.body_zone)), [items, parte])
  const equipadas = Object.values(currentOutfit).filter(Boolean)
  const estaPuesta = (item) => currentOutfit[ZONE_TO_SLOT[item.body_zone]]?.id === item.id
  const prendaDeParte = (p) => { for (const s of p.verSlots) if (currentOutfit[s]) return currentOutfit[s]; return null }

  const armarioVacio = items.length === 0

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface md:border-l md:border-hairline">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between flex-shrink-0">
        <div>
          <p className="eyebrow">Estudio</p>
          <h2 className="title-lg text-ink mt-1">Vestir</h2>
          <p className="text-[12.5px] text-muted mt-1">
            {equipadas.length === 0 ? 'Compón tu look' : `${equipadas.length} ${equipadas.length === 1 ? 'prenda puesta' : 'prendas puestas'}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {equipadas.length > 0 && (
            <button onClick={clearAll} className="btn btn-ghost btn-sm text-muted hover:text-danger">
              Limpiar
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Fichas de partes del cuerpo (resumen + selector) */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="grid grid-cols-5 gap-1.5">
          {PARTES.map((p) => {
            const item = prendaDeParte(p)
            const sel = activa === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActiva(p.id)}
                className={clsx(
                  'group relative flex flex-col items-center gap-1.5 pt-2 pb-2 px-0.5 rounded-[13px] border transition-all min-w-0',
                  sel ? 'border-accent bg-accent-tint shadow-[var(--shadow-xs)]' : 'border-hairline bg-canvas hover:border-accent/40'
                )}
              >
                <span className={clsx(
                  'relative w-11 h-11 rounded-[10px] overflow-hidden flex items-center justify-center',
                  item ? 'ring-1 ring-black/5' : sel ? 'text-accent-deep' : 'text-muted'
                )} style={item ? { background: (item.dominant_color ?? '#E7DFD1') + '22' } : { background: 'var(--bg-tinted)' }}>
                  {item ? (
                    <>
                      <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                      <span
                        onClick={(e) => { e.stopPropagation(); togglePrenda(item) }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ink text-white flex items-center justify-center shadow-[var(--shadow-sm)]"
                        title="Quitar"
                      >
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
                      </span>
                    </>
                  ) : p.icon}
                </span>
                <span className={clsx('text-[10px] font-semibold leading-none truncate max-w-full', sel ? 'text-accent-deep' : 'text-muted')}>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="divider mx-5 flex-shrink-0" />

      {/* Selector de prendas */}
      {armarioVacio ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-[230px]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-soft flex items-center justify-center text-accent-deep">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6a2 2 0 0 1 2 2c0 1-1 1.6-1 2.4L21 15H3l8-4.6c0-.8-1-1.4-1-2.4a2 2 0 0 1 2-2z" />
                <path d="M3 15v3.5A1.5 1.5 0 0 0 4.5 20h15a1.5 1.5 0 0 0 1.5-1.5V15" />
              </svg>
            </div>
            <h3 className="font-display text-[18px] font-semibold text-ink">Empieza tu armario</h3>
            <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed">
              Sube tu primera prenda y empieza a vestir el avatar al instante.
            </p>
            <button onClick={openUpload} className="btn btn-primary mt-5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
              Añadir prenda
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12.5px] font-semibold text-ink-soft">{parte.label}</p>
            <span className="text-[11px] text-faint">{prendas.length} {prendas.length === 1 ? 'opción' : 'opciones'}</span>
          </div>

          {prendas.length === 0 ? (
            <div className="rounded-[15px] border border-dashed border-line-strong bg-canvas/50 px-4 py-8 text-center">
              <p className="text-[12.5px] text-ink-soft font-semibold">Nada en «{parte.label}»</p>
              <p className="text-[11.5px] text-muted mt-1 mb-4">Aún no subes prendas para esta parte.</p>
              <button onClick={openUpload} className="btn btn-outline btn-sm">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
                Añadir prenda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {prendas.map((item) => {
                  const puesta = estaPuesta(item)
                  return (
                    <motion.button
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => togglePrenda(item)}
                      className={clsx(
                        'group relative rounded-[14px] overflow-hidden border text-left transition-all active:scale-[0.98]',
                        puesta ? 'border-accent shadow-[var(--ring)]' : 'border-hairline shadow-[var(--shadow-xs)] hover:border-accent/40 hover:shadow-[var(--shadow-sm)]'
                      )}
                    >
                      <div className="aspect-square overflow-hidden" style={{ background: (item.dominant_color ?? '#E7DFD1') + '22' }}>
                        <img src={item.thumbnail_url} alt={item.name} loading="lazy" className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      {puesta && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-soft">
                          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l2.5 2.5L10 3.5" /></svg>
                        </span>
                      )}
                      <div className="px-2.5 py-2 bg-surface">
                        <p className={clsx('text-[12px] font-semibold truncate', puesta ? 'text-accent-deep' : 'text-ink')}>{item.name}</p>
                        <p className="text-[10.5px] text-faint truncate mt-0.5">{item.category}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

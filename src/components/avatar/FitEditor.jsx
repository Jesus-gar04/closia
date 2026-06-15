import { useState } from 'react'
import clsx from 'clsx'
import { useAvatarStore } from '../../store/avatarStore'
import { useWardrobeStore } from '../../store/wardrobeStore'

/* Editor de ajuste fino por prenda. Sobre el canvas del avatar: permite mover y
   escalar la prenda puesta hasta cuadrarla con el cuerpo. Cada cambio se aplica en
   vivo (avatarStore) y se guarda en la prenda (wardrobeStore → local + nube), de
   modo que el ajuste se conserva aunque luego se cambie la silueta o se quite/ponga. */

const PASO_OFFSET = 0.02 // unidades de mundo por pulsación de flecha
const PASO_ESCALA = 0.05
const LIM_OFFSET = 0.6
const ESCALA_MIN = 0.4
const ESCALA_MAX = 2.5

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const r3 = (v) => Math.round(v * 1000) / 1000 // evita deriva de coma flotante

// fit actual de una prenda (columnas fit_*) con sus valores por defecto.
function leerFit(item) {
  return {
    fit_scale_x: item?.fit_scale_x ?? 1,
    fit_scale_y: item?.fit_scale_y ?? 1,
    fit_offset_x: item?.fit_offset_x ?? 0,
    fit_offset_y: item?.fit_offset_y ?? 0,
  }
}

function Flecha({ dir, onClick }) {
  const rot = { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 }[dir]
  return (
    <button onClick={onClick} className="btn btn-outline btn-icon btn-sm" aria-label={`Mover ${dir}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}

function ParEscala({ etiqueta, onMenos, onMas }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted w-10">{etiqueta}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={onMenos} className="btn btn-outline btn-icon btn-sm" aria-label={`${etiqueta} menos`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
        <button onClick={onMas} className="btn btn-outline btn-icon btn-sm" aria-label={`${etiqueta} más`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
    </div>
  )
}

function IcnAjuste() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  )
}

export function FitEditor() {
  const { currentOutfit, ajustarPrendaPuesta } = useAvatarStore()
  const updateItem = useWardrobeStore((s) => s.updateItem)
  const [abierto, setAbierto] = useState(false)
  const [selId, setSelId] = useState(null)

  const puestas = Object.values(currentOutfit).filter(Boolean)
  if (puestas.length === 0) return null

  // Prenda seleccionada (por defecto la primera puesta).
  const sel = puestas.find((p) => p.id === selId) ?? puestas[0]
  const fit = leerFit(sel)

  // Aplica updates (columnas fit_*) en vivo y los persiste en la prenda.
  const aplicar = (updates) => {
    ajustarPrendaPuesta(sel.id, updates)
    updateItem(sel.id, updates)
  }
  // Lee el fit MÁS RECIENTE del store (no el snapshot del render) para que varias
  // pulsaciones rápidas seguidas acumulen en vez de pisar el mismo valor base.
  const fitFresco = () =>
    leerFit(useWardrobeStore.getState().items.find((i) => i.id === sel.id) ?? sel)
  const nudge = (campo, delta, lim) =>
    aplicar({ [campo]: r3(clamp((fitFresco()[campo] ?? 0) + delta, -lim, lim)) })
  const escalar = (campo, delta) =>
    aplicar({ [campo]: r3(clamp((fitFresco()[campo] ?? 1) + delta, ESCALA_MIN, ESCALA_MAX)) })
  const resetear = () =>
    aplicar({ fit_scale_x: 1, fit_scale_y: 1, fit_offset_x: 0, fit_offset_y: 0 })

  const ajustada =
    fit.fit_scale_x !== 1 || fit.fit_scale_y !== 1 ||
    fit.fit_offset_x !== 0 || fit.fit_offset_y !== 0

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="absolute bottom-24 left-5 btn btn-outline btn-sm bg-surface/85 backdrop-blur-xl shadow-card z-20"
      >
        <IcnAjuste />
        <span className="hidden sm:inline">Ajustar</span>
      </button>
    )
  }

  return (
    <div className="absolute bottom-24 left-5 w-[224px] card bg-surface/95 backdrop-blur-xl shadow-lift z-20 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="flex items-center gap-1.5 text-sm font-medium"><IcnAjuste /> Ajuste fino</span>
        <button onClick={() => setAbierto(false)} className="btn btn-ghost btn-icon btn-sm" aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Selector de prenda puesta */}
      {puestas.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {puestas.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelId(p.id)}
              className="chip"
              data-on={p.id === sel.id}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Posición — flechas */}
      <p className="text-xs text-muted mb-1.5">Posición</p>
      <div className="grid grid-cols-3 gap-1.5 w-fit mx-auto mb-3">
        <span />
        <Flecha dir="arriba" onClick={() => nudge('fit_offset_y', PASO_OFFSET, LIM_OFFSET)} />
        <span />
        <Flecha dir="izquierda" onClick={() => nudge('fit_offset_x', -PASO_OFFSET, LIM_OFFSET)} />
        <button onClick={resetear} className="btn btn-ghost btn-icon btn-sm" title="Centrar y restablecer" aria-label="Restablecer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
        </button>
        <Flecha dir="derecha" onClick={() => nudge('fit_offset_x', PASO_OFFSET, LIM_OFFSET)} />
        <span />
        <Flecha dir="abajo" onClick={() => nudge('fit_offset_y', -PASO_OFFSET, LIM_OFFSET)} />
        <span />
      </div>

      {/* Tamaño */}
      <p className="text-xs text-muted mb-1.5">Tamaño</p>
      <div className="space-y-1.5">
        <ParEscala etiqueta="Ancho" onMenos={() => escalar('fit_scale_x', -PASO_ESCALA)} onMas={() => escalar('fit_scale_x', PASO_ESCALA)} />
        <ParEscala etiqueta="Alto" onMenos={() => escalar('fit_scale_y', -PASO_ESCALA)} onMas={() => escalar('fit_scale_y', PASO_ESCALA)} />
      </div>

      {ajustada && (
        <button onClick={resetear} className="btn btn-ghost btn-sm w-full mt-3 text-muted">
          Restablecer ajuste
        </button>
      )}
    </div>
  )
}

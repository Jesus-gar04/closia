import { useState } from 'react'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { SILUETAS_POR_ZONA } from '../../utils/ProceduralMeshes'

const ZONAS = [
  { v: 'torso',     t: 'Torso' },
  { v: 'legs',      t: 'Piernas' },
  { v: 'dress',     t: 'Vestido' },
  { v: 'outer',     t: 'Abrigo' },
  { v: 'feet',      t: 'Calzado' },
  { v: 'head',      t: 'Cabeza' },
  { v: 'neck',      t: 'Cuello' },
  { v: 'wrist',     t: 'Muñeca' },
  { v: 'accessory', t: 'Bolso' },
]

const ESTILOS = ['Casual', 'Trabajo', 'Fiesta', 'Playa', 'Sport', 'Elegante']

const SECTION = 'space-y-2.5'
const LABEL = 'field-label'

function Chip({ activo, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="chip" data-on={activo || undefined}>
      {children}
    </button>
  )
}

export function Step3Details({ datos, onChange }) {
  const { getCategories, addCategory } = useWardrobeStore()
  const categorias = getCategories()
  const [nueva, setNueva] = useState('')

  const siluetas = SILUETAS_POR_ZONA[datos.body_zone] ?? []

  const toggleEstilo = (e) => {
    const k = e.toLowerCase()
    const cur = datos.styles ?? []
    onChange('styles', cur.includes(k) ? cur.filter((s) => s !== k) : [...cur, k])
  }

  const crearCategoria = () => {
    const limpio = nueva.trim()
    if (!limpio) return
    addCategory(limpio)
    onChange('category', limpio)
    setNueva('')
  }

  return (
    <div className="px-7 sm:px-10 pt-1 pb-7 space-y-7 max-h-[56vh] overflow-y-auto">
      {/* Nombre */}
      <div className={SECTION}>
        <label className={LABEL}>Nombre <span className="field-req">*</span></label>
        <input
          type="text" value={datos.name ?? ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Ej. Blusa off-shoulder coral"
          className="field"
        />
      </div>

      {/* Zona */}
      <div className={SECTION}>
        <label className={LABEL}>Zona del cuerpo <span className="field-req">*</span></label>
        <div className="flex flex-wrap gap-2">
          {ZONAS.map((z) => (
            <Chip key={z.v} activo={datos.body_zone === z.v}
              onClick={() => { onChange('body_zone', z.v); onChange('silhouette_type', '') }}>
              {z.t}
            </Chip>
          ))}
        </div>
      </div>

      {/* Silueta */}
      {siluetas.length > 0 && (
        <div className={SECTION}>
          <label className={LABEL}>Tipo de silueta <span className="field-req">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {siluetas.map((s) => (
              <button
                key={s.valor} type="button"
                onClick={() => onChange('silhouette_type', s.valor)}
                className="opt"
                data-on={datos.silhouette_type === s.valor || undefined}
              >
                {s.etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categoría */}
      <div className={SECTION}>
        <label className={LABEL}>Categoría <span className="field-req">*</span></label>
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <Chip key={c} activo={datos.category === c} onClick={() => onChange('category', c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <input
            type="text" value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); crearCategoria() } }}
            placeholder="Crear nueva categoría…"
            className="field flex-1"
          />
          <button type="button" onClick={crearCategoria} disabled={!nueva.trim()} className="btn btn-accent flex-shrink-0">
            Añadir
          </button>
        </div>
      </div>

      {/* Estilos */}
      <div className={SECTION}>
        <label className={LABEL}>Estilos <span className="text-faint font-normal">· opcional</span></label>
        <div className="flex flex-wrap gap-2">
          {ESTILOS.map((e) => (
            <Chip key={e} activo={(datos.styles ?? []).includes(e.toLowerCase())} onClick={() => toggleEstilo(e)}>
              {e}
            </Chip>
          ))}
        </div>
      </div>

      {/* Talla / Marca */}
      <div className="grid grid-cols-2 gap-3">
        <div className={SECTION}>
          <label className={LABEL}>Talla</label>
          <input type="text" value={datos.size ?? ''} onChange={(e) => onChange('size', e.target.value)} placeholder="S · M · 38" className="field" />
        </div>
        <div className={SECTION}>
          <label className={LABEL}>Marca</label>
          <input type="text" value={datos.brand ?? ''} onChange={(e) => onChange('brand', e.target.value)} placeholder="Zara…" className="field" />
        </div>
      </div>

      {/* Notas */}
      <div className={SECTION}>
        <label className={LABEL}>Notas</label>
        <textarea value={datos.notes ?? ''} onChange={(e) => onChange('notes', e.target.value)} rows={2} placeholder="Combina con…" className="field resize-none" />
      </div>

      {/* Favorita */}
      <button
        type="button"
        onClick={() => onChange('favorite', !datos.favorite)}
        className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-[11px] border border-hairline bg-canvas/40 hover:border-line-strong"
      >
        <span className="text-[13.5px] font-medium text-ink-soft">Marcar como favorita</span>
        <span className="switch" data-on={datos.favorite || undefined} />
      </button>
    </div>
  )
}

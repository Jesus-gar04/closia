import { useWardrobeStore } from '../../store/wardrobeStore'
import clsx from 'clsx'

const ZONAS = [
  { v: 'all',       t: 'Todas' },
  { v: 'torso',     t: 'Torso' },
  { v: 'legs',      t: 'Piernas' },
  { v: 'dress',     t: 'Vestidos' },
  { v: 'outer',     t: 'Outer' },
  { v: 'feet',      t: 'Pies' },
  { v: 'accessory', t: 'Accesorios' },
]
const ESTILOS = [
  { v: 'all',      t: 'Todos los estilos' },
  { v: 'casual',   t: 'Casual' },
  { v: 'trabajo',  t: 'Trabajo' },
  { v: 'fiesta',   t: 'Fiesta' },
  { v: 'playa',    t: 'Playa' },
  { v: 'sport',    t: 'Sport' },
  { v: 'elegante', t: 'Elegante' },
]
const ORDEN = [
  { v: 'newest',    t: 'Más recientes' },
  { v: 'name',      t: 'Nombre A → Z' },
  { v: 'most_worn', t: 'Más usadas' },
]

export function FilterBar() {
  const { filters, setFilter, resetFilters } = useWardrobeStore()

  return (
    <div className="flex flex-col gap-3.5 px-6 md:px-10 pt-2 pb-6 flex-shrink-0">
      <div className="flex gap-2 flex-wrap">
        {ZONAS.map((z) => (
          <button
            key={z.v}
            onClick={() => setFilter('bodyZone', z.v)}
            className="chip !h-9 !px-4 !text-[12.5px]"
            data-on={filters.bodyZone === z.v || undefined}
          >
            {z.t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="select-wrap">
          <select value={filters.style} onChange={(e) => setFilter('style', e.target.value)} className="select !h-10 !pl-3.5 !text-[13px]">
            {ESTILOS.map((s) => <option key={s.v} value={s.v}>{s.t}</option>)}
          </select>
        </div>
        <div className="select-wrap">
          <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} className="select !h-10 !pl-3.5 !text-[13px]">
            {ORDEN.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
          </select>
        </div>
        <button
          onClick={() => setFilter('favoritesOnly', !filters.favoritesOnly)}
          className={clsx(
            'inline-flex items-center gap-1.5 h-10 px-4 rounded-[11px] text-[13px] font-medium border-[1.5px] transition-all',
            filters.favoritesOnly
              ? 'bg-danger-soft border-danger/40 text-danger'
              : 'bg-surface border-line-strong text-ink-soft hover:border-danger/40'
          )}
        >
          <span>{filters.favoritesOnly ? '★' : '☆'}</span> Favoritas
        </button>
        <button onClick={resetFilters} className="ml-auto btn btn-ghost btn-sm">
          Limpiar
        </button>
      </div>
    </div>
  )
}

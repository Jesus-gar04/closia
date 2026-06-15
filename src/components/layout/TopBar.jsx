import { useUIStore } from '../../store/uiStore'
import { useWardrobeStore } from '../../store/wardrobeStore'

function IcnSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="6" />
      <path d="M14 14l4 4" />
    </svg>
  )
}
function IcnPlus({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  )
}

export function TopBar({ isMobile }) {
  const { openUpload } = useUIStore()
  const { setFilter, filters } = useWardrobeStore()

  return (
    <header className="h-[68px] flex items-center justify-between px-4 md:px-7 flex-shrink-0 bg-surface/85 backdrop-blur-xl border-b border-hairline gap-3 md:gap-6 z-30">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-accent-bright to-accent flex items-center justify-center shadow-[0_4px_12px_rgba(190,94,52,0.3)]">
          <span className="font-display text-[19px] font-semibold text-white leading-none pt-0.5">c</span>
        </div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink leading-none hidden sm:block">
          closia
        </h1>
      </div>

      {/* Búsqueda */}
      <div className="flex-1 max-w-[520px]">
        <label className="relative flex items-center h-11 bg-canvas hover:bg-tinted/70 focus-within:bg-surface focus-within:shadow-[var(--ring)] border-[1.5px] border-line-strong focus-within:border-accent rounded-[11px] transition-all">
          <span className="pl-3.5 pr-2 text-faint flex-shrink-0">
            <IcnSearch />
          </span>
          <input
            type="text"
            placeholder={isMobile ? 'Buscar...' : 'Buscar prendas, marcas o estilos'}
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="flex-1 h-full pr-3.5 bg-transparent text-[14px] text-ink placeholder:text-faint"
          />
        </label>
      </div>

      {/* CTA agregar */}
      <button onClick={openUpload} className="btn btn-accent flex-shrink-0">
        <IcnPlus />
        <span className="hidden sm:inline">Nueva prenda</span>
      </button>
    </header>
  )
}

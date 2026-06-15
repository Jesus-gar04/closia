import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'

export function DaySlot({ fecha, outfit, esHoy, onAsignar, onQuitar }) {
  const diaSemana = format(fecha, 'EEEE', { locale: es })
  const diaMes = format(fecha, 'd')

  return (
    <div
      className={clsx(
        'group flex flex-col p-3.5 rounded-md border bg-surface min-h-[190px]',
        esHoy ? 'border-accent ring-2 ring-accent/15' : 'border-hairline hover:border-accent/30'
      )}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className={clsx('text-[11px] uppercase tracking-wide font-semibold', esHoy ? 'text-accent-deep' : 'text-faint')}>
          {diaSemana.slice(0, 3)}
        </span>
        <span className={clsx('text-[22px] font-bold leading-none tracking-tight', esHoy ? 'text-accent-deep' : 'text-ink')}>
          {diaMes}
        </span>
      </div>

      {outfit ? (
        <div className="flex flex-col gap-2 flex-1">
          <button
            type="button"
            onClick={onAsignar}
            title="Cambiar el look de este día"
            className="relative aspect-[3/4] rounded-sm overflow-hidden bg-tinted block w-full cursor-pointer"
          >
            {outfit.screenshot_url && <img src={outfit.screenshot_url} alt={outfit.name} className="w-full h-full object-cover" />}

            {/* Overlay "Cambiar": en hover en desktop, siempre visible en táctil (sin hover) */}
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
              <span className="mb-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface/95 text-ink text-[11px] font-medium shadow-card">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
                Cambiar
              </span>
            </div>

            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onQuitar() }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onQuitar() } }}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-canvas/95 flex items-center justify-center text-muted hover:text-danger opacity-0 group-hover:opacity-100"
              aria-label="Quitar"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </span>
          </button>
          <p className="text-[11.5px] text-ink-soft truncate">{outfit.name}</p>
        </div>
      ) : (
        <button
          onClick={onAsignar}
          className="flex-1 rounded-sm border border-dashed border-line-strong hover:border-accent/50 hover:bg-accent-tint/40 flex flex-col items-center justify-center gap-1.5 text-faint hover:text-accent-deep"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
          <span className="text-[11px] font-medium">Asignar</span>
        </button>
      )}
    </div>
  )
}

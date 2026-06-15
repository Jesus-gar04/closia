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
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-tinted group/img">
            {outfit.screenshot_url && <img src={outfit.screenshot_url} alt={outfit.name} className="w-full h-full object-cover" />}
            <button
              onClick={onQuitar}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-canvas/95 flex items-center justify-center text-muted hover:text-danger opacity-0 group-hover:opacity-100"
              aria-label="Quitar"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </div>
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

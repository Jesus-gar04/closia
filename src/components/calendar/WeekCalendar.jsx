import { useState } from 'react'
import { addDays, startOfWeek, isSameDay, format, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { DaySlot } from './DaySlot'
import { Modal } from '../ui/Modal'
import { useOutfitsStore } from '../../store/outfitsStore'
import { useCalendarStore } from '../../store/calendarStore'

const fmtKey = (d) => format(d, 'yyyy-MM-dd')

export function WeekCalendar() {
  const [semanaBase, setSemanaBase] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [editando, setEditando] = useState(null) // fecha key
  const { outfits } = useOutfitsStore()
  const { plan, asignar, quitar } = useCalendarStore()
  const hoy = new Date()

  const dias = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i))
  const outfitDe = (fecha) => outfits.find((o) => o.id === plan[fmtKey(fecha)]) ?? null

  const mesRango = isSameMonth(dias[0], dias[6])
    ? format(dias[0], 'MMMM yyyy', { locale: es })
    : `${format(dias[0], 'MMM', { locale: es })} — ${format(dias[6], 'MMM yyyy', { locale: es })}`

  return (
    <div className="px-6 md:px-10 pb-8 space-y-5">
      <div className="flex items-center justify-between bg-surface border border-hairline rounded-md px-3 py-2">
        <button onClick={() => setSemanaBase((b) => addDays(b, -7))} className="w-9 h-9 rounded-sm hover:bg-tinted flex items-center justify-center text-muted hover:text-ink" aria-label="Anterior">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5" /></svg>
        </button>
        <div className="text-center">
          <p className="text-[16px] font-bold text-ink capitalize leading-none tracking-tight">{mesRango}</p>
          <p className="text-[11px] text-faint mt-1">Semana del {format(dias[0], 'd', { locale: es })} al {format(dias[6], 'd', { locale: es })}</p>
        </div>
        <button onClick={() => setSemanaBase((b) => addDays(b, 7))} className="w-9 h-9 rounded-sm hover:bg-tinted flex items-center justify-center text-muted hover:text-ink" aria-label="Siguiente">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {dias.map((dia) => (
          <DaySlot
            key={dia.toISOString()}
            fecha={dia}
            outfit={outfitDe(dia)}
            esHoy={isSameDay(dia, hoy)}
            onAsignar={() => setEditando(fmtKey(dia))}
            onQuitar={() => quitar(fmtKey(dia))}
          />
        ))}
      </div>

      {/* Selector de look */}
      <Modal abierto={!!editando} onCerrar={() => setEditando(null)} titulo="Elegir look" subtitulo="Asigna un outfit a este día" ancho="md">
        <div className="px-6 sm:px-8 py-6">
          {outfits.length === 0 ? (
            <p className="text-center text-[13px] text-muted py-8">Aún no tienes looks guardados.<br />Crea uno en el avatar.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {outfits.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { asignar(editando, o.id); setEditando(null) }}
                  className="rounded-md overflow-hidden border border-hairline hover:border-accent hover:ring-2 hover:ring-accent/20 active:scale-95 text-left"
                >
                  <div className="aspect-[3/4] bg-tinted">
                    {o.screenshot_url && <img src={o.screenshot_url} alt={o.name} className="w-full h-full object-cover" />}
                  </div>
                  <p className="px-2 py-1.5 text-[11.5px] font-medium text-ink truncate">{o.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

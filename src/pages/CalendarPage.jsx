import { WeekCalendar } from '../components/calendar/WeekCalendar'

export function CalendarPage() {
  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="px-6 md:px-10 pt-8 pb-4">
        <p className="eyebrow">Tu semana</p>
        <h1 className="title-xl text-ink mt-1.5">Agenda</h1>
        <p className="text-[12.5px] text-muted mt-2">Planifica tus looks día por día</p>
      </div>
      <WeekCalendar />
    </div>
  )
}

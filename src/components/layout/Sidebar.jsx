import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

function I({ d, size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  )
}

const NAV = [
  {
    ruta: '/avatar', label: 'Avatar',
    icono: (s) => <I size={s} d={<><circle cx="12" cy="8" r="3.5" /><path d="M5 20.5c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>} />,
  },
  {
    ruta: '/guardarropa', label: 'Guardarropa',
    icono: (s) => <I size={s} d={<><path d="M12 6a2 2 0 0 1 2 2c0 1-1 1.6-1 2.4L21 15H3l8-4.6c0-.8-1-1.4-1-2.4a2 2 0 0 1 2-2z" /><path d="M3 15v3.5A1.5 1.5 0 0 0 4.5 20h15a1.5 1.5 0 0 0 1.5-1.5V15" /></>} />,
  },
  {
    ruta: '/outfits', label: 'Looks',
    icono: (s) => <I size={s} d={<path d="M12 4l2.2 5.2L20 10l-4 3.6L17 19l-5-2.8L7 19l1-5.4L4 10l5.8-.8z" />} />,
  },
  {
    ruta: '/calendario', label: 'Agenda',
    icono: (s) => <I size={s} d={<><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3.5v3M16 3.5v3M3.5 10h17" /></>} />,
  },
  {
    ruta: '/ajustes', label: 'Ajustes',
    icono: (s) => <I size={s} d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3 2 2 0 1 1-2.8-2.8 1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8 2 2 0 1 1 2.8-2.8 1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3 2 2 0 1 1 2.8 2.8 1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>} />,
  },
]

export function Sidebar() {
  return (
    <aside className="w-[84px] h-full flex flex-col items-center py-4 flex-shrink-0 bg-surface border-r border-hairline z-20">
      <nav className="flex flex-col gap-1.5 w-full items-center px-2.5">
        {NAV.map(({ ruta, icono, label }) => (
          <NavLink
            key={ruta}
            to={ruta}
            title={label}
            className={({ isActive }) => clsx(
              'group relative flex flex-col items-center justify-center gap-1 w-full h-[58px] rounded-[13px] transition-all',
              isActive
                ? 'text-accent-deep'
                : 'text-muted hover:text-ink hover:bg-tinted'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <>
                    <span className="absolute inset-0 rounded-[13px] bg-accent-tint border border-accent-soft" />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-accent" />
                  </>
                )}
                <span className="relative">{icono(21)}</span>
                <span className="relative text-[9.5px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto text-faint">
        <span className="text-[9px] tracking-[0.22em] uppercase">v0.4</span>
      </div>
    </aside>
  )
}

/* ── Tab bar inferior móvil ─────────────────────── */
export function MobileTabBar() {
  return (
    <nav className="h-[62px] flex-shrink-0 bg-surface border-t border-hairline flex items-stretch z-30">
      {NAV.map(({ ruta, icono, label }) => (
        <NavLink
          key={ruta}
          to={ruta}
          className={({ isActive }) => clsx(
            'flex-1 flex flex-col items-center justify-center gap-1',
            isActive ? 'text-accent-deep' : 'text-faint'
          )}
        >
          {({ isActive }) => (
            <>
              <span className={clsx('flex items-center justify-center w-10 h-7 rounded-full', isActive && 'bg-accent-tint')}>
                {icono(19)}
              </span>
              <span className="text-[10px] tracking-wide font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

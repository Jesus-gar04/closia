import clsx from 'clsx'

const TONOS = {
  accent: 'bg-accent-soft text-accent-deep',
  sage:   'bg-sage-soft text-ink-soft',
  danger: 'bg-danger-soft text-ink-soft',
  ink:    'bg-tinted text-ink-soft',
}

export function Badge({ children, tono = 'accent', color, className }) {
  if (color) {
    return (
      <span
        className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium', className)}
        style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {children}
      </span>
    )
  }
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-medium',
      TONOS[tono],
      className,
    )}>
      {children}
    </span>
  )
}

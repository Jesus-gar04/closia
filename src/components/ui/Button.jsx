import clsx from 'clsx'

export function Button({
  variante = 'primario',
  tamanio = 'md',
  className,
  cargando,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={cargando || props.disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-md active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        {
          primario:   'bg-ink hover:bg-ink-soft text-canvas shadow-soft',
          secundario: 'bg-tinted hover:bg-deep text-ink',
          fantasma:   'text-muted hover:text-ink hover:bg-tinted',
          contorno:   'border border-hairline hover:border-accent/40 text-ink-soft hover:text-ink bg-surface',
          peligro:    'bg-danger-soft hover:bg-danger text-ink-soft hover:text-canvas',
          acento:     'bg-accent hover:bg-accent-deep text-canvas',
        }[variante],
        {
          sm: 'px-3 py-1.5 text-[12px]',
          md: 'px-4 py-2.5 text-[13px]',
          lg: 'px-6 py-3 text-[14px]',
        }[tamanio],
        className
      )}
    >
      {cargando ? (
        <span className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
      ) : children}
    </button>
  )
}

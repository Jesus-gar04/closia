import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const ANCHOS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-5xl',
}

export function Modal({ abierto, onCerrar, titulo, subtitulo, children, ancho = 'md' }) {
  useEffect(() => {
    if (!abierto) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const h = (e) => { if (e.key === 'Escape') onCerrar?.() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [abierto, onCerrar])

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            onClick={onCerrar}
          />
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={clsx(
              'relative bg-surface w-full rounded-t-2xl sm:rounded-xl shadow-lift overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh]',
              ANCHOS[ancho]
            )}
          >
            {titulo && (
              <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 pb-4 border-b border-hairline flex-shrink-0">
                <div className="min-w-0">
                  <h2 className="font-display text-[24px] sm:text-[26px] font-semibold text-ink leading-none tracking-tight">{titulo}</h2>
                  {subtitulo && (
                    <p className="text-[12.5px] text-muted mt-1">{subtitulo}</p>
                  )}
                </div>
                <button
                  onClick={onCerrar}
                  className="w-9 h-9 rounded-md hover:bg-tinted flex items-center justify-center text-muted hover:text-ink -mr-1"
                  aria-label="Cerrar"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>
            )}
            <div className="overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

import { motion } from 'framer-motion'

export function ProgressBar({ progreso, etiqueta }) {
  return (
    <div className="w-full space-y-2.5">
      {etiqueta && (
        <p className="text-[12.5px] text-ink-soft text-center font-medium">{etiqueta}</p>
      )}
      <div className="w-full h-1.5 bg-tinted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-[11px] text-faint text-center tabular-nums">{progreso}%</p>
    </div>
  )
}
